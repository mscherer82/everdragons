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
const accountUtils = require("everdragons-shared/accounts");
const toBytes32 = (str) => web3Utils.padRight(web3Utils.asciiToHex(str), 64);

module.exports = function(deployer, network) {

    deployer.then(async () => {

        try {
            const accounts = accountUtils.accounts;
            const registrar = await Registrar.deployed();

            const everdragons = await EverDragons.deployed();
            const auctions = await ReverseAuction.deployed();
            const scarcity = await Scarcity.deployed();
            const zeroScarcity = await ZeroScarcity.deployed();
            const player = await EverDragonsPlayer.deployed();
            const cubsGenerator = await CubsGenerator.deployed();
            const dragonsGenerator = await DragonsGenerator.deployed();
            const bridge = await EverDragonsBridge.deployed();

            await registrar.registerAddress(toBytes32("cutWallet"), accounts.cutWallet.address);
            await registrar.registerAddress(toBytes32("bonusWallet"), accounts.bonusWallet.address);

            await registrar.addRole(toBytes32("admin"), accounts.owner.address);
            await registrar.addRole(toBytes32("admin"), accounts.admin.address);
            await registrar.addRole(toBytes32("minter"), accounts.admin.address);
            await registrar.addRole(toBytes32("modifier"), accounts.admin.address);

            // auctions can be paid with gold
            await registrar.addRole(toBytes32("payable"), auctions.address);

            // auctions can create NSEs
            await registrar.addRole(toBytes32("minter"), auctions.address);
            await registrar.addRole(toBytes32("bridgeAPI"), accounts.bridgeAPI.address);
            await registrar.addRole(toBytes32("gamesAPI"), accounts.gameAPI.address);

            await registrar.setGenerator(1, dragonsGenerator.address);
            await registrar.setGenerator(2, cubsGenerator.address);
            await registrar.registerAddress(toBytes32("EverDragons"), everdragons.address);
            await registrar.registerAddress(toBytes32("ReverseAuction"), auctions.address);
            await registrar.registerAddress(toBytes32("Scarcity"), scarcity.address);
            await registrar.registerAddress(toBytes32("ZeroScarcity"), zeroScarcity.address);
            await registrar.registerAddress(toBytes32("Player"), player.address);
            await registrar.registerAddress(toBytes32("Bridge"), bridge.address);

            await registrar.registerAddress(toBytes32("CubsGenerator"), cubsGenerator.address);
            await registrar.registerAddress(toBytes32("DragonsGenerator"), dragonsGenerator.address);
        } catch (e) {
            console.log(e);
            throw e;
        }
    });
};
