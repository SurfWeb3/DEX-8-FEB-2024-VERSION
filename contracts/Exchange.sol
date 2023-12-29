//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";

contract Exchange {
    /* Address that receives exchange fees */
    /* The public variable can be read outside the blockchain, including by our JavaScript test */
    address public feeAccount;
    uint256 public feePercent;
    /* The "tokens" nested mapping keeps track of how many tokens each user has deposited */
    mapping(address => mapping(address => uint256)) public tokens;

    event Deposit(address token, address user, uint256 amount, uint256 balance);

    event Withdraw(address token, address user, uint256 amount, uint256 balance);


    constructor(address _feeAccount, uint256 _feePercent){
    /* We input this local variable, which is connected with the state vaiable 
    that is written on the blockchain. */
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    /* DEPOSIT & WITHDRAW TOKEN */
    function depositToken(address _token, uint256 _amount) public {
        /*send tokens to exchange (from user's wallet), The exchange is this contract.*/
        /*We call the Token contract*/
        (Token(_token).transferFrom(msg.sender, address(this), _amount));

        /*update user balance (in "tokens" mapping), and show user how many tokens on exchange,
        by adding _amount to balance */
        tokens[_token][msg.sender] = tokens[_token][msg.sender] + _amount;

        /*emit event about deposit, this can be used to show deposit history, 
        and to show orders and deposits on the exchange. 
        The dex can get an alert when a deposit happens, 
        and it can update the balances.
        We read the updated balance (in mapping) with "tokens[_token][msg.sender]",
        and emit the event. */
        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    function withdrawToken(address _token, uint256 _amount) public {
        /* Make sure user has enough tokens to withdraw */
        require(tokens[_token][msg.sender] >= _amount);

        /*transfer tokens to the user
        with "Token(_token)" we call imported "Token" contract*/
        Token(_token).transfer(msg.sender, _amount);

        /*update user balance (of tokens on the exchange)*/
        tokens[_token][msg.sender] = tokens[_token][msg.sender] - _amount;

        /*emit event
        we read balance with "tokens[_token][msg.sender]" */
        emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    /* check balance  for token and user address arguments, a number is returned */
    function balanceOf(address _token, address _user) public view returns (uint256) {
        return tokens[_token][_user];
    }

}