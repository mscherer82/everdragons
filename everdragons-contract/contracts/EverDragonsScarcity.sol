pragma solidity ^0.4.0;

import "./EverDragonsModifier.sol";
import "./scarcity/IScarcity.sol";

contract EverDragonsScarcity is EverDragonsModifier {
    function getNumOfRequiredDragons(uint8 dragonType) public view returns (uint256) {
        IGenerator generator = IGenerator(registrar.getGenerator(dragonType));
        IScarcity scarcity = IScarcity(registrar.getAddress(generator.getScarcityName()));
        return scarcity.calcRequiredDragons();
    }

    function createNewDragons(uint8 dragonType) external hasRole("minter") {
        uint required = getNumOfRequiredDragons(dragonType);
        for (uint256 i = 0; i < required; i++) {
            createNSE(dragonType, 0); // version 0 means currentVersion from generator
        }
    }

    function createNSE(uint8 dragonType, uint8 version) internal {
        uint64 dna = generateDragon(dragonType, version);
        if (dna != 0) {
            mint(address(this), uint256(dna));
            dragonIndexToApproved[dna] = address(registrar.getAddress("ReverseAuction"));
            createAuctionForNSE(dna);
        }
    }
}
