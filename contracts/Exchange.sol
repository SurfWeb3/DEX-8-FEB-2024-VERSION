//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";

contract Exchange {
    /* Address that receives exchange fees */
    /* The public variable can be read outside the blockchain, including by our JavaScript test */
    address public feeAccount;
    uint256 public feePercent;
    /* DEPOSIT MAPPING The "tokens" nested mapping keeps track of how many tokens each user has deposited */
    mapping(address => mapping(address => uint256)) public tokens;
    /* ORDERS MAPPING First uint156 key is order ID, the value returned is _Order struct*/
    mapping(uint256 => _Order) public orders;

    /*variable for the total number of orders made in this contract, starting at 0 (before an order is made)
    1 is added to this this value every time an order is made*/
    uint256 public orderCount;

    event Deposit(address token, address user, uint256 amount, uint256 balance);

    event Withdraw(address token, address user, uint256 amount, uint256 balance);

    event Order(uint256 id, address user, address tokenGet, uint256 amountGet, address tokenGive, 
        uint256 amountGive, uint256 timestamp);

    struct _Order {
        /* For order, we want to store: addresses of tokenGet (received) and tokenGive (give),
        and the amounts of both, and address of user that made order, 
        and a unique identifier number for each order (which can be saved on blockchain),
        and the time when the order was made */
        uint256 id; /*order ID*/
        address user; /*user that made order*/
        address tokenGet; /*address of received token*/
        uint256 amountGet; /*amount received*/
        address tokenGive; /*address of given token*/
        uint256 amountGive; /*amount given*/
        uint256 timestamp; /*when order was made*/
    }


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

    /* MAKE & CANCEL ORDERS */

    function makeOrder(address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive) public {
        /* PREVENT ORDERS IF TOO FEW TOKENS ON EXCHANGE */
        require(balanceOf(_tokenGive, msg.sender) >= _amountGive);


       /* token Give = token that person wants to spend, which token & amount
       token Get   = token that person wants to receive, which token & amount 

        uint256 id;  = order ID
        address user; = user that made order (msg.sender)
        address tokenGet;  = address of received token
        uint256 amountGet;  = amount received
        address tokenGive; = address of given token
        uint256 amountGive;  = amount given
        uint256 timestamp;  = when order was made */

        /* MAKE ORDERS */

        /*before making an order, we add 1 to the "ordersCount" variable
        the first order is 1, the second order is 2, etc.*/
        orderCount = orderCount + 1;

        /*we input orderCount as the id-number-key (of the mapping,
        and is is connected with the value of the _Order struct (with its input values)*/
      orders[orderCount] = 
      _Order(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, block.timestamp);

      /* EMIT EVENTS */
      /*we call the "Order" event inside the function*/
      emit Order(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, block.timestamp);





    }

} 