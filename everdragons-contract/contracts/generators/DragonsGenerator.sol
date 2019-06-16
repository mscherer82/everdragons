pragma solidity ^0.4.0;

import "./GeneratorBase.sol";

contract DragonsGenerator is GeneratorBase {
    // DNA:
    // Type	            256 8
    // Layer 1 – Wings	256	8
    // Layer 2 – Tail	256	8
    // Layer 3 – Body	256	8
    // Layer 4 – Legs	256	8
    // Layer 5 – Head	256	8
    // Layer 6 – Horns	256	8
    // Layer 7 – Eyes	256	8

    // Attributes
    // Version          32  5
    // Color	        64  6
    // Domain	         8	3
    // Power Source	    32	5

    uint8 constant TYPE = 1;
    uint8[] internal LAYERS_LIMIT = [24, 24, 24, 24, 24, 24, 24];
    uint8 internal constant COLOR_LIMIT = 10;
    uint8 internal constant DOMAIN_LIMIT = 4;
    uint8 internal constant PS_LIMIT = 32;

    uint8 internal constant LAYERS_OFFSET = 8;
    uint8 internal constant COLOR_OFFSET = 5;
    uint8 internal constant DOMAIN_OFFSET = 11;
    uint8 internal constant PS_OFFSET = 14;

    constructor(address registrarAddress, bytes32 scarcityName)
        public
        GeneratorBase(scarcityName)
        HasRegistrar(registrarAddress) {
        currentVersion = 2; // generate gen1 NSE dragons
    }

    function getDragonData(uint8 version, uint256 counter) external view returns (uint64 dna, uint24 attributes) {
        uint256 rand = pseudoRandom(counter);
        uint8 part;

        // Type
        dna = TYPE;

        // Layers
        for (uint i = 0; i < 7; i++) {
            part = uint8((rand >> (i * 8 + LAYERS_OFFSET)) & 0xFF);
            dna |= (uint64(part) % LAYERS_LIMIT[i]) << (i * 8 + LAYERS_OFFSET);
        }

        // Version
        attributes = (version > 0 ? version : currentVersion) & 0x1F;

        // Color
        part = uint8((rand >> COLOR_OFFSET + 64) & 0xFF);
        attributes |= (uint24(part) % COLOR_LIMIT) << COLOR_OFFSET;

        // Domain
        part = uint8((rand >> (DOMAIN_OFFSET + 64)) & 0xFF);
        attributes |= (uint24(part) % DOMAIN_LIMIT) << DOMAIN_OFFSET;

        // Power source
        part = uint8((rand >> PS_OFFSET) & 0xFF);
        attributes |= (uint24(part) % PS_LIMIT) << PS_OFFSET;
    }

    function isSoulBound(uint96, uint24 attributes, uint32 experience, uint32) external view returns (bool) {
        return attributes & 0xFF == 4 && experience < 100;
    }

    function canBeSold(uint64) external view returns (bool) {
        return true;
    }

}
