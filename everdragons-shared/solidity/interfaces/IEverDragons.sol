pragma solidity ^0.4.0;

import "./IERC721.sol";

contract IEverDragons is IERC721 {
    function getDragon(uint64 dna) external view returns (
        uint24 attributes, uint32 experience, uint32 prestige, uint16 state, bytes32 name);

    function modifyDragonAttributes(uint64 dna, uint24 attributes) external;

    function modifyDragonExperience(uint64 dna, int32 experience) external;

    function modifyDragonPrestige(uint64 dna, int32 prestige) external;

    function modifyDragonName(uint64 dna, bytes32 name) external;

    function modifyDragonState(uint64 dna, uint16 state) external;

    function modifyDragonItem(uint64 dna, bytes32 item, int32 value) external;

    function exists(uint256 tokenId) public view returns (bool);

    function impDragon(
        uint64 dna,
        uint24 attributes,
        uint32 experience,
        uint32 prestige,
        uint16 state,
        bytes32 name,
        address owner,
        address approvedFor
    ) external;

    function createNewDragons(uint8 dragonType) external;
}
