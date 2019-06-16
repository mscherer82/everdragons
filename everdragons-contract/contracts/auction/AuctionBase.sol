pragma solidity ^0.4.0;

import "./../../node_modules/everdragons-shared/solidity/interfaces/IEverDragons.sol";
import "./../../node_modules/everdragons-shared/solidity/libs/Pausable.sol";
import "./../../node_modules/everdragons-shared/solidity/libs/HasRegistrar.sol";
import "./../../node_modules/everdragons-shared/solidity/libs/HasWallet.sol";

contract AuctionBase is Pausable, HasRegistrar, HasWallet {
    event AuctionCreated(uint64 tokenId, uint128 startingPrice, uint128 endingPrice, uint32 duration);
    event AuctionSuccessful(uint64 tokenId, uint128 totalPrice, address winner, uint256 voucher);
    event AuctionCancelled(uint64 tokenId);

    struct Auction {
        address seller;
        uint64 tokenId;
        uint128 startingPrice;
        uint128 endingPrice;
        uint32 duration; // Duration in seconds
        uint32 startedAt; // Time when auction started or 0 for concluded auction
    }

    mapping(uint64 => uint256) tokenIdToAuction;
    mapping(address => uint256[]) sellerToAuctions;
    Auction[] auctions;
    uint256 internal ownerCut;

    function addAuction(Auction auction) internal {
        uint256 auctionId = auctions.push(auction) - 1;
        tokenIdToAuction[auction.tokenId] = auctionId;
        sellerToAuctions[auction.seller].push(auctionId);

        emit AuctionCreated(auction.tokenId, auction.startingPrice, auction.endingPrice, auction.duration);
    }

    function removeAuction(uint256 auctionId) internal {
        Auction storage auction = auctions[auctionId];
        delete tokenIdToAuction[auction.tokenId];

        address delSeller = auction.seller;
        uint delIndex = auctionId;

        address movSeller = auctions[auctions.length - 1].seller;
        uint movIndex = auctions.length - 1;

        if (auctionId == auctions.length - 1) {
            delete auctions[auctions.length - 1];
        } else {
            auctions[auctionId] = auctions[auctions.length - 1]; // copy last auction to deleted auction
            delete auctions[auctions.length - 1];
            tokenIdToAuction[auctions[auctionId].tokenId] = auctionId;
        }

        sellerArrayMoveIndex(movSeller, delIndex, movIndex);
        sellerArrayRemove(delSeller, delIndex);
        auctions.length--;
    }

    function sellerArrayMoveIndex(address seller, uint256 delIndex, uint256 movIndex) internal {
        uint256 len = sellerToAuctions[seller].length;
        for (uint256 i = 0; i < len; i++) {
            if (sellerToAuctions[seller][i] == movIndex) {
                sellerToAuctions[seller][i] = delIndex;
                return;
            }
        }
    }

    function sellerArrayRemove(address seller, uint256 delIndex) internal {
        uint256 len = sellerToAuctions[seller].length;
        for (uint256 i = 0; i < len; i++) {
            if (sellerToAuctions[seller][i] == delIndex) {
                sellerToAuctions[seller][i] = sellerToAuctions[seller][len - 1];
                delete sellerToAuctions[seller][len - 1];
                sellerToAuctions[seller].length--;
                return;
            }
        }
    }

    function isOnAuction(Auction auction) internal pure returns (bool) {
        return (auction.startedAt > 0);
    }

    function owns(address claimant, uint64 tokenId) internal view returns (bool) {
        IEverDragons dragonsContract = IEverDragons(registrar.getAddress("EverDragons"));
        return (dragonsContract.ownerOf(tokenId) == claimant);
    }

    function calcRegularAuctionPrice(Auction auction) internal view returns (uint256) {
        uint256 secondsPassed = now > auction.startedAt ? now - auction.startedAt : 0;
        if (secondsPassed >= auction.duration) {
            return auction.endingPrice;
        } else {
            int256 priceChange = int256(auction.endingPrice) - int256(auction.startingPrice);
            int256 currentPriceChange = priceChange * int256(secondsPassed) / int256(auction.duration);
            return uint256(int256(auction.startingPrice) + currentPriceChange);
        }
    }

    function calcSecondsRemaining(Auction auction) internal view returns (uint256) {
        uint256 secondsPassed = now > auction.startedAt ? now - auction.startedAt : 0;
        uint256 secondsRemaining = secondsPassed < auction.duration ? auction.duration - secondsPassed : 0;
        return secondsRemaining;
    }

    function isNSEAuction(Auction auction) internal view returns (bool) {
        return (auction.seller == registrar.getAddress("EverDragons"));
    }
}
