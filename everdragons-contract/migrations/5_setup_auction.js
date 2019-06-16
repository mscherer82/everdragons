const BN = require("bn.js");
const EverDragons = artifacts.require("./EverDragons.sol");
const ReverseAuction = artifacts.require("./ReverseAuction.sol");
const getChainConfig = require("everdragons-shared/config/chainConfig");

module.exports = function (deployer, network) {

    deployer.then(async () => {

        const chainConfig = getChainConfig(network);
        const everdragons = await EverDragons.deployed();
        const auction = await ReverseAuction.deployed();
        const auctionValues = {};

        try {
            Object.keys(chainConfig.auctionValues).forEach(k => {
                auctionValues[k] = new BN(chainConfig.auctionValues[k].toString(10)).mul(new BN(chainConfig.currencyValue.toString(10))).toString(10);
            });

            await everdragons.setNSEAuctionValues(
                auctionValues.startPriceNSE,
                auctionValues.endPriceNSE,
                chainConfig.auctionValues.durationNSE
            );

            await auction.setMinandMaxPrice(
                auctionValues.startPriceMin,
                auctionValues.startPriceMax,
                auctionValues.endPriceMin,
                auctionValues.endPriceMax,
                chainConfig.auctionValues.durationMin,
                chainConfig.auctionValues.durationMax
            );
        } catch (e) {
            console.log(e);
            throw e;
        }
    });
};
