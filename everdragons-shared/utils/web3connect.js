module.exports = {
    getWSConnection(url, Web3) {
        const web3 = new Web3(new Web3.providers.WebsocketProvider(url));
        web3._provider.on('error', (e) => {
            console.log("ws error", e);
            if(typeof process !== "undefined") {
                process.exit(1);
            }
        });
        web3._provider.on('end', (e) => {
            console.log("ws end", e);
            if(typeof process !== "undefined") {
                process.exit(1);
            }
        });
        console.log("web3 initialized:", url, web3.version.api ? web3.version.api : web3.version);
        return web3;
    },
    getRPCConnection(url, Web3) {
        const web3 =  new Web3(new Web3.providers.HttpProvider(url));
        console.log("web3 initialized:", url, web3.version.api ? web3.version.api : web3.version);
        return web3;
    },
    getTronWeb(urls, TronWeb, privateKey = undefined) {
        const HttpProvider = TronWeb.providers.HttpProvider; // This provider is optional, you can just use a url for the nodes instead
        const fullNode = new HttpProvider(urls.fullNode); // Full node http endpoint
        const solidityNode = new HttpProvider(urls.solidityNode); // Solidity node http endpoint
        const eventServer = urls.eventNode; // Contract events http endpoint

        console.log("tronweb initialized:", urls.fullNode);
        return new TronWeb(
            fullNode,
            solidityNode,
            eventServer,
            privateKey
        );
    }
};
