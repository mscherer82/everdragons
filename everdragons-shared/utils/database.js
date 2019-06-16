const MongoClient = require('mongodb').MongoClient;
const config = require('./../config');
const accountUtils = require("./../accounts");

let dbConnection;
let dragonsCollection, syncStateCollection;

const setupIndices = async () => {

    await dragonsCollection.createIndex( { dna: 1 } );
    await dragonsCollection.createIndex( { type: 1 } );
    await dragonsCollection.createIndex( { chain: 1 } );
    await dragonsCollection.createIndex( { prestige: -1 } );
    await dragonsCollection.createIndex( { experience: -1 } );
    await dragonsCollection.createIndex( { name: 1 } );
    await dragonsCollection.createIndex( { hasImage: 1 } );

    const setChainSpecificIndices = async (chain) => {

        const chainPrefix = chain.toLowerCase();
        await dragonsCollection.createIndex( {[chainPrefix + "Owner"] : 1 });
        await dragonsCollection.createIndex( {[chainPrefix + "OnMarketPlace"] : 1 });

        await dragonsCollection.createIndex( { [chainPrefix + "Auction.seller"] : 1 } );
        await dragonsCollection.createIndex( { [chainPrefix + "Auction.startingPrice"]: 1 } );
        await dragonsCollection.createIndex( { [chainPrefix + "Auction.endingPrice"]: 1 } );

        await dragonsCollection.createIndex(
            { [chainPrefix + "Auction"]: 1 },
            { partialFilterExpression: { [chainPrefix + "Auction"]: { $exists: true } } }
        )
    };

    setChainSpecificIndices("eth");
    setChainSpecificIndices("poa");
    setChainSpecificIndices("tron");

    await syncStateCollection.createIndex( { name: 1 } );
};

module.exports = {

    initDatabase: async () => {
        if(!dbConnection) {
            const accounts = accountUtils.accounts;
            const mongoURL = `mongodb://${accounts.databaseRW.user}:${accounts.databaseRW.pwd}@${config.MONGO_DB_HOST}`;

            dbConnection = await MongoClient.connect(mongoURL, { useNewUrlParser: true });
            const database = dbConnection.db(config.MONGO_DB_NAME);
            dragonsCollection = database.collection('dragons');
            syncStateCollection = database.collection('syncState');

            await setupIndices();
        }
        return {dragonsCollection, syncStateCollection};
    },
    closeConnection: async() => {
        if(dbConnection) {
            await dbConnection.close();
        }
    },
    getDragonsCollection() {return dragonsCollection;},
    getSyncStateCollection() {return syncStateCollection;}
};
