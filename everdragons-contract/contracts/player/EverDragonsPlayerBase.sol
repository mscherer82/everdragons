pragma solidity ^0.4.0;

import "../../node_modules/everdragons-shared/solidity/libs/HasRegistrar.sol";
import "../../node_modules/everdragons-shared/solidity/libs/Pausable.sol";
import "../../node_modules/everdragons-shared/solidity/libs/HasWallet.sol";

contract EverDragonsPlayerBase is HasRegistrar, Pausable, HasWallet {
    struct Player {
        mapping(bytes32 => uint32) items;
        mapping(bytes32 => address) linkedAccounts;
        bytes32 name;
        bool hasItems;
    }

    mapping(address => Player) internal players;
    address[] allPlayers;

    function playersCount() public view returns (uint) {
        return allPlayers.length;
    }

    function getPlayerByIndex(uint256 index) external view returns (address) {
        require(index < playersCount(), "index too large");
        return allPlayers[index];
    }

    function getLinkedAccount(bytes32 chain) external view returns (address) {
        return getLinkedAccountForUser(msg.sender, chain);
    }

    function getLinkedAccountForUser(address player, bytes32 chain) public view returns (address) {
        return players[player].linkedAccounts[chain];
    }

    function linkAccount(bytes32 chain, address account) external {
        addPlayerIfNotExists(msg.sender);
        address player = msg.sender;
        players[player].linkedAccounts[chain] = account;
    }

    function linkAccountForUser(address player, bytes32 chain, address account) external hasRole("admin") {
        addPlayerIfNotExists(player);
        players[player].linkedAccounts[chain] = account;
    }

    function addPlayerIfNotExists(address player) internal {
        if (!players[player].hasItems) {
            players[player] = Player({hasItems: true, name: ""});
            allPlayers.push(player);
        }
    }
}
