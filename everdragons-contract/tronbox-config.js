const serverUtils = require("everdragons-shared/utils/serverUtils");
const tronboxConfig = require('everdragons-shared/deploy/tronbox-config');
const waitSync = require('wait-sync');

serverUtils.initAccounts();
waitSync(3); // hacky way to wait until accounts are loaded async

module.exports = tronboxConfig;
