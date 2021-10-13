// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.9.0;

import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";
// see spec: https://github.com/OpenZeppelin/openzeppelin-contracts

contract TicketFactory is ERC721 {
    //TODO: implement Onwable & onlyOwner functionality

    uint maxTicketSupply = 1000;
    Ticket[] public tickets;
    mapping(uint => address) ticketToOwner;

    struct Ticket {
        string ticketType; // "Normal", "Special", "VIP"
        uint initialPrice; // Some Tickets might be sold more expensive.
    }

    /*
    @param - first parameter: name of token
    @param - second parameter: symbol of token
    Constructor is called when contract is first deployed.
    */
    constructor() ERC721("TicketFactory", "TICKET") {
    }

    //TODO: Only organizer should be able to mint tickets
    function mint(string memory _ticketType) public {
        /*
        In solidity 0.5.0 you could have used the return function from array.push()
        to get the ID. Since Solidity 0.6.0 the push() functions doesn't return
        the index anymore. 
        https://docs.soliditylang.org/en/develop/types.html?highlight=array%20push#array-members
        */
        tickets.push(Ticket(_ticketType, 10)); // TODO: for now, every ticket is worth the same.
        uint id = tickets.length - 1;
    }

}