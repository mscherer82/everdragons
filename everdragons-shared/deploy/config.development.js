const fs = require('fs');
const os = require('os');
const path = require('path');



const ec2_node_3 = {
    host: '',
    port: '22',
    username: 'ubuntu',
    privateKey: fs.readFileSync(path.join(os.homedir(), '.ssh/ed.pem')),
    from: './dist'
};

module.exports = {
    ec2_node_1: ec2_node_3,
    ec2_node_2: ec2_node_3,
    ec2_node_3: ec2_node_3,
    strato_node_1: ec2_node_3
};
