var fs = require('fs');
var SshWebpackPlugin = require('ssh-webpack-plugin');
var os = require('os');
var path = require('path');
var nodeModules = {};
var serviceConfig = {
    folder: "bridge",
    instances: [
        {name: "bridge-eth-poa", ENV: ["USE_CHAIN=ETH", "USE_DEST_CHAIN=POA"]},
        {name: "bridge-eth-tron", ENV: ["USE_CHAIN=ETH", "USE_DEST_CHAIN=TRON"]},
        {name: "bridge-poa-tron", ENV: ["USE_CHAIN=POA", "USE_DEST_CHAIN=TRON"]},
    ]
};
var sshConfig = require('everdragons-shared/deploy')(serviceConfig).strato_node_1;

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
    target: 'node',
    externals: nodeModules,
    plugins: [new SshWebpackPlugin(sshConfig)]
};
