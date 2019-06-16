var fs = require('fs');
var SshWebpackPlugin = require('ssh-webpack-plugin');
var os = require('os');
var path = require('path');
var nodeModules = {};
var serviceConfig = {
    instances: [{name: "dragons-api"}]
};
var sshConfig = require('everdragons-shared/deploy')(serviceConfig).ec2_node_1;

fs.readdirSync('node_modules')
    .filter(function(x) {
        return ['.bin'].indexOf(x) === -1;
    })
    .forEach(function(mod) {
        nodeModules[mod] = 'commonjs ' + mod;
    });

module.exports = {
    entry: './app.ts',
    output: {
        path: __dirname + '/dist',
        filename: 'app.js',
    },
    resolve: {
        // Add '.ts' and '.tsx' as a resolvable extension.
        extensions: ['.webpack.js', '.web.js', '.ts', '.tsx', '.js'],
    },
    module: {
        loaders: [
            // All files with a '.ts' or '.tsx'
            // extension will be handled by 'ts-loader'
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
            },
        ],
    },
    target: 'node',
    externals: nodeModules,
    plugins: [new SshWebpackPlugin(sshConfig)]
};
