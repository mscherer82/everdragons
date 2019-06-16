pragma solidity ^0.4.0;

import "./AuctionERC721Tokens.sol";

contract AuctionAdmin is AuctionERC721Tokens {
    uint256 internal startPriceMin = 0 * 1e18;
    uint256 internal startPriceMax = 1000 * 1e18;
    uint256 internal endPriceMin = 0 * 1e18;
    uint256 internal endPriceMax = 1000 * 1e18;
    uint256 internal minDuration = 60;
    uint256 internal maxDuration = 7 * 24 * 60 * 60;
    bool internal reveresOnly = true;

    function setMinandMaxPrice(
        uint256 minStart,
        uint256 maxStart,
        uint minEnd,
        uint maxEnd,
        uint _minDuration,
        uint _maxDuration
    ) external hasRole("admin") {
        startPriceMin = minStart;
        startPriceMax = maxStart;
        endPriceMin = minEnd;
        endPriceMax = maxEnd;
        minDuration = _minDuration;
        maxDuration = _maxDuration;
    }

    function setReveresOnly(bool enabled) external hasRole("admin") {
        reveresOnly = enabled;
    }

    function setOwnerCut(uint256 cut) external hasRole("admin") {
        require(cut <= 10000, "cut too large");
        require(cut >= 0, "cut too small");
        ownerCut = cut;
    }

    function impAuction(
        address seller,
        uint64 tokenId,
        uint128 startingPrice,
        uint128 endingPrice,
        uint32 duration, // Duration in seconds
        uint32 startedAt // Time when auction started or 0 for concluded auction
    ) external onlyOwner {
        uint256 auctionId = auctions.push(Auction(seller, tokenId, startingPrice, endingPrice, duration, startedAt));
        tokenIdToAuction[tokenId] = auctionId;
        sellerToAuctions[seller].push(auctionId);
    }
}
