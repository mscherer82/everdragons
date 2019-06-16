pragma solidity ^0.4.0;

import "./EverDragonsScarcity.sol";

contract EverDragonsImport is EverDragonsScarcity {
    function impDragon(
        uint64 dna,
        uint24 attributes,
        uint32 experience,
        uint32 prestige,
        uint16 state,
        bytes32 name,
        address owner,
        address approvedFor
    ) external hasRole("minter") {
        require(dnaToDragon[dna].attributes == 0, "dna already exists");

        dnaToDragon[dna] = Dragon(name, attributes, experience, prestige, state);

        dragonIndexToOwner[dna] = owner;
        dragonIndexToApproved[dna] = approvedFor;
        ownedTokens[owner].push(dna);
        DNAs.push(dna);
        emit Create(dna);
    }

    function impBlockedDNA(uint64 dna) external hasRole("admin") {
        blockedDNA[dna] = true;
    }
}
