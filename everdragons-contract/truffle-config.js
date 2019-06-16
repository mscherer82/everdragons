require('babel-register');
require('babel-polyfill');

const waitSync = require('wait-sync');
const truffleConfig = require('everdragons-shared/deploy/truffle-config');
const serverUtils = require("everdragons-shared/utils/serverUtils");

serverUtils.initAccounts();
waitSync(3); // hacky way to wait until accounts are loaded async

module.exports = truffleConfig;
