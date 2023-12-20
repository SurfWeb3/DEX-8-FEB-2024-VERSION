//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Exchange {
    /* Address that receives exchange fees */
    /* The public variable can be read outside the blockchain, including by our JavaScript test */
    address public feeAccount;
    uint256 public feePercent;

    constructor(address _feeAccount, uint256 _feePercent){
    /* We input this local variable, which is connected with the state vaiable 
    that is written on the blockchain. */
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

}