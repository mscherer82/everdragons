const Migrations = artifacts.require("./Migrations.sol");

module.exports = function(deployer, network) {
  deployer.then(async () => {
    await deployer.deploy(Migrations);
  });
};
