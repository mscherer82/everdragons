pragma solidity ^0.4.0;

import "../../node_modules/everdragons-shared/solidity/libs/HasRegistrar.sol";
import "../auction/ReverseAuction.sol";

contract Scarcity is HasRegistrar {
    uint256 internal minNSEOnMarket = 20;
    uint256 internal minNSEPercentage = 10;
    uint256 internal maxNSEAtMinPricePercentage = 50;

    constructor(address registrarAddress) public HasRegistrar(registrarAddress) {}

    function setNSEScarcityValues(
        uint256 _minNSEOnMarket,
        uint256 _minNSEPercentage,
        uint256 _maxNSEAtMinPricePercentage
    ) external hasRole("admin") {
        minNSEOnMarket = _minNSEOnMarket;
        minNSEPercentage = _minNSEPercentage;
        maxNSEAtMinPricePercentage = _maxNSEAtMinPricePercentage;
    }

    function calcRequiredDragons() external view returns (uint256) {
        ReverseAuction auction = ReverseAuction(registrar.getAddress("ReverseAuction"));
        uint256 currentAvailableNSE = auction.getAuctionCountForSeller(registrar.getAddress("EverDragons"));
        uint256 auctionCount = auction.getAuctionCount();

        // 1. current available NES on market < 20
        if (currentAvailableNSE < minNSEOnMarket || auctionCount == 0) {
            return 2;
        } else {
            // 2. min 10% on the market are NES
            uint256 NSEPercentage = (currentAvailableNSE * 100) / auctionCount;
            if (NSEPercentage < minNSEPercentage) {
                uint256 numFinished = 0;
                for (uint256 i = 0; i < currentAvailableNSE; i++) {
                    uint256 tokenId = auction.getAuctionIdForSeller(registrar.getAddress("EverDragons"), i);
                    if (auction.isAuctionFinished(tokenId)) {
                        numFinished++;
                    }
                }
                // 3. max 50% NES auctions on the market are not finished
                uint256 NSEAtMinPricePercentage = (numFinished * 100) / currentAvailableNSE;
                if (NSEAtMinPricePercentage < maxNSEAtMinPricePercentage) {
                    return 2;
                }
            }
        }
        return 0;
    }
}
