// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.9.0;

import "../node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
// see spec: https://github.com/OpenZeppelin/openzeppelin-contracts

//TODO: write tests to check addresses and functionality
//TODO: make currency token ERC20
contract TicketFactory is Ownable, ERC721Enumerable {

    uint public maxTicketSupply;
    Ticket[] public tickets;
    mapping(string => uint) defaultPriceOfType;

    address internal organizer; //Note that I differentiate owner & organizer

    struct Ticket {
        string ticketType; // "Normal", "Special", "VIP"
        uint16 initialPrice; 
        uint16 lastSalePrice; //implement functionality for indexed search in past logged events to deprecate this variable.
        uint16 currentPrice;
        //Note: integers take up fixed sizes of 256 in structs. NO extra cost for filling up empty storage space. (16+16+16<256)
    }

    /*
    Constructor is called when contract is first deployed.
    */
    // constructor(string memory _uri) ERC1155 (_uri){
    // }
    constructor(string memory _name, string memory _symbol) ERC721 (_name, _symbol){

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
    @dev set default price for tickets
    */
    function setDefaultPriceFor(string memory _ticketType, uint _price) external onlyOrganizer {
        defaultPriceOfType[_ticketType] = _price;
    }

    /**
    @dev returns default price for ticket type
    */
    function defaultPriceOf(string memory _ticketType) external view returns(uint256){
        return defaultPriceOfType[_ticketType];
    }

    /**
    @dev Organizer can set maxTicketSupply;
     */
    function setMaxTicketSupply(uint _max) public onlyOrganizer {
        require(_max >= tickets.length, "Max supply can't be lower than circulating supply");
        maxTicketSupply = _max;
    }

    /**
    * @dev get tickets from Organizer
    */
    function totalTicketSupply() public view returns (uint total) {
        return tickets.length;
    }

    /**
    @dev returns number of available tickets left
    */
    function ticketsLeft() external view returns(uint amount){
        return (maxTicketSupply - tickets.length);
    }



    /**
    @dev Only organizer can mint new tickets.
     */
    function mint(string memory _ticketType, uint _amount, address _to) internal {
        /*
        In solidity 0.5.0 you could use the return function from array.push()
        to get the ID. Since Solidity 0.6.0 the push() functions doesn't return
        the index anymore. 
        https://docs.soliditylang.org/en/develop/types.html?highlight=array%20push#array-members
        */
        uint16 price = uint16(defaultPriceOfType[_ticketType]);
        require(price > 0, "Price not set by organizer");
        require(tickets.length + _amount < maxTicketSupply, "Buy order amount exceeds max supply");
        for(uint i=0; (i<_amount && tickets.length<maxTicketSupply); i++){
            tickets.push(Ticket(_ticketType, price, price, price));

            uint256 id = tickets.length - 1;
            _safeMint(_to, id); //updates _owners and _balances
        }
    }

    /**
    @dev organizer can mint free tickets 
    */
    function mintForFree(string memory _ticketType, uint _amount) external onlyOrganizer {
        mint(_ticketType, _amount, organizer);
    }

}