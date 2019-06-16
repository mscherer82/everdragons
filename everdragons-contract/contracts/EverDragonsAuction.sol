pragma solidity ^0.4.0;

import "./EverDragonsERC721Token.sol";
import "./auction/ReverseAuction.sol";

contract EverDragonsAuction is EverDragonsERC721Token {
    uint128 internal startPriceNES = 0.5 * 1e18;
    uint128 internal endPriceNES = 0.1 * 1e18;
    uint32 internal durrationNES = 48 * 60 * 60; // 48h

    function createAuction(uint64 dna, uint128 startingPrice, uint128 endingPrice, uint32 duration)
        public
        onlyOwnerOf(dna)
        whenNotPaused
    {
        require(canBeTransferred(dna), "token can't be transferred");
        ReverseAuction auction = ReverseAuction(registrar.getAddress("ReverseAuction"));
        approve(auction, dna);
        auction.createAuction(dna, startingPrice, endingPrice, duration, msg.sender);
    }

    function setNSEAuctionValues(uint128 _startPriceNES, uint128 _endPriceNES, uint32 _durrationNES)
        external
        hasRole("admin")
    {
        startPriceNES = _startPriceNES;
        endPriceNES = _endPriceNES;
        durrationNES = _durrationNES;
    }

    function createAuctionForNSE(uint64 dna) internal {
        ReverseAuction auction = ReverseAuction(registrar.getAddress("ReverseAuction"));
        auction.createAuction(dna, startPriceNES, endPriceNES, durrationNES, address(this));
    }
}
