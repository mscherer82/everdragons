const Registrar = artifacts.require("./Registrar.sol");

module.exports = function(deployer) {

    deployer.then(async () => {
        await deployer.deploy(Registrar);
    });
};
