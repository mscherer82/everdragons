var fs = require('fs');
var os = require('os');
var path = require('path');
var nodeModules = {};
var SshWebpackPlugin = require('ssh-webpack-plugin');
var serviceConfig = {
    folder: "dragons-db",
    instances: [
        {name: "dragons-db-eth"},
        {name: "dragons-db-poa", ENV: ["USE_CHAIN=POA"]},
        {name: "dragons-db-tron", ENV: ["USE_CHAIN=TRON"]},
    ]
};
var sshConfig = require('everdragons-shared/deploy')(serviceConfig).ec2_node_1;

fs.readdirSync('node_modules')
    .filter(function(x) {
        return ['.bin'].indexOf(x) === -1 && x !== "everdragons-shared";
    })
    .forEach(function(mod) {
        nodeModules[mod] = 'commonjs ' + mod;
    });

module.exports = {
    entry: './index.js',
    output: {
        path: __dirname + '/dist',
        filename: 'app.js',
    },
    resolve: {
        // Add '.ts' and '.tsx' as a resolvable extension.
        extensions: ['.webpack.js', '.web.js', '.ts', '.tsx', '.js', '.json'],
    },
    module: {
        loaders: [
            {
                use: 'babel-loader',
                test: /\.js$/,
                exclude: /node_modules/
            },
            {
                use: 'json-loader',
                test: /\.json$/
            },
        ],
    },
    devtool: "source-map",
    target: 'node',
    externals: nodeModules,
    plugins: [new SshWebpackPlugin(sshConfig)]
};
