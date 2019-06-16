pragma solidity ^0.4.0;

import "./../node_modules/everdragons-shared/solidity/libs/Pausable.sol";
import "./../node_modules/everdragons-shared/solidity/libs/HasRegistrar.sol";
import "./../node_modules/everdragons-shared/solidity/libs/HasWallet.sol";
import "./generators/IGenerator.sol";

contract EverDragonsFactory is Pausable, HasRegistrar, HasWallet {
    event Create(uint64 dna);
    event DuplicatedDNA(uint64 dna);

    struct Dragon {
        bytes32 name;
        uint24 attributes;
        uint32 experience;
        uint32 prestige;
        uint16 state;
        mapping(bytes32 => uint32) items;
    }

    uint64[] internal DNAs;
    mapping(uint64 => Dragon) internal dnaToDragon;
    mapping(uint64 => bool) internal blockedDNA;

    function createDragon(uint64 dna, uint24 attributes) internal {
        require(dna != 0, "dna must be provided");
        dnaToDragon[dna] = Dragon({name: "", attributes: attributes, experience: 0, prestige: 0, state: 0});
        DNAs.push(dna);
        emit Create(dna);
    }

    function generateDragon(uint8 dragonType, uint8 version) internal returns (uint64) {
        uint64 dna;
        uint24 attributes;
        IGenerator generator = IGenerator(registrar.getGenerator(dragonType));

        for (uint256 i = 0; i < 10; i++) {
            (dna, attributes) = generator.getDragonData(version, i);
            if (dnaToDragon[dna].attributes == 0 && !blockedDNA[dna]) {
                createDragon(dna, attributes);
                return dna;
            }
        }
        emit DuplicatedDNA(dna);
        return 0;
    }
}
