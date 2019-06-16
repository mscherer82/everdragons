pragma solidity ^0.4.0;

import "./EDGBase.sol";
import "../../interfaces/IEverDragons.sol";
import "../../interfaces/IEverDragonsPlayer.sol";

contract EDHosted is EDGBase {

  enum GameStatus {NOT_STARTED, HOSTED, STARTED, PLAYER_QUIT, PLAYER_SURRENDERED, PLAYER_GOT_REPORTED, FINISHED, FAILED}
  enum GameOptions {NONE, CAN_QUIT, CAN_REPORT, CAN_SURRENDER, CAN_CLAIM, CANT_CALIM, NOT_PARTICIPANT}

  struct Game {
    uint32 price;
    uint16 maxPlayers;
    uint64[] dragons;
    uint64[] winners;
    uint8 status;
  }

  mapping(uint => Game) games;

  function createGame(uint32 price, uint16 maxPlayers) internal {
    addGame();
    Game storage game = games[gamesCount];
    game.price = price;
    game.maxPlayers = maxPlayers;
    game.status = uint8(GameStatus.HOSTED);
  }

  function host(uint32 price, uint16 maxPlayers, uint64 dragonDNA) internal {
    requestFees(dragonDNA, price, true);
    createGame(price, maxPlayers);
    games[gamesCount].dragons.push(dragonDNA);
  }

  function join(uint gameId, uint64 dragonDNA) internal {
    Game storage game = games[gameId];

    isAllowedToJoin(gameId);
    requestFees(dragonDNA, game.price, false);

    game.dragons.push(dragonDNA);
    emit Joined(gameId, msg.sender, dragonDNA);

    if (game.maxPlayers == game.dragons.length) {
      game.status = uint8(GameStatus.STARTED);
      emit Started(gameId);
    }
  }

  function payoutWinners(uint gameId, bool hasFinished) internal {
    IEverDragons dragonsContract = IEverDragons(registrar.getAddress("EverDragons"));
    IEverDragonsPlayer playerContract = IEverDragonsPlayer(registrar.getAddress("Player"));

    Game storage game = games[gameId];
    uint prizePot = game.maxPlayers * game.price;
    playerContract.payoutCutAndBonus(prizePot);
    prizePot -= playerContract.getCutGoldValue(prizePot);
    prizePot /= game.winners.length;

    for (uint i = 0; i < game.winners.length; i++) {
      dragonsContract.modifyDragonPrestige(game.winners[i], 1);
      playerContract.modifyItem(dragonsContract.ownerOf(game.winners[i]), "goldToClaim", int32(prizePot));
      if (!hasFinished) {
        // only winners get xp
        dragonsContract.modifyDragonExperience(game.winners[i], 1);
      }
    }

    for (i = 0; i < game.dragons.length; i++) {
      if (hasFinished) {
        // xp for all dragons
        dragonsContract.modifyDragonExperience(game.dragons[i], 1);
      }
      dragonsContract.modifyDragonState(game.dragons[i], 0);
    }
    checkForFinishedGames();
    emit Finished(gameId, game.winners);
  }

  function paybackFees(uint gameId) internal {
    IEverDragonsPlayer playerContract = IEverDragonsPlayer(registrar.getAddress("Player"));
    IEverDragons dragonsContract = IEverDragons(registrar.getAddress("EverDragons"));
    Game storage game = games[gameId];
    for (uint i = 0; i < game.dragons.length; i++) {
      playerContract.modifyItem(dragonsContract.ownerOf(game.dragons[i]), "gold", int32(game.price));
      dragonsContract.modifyDragonState(game.dragons[i], 0);
    }
    checkForFinishedGames();
    emit Finished(gameId, game.winners);
  }

  function checkPrestige(bool isHost, uint32 price, uint32 prestige) internal pure returns (bool) {
    return !isHost || ((price == 10 || price <= prestige * 10) && price % 10 == 0);
  }

  function requestFees(uint64 dragonDNA, uint32 price, bool isHost) internal returns (bool) {
    IEverDragons dragonsContract = IEverDragons(registrar.getAddress("EverDragons"));
    IEverDragonsPlayer playerContract = IEverDragonsPlayer(registrar.getAddress("Player"));

    require(dragonsContract.ownerOf(dragonDNA) == msg.sender, "player must own dragon");

    (, , uint32 prestige, uint16 state, ) = dragonsContract.getDragon(dragonDNA);
    require(checkPrestige(isHost, price, prestige), "not engough prestige");

    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    //    require(state & 0x01 == 0, "dragon must be idle");

    uint32 gold = playerContract.getItemForUser(msg.sender, "gold");
    require(gold >= price, "not engough coins");

    playerContract.modifyItem(msg.sender, "gold", int32(-price));
    dragonsContract.modifyDragonState(dragonDNA, gameUID);
  }

  function checkForFinishedGames() public {
    for (uint i = finishedUntil; i <= gamesCount; i++) {
      if (games[i].status < 3) {
        finishedUntil = i;
        return;
      }
    }
  }

  function isAllowedToJoin(uint gameId) internal view returns (bool) {
    IEverDragons dragonsContract = IEverDragons(registrar.getAddress("EverDragons"));
    Game storage game = games[gameId];
    require(game.maxPlayers > game.dragons.length, "max player for game reached");
    for (uint i = 0; i < game.dragons.length; i++) {
      require(dragonsContract.ownerOf(game.dragons[i]) != msg.sender, "player can only join once");
    }
  }

  function hasStarted(uint gameId) public view returns (bool) {
    Game storage game = games[gameId];
    return game.status >= uint8(GameStatus.STARTED);
  }

  function isInProgress(uint gameId) public view returns (bool) {
    Game storage game = games[gameId];
    return game.status == uint8(GameStatus.STARTED);
  }

  function hasFinished(uint gameId) public view returns (bool) {
    Game storage game = games[gameId];
    return game.status >= uint8(GameStatus.PLAYER_QUIT);
  }

  function getWinners(uint gameId) public view returns (uint64[]) {
    Game storage game = games[gameId];
    require(game.status >= uint8(GameStatus.PLAYER_QUIT), "game has to be finished");
    return game.winners;
  }

  function getGame(uint gameId)

    public
    view
    returns (uint32 price, uint16 maxPlayers, uint64[] dragons, uint64[] winners, uint8 status)
  {
    Game storage game = games[gameId];
    return (game.price, game.maxPlayers, game.dragons, game.winners, game.status);
  }

  function getOpenGames(uint256 offset) public view returns (uint[10] gameIds) {
    uint count = 0;
    for (uint256 i = finishedUntil + offset; i <= gamesCount && count < 10; i++) {
      Game storage game = games[i];
      if (game.status == 1) {
        gameIds[count++] = i;
      }
    }
  }

  function getActiveGames(uint256 offset) public view returns (uint[10] gameIds) {
    uint count = 0;
    for (uint256 i = finishedUntil + offset; i <= gamesCount && count < 10; i++) {
      Game storage game = games[i];
      if (game.status == 2) {
        gameIds[count++] = i;
      }
    }
  }

  function getGamesForPlayer(address player, uint256 offset) public view returns (uint[5] gameIds) {
    IEverDragons dragonsContract = IEverDragons(registrar.getAddress("EverDragons"));
    uint count = 0;
    for (uint256 i = gamesCount - offset; i > 0 && count < 5; i--) {
      Game storage game = games[i];
      for (uint256 j = 0; j < game.dragons.length; j++) {
        if (dragonsContract.ownerOf(game.dragons[j]) == player) {
          gameIds[count++] = i;
        }
      }
    }
  }

  function getPrizePot(uint gameId) public view returns (uint prizePot) {
    IEverDragonsPlayer playerContract = IEverDragonsPlayer(registrar.getAddress("Player"));
    Game storage game = games[gameId];
    prizePot = game.maxPlayers * game.price;
    prizePot -= playerContract.getCutGoldValue(prizePot);
    return prizePot;
  }

}
