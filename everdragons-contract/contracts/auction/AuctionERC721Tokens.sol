pragma solidity ^0.4.0;

import "./../../node_modules/everdragons-shared/solidity/interfaces/IEverDragons.sol";
import "../player/EverDragonsPlayer.sol";
import "../voucher/IVoucher.sol";
import "./AuctionBase.sol";

contract AuctionERC721Tokens is AuctionBase {
    function bid(uint64 tokenId, uint256 voucherCode, uint256 gold, uint256 copper) public payable whenNotPaused {
        uint256 auctionId = tokenIdToAuction[tokenId];
        Auction storage auction = auctions[auctionId];
        require(isOnAuction(auction), "must be on auction");

        uint256 regularPrice = calcRegularAuctionPrice(auction);
        uint256 price = regularPrice;
        uint256 goldValue = gold > 0 ? applyGoldValue(gold) : 0;

        if (isNSEAuction(auction)) {
            if (voucherCode > 0) {
                price = applyVoucherDiscount(voucherCode, regularPrice);
            }
            if (copper > 0) {
                price = applyCopperDiscount(copper, regularPrice);
            }

            require(msg.value + goldValue >= price, "bit amount too small");
            registrar.getAddress("cutWallet").transfer(msg.value);
        } else {
            require(copper == 0 && voucherCode == 0, "discount only possible for NSE");
            require(msg.value + goldValue >= price, "bit amount too small");

            uint256 auctioneerCut = price * ownerCut / 10000;
            uint256 sellerProceeds = price - auctioneerCut;
            auction.seller.transfer(sellerProceeds);
            registrar.getAddress("cutWallet").transfer(auctioneerCut);
        }

        removeAuction(auctionId);

        IEverDragons dragonsContract = IEverDragons(registrar.getAddress("EverDragons"));
        dragonsContract.transfer(msg.sender, tokenId);
        dragonsContract.createNewDragons(uint8(tokenId & 0xFF));

        emit AuctionSuccessful(tokenId, uint64(price), msg.sender, voucherCode);
    }

    function cancelAuction(uint64 tokenId) external {
        uint256 auctionId = tokenIdToAuction[tokenId];

        Auction storage auction = auctions[auctionId];
        address seller = auction.seller;

        require(isOnAuction(auction), "must be on auction");
        require(msg.sender == seller || registrar.checkRole("admin", msg.sender), "sender must be seller");

        removeAuction(auctionId);

        IEverDragons dragonsContract = IEverDragons(registrar.getAddress("EverDragons"));
        dragonsContract.transfer(seller, tokenId);

        emit AuctionCancelled(tokenId);
    }

    function getGoldDiscount(uint256 gold) public view returns (uint256) {
        EverDragonsPlayer playerContract = EverDragonsPlayer(registrar.getAddress("Player"));
        return gold * playerContract.goldPrice();
    }

    function getCopperDiscount(uint256 copper, uint256 regularPrice) public pure returns (uint256) {
        require(copper <= 3000, "max 3000 copper");
        return (regularPrice * copper) / 10000;
    }

    function getVoucherDiscount(uint256 voucherCode, uint256 regularPrice) public view returns (uint256 price) {
        address voucherOwner;
        uint256 reward;
        IVoucher voucherContract = IVoucher(registrar.getAddress("Voucher"));
        (price, reward, voucherOwner) = voucherContract.getDiscountedPrice(regularPrice, voucherCode);
    }

    function applyGoldValue(uint256 gold) internal returns (uint256) {
        EverDragonsPlayer playerContract = EverDragonsPlayer(registrar.getAddress("Player"));
        playerContract.payGoldToContract(uint32(gold), msg.sender);
        return gold * playerContract.goldPrice();
    }

    function applyCopperDiscount(uint256 copper, uint256 regularPrice) internal returns (uint256) {
        require(copper <= 3000, "max 3000 copper");
        EverDragonsPlayer playerContract = EverDragonsPlayer(registrar.getAddress("Player"));

        require(playerContract.getItemForUser(msg.sender, "copper") >= copper, "not enough copper");
        playerContract.modifyItem(msg.sender, "copper", -int32(copper));
        return regularPrice - ((regularPrice * copper) / 10000);
    }

    function applyVoucherDiscount(uint256 voucherCode, uint256 regularPrice) internal returns (uint256 price) {
        address voucherOwner;
        uint256 reward;
        IVoucher voucherContract = IVoucher(registrar.getAddress("Voucher"));
        (price, reward, voucherOwner) = voucherContract.getDiscountedPrice(regularPrice, voucherCode);

        require(voucherOwner != address(0), "voucher owner must not be 0x00");
        require(voucherOwner != msg.sender, "voucher owner must not be msg.sender");
        voucherOwner.transfer(reward);
    }
}
