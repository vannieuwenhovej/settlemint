// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.9.0;

import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
// see spec: https://github.com/OpenZeppelin/openzeppelin-contracts

contract TicketFactory is ERC721, Ownable {

    uint maxTicketSupply = 1000;
    Ticket[] public tickets;
    mapping(uint => address) ticketToOwner;

    address private organizer; //Note that I differentiate owner & organizer

    struct Ticket {
        string ticketType; // "Normal", "Special", "VIP"
        uint initialPrice; // Some Tickets might be sold more expensive.
    }

    /**
    * @param _name name of contract
    * @param _symbol symbol of token
    Constructor is called when contract is first deployed.
    */
    constructor() ERC721("Ticket", "TICKET") {
    }


    /**
    @dev throws if called by neither owner or organizer.
     */
    modifier onlyOwnerAndOrganizer() {
        require(owner() == _msgSender() || organizer == _msgSender(), "Can only be called by Owner or Organizer.");
        _;
    }

    /**
    @dev throws if called by any account either than organizer.
     */
    modifier onlyOrganizer() {
        require(organizer == _msgSender(), "Can only be called by Organizer.");
        _;
    }

    /**
    * @dev only Owner can change the organizer.
    */
    function setOrganizer(address _organizer) public onlyOwner {
        organizer = _organizer;
    }

    /**
    @dev Only organizer can mint new tickets.
     */
    function mint(string memory _ticketType, uint _amount, uint _price) public onlyOrganizer {
        /*
        In solidity 0.5.0 you could use the return function from array.push()
        to get the ID. Since Solidity 0.6.0 the push() functions doesn't return
        the index anymore. 
        https://docs.soliditylang.org/en/develop/types.html?highlight=array%20push#array-members
        */
        for(uint i=1; i<_amount; i++){
            tickets.push(Ticket(_ticketType, _price));
            uint id = tickets.length - 1;
            ticketToOwner[id] = organizer;
        }
    }

}