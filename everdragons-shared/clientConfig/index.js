const isProd = false; location.hostname.substr(0,5).indexOf("beta.") === -1 &&
    location.hostname.substr(0,9).indexOf("localhost") === -1 &&
    !["m.","h.","q."].includes(location.hostname.substr(0,2).toLowerCase());
const env = isProd ? "production" : "development";
module.exports = require('./config.' + env);
