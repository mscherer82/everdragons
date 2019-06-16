const accounts = require('./../accounts').accounts;
const env = require('../env/index.js').getEnv();
const database = require('./database');

if (typeof window !== "undefined") {
    throw "don't include this config in client!";
}

module.exports = {
    initAccounts: async () => {
        if (env === "production") {
            try {
                const buttercup = require("buttercup");
                const FileDatasource = buttercup.Datasources.FileDatasource;
                const keyFilePath = process.env.KEY_FILE || process.cwd() + "/" + "data.bin";
                const fileDatasource = new FileDatasource(keyFilePath);
                const credentials = buttercup.Credentials.fromPassword(process.env.ACC_PWD || "OPpc6DH8PyJBAAUgcYnG");
                const archive = await fileDatasource.load(credentials).then(buttercup.Archive.createFromHistory);
                if (archive) {
                    console.log("process data file");
                    archive.findGroupsByTitle("accounts")[0].getEntries().forEach(function (e) {
                        const account = e.getProperty("title");
                        const properties = e.getProperty();
                        if (accounts[account]) {
                            Object.keys(properties).forEach(key => {
                                if (properties[key] && key !== "title") {
                                    accounts[account][key] = properties[key];
                                }
                            });
                        }
                    });
                }
            } catch (e) {
                console.log(e);
            }
        }
    },
    ganacheAccounts(accounts, web3) {
        accounts.owner = {
            address: web3.eth.accounts[0]
        };
        accounts.admin = {
            address: web3.eth.accounts[1]
        };
        accounts.wallet = {
            address: web3.eth.accounts[2]
        };
        accounts.bridgeAPI = {
            address: web3.eth.accounts[3]
        };
        accounts.gamesAPI = {
            address: web3.eth.accounts[4]
        };
    },
    exit: async (e) => {
        if(e) {
            console.error(e);
        }
        await database.closeConnection();
        process.exit(!!e ? 1 : 0);
    }
};
