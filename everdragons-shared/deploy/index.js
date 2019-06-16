if(typeof window !== "undefined") {
    throw "don't include this config in client!";
}

const env = require('../env/index.js').getEnv();
module.exports = function (serviceOptions) {

    const sshConfig = {};
    sshConfig.to = '/opt/' + (serviceOptions.folder || serviceOptions.instances[0].name);
    sshConfig.after = [];

    serviceOptions.instances.forEach(service => {
        let env = "";
        sshConfig.after.push('pm2 reset ' + service.name);
        if(service.ENV) {
            env = service.ENV.map(e => "export " + e + " && ").join("");
        }
        sshConfig.after.push(
            'if pm2 describe ' + service.name + '; then ' +
            env + 'pm2 restart -a ' + service.name + '; else ' +
            env + 'pm2 start ' + sshConfig.to + '/app.js --name "' + service.name + '" --log-date-format="DD.MM HH:mm:ss" --cwd "' + sshConfig.to + '/"; fi');

    });

    const servers = require('./config.' + env);
    Object.keys(servers).forEach(key => {
        servers[key] = Object.assign(servers[key], sshConfig);
    });
    return servers;
};
