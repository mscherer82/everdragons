pragma solidity ^0.4.0;

import "./EverDragonsPlayerItems.sol";

contract EverDragonsPlayerPayment is EverDragonsPlayerItems {
    uint256 public goldPrice;
    uint256 public ownersCut = 500;
    uint256 public dividendCut = 500;

    constructor(uint256 _goldPrice) public {
        require(_goldPrice > 0, "gold price must be > 0");
        goldPrice = _goldPrice;
    }

    function totalValue() public view returns (uint256 value) {
        for (uint i = 0; i < allPlayers.length; i++) {
            value += players[allPlayers[i]].items["gold"];
            value += players[allPlayers[i]].items["goldToClaim"];
        }
        return value;
    }

    function getCut() external view returns (uint256) {
        return ownersCut + dividendCut;
    }

    function getCutGoldValue(uint256 goldSpent) external view returns (uint256) {
        return (goldSpent * (ownersCut + dividendCut)) / 10000;
    }

    function payoutCutAndBonus(uint256 goldSpent) external hasRole("game") {
        registrar.getAddress("cutWallet").transfer((goldSpent * ownersCut * goldPrice) / 10000);
        registrar.getAddress("bonusWallet").transfer((goldSpent * dividendCut * goldPrice) / 10000);
    }

    function buyGold() external payable whenNotPaused {
        address player = msg.sender;
        uint32 amount = uint32(uint256(msg.value / goldPrice));
        addPlayerIfNotExists(player);
        require(msg.value > 0, "value has to be > 0");
        require(amount > 0, "value too low");
        require(uint256(players[player].items["gold"] + amount) < uint256(uint32(-1)), "gold value too high");
        players[player].items["gold"] = players[player].items["gold"] + amount;
    }

    function sellGold(uint32 value) external whenNotPaused {
        address player = msg.sender;
        require(value > 0, "value has to be > 0");
        require(players[player].hasItems && players[player].items["gold"] >= value, "not enough gold");
        players[player].items["gold"] = players[player].items["gold"] - value;
        msg.sender.transfer(value * goldPrice);
    }

    // Allows user to pay with gold in another contract's function
    function payGoldToContract(uint32 value, address player) external whenNotPaused hasRole("payable") {
        require(players[player].hasItems && players[player].items["gold"] >= value, "not enough gold");
        players[player].items["gold"] = players[player].items["gold"] - value;
        msg.sender.transfer(value * goldPrice);
    }

    function claimRewards() external whenNotPaused {
        address player = msg.sender;
        players[player].items["gold"] += players[player].items["goldToClaim"];
        players[player].items["goldToClaim"] = 0;
        players[player].items["copper"] += players[player].items["copperToClaim"];
        players[player].items["copperToClaim"] = 0;
    }

    function setCutAndBonus(uint256 _ownersCut, uint256 _dividendCut) external hasRole("admin") {
        ownersCut = _ownersCut;
        dividendCut = _dividendCut;
    }

    function setGoldPrice(uint _goldPrice) external hasRole("admin") {
        goldPrice = _goldPrice;
    }

    function payoutSurplus() public hasRole("admin") {
        uint256 totalGold = totalValue();
        uint256 diff = address(this).balance - (totalGold * goldPrice);
        registrar.getAddress("cutWallet").transfer(diff);
    }
}
