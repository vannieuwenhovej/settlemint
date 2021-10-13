const Migrations = artifacts.require("Migrations");

module.exports = function (deployer) {
  deployer.deploy(Migrations); //deployer acts as an interface between you (the developer) and truffle's deployment engine.
};
