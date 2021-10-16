// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.9.0;

// import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
// see spec: https://github.com/OpenZeppelin/openzeppelin-contracts

//TODO: write tests to check addresses and functionality
//TODO: make currency token ERC20
contract TicketFactory is Ownable {

    uint maxTicketSupply;
    Ticket[] public tickets;
    mapping(uint => address) ticketToOwner;
    enum ticketTypes {NORMAL, SPECIAL, VIP}

    address internal organizer; //Note that I differentiate owner & organizer

    struct Ticket {
        ticketTypes ticketType; // "Normal", "Special", "VIP"
        uint16 initialPrice; 
        uint16 lastSalePrice; //implement functionality for indexed search in past logged events to deprecate this variable.
        uint16 currentPrice;
        //Note: integers take up fixed sizes of 256 in structs. NO extra cost for filling up empty storage space. (16+16+16<256)
    }

    /*
    Constructor is called when contract is first deployed.
    */
    // constructor() ERC721("Ticket", "TICKET") {
    // }


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
    @dev Organizer can set maxTicketSupply;
     */
    function setMaxTicketSupply(uint _max) public onlyOrganizer {
        maxTicketSupply = _max;
    }

    /**
    @dev Only organizer can mint new tickets.
     */
    function mint(ticketTypes _ticketType, uint _amount, uint16 _price) public onlyOrganizer {
        /*
        In solidity 0.5.0 you could use the return function from array.push()
        to get the ID. Since Solidity 0.6.0 the push() functions doesn't return
        the index anymore. 
        https://docs.soliditylang.org/en/develop/types.html?highlight=array%20push#array-members
        */
        for(uint i=1; (i<_amount && tickets.length<maxTicketSupply); i++){
            tickets.push(Ticket(_ticketType, _price, _price, _price));
            uint id = tickets.length - 1;
            ticketToOwner[id] = organizer;
            // _safeMint(organizer, id); //ERC1155 allows to do this in bulk.
        }
    }

}