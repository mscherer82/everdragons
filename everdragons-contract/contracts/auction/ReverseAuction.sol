pragma solidity ^0.4.0;

import "./AuctionAdmin.sol";
import "../voucher/IVoucher.sol";
import "../generators/IGenerator.sol";

contract ReverseAuction is AuctionAdmin {
    constructor(address registrarAddress) public HasRegistrar(registrarAddress) {}

    function createAuction(uint64 tokenId, uint128 startingPrice, uint128 endingPrice, uint32 duration, address seller)
        external
        whenNotPaused
    {
        require(startingPrice >= startPriceMin && startingPrice <= startPriceMax, "invalid starting price");
        require(endingPrice >= endPriceMin && endingPrice <= endPriceMax, "invalid ending price");
        require(duration >= minDuration && duration <= maxDuration, "invalid duration");
        require(!reveresOnly || startingPrice >= endingPrice, "only reverse auctions allowed");

        IEverDragons dragonsContract = IEverDragons(registrar.getAddress("EverDragons"));
        require(dragonsContract.canBeTransferred(tokenId), "item can't be transferred");

        IGenerator generator = IGenerator(registrar.getGenerator(uint8(tokenId & 0xFF)));
        require(generator.canBeSold(tokenId), "item type can't be sold");

        dragonsContract.transferFrom(seller, this, tokenId);
        Auction memory auction = Auction(seller, tokenId, startingPrice, endingPrice, duration, uint32(now));
        addAuction(auction);
    }

    function getAuction(uint256 auctionId)
        public
        view
        returns (
        address seller,
        uint64 tokenId,
        uint128 startingPrice,
        uint128 endingPrice,
        uint32 duration,
        uint32 startedAt
    )
    {
        Auction storage auction = auctions[auctionId];
        return (auction.seller, auction.tokenId, auction.startingPrice, auction.endingPrice, auction.duration, auction.startedAt);
    }

    function isAuctionFinished(uint256 auctionId) external view returns (bool) {
        return auctions[auctionId].startedAt > 0 && now > auctions[auctionId].startedAt && now - auctions[auctionId].startedAt >= auctions[auctionId].duration;
    }

    function getAuctionCount() external view returns (uint256) {
        return auctions.length;
    }

    function getAuctionByTokenId(uint64 _tokenId)
        external
        view
        returns (
        address seller,
        uint64 tokenId,
        uint128 startingPrice,
        uint128 endingPrice,
        uint32 duration,
        uint32 startedAt
    )
    {
        return getAuction(tokenIdToAuction[_tokenId]);
    }

    function getAuctionIdByTokenId(uint64 tokenId) public view returns (uint256) {
        return tokenIdToAuction[tokenId];
    }

    function getAuctionCountForSeller(address user) external view returns (uint256) {
        return sellerToAuctions[user].length;
    }

    function getAuctionIdForSeller(address user, uint256 idx) external view returns (uint256) {
        return sellerToAuctions[user][idx];
    }

    function getAuctionIdsForSeller(address seller) external view returns (uint256[]) {
        return sellerToAuctions[seller];
    }

    function getAuctionForSeller(address user, uint256 idx)
        external
        view
        returns (
        address seller,
        uint64 tokenId,
        uint128 startingPrice,
        uint128 endingPrice,
        uint32 duration,
        uint32 startedAt
    )
    {
        return getAuction(sellerToAuctions[user][idx]);
    }

    function getCurrentPriceByTokenId(uint64 tokenId, uint256 voucherCode, uint256 gold, uint256 copper)
        external
        view
        returns (
        uint256 price,
        uint256 regularPrice,
        uint256 goldDiscount,
        uint256 copperDiscount,
        uint256 voucherDiscount,
        uint256 secondsRemaining
    )
    {
        uint256 auctionId = getAuctionIdByTokenId(tokenId);
        require(auctionId != 0, "token not found");
        return getCurrentPrice(auctionId, voucherCode, gold, copper);
    }

    function getCurrentPrice(uint256 auctionId, uint256 voucherCode, uint256 gold, uint256 copper)
        public
        view
        returns (
        uint256 price,
        uint256 regularPrice,
        uint256 goldDiscount,
        uint256 copperDiscount,
        uint256 voucherDiscount,
        uint256 secondsRemaining
    )
    {
        Auction storage auction = auctions[auctionId];
        require(isOnAuction(auction), "must be on auction");

        regularPrice = price = calcRegularAuctionPrice(auction);
        secondsRemaining = calcSecondsRemaining(auction);

        if (gold > 0) {
            goldDiscount = getGoldDiscount(gold);
            price -= goldDiscount;
        }

        if (voucherCode > 0) {
            require(auction.seller == registrar.getAddress("EverDragons"), "seller has to be dragon contract");
            IVoucher voucherContract = IVoucher(registrar.getAddress("Voucher"));
            (voucherDiscount, , ) = voucherContract.getDiscountedPrice(regularPrice, voucherCode);
            price -= voucherDiscount;
        }

        if (copper > 0) {
            copperDiscount = getCopperDiscount(copper, regularPrice);
            price -= copperDiscount;
        }
    }
}
