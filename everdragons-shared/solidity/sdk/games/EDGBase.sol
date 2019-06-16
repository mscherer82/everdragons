pragma solidity ^0.4.0;

import "../../libs/Pausable.sol";
import "../../libs/HasRegistrar.sol";


contract EDGBase is Pausable, HasRegistrar {

    event NewGame(uint256 indexed gameId);
    event Joined(uint256 indexed gameId, address player, uint64 dna);
    event Started(uint256 indexed gameId);
    event Finished(uint256 indexed gameId, uint64[] winners);

    uint16 public gameUID;
    uint256 public gamesCount = 0;
    uint256 public finishedUntil = 1;

    constructor(uint16 _gameUID) internal {
        require(_gameUID > 0, "gameUID is required");
        gameUID = _gameUID;
    }

    function addGame() internal returns (uint256) {
        gamesCount++;
        emit NewGame(gamesCount);
        return gamesCount;
    }
}
