// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.9.0;

/**
@dev compliant with ERC-20 standard: https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20.md
 */
import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract FestToken is ERC20, Ownable{

    /**
    Note: Public variables automatically generates an ERC20 compliant getter function.
        ex: https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20.md#totalsupply
     */
  
    /**
    For now FestToken just uses ERC20 basic functionality
    */

    constructor(string memory _name, string memory _symbol) ERC20(_name, _symbol) {
    }

    function mintTo(address _address, uint256 _amount) public onlyOwner() {
        _mint(_address, _amount);
    }

}