/*This imports Chai library to get the "expect" function and the matchers
"to" and "equal" from the chai library. */
const { expect } = require ("chai");

/*This imports ethers library from hardhat library.
We save ethers to a variable, so we can use ethers in these actions. */
const { ethers } = require("hardhat");

/*When this function is called with an argument of ritten-number-as-a-string,
it changes the number to a wei amount automatically. */
const tokens = (n) => {
	return ethers.utils.parseUnits(n.toString(), "ether")
}

/* the strings that are 1st arguments describe the thing that's tested*/
describe("Token", ()=> {
	/*We make the "token" variable*/
	let token
	/*tests are in here*/

	beforeEach(async() => {
		/* 1. Get Token contract data from the blockchain, with ethers.js */
		/*This imports the contract, and we want a deployed instance of the contract*/
		/*The token variable gets a value here*/
		const Token = await ethers.getContractFactory("Token")

		/*This deploys to test blockchain, gets deployed copy, and connected it 
		to token variable (and then we can call token.name)
		This code has a deploy function that can send arguments to a constructor function in contract,
		to make a contract template*/
		token = await Token.deploy("Dapp University", "DAPP", "1000000" )
	})

	describe("Deployment", () => {
		const name = "Dapp University"
		const symbol = "DAPP"
		const decimals = "18"
		const totalSupply = tokens("1000000")

		it("has correct name", async ()=> {
		/*In here is code to test that name is correct */

		/* 2. Read token name (automatically, 
		without needing to do it in the terminal), and save it to a variable */
		/*We check token's value here*/
		/*Since we can read the token name from the blockchain,
		we put const name = await token.name() into the next line of code */


		/* 3. Check that name is correct */
		expect(await token.name()).to.equal(name)

	})

		it("has correct symbol", async ()=> {
		/*this action is put into next line,like above:const symbol = await token.symbol()*/
			expect(await token.symbol()).to.equal(symbol)
	})
	
		it("has correct decimals", async ()=> {
		/*this action is put into next line,like above:const symbol = await token.symbol()*/
			expect(await token.decimals()).to.equal(decimals)
	})

		it("has correct totalSupply", async ()=> {
		/*this action is put into next line,like above:const symbol = await token.symbol()*/
		expect(await token.totalSupply()).to.equal(totalSupply)
	})
	})


	/*async, await gives more time to execute this function, 
	which gets data from the blockchain*/
	



})
