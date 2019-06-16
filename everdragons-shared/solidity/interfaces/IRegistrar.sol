pragma solidity ^0.4.0;

contract IRegistrar {
    function registerAddress(bytes32 name, address contractAddress) external;
    function removeAddress(bytes32 name) external;
    function getAddress(bytes32 name) external view returns(address);

    function addRole(bytes32 role, address account) external;
    function removeRole(bytes32 role, address account) external;
    function checkRole(bytes32 role, address user) external view returns(bool);

    function setGenerator(uint8 index, address generator) external;
    function getGenerator(uint8 index) external view returns(address);
}
