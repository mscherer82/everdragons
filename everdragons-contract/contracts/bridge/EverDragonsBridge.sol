pragma solidity ^0.4.0;

import "../../node_modules/everdragons-shared/solidity/libs/HasRegistrar.sol";
import "../../node_modules/everdragons-shared/solidity/interfaces/IEverDragons.sol";

contract EverdragonsBridge is HasRegistrar {
    mapping(uint256 => bool) private processedEvents;

    constructor(address registrarAddress) public HasRegistrar(registrarAddress) {}

    function markedAsProcessed(uint256 eventHash) external hasRole("admin") {
        processedEvents[eventHash] = true;
    }

    function hasEventProcessed(uint256 eventHash) external view returns (bool) {
        return processedEvents[eventHash];
    }

    function transferToken(
        uint256 eventHash,
        address owner,
        uint64 dna,
        uint24 attributes,
        uint32 experience,
        uint32 prestige,
        bytes32 name
    ) external hasRole("bridge") {
        require(!processedEvents[eventHash], "event already processed");
        processedEvents[eventHash] = true;
        transferTokenWithoutHash(owner, dna, attributes, experience, prestige, name);
    }

    function transferTokenWithoutHash(
        address owner,
        uint64 dna,
        uint24 attributes,
        uint32 experience,
        uint32 prestige,
        bytes32 name
    ) public hasRole("bridge") {
        require(owner != 0, "owner must not be null");
        require(dna != 0, "dna must not be null");
        require(attributes != 0, "attributes must not be null");

        IEverDragons dragonContract = IEverDragons(registrar.getAddress("EverDragons"));
        if (dragonContract.exists(dna)) {
            updateDragon(dna, attributes, experience, prestige, name, owner);
        } else {
            dragonContract.impDragon(dna, attributes, experience, prestige, 0, name, owner, 0);
        }
    }

    function updateDragon(
        uint64 dna,
        uint24 attributes,
        uint32 experience,
        uint32 prestige,
        bytes32 name,
        address owner
    ) internal {
        IEverDragons dragonContract = IEverDragons(registrar.getAddress("EverDragons"));

        uint24 _attributes;
        uint32 _prestige;
        uint32 _experience;
        bytes32 _name;

        (_attributes, _experience, _prestige, , _name) = dragonContract.getDragon(dna);

        if (prestige != _prestige) {
            dragonContract.modifyDragonPrestige(dna, int32(prestige - _prestige));
        }
        if (experience != _experience) {
            dragonContract.modifyDragonExperience(dna, int32(experience - _experience));
        }
        if (attributes != _attributes) {
            dragonContract.modifyDragonAttributes(dna, attributes);
        }
        if (name != name) {
            dragonContract.modifyDragonName(dna, name);
        }

        dragonContract.transfer(owner, dna);
    }

}
