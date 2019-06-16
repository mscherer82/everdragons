module.exports = {
    MONGO_DB_HOST: '',
    MONGO_DB_NAME: '',
    ETH_WS_URL: 'wss://mainnet.infura.io/ws',
    ETH_RPC_URL: 'https://mainnet.infura.io',
    POA_WS_URL: 'wss://poa.infura.io/ws',
    POA_RPC_URL: 'https://core.poa.network',
    ERROR_MAIL_RECEIVER: 'error@everdragons.com',
    TRON_URLS: {
        fullNode: 'https://api.trongrid.io',
        solidityNode: 'https://api.trongrid.io',
        eventNode: 'https://api.trongrid.io'
    },
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
        RACE_DURATION_IN_SECS: 3600
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
