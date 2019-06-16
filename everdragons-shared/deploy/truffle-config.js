const HDWalletProvider = require("truffle-hdwallet-provider");
const accounts = require("./../accounts").accounts;
const accountName = process.env.ACC_NAME || "owner";
const gasPrice = process.env.GAS_PRICE;

module.exports = {
    contracts_build_directory: process.cwd() + "/build/eth",
    compilers: {
        solc: {
            version: "0.4.25"
        }
    },
    solc: {
        optimizer: {
            enabled: true,
            runs: 200
        }
    },
    networks: {
        mainnet: {
            provider: () => new HDWalletProvider(accounts[accountName].key, "https://mainnet.infura.io/"),
            network_id: '1',
            gas: 65e5,
            gasPrice: gasPrice || 5e9,
        },
        rinkeby: {
            provider: () => new HDWalletProvider(accounts[accountName].key, "https://rinkeby.infura.io/v3/"),
            skipDryRun: true,
            network_id: '4',
            gas: 70e5,
            gasPrice: gasPrice || 15e9
        },
        sokol: {
            provider: () =>  new HDWalletProvider(accounts[accountName].key, "https://sokol.poa.network/"),
            skipDryRun: true,
            network_id: '77',
            gas: 75e5,
            gasPrice: gasPrice || 1e9
        },
        poa: {
            provider: () => new HDWalletProvider(accounts[accountName].key, "https://core.poa.network/"),
            network_id: '99',
            gas: 75e5,
            gasPrice: gasPrice || 1e9
        },
        ganache: {
            host: 'localhost',
            port: 8545,
            network_id: '43', // eslint-disable-line camelcase
            gas: 70e5,
            gasPrice: gasPrice || 1e9
        }
    }
};
