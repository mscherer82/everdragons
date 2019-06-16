const web3Utils = require("web3-utils");
const Registrar = artifacts.require("./Registrar.sol");
const EverDragons = artifacts.require("./EverDragons.sol");
const EverDragonsPlayer = artifacts.require("./EverDragonsPlayer.sol");
const EverDragonsBridge = artifacts.require("./EverDragonsBridge.sol");
const ReverseAuction = artifacts.require("./ReverseAuction.sol");
const Scarcity = artifacts.require("./Scarcity.sol");
const ZeroScarcity = artifacts.require("./ZeroScarcity.sol");
const CubsGenerator = artifacts.require("./CubsGenerator.sol");
const DragonsGenerator = artifacts.require("./DragonsGenerator.sol");
const getChainConfig = require("everdragons-shared/config/chainConfig");
const toBytes32 = (str) => web3Utils.padRight(web3Utils.asciiToHex(str), 64);

module.exports = function(deployer, network) {

    deployer.then(async () => {
        const chainConfig = getChainConfig(network);
        const dragonScarcity = chainConfig.chain === "TRON" ? "Scarcity" : "ZeroScarcity";

        const registrar = await Registrar.deployed();

        await deployer.deploy(EverDragons, registrar.address);
        await deployer.deploy(ReverseAuction, registrar.address);
        await deployer.deploy(Scarcity, registrar.address);
        await deployer.deploy(ZeroScarcity, registrar.address);
        await deployer.deploy(EverDragonsPlayer, registrar.address, chainConfig.goldPrice.toString(10));
        await deployer.deploy(CubsGenerator, registrar.address, toBytes32("ZeroScarcity"));
        await deployer.deploy(DragonsGenerator, registrar.address, toBytes32(dragonScarcity));
        await deployer.deploy(EverDragonsBridge, registrar.address);
    });
};
