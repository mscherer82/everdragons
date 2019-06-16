pragma solidity ^0.4.0;

import "./HasRegistrar.sol";

contract HasWallet is HasRegistrar {

    function payout() public hasRole("admin") {
        registrar.getAddress("cutWallet").transfer(address(this).balance);
    }

    function() external payable {
    }
}
