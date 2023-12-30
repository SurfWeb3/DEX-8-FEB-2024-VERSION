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
    
    /* The key is orderID, and the value is true/false
    We save every order that is created on the blockchain,
    but we make an additional mapping as a record of cancelled orders */
    mapping(uint256 => bool) public orderCancelled;
    mapping(uint256 => bool) public orderFilled;

    /*variable for the total number of orders made in this contract, starting at 0 (before an order is made)
    1 is added to this this value every time an order is made*/
    uint256 public orderCount;

    event Deposit(address token, address user, uint256 amount, uint256 balance);

    event Withdraw(address token, address user, uint256 amount, uint256 balance);

    event Order(uint256 id, address user, address tokenGet, uint256 amountGet, address tokenGive, 
        uint256 amountGive, uint256 timestamp);

    event Cancel(uint256 id, address user, address tokenGet, uint256 amountGet, address tokenGive, 
        uint256 amountGive, uint256 timestamp);  

    /* id is order id, user is user who starts the trade (in other part of the contract, 
    "user" is the person who makes the order, not the one that accepts the offer of the order),
    creator is the order creator (called "user" in other åarts of the contract.*/
    event Trade(uint256 id, address user, address tokenGet, uint256 amountGet, address tokenGive, 
        uint256 amountGive, address creator, uint256 timestamp);



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
        orderCount ++;

        /*we input orderCount as the id-number-key (of the mapping,
        and is is connected with the value of the _Order struct (with its input values)*/
      orders[orderCount] = 
      _Order(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, block.timestamp);

      /* EMIT EVENTS */
      /*we call the "Order" event inside the function*/
      emit Order(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, block.timestamp);

    }

    function cancelOrder(uint256 _id) public {
        /*get the order data from the "orders" mapping, with order ID input, and save it to _order variable
        "_Order" is the datatype (struct)
       We get this order data from storage (located on the blockchain), from the struct in the "orders" mapping*/
        _Order storage _order = orders[_id];

  /* Make sure that the caller of the cancel function, is the one that owns (made) the order
  "user" is an address variable of user that made order, in the _Order struct*/
        require(address(_order.user) == msg.sender);

        /* Require that Order exists */
        /* The uiunt256 _id argument (of "cancelOrder" function) == uint256 id of "_order" variable, 
        which is with its struct value (that you get from the storage data on the blockchain)*/
        require(_order.id == _id);

        /*cancel order
        We store all the cancelled orders in the special "orderCancelled" mapping*/
        orderCancelled[_id] = true;


        /*emit order Cancel event*/
        emit Cancel(_order.id, msg.sender, _order.tokenGet, _order.amountGet, _order.tokenGive, 
        _order.amountGive, block.timestamp);

    }



/* EXECUTING ORDERS */

/* the parameter to fill order is an order id (which can also be used for cancelling an order)*/
    function fillOrder(uint256 _id) public {

/* We add code to check for 3 things: a valid orderId, that the order is not already filled, 
and that the order has not been cancalled */
/*we check that order id number is less than order count, and more than 0*/
    require(_id > 0 && _id <=orderCount, "Order does not exist");
/* Without !, true is required, but with !, the opposite of true is required, 
so not true is true for this piece of code*/
    require(!orderFilled[_id]);
    require(!orderCancelled[_id]);



/* GET ORDER For trading tokens, we need to use an order that was made earlier, 
by getting the order data from storage, with the _Order struct */
    _Order storage _order = orders[_id];

/* trading tokens */
/* we read values from the "orders" mapping storage, and input them into internal _trade function */
/* Execute the trade. We call the "_trade" function here:*/
    _trade(_order.id, _order.user, _order.tokenGet, _order.amountGet, 
        _order.tokenGive, _order.amountGive);

    /* Show that the order is filled, by calling "orderFilled" mapping with order ID and true
    (_order dot id because the data comes from _order variable with _Order struct) */
    orderFilled[_order.id] = true;

  }

/* THIS FUNCTION DOES THE TRADE, and emits an event about it
we look at the order id. 
The "_trade" function is called internally. */
  function _trade(uint256 _orderId, address _user, address _tokenGet, uint256 _amountGet,
    address _tokenGive, uint256 _amountGive) internal { 
/* we call this function, and do trade here 
msg.sender calls the function*/

                          /* CHARGING DEX FEE */
/* Fee is paid by msg.sender (who fills the order)
Fee is taken from _amountGet */
/* 10 % fee amount*/
uint256 _feeAmount = (_amountGet * feePercent) / 100;




                        /* FIRST SECTION OF TRADE */
/* We update balance of the person filling order. This person is msg.sender. 
We take the token that they provide from their account, and change their balance.
We subtract THE TOTAL OF amountGet (token given by msg.sender to the order creator) and
the dex fee. We take fee amount from the balance of msg.sender (who fills order),
and we also take the amount needed to pay for the basic token trade. */
    tokens[_tokenGet][msg.sender] = tokens[_tokenGet][msg.sender] - ( _amountGet + _feeAmount);

/* "order.user", "_user" in the code below, made the order.
msg.sender fills the order. We add amountGet for the token that the order creator, _user, gets.*/
    tokens[_tokenGet][_user] = tokens[_tokenGet][_user] + _amountGet;

/* We give fee to the exchange account */
    tokens[_tokenGet][feeAccount] = tokens[_tokenGet][feeAccount] + _feeAmount;




                        

                        /* SECOND SECTION OF TRADE */
/* tokenGive is taken from the order creator, and added to the order filler's balalnce */
    tokens[_tokenGive][_user] = tokens[_tokenGive][_user] - _amountGive;
    tokens[_tokenGive][msg.sender] = tokens[_tokenGive][msg.sender] + _amountGive;

/* Emit trade event
msg.sender is user that does the trade, 
_user is the creator of the order */
    emit Trade(_orderId, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, 
        _user, block.timestamp);

  

  }

} 