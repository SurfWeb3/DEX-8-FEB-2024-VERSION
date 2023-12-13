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
describe("Token", ()=> { /*tests are in here*/
	/*We make the "token" variable, etc.*/
	let token, accounts, deployer, receiver, exchange
	

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

		accounts = await ethers.getSigners()
		deployer = accounts[0]
		receiver = accounts[1]
		/*exchange account is a pretended exchange account for testing*/
		exchange = accounts[2]
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
			expect(await token.decimals()).to.equal(decimals)
	})

		it("has correct totalSupply", async ()=> {
		expect(await token.totalSupply()).to.equal(totalSupply)
	})
	
	it("assigns totalSupply to deployer", async ()=> {
		expect(await token.balanceOf(deployer.address)).to.equal(totalSupply)
	})

	/*async, await gives more time to execute this function, 
	which gets data from the blockchain*/
	

	})


	describe("Sending Tokens", () => {
		let amount, transaction, result

		describe("Success", () => {
			/* "beforeEach", for things we run before each test*/
		beforeEach(async () => {
			amount = tokens(100)
						/*await, to await for transaction to finish,a nd get the transaction when it is made.
			we use ".address" after "receiver", to get address data*/
			transaction = await token.connect(deployer).transfer(receiver.address, amount)
			/*we add code to make the app wait for the whole transaction
			 to finish on the blockchain, before doing next action.
			 With ,wait, we wait i\until the transaction is included in a block, 
			 and we can look at the result of that.*/
			result = await transaction.wait()

		})

		it("transfers token balances", async () => {
		/*In here is code to check if that the transfer function in the contract works.*/
		/*We transfer tokens*/			

            /*Make sure tokens were transferred (balance changed).*/
			expect(await token.balanceOf(deployer.address)).to.equal(tokens(999900))
			expect(await token.balanceOf(receiver.address)).to.equal(amount)
			/*amount = tokens(100)*/		

		})
				/*We check the event*/
		it("Emits a Transfer event", async () => {
			const event = result.events[0]
			expect(event.event).to.equal("Transfer")
			
			const args = event.args
			expect(args.from).to.equal(deployer.address)
			expect(args.to).to.equal(receiver.address)
			expect(args.value).to.equal(amount)

		})

		})

		describe("Failure", () => {
			it("rejects insufficient balances", async () => {
				/*We can transfer more than the 1 million tokens of deployer
				and call the transfer function with that*/
				const invalidAmount = tokens(100000000)
				await expect(token.connect(deployer).transfer(receiver.address, invalidAmount)).to.be.reverted
			})

			/*it("Rejects invalid recipient", async () => {
				const amount = tokens(100)
				await expect(token.connect(deployer).transfer("0xD32f32e13af6B8C164f43ccE96478574364c62d9", amount)).to.be.reverted*/
				 it('rejects invalid recipent', async () => {
        const amount = tokens(100)
        await expect(token.connect(deployer).transfer('0x0000000000000000000000000000000000000000', amount)).to.be.reverted
      })
	})

		
    })

    describe("Approving Tokens", () => {

    	/*this uses code very similar to "Sending Tokens", except "transfer" replaced by "approve",
    	and "exchange" (address), instead of "receiver". For the test, this is connected with 
    	the accounts section of describe("Token") section, in which there are accounts, 
    	from ethers (ethers.getSigners(). There are test accounts made for deployer, receiver, and for exchage.
    	The exchange acctount is used for executing this section of code.
    	(exchange = accounts[2], exchange account is a pretended exchange account for testing, 
    	and "exchange" is a variable) */
		
    	let amount, transaction, result

    	beforeEach(async () => {
    		amount = tokens(100)
    		/*We call (in the contract) the "approve" function (which writes), with 100 tokens, 
    		and we check if "allowance" function (which reads) was updated*/
			transaction = await token.connect(deployer).approve(exchange.address, amount)
			result = await transaction.wait()
    	})

    	describe("Success", () => {
    		it("allocated an allowance for delegated token spending", async () => {
    			/*We check for an allowance value, which is the amount 
    			of the _value parameter in the "approve" function.
    			To read and check allowance, we use this function
    			(with deployer(/msg.sender) as owner and exchange as spender), and value is returned:*/
    			expect(await token.allowance(deployer.address, exchange.address)).to.equal(amount)
    		})

    		
    		it("Emits an Approval event", async () => {
			const event = result.events[0]
			expect(event.event).to.equal("Approval")
			
			const args = event.args
			expect(args.owner).to.equal(deployer.address)
			expect(args.spender).to.equal(exchange.address)
			expect(args.value).to.equal(amount)

		})


    		/*we check that smart contract emits Aproval event*/


    	})

    	describe("Failure", () => {
    		it("rejects invalid spenders", async () =>{
    			await expect(token.connect(deployer).approve('0x0000000000000000000000000000000000000000', amount)).to.be.reverted
    		})
    	})
    })

})
