pragma solidity ^0.4.0;

import "./EverDragonsPlayerBase.sol";

contract EverDragonsPlayerItems is EverDragonsPlayerBase {
    event ItemChanged(address player, bytes32 item, uint32 value);

    function modifyItem(address player, bytes32 item, int32 value) external hasRole("modifier") {
        addPlayerIfNotExists(msg.sender);

        int64 result = int64(players[player].items[item]) + int64(value);
        if (result < 0) {
            players[player].items[item] = 0;
        } else if (result > int64(uint32(-1))) {
            players[player].items[item] = uint32(-1);
        }
        players[player].items[item] = uint32(result);
        emit ItemChanged(player, item, players[player].items[item]);
    }

    function setItem(address player, bytes32 item, uint32 value) external hasRole("modifier") {
        addPlayerIfNotExists(msg.sender);
        players[player].items[item] = value;
        emit ItemChanged(player, item, players[player].items[item]);
    }

    function getItem(bytes32 item) external view returns (uint32) {
        return getItemForUser(msg.sender, item);
    }

    function getItemForUser(address player, bytes32 item) public view returns (uint32) {
        return players[player].items[item];
    }
}
