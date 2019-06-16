const convert = require('xml-js');
const stringToStream = require('string-to-stream');
const fs = require('fs');
const config = require('everdragons-shared/config');
const accountUtils = require('everdragons-shared/accounts');
const initDatabase = require('everdragons-shared/utils/database').initDatabase;
const dnaUtils = require('everdragons-shared/utils/dna');
const serverUtils = require('everdragons-shared/utils/serverUtils');
const s3Upload = require('./s3-upload');
const dragonSVG = require('./dragon-svg');
const sharp = require('sharp');

let dragonsCollection;
let accounts;

const creatorFunctions = {
    1: dragonSVG.creatDragon,
    2: dragonSVG.creatCub,
};

const iterateThroughNewDragons = async () => {
    const newDragons = await dragonsCollection.find({hasImage: false}).toArray();

    for (let i = 0; i < newDragons.length; i++) {
        const dragon = newDragons[i];
        const dnaParts = dnaUtils.extractDNA(dragon.dna);
        const attributes = dnaUtils.extractAttributes(dragon.attributes);

        const name = dnaParts.type.toString(10).padStart(2, '0') + dnaParts.layers.reduce((s, l) => s + l.toString(10).padStart(2, '0'), '');
        const svg = creatorFunctions[dnaParts.type](dnaParts.layers, name, attributes.domain, attributes.color);

        const svgFile = convert.js2xml(svg, {compact: true});
        const svgStream = stringToStream(svgFile);
        await s3Upload.uploadS3(svgStream, name + '.svg', 'image/svg+xml');

        /* const pngFile = await csvg.convert(svgFile, {
            width: config.dragonSVG.PNG_WIDTH,
            height: config.dragonSVG.PNG_HEIGHT,
        }); */

        const pngFile = await sharp(new Buffer(svgFile)).png().toBuffer();
        const pngStream = stringToStream(pngFile);
        await s3Upload.uploadS3(pngStream, name + '.png', 'image/png');
        await dragonsCollection.updateOne({_id: dragon._id}, {$set: {hasImage: true}});
    }
};

const main = async () => {
    try {
        await serverUtils.initAccounts();
        accounts = accountUtils.accounts;

        const collections = await initDatabase();
        dragonsCollection = collections.dragonsCollection;
        s3Upload.initS3();

        const interv = async () => {
            try {
                console.log('looking for new dragons');
                await iterateThroughNewDragons();
            } catch (e) {
                serverUtils.exit(e);
            }
            setTimeout(interv, config.dragonSVG.INTERVAL);
        };

        setTimeout(interv, config.dragonSVG.INTERVAL);
    } catch (e) {
        serverUtils.exit(e);
    }
};

main();

process.on('uncaughtException', function(error) {
    serverUtils.exit(error);
});

process.on('unhandledRejection', function(reason) {
    serverUtils.exit(reason);
});
