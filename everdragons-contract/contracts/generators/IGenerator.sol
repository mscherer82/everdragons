pragma solidity ^0.4.0;

contract IGenerator {
    function getDragonData(uint8 version, uint256 counter) external view returns (uint64 dna, uint24 attributes);
    function isSoulBound(uint96 dna, uint24 attributes, uint32 experience, uint32 prestige) external view returns (bool);
    function getScarcityName() public view returns (bytes32);
    function canBeSold(uint64 dna) external view returns (bool);
}
