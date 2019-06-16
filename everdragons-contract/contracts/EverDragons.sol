pragma solidity ^0.4.0;

import "./EverDragonsImport.sol";

contract EverDragons is EverDragonsImport {
    constructor(address registrarAddress) public HasRegistrar(registrarAddress) {}

    function getDragon(uint64 dna)
        public
        view
        returns (uint24 attributes, uint32 experience, uint32 prestige, uint16 state, bytes32 name)
    {
        Dragon storage dragon = dnaToDragon[dna];
        return (dragon.attributes, dragon.experience, dragon.prestige, dragon.state, dragon.name);
    }

    function getDragonItem(uint64 dna, bytes32 item) public view returns (uint256) {
        return dnaToDragon[dna].items[item];
    }

    function getDragonByIndex(uint256 index)
        public
        view
        returns (uint24 attributes, uint32 experience, uint32 prestige, uint16 state, bytes32 name, uint64 dna)
    {
        require(index < totalSupply(), "index too large");
        dna = DNAs[index];
        Dragon storage dragon = dnaToDragon[dna];
        return (dragon.attributes, dragon.experience, dragon.prestige, dragon.state, dragon.name, dna);
    }

    function changeDragonName(uint64 dna, bytes32 name) external onlyOwnerOf(dna) {
        dnaToDragon[dna].name = name;
        emit PropertiesChanged(dna);
    }

    function createDragonForUser(address receiver, uint64 dna, uint24 attributes) external hasRole("minter") {
        require(dnaToDragon[dna].attributes == 0, "dna already exists");
        require(blockedDNA[dna] == false, "dna blocked");
        createDragon(dna, attributes);
        mint(receiver, uint256(dna));
    }

    function createRandomDragonForUser(address receiver, uint8 dragonType, uint8 version) external hasRole("minter") {
        uint64 dna = generateDragon(dragonType, version);
        require(dna != 0, "duplicated dna");
        mint(receiver, uint256(dna));
    }

    function createNSEDragon(uint8 dragonType, uint8 version) external hasRole("minter") {
        createNSE(dragonType, version);
    }
}
