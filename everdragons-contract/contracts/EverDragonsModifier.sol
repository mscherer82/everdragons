pragma solidity ^0.4.0;

import "./EverDragonsAuction.sol";

contract EverDragonsModifier is EverDragonsAuction {
    event PropertiesChanged(uint64 dna);

    function modifyDragonAttributes(uint64 dna, uint24 attributes) external hasRole("modifier") {
        dnaToDragon[dna].attributes = attributes;
        emit PropertiesChanged(dna);
    }

    function modifyDragonState(uint64 dna, uint16 state) external hasRole("modifier") {
        dnaToDragon[dna].state = state;
        emit PropertiesChanged(dna);
    }

    function modifyDragonExperience(uint64 dna, int32 experience) external hasRole("modifier") {
        int64 result = int64(dnaToDragon[dna].experience) + int64(experience);
        if (result < 0) {
            dnaToDragon[dna].experience = 0;
        } else if (result > int64(uint32(-1))) {
            dnaToDragon[dna].experience = uint32(-1);
        }
        dnaToDragon[dna].experience = uint32(result);
        emit PropertiesChanged(dna);
    }

    function modifyDragonPrestige(uint64 dna, int32 prestige) external hasRole("modifier") {
        int64 result = int64(dnaToDragon[dna].prestige) + int64(prestige);
        if (result < 0) {
            dnaToDragon[dna].prestige = 0;
        } else if (result > int64(uint32(-1))) {
            dnaToDragon[dna].prestige = uint32(-1);
        }
        dnaToDragon[dna].prestige = uint32(result);
        emit PropertiesChanged(dna);
    }

    function modifyDragonName(uint64 dna, bytes32 name) external hasRole("modifier") {
        dnaToDragon[dna].name = name;
        emit PropertiesChanged(dna);
    }

    function modifyDragonItem(uint64 dna, bytes32 item, int32 value) external hasRole("modifier") {
        int64 result = int64(dnaToDragon[dna].items[item]) + int64(value);
        if (result < 0) {
            dnaToDragon[dna].items[item] = 0;
        } else if (result > int64(uint32(-1))) {
            dnaToDragon[dna].items[item] = uint32(-1);
        }
        dnaToDragon[dna].items[item] = uint32(result);
        emit PropertiesChanged(dna);
    }
}
