if(typeof window !== "undefined") {
    throw "don't include this config in client!";
}

const env = require('../env/index.js').getEnv();
const serverConfig = require('./config.' + env);
const clientConfig = require('../clientConfig/config.' + env);

module.exports = Object.assign(serverConfig, clientConfig);
