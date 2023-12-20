//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Token {
    string public name;
    string public symbol;
    uint256 public decimals = 18;
    uint256 public totalSupply;

   /*For ERC20, we need a balanceOf function, and this public mapping provides the actions of that function.
   You can just read the mapping. We can do the same thing, using a mapping, with state variable, 
   for the allowance function. For allowance we use a nested mapping, so when you put in the address of
   the owner, it gives you another mapping, with addresses of possible spenders, 
   and how many tokens each one is approved to spend. So when we call "allowance" function (which is a read function),
   the first mapping key is owner/deployer address, and the value is a nested mapping with spender 
   (in test, exchange) address, and number of approved tokens. */
    mapping(address => uint256) public balanceOf;
    /*approvals are in allowance mapping*/
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);

    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor(string memory _name, string memory _symbol, uint256 _totalSupply) {
        name = _name;
        symbol = _symbol;
        /*We still need to add the code for adding decimal places*/
        totalSupply = _totalSupply * (10**decimals);
        balanceOf[msg.sender] = totalSupply;
    }

    function transfer(address _to, uint256 _value) public returns (bool success) {

        require(balanceOf[msg.sender] >= _value);
        /*These items were removed, since they are done in _transfer function.  
        require(_to != address(0));
        balanceOf[msg.sender] = balanceOf[msg.sender] - _value;
        balanceOf[_to] = balanceOf[_to] + _value; 
        emit Transfer(msg.sender, _to, _value);*/

        /* The code "_transfer(_from, _to, _value)" is used to call internal the "_transfer" function.  */

        _transfer(msg.sender, _to, _value);
        
        return true;

    } 

       
/*The "transfer" function is external, and the "_transfer" function is internal.*/
    function _transfer(address _from, address _to, uint256 _value) internal {
        /*address(0) is the zero address, all zeros*/
        require(_to != address(0));
        /*This function moves tokens from one account to another account, 
        and sends a transfer event.*/
        balanceOf[_from] = balanceOf[_from] - _value;
        balanceOf[_to] = balanceOf[_to] + _value;

        /*In "transfer" function, msg.sender is sent to the _from parameter of "_transfer" function. 
        But when we emit the event in "transferFrom" function, (when we call "_transfer"), 
        _from value is the argument, and is not msg.sender */
        emit Transfer(_from, _to, _value);

    }

        /*The address parameter is for the account approved to spend tokens (for another account).
        The person/account approving is always msg.sender (that calls the function).
        _value is how many token the _spender account has been approved to spend*/
        function approve(address _spender, uint256 _value) public returns(bool success) {
            require(_spender != address(0));
            /*We update allowance: "approve" (write function) updates "allowance" (read function).
            we can read mapping values with mappingName[] syntax. 
            To access the nested mapping, we use a second [] for the nested mapping.
            "allowance" mapping (can act like a function). msg.sender is the first address on the mapping 
            (before the nested mapping with the other, approved, address)
            The next line of code updates the mapping, the first section [] returns a mapping, 
            and we call the second section []: */
            allowance[msg.sender][_spender] = _value;
            /*There is an event above that we need to call (with owner which is msg.sender, _spender and _value):*/
            emit Approval(msg.sender, _spender, _value);
            return true;

        }

        function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
            /* We also check that the account has enough tokens for the transaction */
            require(_value <= balanceOf[_from]);

            /*/*Has _from allowed msg.sender to transfer tokens, and if yes, then what value/amount?
            We check that someone else is approved to spend tokens for us. 
            We want to check the approval before caling transferFrom function, 
            so that only allowed accounts can spend the tokens.
            The approvals are in the allowance mapping. 
            Require stops the rest of the function, and makes an error for a false value, and 
            it only allows a transfer of the amount of tokens that have been approved.
            The account calling the function and transferring the tokens is msg.sender.
            Require checks that _from address allows msg.sender to transfer tokens, 
            and (if so) that the amount / _value of these tokens is approved, and is not more than what is approved
            (less than or equal to).*/
            require(_value <= allowance[_from][msg.sender]);
            



            /* CHANGE THE AMOUNT OF TOKENS APPROVED FOR SPENDING (AFTER THEY'RE SPENT), & PREVENT DOUBLE SPENDING
            We update the approval mapping to take away the _value amount 
            (to prevent double spending), and we can allow the total-allowed-amount to be divided 
            into smaller amounts that are spent one after another. 
            _from address authorizes the transfer & msg.sender transfers tokens*/
            allowance[_from][msg.sender] = allowance[_from][msg.sender] - _value;

            /*Spend tokens 
            This has the parameters of the "_transfer" and "transferFrom" functions.
            To do this, we use the internal "_transfer" function above*/

             /* The code "_transfer(_from, _to, _value)" is used to call internal the "_transfer" function,
             to spend tokens.  */
            _transfer(_from, _to, _value);
        /*A BIT MORE: In "transfer" function, msg.sender is sent to the _from parameter of "_transfer" function. 
        But when we emit the event in "transferFrom" function, (when we call "_transfer"), 
        _from value is the argument, and is not msg.sender */

        

            /* For an ERC20 token, we return "true" here */
            return true;

        }
}
