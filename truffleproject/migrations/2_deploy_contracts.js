const TicketFactory = artifacts.require("TicketFactory");
const FestToken = artifacts.require("FestToken");

module.exports = function (deployer) {
  deployer.deploy(TicketFactory);
  deployer.deploy(FestToken);
};
