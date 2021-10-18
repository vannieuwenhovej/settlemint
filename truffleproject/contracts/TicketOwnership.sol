// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.9.0;

import "./TicketManager.sol";
import "./FestToken.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract TicketOwnership is TicketManager, ERC721 {
    
    mapping (uint => address) approvedTicketsForResale;
    address festTokenAddress;


    /*
    Constructor is called when contract is first deployed.
    */
    constructor(string memory _name, string memory _symbol, uint256 _maxSupply, uint256 _monetization)
     ERC721(_name, _symbol) 
     TicketManager( _maxSupply, _monetization) {

    }

    function setFestTokenAddress(address _address) external onlyOwner() {
        festTokenAddress = _address;
    }

    event funcCalled(uint256 val);

    /**
    @dev Buys ticket from seller.
    */
    function buyTicket(uint _ticketId) public {
        emit funcCalled(1);
        address ticketOwner = ticketToOwner[_ticketId];
        require(ticketOwner != address(0), "Ticket expired or deleted");
        require(ticketOwner != msg.sender, "Cannot buy own tickets");
        if(ticketOwner == organizer){
            buyTicketFromOrganizer(_ticketId);
        } else {
            buyResaleTicket(_ticketId);
        }
    }

    /**
    @dev buys ticket from organizer with custom FEST currency
     */
    function buyTicketFromOrganizer(uint _ticketId) public {
        require(ticketToOwner[_ticketId] == organizer, "Ticket not directly sold by organizer");
        //ERC20 checks balance availability already
        FestToken(festTokenAddress).transferFrom(msg.sender, organizer, tickets[_ticketId].currentPrice);
        ticketToOwner[_ticketId] = msg.sender;
        emit Transfer(organizer, msg.sender, _ticketId); //ERC721
    }

    function getPriceOf(uint _ticketId) external view returns(uint256) {
        return tickets[_ticketId].currentPrice;
    }


    /**
    @dev buys ticket from a seller and check monetization option
    */
    function buyResaleTicket(uint _ticketId) public payable {
        Ticket memory ticket = tickets[_ticketId];
        uint fee = getFee(ticket.currentPrice);
        require(approvedTicketsForResale[_ticketId] != address(0), "Ticket is not for sale");
        require((ticket.currentPrice + fee) == msg.value, "asTransaction value doesn't match ticket price");
        address seller = ticketToOwner[_ticketId];
        //Give cut to organizer
        if(monetization > 0) {
            payable(organizer).transfer(fee);
        } 
        payable(seller).transfer(ticket.currentPrice); //send tx value to seller
        ticketToOwner[_ticketId] = msg.sender;
        emit Transfer(seller, msg.sender, _ticketId); //ERC721
    }


    /**
    @dev approves a ticket for resale.
     */
    function approveTicketResale(uint _ticketId) internal onlyOwnerOf(_ticketId) returns(bool) {
        approvedTicketsForResale[_ticketId] = msg.sender;
        return true;
        // emit Approval(msg.sender, _approved, _ticketId); 
        // note: this should be in approve()
    }


    /**
    @dev Updates price and approves ticket for resale.
     */
    function tryApproveTicketSellOrder(uint _ticketId, uint _resalePrice) public onlyOwnerOf(_ticketId) returns(bool){
        require(setPrice(_ticketId, _resalePrice), "Failed updating price");
        approveTicketResale(_ticketId);
        return true;
    }

    



}