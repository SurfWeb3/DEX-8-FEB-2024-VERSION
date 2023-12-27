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
describe("Exchange", ()=> { /*tests are in here*/
	/*We make the variable, etc.*/
	let deployer, feeAccount, exchange
	/* const is used for feePercent, since it does not change. */
	const feePercent = 10

	beforeEach(async () => {	
		const Exchange = await ethers.getContractFactory("Exchange")
		const Token = await ethers.getContractFactory("Token")

/* We deploy the first token, "Token 1" */
		token1 = await Token.deploy("Dapp University", "DAPP", "1000000")
/* We make user 1 (with account 2 in "accounts[]") */


		accounts = await ethers.getSigners()
		deployer = accounts[0]
		feeAccount = accounts[1]
		user1 = accounts[2]
/* we give the user tokens for the testt */
		let transaction = await token1.connect(deployer).transfer(user1.address, tokens(100))
		await transaction.wait()

		/* The next line is connected with deploy function */
		exchange = await Exchange.deploy(feeAccount.address, feePercent)
	
	})

	describe("Deployment", () => {
	

		it("tracks the fee account", async ()=> {
		/* With "exchange.feeAccount" we read the feeAccount data from the blockchain. */	
		expect(await exchange.feeAccount()).to.equal(feeAccount.address)

	})

			it("tracks the fee percent", async ()=> {	
		expect(await exchange.feePercent()).to.equal(feePercent)

	})

})

describe("Depositing Tokens", () => {
	let transaction, result
/* We deposit 10 tokens */
	let amount = tokens(10)
	 /* in this section we test for approving tokens and then depositing tokens*/
	

	describe("Success", () => {
		beforeEach(async () => {
	/* We make a transaction in which the user deposits tokens to the exchange.
	"connect" is for connecting the wallet 
	"depositToken is a function in Exchange contract" */
	/* approve token */
	transaction = await token1.connect(user1).approve(exchange.address, amount)
	result = await transaction.wait()
	/* deposit token */
	transaction = await exchange.connect(user1).depositToken(token1.address, amount)
	result = await transaction.wait()
	 
	
	})

		it("tracks the token deposit", async () => {
			/* we check that the exchange has tokens 
			we call balanceOf function in the Token contract */
			expect(await token1.balanceOf(exchange.address)).to.equal(amount)
			expect(await exchange.tokens(token1.address, user1.address)).to.equal(amount)
			expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(amount)


		})

			it("emits a Deposit event", async () => {
			const event = result.events[1]
			expect(event.event).to.equal("Deposit")
			
			const args = event.args
			expect(args.token).to.equal(token1.address)
			expect(args.user).to.equal(user1.address)
			expect(args.amount).to.equal(amount)
			expect(args.balance).to.equal(amount)

		})

	})

	describe("Failure", () => {
		it("fails when no tokens are approved", async () => {
			/* Don't approve any tokens before depositing 
			Tokens are approved in beforeEach section, of describe("Success" section,
			but not in this section */
			await expect(exchange.connect(user1).depositToken(token1.address, amount)).to.be.reverted
		})
		
	})
})

		
})
