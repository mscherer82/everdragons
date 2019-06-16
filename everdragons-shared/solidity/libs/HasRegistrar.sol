pragma solidity ^0.4.0;

import "../interfaces/IRegistrar.sol";

contract HasRegistrar {

    IRegistrar internal registrar;

    constructor(address registrarAddress) public {
        require(registrarAddress != address(0), "registrar address not available");
        registrar = IRegistrar(registrarAddress);
    }

    modifier hasRole(bytes32 role) {
        require(registrar.checkRole(role, msg.sender) , "not permitted");
        _;
    }
}
