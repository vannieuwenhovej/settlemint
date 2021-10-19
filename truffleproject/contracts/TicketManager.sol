// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.9.0;

import "./TicketFactory.sol";

contract TicketManager is TicketFactory {

    uint monetization; //0 = no monetization set
    
    modifier onlyOwnerOf(uint _ticketId) {
        // require(msg.sender == ticketToOwner[_ticketId]);
        require(msg.sender == ownerOf(_ticketId));
        _;
    }

    constructor(uint256 _maxSupply, uint256 _monetization, string memory _name, 
    string memory _symbol) TicketFactory(_name, _symbol){

        maxTicketSupply = _maxSupply;
        monetization = uint(_monetization);
    }

    function setMonetization(uint _monetization) external onlyOrganizer() {
        require( _monetization >= 0, "Monetization fee can't be negative"); //unsigned integers can't be negative
        require( _monetization <= 10, "Monetization fee can't be higher than 10");
        monetization = _monetization;
    }

    /** 
    @dev calculate and return fee to pay organizer
     */
    function getFee(uint _price) internal view returns(uint){
        uint fee = _price / 100 * monetization;
        return fee;
    }

    /**
    @dev calculate total price with fee
    */
    function resalePriceOf(uint _ticketId) public view returns(uint256) {
        return tickets[_ticketId].currentPrice + getFee(tickets[_ticketId].currentPrice);
    }

    /** 
    @dev ticketowner can set the price of his ticket to max 110% of previous sale price.
    */
    function setPrice(uint _ticketId, uint _price) internal onlyOwnerOf(_ticketId) returns(bool){
        Ticket storage ticket = tickets[_ticketId];
        //Require that price is not higher than 110% of previous sale
        require(_price <= uint((ticket.lastSalePrice + (ticket.lastSalePrice/10))), 
        "Price can not exceed previous sale price by more than 10%");
        require(_price > 0, "Price can not be zero");
        ticket.currentPrice = uint16(_price);
        return true;
    }

}