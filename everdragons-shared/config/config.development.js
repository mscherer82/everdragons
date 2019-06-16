module.exports = {
    MONGO_DB_HOST: '',
    MONGO_DB_NAME: '',
    ETH_WS_URL: 'wss://rinkeby.infura.io/ws',
    ETH_RPC_URL: 'https://rinkeby.infura.io:443',
    POA_RPC_URL: 'https://sokol.poa.network:443',
    // ERROR_MAIL_RECEIVER: "ed.error.mail@gmail.com",
    TRON_URLS: {
        fullNode: 'https://api.shasta.trongrid.io',
        solidityNode: 'https://api.shasta.trongrid.io',
        eventNode: 'https://api.shasta.trongrid.io'
    },
    FORCED_RESTART: 10 * 60,
    dragonApi: {
        PORT: 3000
    },
    dragonDB: {
        BLOCK_DELAY: 2,
        ITERATION_BLOCK_COUNT: 500,
        INTERVAL: 5000
    },
    raceTrigger: {
        UPDATE_INTERVAL_IN_SECS: 5,
        COIN_API_URL: "",
        RACE_DURATION_IN_SECS: 600
    },
    dragonSVG: {
        INTERVAL: 5000,
        PNG_WIDTH: 1000,
        PNG_HEIGHT: 1000
    },
    coinlist: {
        PORT: 3001
    }
};
