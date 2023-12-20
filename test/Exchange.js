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

		accounts = await ethers.getSigners()
		deployer = accounts[0]
		feeAccount = accounts[1]

		const Exchange = await ethers.getContractFactory("Exchange")
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

		
})
