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

    event funcCalled(uint256 val);

    /**
    @dev Buys ticket from seller.
    */
    // function buyTicket(uint _ticketId) public {
    //     emit funcCalled(1);
    //     address ticketOwner = ticketToOwner[_ticketId];
    //     require(festTokenAddress != address(0), "ERC20 Currency address not set");
    //     require(ticketOwner != address(0), "Ticket expired or deleted");
    //     require(ticketOwner != msg.sender, "Cannot buy own tickets");
    //     if(ticketOwner == organizer){
    //         buyTicketFromOrganizer(_ticketId);
    //     } else {
    //         buyResaleTicket(_ticketId);
    //     }
    // }

    /**
    @dev buys ticket from organizer with custom FEST currency
     */
    function buyTicketFromOrganizer(string memory _ticketType, uint _amount) public {
        require(festTokenAddress != address(0), "ERC20 Currency address not set");
        //ERC20 checks balance availability already
        require(FestToken(festTokenAddress).allowance(msg.sender, address(this)) 
        >= defaultPriceOfType[_ticketType], "TicketContract is not allowed to spend amount");
        
        FestToken(festTokenAddress).transferFrom(msg.sender, organizer, defaultPriceOfType[_ticketType]);
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
        FestToken(festTokenAddress).transferFrom(msg.sender, seller, resalePriceOf(_ticketId));
        
        // emit Transfer(seller, msg.sender, _ticketId); //ERC721
    }

    /**
    @dev changes a ticket to different owner
     */
    // function changeTicketOwner(uint _ticketId, address _to) internal {
    //     //decrease tickettype balance of current owner
    //     ticketTypeBalances[tickets[_ticketId].ticketType][ticketToOwner[_ticketId]]--;
    //     //and increase tickettype balance of recepient
    //     ticketTypeBalances[tickets[_ticketId].ticketType][_to]++;
    //     //change owner
    //     ticketToOwner[_ticketId] = _to;

    // }

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