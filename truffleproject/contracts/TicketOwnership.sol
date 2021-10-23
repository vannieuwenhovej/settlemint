// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.9.0;

import "./TicketManager.sol";
import "./FestToken.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract TicketOwnership is TicketManager {
    
    mapping (uint => address) approvedTicketsForResale;
    address festTokenAddress;


    /*
    Constructor is called when contract is first deployed.
    */
    constructor(string memory _name, string memory _symbol, uint256 _maxSupply, uint256 _monetization, string memory _cdn)
     TicketManager( _maxSupply, _monetization, _name, _symbol) {

    }

    function setFestTokenAddress(address _address) external onlyOwner() {
        festTokenAddress = _address;
    }

    /**
    @dev check if sender is owner
    */
    function isOwner() external view returns(bool){
        return(msg.sender == owner());
    }

    /**
    @dev check if sender is organiser
    */
    function isOrganizer() external view returns(bool){
        return(msg.sender == organizer);
    }

    /**
    @dev buys ticket from organizer with custom FEST currency
     */
    function buyTicketFromOrganizer(string memory _ticketType, uint _amount) public {
        require(festTokenAddress != address(0), "ERC20 Currency address not set");
        //ERC20 checks balance availability already
        require(FestToken(festTokenAddress).allowance(msg.sender, address(this)) 
        >= defaultPriceOfType[_ticketType], "TicketContract is not allowed to spend amount");
        
        FestToken(festTokenAddress).transferFrom(msg.sender, organizer, (defaultPriceOfType[_ticketType] * _amount));
        mint(_ticketType, _amount, msg.sender);
        // emit Transfer(organizer, msg.sender, _ticketId); //ERC721
    }


    /**
    @dev buys ticket from a seller and check monetization option
    */
    function buyResaleTicket(uint _ticketId) public {
        require(festTokenAddress != address(0), "ERC20 Currency address not set");
        require(approvedTicketsForResale[_ticketId] != address(0), "Ticket is not for sale");
        require(FestToken(festTokenAddress).allowance(msg.sender, address(this))
        >= resalePriceOf(_ticketId), "TicketContract is not allowed to spend amount");
        require(getApproved(_ticketId) == address(this), "contract can't receive ticket"); //ERC721

        address seller = ownerOf(_ticketId);
        this.transferFrom(seller, msg.sender, _ticketId); //ERC721
        FestToken(festTokenAddress).transferFrom(msg.sender, seller, tickets[_ticketId].currentPrice);
        if(monetization>0){
            FestToken(festTokenAddress).transferFrom(msg.sender, organizer, getFee(tickets[_ticketId].currentPrice));
        }
        tickets[_ticketId].lastSalePrice = tickets[_ticketId].currentPrice;
        
        // emit Transfer(seller, msg.sender, _ticketId); //ERC721
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