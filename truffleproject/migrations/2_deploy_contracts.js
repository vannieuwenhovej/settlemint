const TicketOwnership = artifacts.require("TicketOwnership");
const FestToken = artifacts.require("FestToken");

module.exports = function (deployer) {
  /* Token contract parameters */
  const _nameOfToken = "FestToken";
  const _symbolOfToken = "FEST";
  
  /* Ticket contract parameters */
  const _nameOfTicket = "Ticket";
  const _symbolOfTicket = "TICKET";
  const _maxSupply = 1000;
  const _monetization = 0;

  deployer.deploy(FestToken, _nameOfToken, _symbolOfToken);
  deployer.deploy(TicketOwnership, _nameOfTicket, _symbolOfTicket, _maxSupply, _monetization);
};
