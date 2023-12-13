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
        require(_to != address(0)); 
        /*address(0) is the zero address, all zeros*/

        balanceOf[msg.sender] = balanceOf[msg.sender] - _value;
        balanceOf[_to] = balanceOf[_to] + _value;

        /*_from can be used instead of msg.sender*/
        emit Transfer(msg.sender, _to, _value);
        return true;

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
}
