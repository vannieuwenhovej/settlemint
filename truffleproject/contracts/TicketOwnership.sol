// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.9.0;

import "./TicketManager.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract TicketOwnership is TicketManager, ERC721 {
    
    mapping (uint => address) approvedTicketsForResale;


    /*
    Constructor is called when contract is first deployed.
    */
    constructor() ERC721("Ticket", "TICKET") {
    }

    /**
    @dev Buys ticket from seller.
    */
    function buyTicket(uint _ticketId) public payable {
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
    @dev buys ticket from organizer
     */
    function buyTicketFromOrganizer(uint _ticketId) public payable {
        require(ticketToOwner[_ticketId] == organizer, "Ticket not directly sold by organizer");
        require(tickets[_ticketId].currentPrice == msg.value, "Transaction value doesn't match ticket price");
        payable(organizer).transfer(msg.value); //send tx value to organizer
        ticketToOwner[_ticketId] = msg.sender;
        emit Transfer(organizer, msg.sender, _ticketId); //ERC721
        //todo: implement festtoken as currency
    }


    /**
    @dev buys ticket from a seller and check monetization option
    */
    function buyResaleTicket(uint _ticketId) public payable {
        Ticket memory ticket = tickets[_ticketId];
        uint fee = getFee(ticket.currentPrice);
        require(approvedTicketsForResale[_ticketId] != address(0), "Ticket is not for sale");
        require((ticket.currentPrice + fee) == msg.value, "Transaction value doesn't match ticket price");
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