const accounts = require("./../accounts").accounts;
const accountName = process.env.ACC_NAME || "owner";

module.exports = {
    contracts_build_directory: process.cwd() + "/build/tron",
    solc: {
        optimizer: {
            enabled: true,
            runs: 200
        }
    },
    networks: {
        shasta: {
            privateKey: accounts[accountName].key,
            userFeePercentage: 10,
            feeLimit: 1e9,
            originalEnergyLimit: 1e9,
            fullHost: "https://api.shasta.trongrid.io",
            host: "https://api.shasta.trongrid.io",
            port: 8090,
            fullNode: "https://api.shasta.trongrid.io",
            solidityNode: "https://api.shasta.trongrid.io",
            eventServer: "https://api.shasta.trongrid.io",
            network_id: "41"
        },
        tron: {
            privateKey: accounts[accountName].key,
            userFeePercentage: 10,
            feeLimit: 1e9,
            originalEnergyLimit: 1e9,
            fullHost: "https://api.trongrid.io",
            host: "https://api.trongrid.io",
            port: 8090,
            fullNode: "https://api.trongrid.io",
            solidityNode: "https://api.trongrid.io",
            eventServer: "https://api.trongrid.io",
            network_id: "40"
        }
    }
};
