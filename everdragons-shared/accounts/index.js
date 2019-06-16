const env = require('../env/index.js').getEnv();
const accounts = require('./accounts.' + env);

module.exports = {
    accounts: accounts
};
