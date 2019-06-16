pragma solidity ^0.4.0;

import "../../node_modules/everdragons-shared/solidity/libs/Ownable.sol";
import "../../node_modules/everdragons-shared/solidity/interfaces/IRegistrar.sol";

contract Registrar is IRegistrar, Ownable {
    mapping(uint8 => address) private generators;
    mapping(bytes32 => address) private addresses;
    mapping(bytes32 => mapping(address => bool)) private roles;

    function registerAddress(bytes32 name, address _address) external onlyOwner {
        addresses[name] = _address;
    }

    function removeAddress(bytes32 name) external onlyOwner {
        addresses[name] = address(0);
    }

    function getAddress(bytes32 name) external view returns (address) {
        require(addresses[name] != address(0), "address not found");
        return addresses[name];
    }

    function addRole(bytes32 role, address account) external onlyOwner {
        roles[role][account] = true;
    }

    function removeRole(bytes32 role, address account) external onlyOwner {
        roles[role][account] = false;
    }

    function checkRole(bytes32 role, address account) external view returns (bool) {
        return roles[role][account];
    }

    function setGenerator(uint8 index, address generator) external onlyOwner {
        generators[index] = generator;
    }

    function getGenerator(uint8 index) external view returns (address) {
        return generators[index];
    }
}
