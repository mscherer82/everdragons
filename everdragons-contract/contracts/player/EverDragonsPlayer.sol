pragma solidity ^0.4.0;

import "./EverDragonsPlayerPayment.sol";

contract EverDragonsPlayer is EverDragonsPlayerPayment {
    constructor(address registrarAddress, uint256 _goldPrice)
        public
        EverDragonsPlayerPayment(_goldPrice)
        HasRegistrar(registrarAddress)
    {}

    function setNameForUser(address player, bytes32 name) public {
        require(
            msg.sender == player || registrar.checkRole("admin", msg.sender),
            "only msg.sender or admin can payout"
        );
        addPlayerIfNotExists(msg.sender);
        players[player].name = name;
    }

    function setName(bytes32 name) external {
        setNameForUser(msg.sender, name);
    }

    function getNameForUser(address player) public view returns (bytes32) {
        return players[player].name;
    }

    function getName() public view returns (bytes32) {
        return getNameForUser(msg.sender);
    }
}
