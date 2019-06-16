pragma solidity ^0.4.0;

contract IVoucher {
    function getDiscountedPrice(uint256 price, uint256 code)
        external
        view
        returns (uint256 discount, uint256 reward, address owner);

}
