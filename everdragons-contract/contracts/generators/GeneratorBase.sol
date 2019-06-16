pragma solidity ^0.4.0;

import "../../node_modules/everdragons-shared/solidity/interfaces/IEverDragons.sol";
import "../../node_modules/everdragons-shared/solidity/libs/HasRegistrar.sol";
import "./IGenerator.sol";

contract GeneratorBase is IGenerator, HasRegistrar {
    bytes32 internal scarcityName;
    uint8 internal currentVersion;

    constructor(bytes32 _scarcityName) public {
        require(_scarcityName != 0, "scarcityName must be provided");
        scarcityName = _scarcityName;
        currentVersion = 1;
    }

    function getScarcityName() public view returns (bytes32) {
        return scarcityName;
    }

    function setCurrentVersion(uint8 version) external hasRole("admin") {
        currentVersion = version;
    }

    function pseudoRandom(uint256 counter) internal view returns (uint256) {
        uint256 lastBlockNumber = block.number - 1;
        uint256 hashVal = uint256(blockhash(lastBlockNumber));

        IEverDragons dragonContract = IEverDragons(registrar.getAddress("EverDragons"));

        return uint256(
            keccak256(
                abi.encodePacked(block.timestamp, block.difficulty, hashVal, dragonContract.totalSupply(), counter)
            )
        );
    }
}
