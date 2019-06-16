const Web3 = require('web3');
const web3Utils = require('web3-utils');
const TronWeb = require('tronweb');
const accountUtils = require('./../accounts');

const everdragonsJSON = require('./../ABI-opt/eth/EverDragons.json');
const everdragonsOldJSON = require('./../ABI-opt/eth/EverDragonsOld.json');
const bridgeJSON = require('./../ABI-opt/eth/EverDragonsBridge.json');
const voucherJSON = undefined;//require('./../ABI-opt/eth/EverDragonsVoucher.json');
const auctionJSON = require('./../ABI-opt/eth/ReverseAuction.json');
const raceJSON = require('./../ABI-opt/eth/Race.json');
const tictactoeJSON = require('./../ABI-opt/eth/TicTacToe.json');
const goldmineJSON = undefined; //require('./../ABI-opt/eth/Goldmine.json');
const playerJSON = require('./../ABI-opt/eth/EverDragonsPlayer.json');
const registrarJSON = require('./../ABI-opt/eth/Registrar.json');

const everdragonsJSON_TRON = require('./../ABI-opt/tron/EverDragons.json');
const bridgeJSON_TRON = require('./../ABI-opt/tron/EverDragonsBridge.json');
// const voucherJSON_TRON = require('./../ABI-opt/tron/EverDragonsVoucher.json');
const auctionJSON_TRON = require('./../ABI-opt/tron/ReverseAuction.json');
const playerJSON_TRON = require('./../ABI-opt/tron/EverDragonsPlayer.json');
// const tictactoeJSON_TRON = require('./../ABI-opt/tron/TicTacToe.json');
// const goldmineJSON_TRON = require('./../ABI-opt/tron/Goldmine.json');
const registrarJSON_TRON = require('./../ABI-opt/tron/Registrar.json');

const voucherJSON_TRON = undefined;//require('./../ABI-opt/eth/EverDragonsVoucher.json');
const raceJSON_TRON = require('./../ABI-opt/tron/Race.json');
const tictactoeJSON_TRON = require('./../ABI-opt/tron/TicTacToe.json');
const goldmineJSON_TRON = undefined; //require('./../ABI-opt/eth/Goldmine.json');

const contractsJSON = {
    everdragonsJSON,
    everdragonsOldJSON,
    bridgeJSON,
//    voucherJSON,
    auctionJSON,
    raceJSON,
//    goldmineJSON,
    tictactoeJSON,
    playerJSON,
    registrarJSON,
    everdragonsJSON_TRON,
    bridgeJSON_TRON,
//    voucherJSON_TRON,
    auctionJSON_TRON,
    raceJSON_TRON,
    playerJSON_TRON,
    registrarJSON_TRON,
    tictactoeJSON_TRON,
//    goldmineJSON_TRON
};

class TronWebWrapper {

    static async createTronWeb(urls, privateKey) {
        const HttpProvider = TronWeb.providers.HttpProvider;
        const tronWeb = new TronWeb(
            new HttpProvider(urls.fullNode),
            new HttpProvider(urls.solidityNode),
            urls.eventNode,
            privateKey
        );

        let wrapper = new TronWebWrapper(tronWeb);
        await wrapper.updateNetworkId();
        await wrapper.getAccount();
        console.log("Tronweb created:", urls.fullNode, wrapper.networkId, wrapper.account);
        return wrapper;
    }

    static async fromInjectedTronWeb(tronWeb) {
        let wrapper = new TronWebWrapper(tronWeb);
        await wrapper.updateNetworkId();
        return wrapper;
    }

    constructor(tronWeb) {
        this.tronWeb = tronWeb;
    }

    async updateNetworkId() {
        if(this.tronWeb.eventServer && this.tronWeb.eventServer.host) {
            this.networkId = await this.tronWeb.eventServer.host.indexOf("shasta") !== -1 ? "41" : "40";
        } else {
            this.networkId = null;
        }
        return this.networkId;
    }

    async getContractByName(name) {
        let contract, contractJSON;
        contractJSON = contractsJSON[name + "JSON_TRON"];
        contract = (await this.tronWeb.contract().at(contractJSON.networks[this.networkId].address));
        return new ContractWrapper(this, contract, contractJSON);
    }

    async getAccount() {
        this.account = this.tronWeb.defaultAddress.hex;
        return this.account;
    }

    async getBalance() {
        return (await this.tronWeb.trx.getBalance(this.tronWeb.defaultAddress.base58));
    }

    async getLatestBlock() {
        throw "not implemented yed";
    }

    isTron() {
        return true;
    }

    isWeb3() {
        return false;
    }
}


class Web3Wrapper {

    constructor(web3) {
        this.web3 = web3;
    }

    static async createWeb3(url, privateKey) {
        let web3;
        if (privateKey) {
            const HDWalletProvider = require("truffle-hdwallet-provider");
            const provider = new HDWalletProvider(privateKey, url);
            web3 = new Web3(provider);
            const account = web3.eth.accounts.privateKeyToAccount('0x' + privateKey).address;
            web3.eth.accounts.wallet.add(account);
            web3.eth.defaultAccount = account;
        } else {
            web3 = new Web3(url);
        }
        const wrapper = new Web3Wrapper(web3);
        wrapper.account = web3.eth.defaultAccount;
        await wrapper.updateNetworkId();
        console.log("Web3 created:", web3.version, url, wrapper.networkId, wrapper.account);
        return wrapper;
    }

    static async fromInjectedWeb3(provider) {
        const web3 = new Web3(provider);
        let wrapper = new Web3Wrapper(web3);
        await wrapper.updateNetworkId();
        return wrapper;
    }

    async updateNetworkId() {
        this.networkId = (await this.web3.eth.net.getId()).toString(10);
        return this.networkId;
    }

    async getContractByName(name) {
        let contract, contractJSON;
        contractJSON = contractsJSON[name + "JSON"];
        contract = new this.web3.eth.Contract(contractJSON.abi, contractJSON.networks[this.networkId].address);
        return new ContractWrapper(this, contract, contractJSON);
    }

    async getAccount() {
        let accounts = await this.web3.eth.getAccounts();
        this.account = accounts.length ? accounts[0] : null;
        return this.account;
    }

    async getBalance() {
        const account = await this.getAccount();
        return (await this.web3.eth.getBalance(account));
    }

    async getLatestBlock() {
        return (await this.web3.eth.getBlockNumber());
    }

    isTron() {
        return false;
    }

    isWeb3() {
        return true;
    }
}

class ContractWrapper {

    constructor(webWrapper, contract, jsonData) {
        this.webWrapper = webWrapper;
        this.jsonData = jsonData;
        this.name = contract.name;
        if (this.webWrapper.isTron()) {
            this.tronContract = contract;
            this.methods = contract;
        } else if (webWrapper.isWeb3()) {
            this.web3Contract = contract;
            this.methods = contract.methods;
        }
    }

    async call(fnc, ...params) {
        try {
            let result;
            const inpParams = this.jsonData.abi.find(n => n.name === fnc).inputs;
            const outParams = this.jsonData.abi.find(n => n.name === fnc).outputs;
            inpParams.forEach((desc, index) => {
                if(desc.type === "bytes32") {
                    params[index] =  web3Utils.padRight(web3Utils.asciiToHex(params[index]), 64);
                } else if(desc.type === "address" && params[index].substr(0, 1) === "T") {
                    params[index] = TronWeb.address.toHex(params[index]);
                }
            });

            result = await this.methods[fnc](...params).call({from: this.webWrapper.account});

            if (typeof result === "string" && result.substr(0, 2) === "0x") {
                if(outParams[0].type === "bytes32") {
                    result = web3Utils.hexToString(result);
                } else {
                    result = result.toLowerCase();
                }
            } else if (typeof result === "object") {
                if (result.toNumber) {
                    result = result.toString(10);
                } else {
                    Object.keys(result).forEach((key, index) => {
                        if (typeof result[key] === "string" && result[key].substr(0, 2) === "0x") {
                            const outParam = outParams.find(op => op.name === key);
                            if(outParam  && outParam .type === "bytes32") {
                                result[key] = web3Utils.hexToString(result[key]);
                            } else {
                                result[key] = result[key].toLowerCase();
                            }
                        } else if (typeof result[key] === "number") {
                            result[key] = result[key].toString(10);
                        } else if (result[key].toNumber) {
                            result[key] = result[key].toString(10);
                        } else if(Array.isArray(result[key])) {
                            for (let index = 0; index < result[key].length; index++) {
                                const value = result[key][index];
                                if (typeof value === "string" && value.substr(0, 2) === "0x") {
                                    const outParam = outParams.find(op => op.name === key);
                                    if (outParam && outParam.type.substr(0,7) === "bytes32") {
                                        result[key][index] = web3Utils.hexToString(value);
                                    } else {
                                        result[key][index] = value.toLowerCase();
                                    }
                                } else if (typeof value === "number") {
                                    result[key][index] = value.toString(10);
                                } else if (value.toNumber) {
                                    result[key][index] = value.toString(10);
                                }
                            }
                        }
                    });
                }
            }

            return result;
        } catch (e) {
            console.error("error in fnc: " + fnc, e);
            // throw e;
        }
    }

    async send(fnc, gas, value, ...params) {
        try {
            let options;
            const paramDescs = this.jsonData.abi.find(n => n.name === fnc).inputs;
            paramDescs.forEach((desc, index) => {
                if(desc.type === "bytes32") {
                    params[index] = web3Utils.padRight(web3Utils.asciiToHex(params[index]), 64);
                } else if(desc.type === "address" && params[index].substr(0, 1) === "T") {
                    params[index] = TronWeb.address.toHex(params[index]).replace(/^41/,"0x");
                }
            });

            if (this.tronContract) {
                options = {
                    feeLimit: 1e9,
                    shouldPollResponse: true,
                    callValue: value,
                };
            } else {
                options = {
                    gas,
                    value,
                    from: this.webWrapper.account
                };
            }console.log(params);
            return (await this.methods[fnc](...params).send(options));
        } catch (e) {
            console.error("error in fnc: " + fnc, e);
            if(e && e.output && e.output.contractResult && this.tronContract) {
                const message = TronWeb.toUtf8(e.output.contractResult[0]).replace(/[^A-Za-z 0-9 \.,\?""!@#\$%\^&\*\(\)-_=\+;:<>\/\\\|\}\{\[\]`~]*/g, '');
                console.error("Reason: " + message);
            }
            // throw new e;
        }
    }

    async getCreationBlock() {
        if (!this.jsonData) {
            throw "jsonData needed";
        }

        const hash = this.jsonData.networks[this.webWrapper.networkId].transactionHash;
        if (this.webWrapper.isTron()) {
            return 0;
        } else if (this.webWrapper.isWeb3()) {
            const tx = await this.webWrapper.web3.eth.getTransactionReceipt(hash);
            return tx.blockNumber;
        }
    }

    getAddress() {
        if (this.webWrapper.isTron()) {
            return this.tronContract.address.toLowerCase();
        } else if (this.webWrapper.isWeb3()) {
            return this.web3Contract.options.address.toLowerCase();
        }
    }
}


module.exports = {
    ContractWrapper,
    Web3Wrapper,
    TronWebWrapper,
    createWebWrapper: async (chain, accountName) => {
        const config = require('./../config');
        const accounts = accountUtils.accounts;
        const privateKey = accounts[accountName].key;

        if (chain === "ETH" || chain === "POA") {
            const rpcURL = chain === 'ETH' ? config.ETH_RPC_URL : config.POA_RPC_URL;
            return await Web3Wrapper.createWeb3(rpcURL, privateKey);
        } else if (chain === "TRON") {
            return await TronWebWrapper.createTronWeb(config.TRON_URLS, privateKey);
        } else {
            throw "unknown chain";
        }
    },
    json: contractsJSON
};
