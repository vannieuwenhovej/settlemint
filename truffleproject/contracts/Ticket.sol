// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";
// see spec: https://github.com/OpenZeppelin/openzeppelin-contracts

contract Ticket is ERC721 {

    /*
    @param - first parameter is name of token
    @param - second parameter is symbol of token
    Constructor is called when contract si first deployed.
    */
    constructor() ERC721("Ticket", "TICKET") {
    }

}