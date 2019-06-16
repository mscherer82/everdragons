pragma solidity ^0.4.0;

contract IEverDragonsPlayer {

    function modifyItem(address player, bytes32 item, int32 value) external;
    function setItem(address player, bytes32 item, uint32 value) external;
    function getItem(bytes32 item) external view returns(uint32);
    function getItemForUser(address player, bytes32 item) external view returns(uint32);

    function payoutCutAndBonus(uint256 totalIncome) external;
    function payoutGold(address player, uint32 value) external;
    function totalValue() external returns(uint256 value);

    function setCutAndBonus(uint256 _ownersCut, uint256 _dividendCut) external;
    function getOwnersCut() external view returns(uint256);
    function getDividendCut() external view returns(uint256);
    function getCutGoldValue(uint256 goldSpent) external view returns(uint256);
}
