// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.9.0;

/**
@dev compliant with ERC-20 standard: https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20.md
 */

contract FestToken {

    /**
    Note: Public variable automatically generates an ERC20 compliant getter function.
        https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20.md#totalsupply
     */
    uint256 public totalSupply;
  
    constructor() {
        totalSupply = 1000000;
    }

}