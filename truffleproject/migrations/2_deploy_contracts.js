const TicketOwnership = artifacts.require("TicketOwnership");
const FestToken = artifacts.require("FestToken");

module.exports = function (deployer) {
  deployer.deploy(TicketOwnership);
  deployer.deploy(FestToken);
};
