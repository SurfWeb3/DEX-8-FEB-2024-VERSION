/*This imports Chai library to get the "expect" function and the matchers
"to" and "equal" from the chai library. */
const { expect } = require('chai');

/*This imports ethers library from hardhat library.
We save ethers to a variable, so we can use ethers in these actions. */
const { ethers } = require('hardhat');

/*When this function is called with an argument of ritten-number-as-a-string,
it changes the number to a wei amount automatically. */
const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

/* the strings that are 1st arguments describe the thing that's tested*/
describe('Exchange', () => {
  /*tests are in here*/
  /*variables, etc.*/
  let deployer, feeAccount, exchange

/* const is used for feePercent, since it does not change. */
  const feePercent = 10

  beforeEach(async () => {
    const Exchange = await ethers.getContractFactory('Exchange')
    const Token = await ethers.getContractFactory('Token')

/* We deploy the first token, "token1" */
    token1 = await Token.deploy('Dapp University', 'DAPP', '1000000')
/* We deploy the second token, "token2" */
    token2 = await Token.deploy('Mock Dai', 'mDAI', '1000000')

/* We make user 1 (with account 2 in "accounts[]") */
    accounts = await ethers.getSigners()
    deployer = accounts[0]
    feeAccount = accounts[1]
    user1 = accounts[2]
    user2 = accounts[3]

/* we give the user tokens for the testt */
    let transaction = await token1.connect(deployer).transfer(user1.address, tokens(100))
    await transaction.wait()

/* The next line is connected with deploy function */
    exchange = await Exchange.deploy(feeAccount.address, feePercent)
  })

  describe('Deployment', () => {

    it('tracks the fee account', async () => {
/* With "exchange.feeAccount" we read the feeAccount data from the blockchain. */ 
      expect(await exchange.feeAccount()).to.equal(feeAccount.address)
    })

    it('tracks the fee percent', async () => {
      expect(await exchange.feePercent()).to.equal(feePercent)
    })
  })

  describe('Depositing Tokens', () => {
/* in this section we test for approving tokens and then depositing tokens*/

    let transaction, result
/* We deposit 10 tokens */
    let amount = tokens(10)

    describe('Success', () => {
      beforeEach(async () => {
        // Approve Token

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

      it('tracks the token deposit', async () => {
/* we check that the exchange has tokens, we call balanceOf function in the Token contract */
        expect(await token1.balanceOf(exchange.address)).to.equal(amount)
        expect(await exchange.tokens(token1.address, user1.address)).to.equal(amount)
        expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(amount)
      })

      it('emits a Deposit event', async () => {
        const event = result.events[1] // 2 events are emitted
        expect(event.event).to.equal('Deposit')

        const args = event.args
        expect(args.token).to.equal(token1.address)
        expect(args.user).to.equal(user1.address)
        expect(args.amount).to.equal(amount)
        expect(args.balance).to.equal(amount)
      })

    })

    describe('Failure', () => {
      it('fails when no tokens are approved', async () => {
/* Don't approve any tokens before depositing 
Tokens are approved in beforeEach section, of describe("Success" section,
but not in this section */
        await expect(exchange.connect(user1).depositToken(token1.address, amount)).to.be.reverted
      })
    })

  })


  describe('Withdrawing Tokens', () => {
    let transaction, result
/* We deposit 10 tokens */
/* in this section we test for approving tokens and then depositing tokens*/
    let amount = tokens(10)

    describe('Success', () => {
      beforeEach(async () => {

/* deposit tokens before withdrawing */
/* We make a transaction in which the user deposits tokens to the exchange.
"connect" is for connecting the wallet 
"depositToken is a function in Exchange contract" */
/* approve token */
        transaction = await token1.connect(user1).approve(exchange.address, amount)
        result = await transaction.wait()
//* deposit token */
        transaction = await exchange.connect(user1).depositToken(token1.address, amount)
        result = await transaction.wait()

/* now withdraw tokens, with the withdrawToken function in the "Exchange" contract */
        transaction = await exchange.connect(user1).withdrawToken(token1.address, amount)
        result = await transaction.wait()
      })

      it('withdraws token funds', async () => {
        expect(await token1.balanceOf(exchange.address)).to.equal(0)
        expect(await exchange.tokens(token1.address, user1.address)).to.equal(0)
        expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(0)
      })

      it('emits a Withdraw event', async () => {
        const event = result.events[1] // 2 events are emitted
        expect(event.event).to.equal('Withdraw')

        const args = event.args
        expect(args.token).to.equal(token1.address)
        expect(args.user).to.equal(user1.address)
        expect(args.amount).to.equal(amount)
        expect(args.balance).to.equal(0)
      })

    })

    describe('Failure', () => {
      it('fails for insufficient balances', async () => {
/* Attempt to withdraw tokens without depositing
beforeEach in Success section has a token deposit, before withdraw.
However, in the Failure section this is not done */
        await expect(exchange.connect(user1).withdrawToken(token1.address, amount)).to.be.reverted
      })
    })

  })

  describe('Checking Balances', () => {
    let transaction, result
/* We deposit 1 token */
    let amount = tokens(1)

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

    it('returns user balance', async () => {
      expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(amount)
    })

  })

  describe('Making orders', async () => {
    let transaction, result

    let amount = tokens(1)

    describe('Success', async () => {
      beforeEach(async () => {
/* deposit tokens before making order */
/* approve token */
        transaction = await token1.connect(user1).approve(exchange.address, amount)
        result = await transaction.wait()
/* deposit token */
        transaction = await exchange.connect(user1).depositToken(token1.address, amount)
        result = await transaction.wait()

/* make order */
/*the user wants to receive token2 (_tokenGet), and give token1 (_tokenGive).
which user has in wallet before trade
(trading 1 token for 1 other token)*/
        transaction = await exchange.connect(user1).makeOrder(token2.address, amount, token1.address, amount)
        result = await transaction.wait()
      })

      it('tracks the newly created order', async () => {
        /* An easy way to do this is to check that orderCount = 1 (as the total amount from the counter)*/
        expect(await exchange.orderCount()).to.equal(1)
      })

      it('emits an Order event', async () => {
        const event = result.events[0]
        /* expect it to equal "Order" event */
        expect(event.event).to.equal('Order')

        /* we check for these values: 
        order id = 1, the user is user1, tokenGet is token2, amountGet is 1 (token), 
        tokenGive is token1, amountGive is 1, timestamp is at least 1 
        (so an amount is provided, since it is difficult to provide an exact time 
        for this particular test)*/
        const args = event.args
        expect(args.id).to.equal(1)
        expect(args.user).to.equal(user1.address)
        expect(args.tokenGet).to.equal(token2.address)
        expect(args.amountGet).to.equal(tokens(1))
        expect(args.tokenGive).to.equal(token1.address)
        expect(args.amountGive).to.equal(tokens(1))
        expect(args.timestamp).to.at.least(1)
      })

    })

    describe('Failure', async () => {
      it('Rejects with no balance', async () => {
        await expect(exchange.connect(user1).makeOrder(token2.address, tokens(1), token1.address, tokens(1))).to.be.reverted
      })
    })
  })

  describe('Order actions', async () => {
    let transaction, result
    let amount = tokens(1)

/*user deposits tokens in the exchange, and then makes an order*/

    beforeEach(async () => {
/* We make a transaction in which the user1 approves, then deposits tokens to the exchange.
"connect" is for connecting the wallet 
"depositToken is a function in Exchange contract" */
/* approve token */
      transaction = await token1.connect(user1).approve(exchange.address, amount)
      result = await transaction.wait()
/* deposit token */
      transaction = await exchange.connect(user1).depositToken(token1.address, amount)
      result = await transaction.wait()


/*tokens for user2*/
      transaction = await token2.connect(deployer).transfer(user2.address, tokens(100))
      result = await transaction.wait()

/*user2 approves and deposits tokens*/
      transaction = await token2.connect(user2).approve(exchange.address, tokens(2))
      result = await transaction.wait()

      transaction = await exchange.connect(user2).depositToken(token2.address, tokens(2))
      result = await transaction.wait()

/* user1 (that has token1, and wants to get token2) makes an order (with tokens and amount)*/
/* make an order */
      transaction = await exchange.connect(user1).makeOrder(token2.address, amount, token1.address, amount)
      result = await transaction.wait()
  /*The actions in this section are required before using an order for trading, 
  or cancelling an order.*/
    })

    describe('Cancelling orders', async () => {
      describe('Success', async () => {
        beforeEach(async () => {
  /*we cancel order, and input (order ID number) 1 argument, calling "cancelOrder" function*/
          transaction = await exchange.connect(user1).cancelOrder(1)
          result = await transaction.wait()
        })

        it('updates canceled orders', async () => {
          expect(await exchange.orderCancelled(1)).to.equal(true)
        })

        it('emits a Cancel event', async () => {
          const event = result.events[0]
          expect(event.event).to.equal('Cancel')

          const args = event.args
          expect(args.id).to.equal(1)
          expect(args.user).to.equal(user1.address)
          expect(args.tokenGet).to.equal(token2.address)
          expect(args.amountGet).to.equal(tokens(1))
          expect(args.tokenGive).to.equal(token1.address)
          expect(args.amountGive).to.equal(tokens(1))
          expect(args.timestamp).to.at.least(1)
        })

      })

      describe('Failure', async () => {
        beforeEach(async () => {
/* user1 deposits tokens */
          transaction = await token1.connect(user1).approve(exchange.address, amount)
          result = await transaction.wait()
          transaction = await exchange.connect(user1).depositToken(token1.address, amount)
          result = await transaction.wait()
/* make an order */
          transaction = await exchange.connect(user1).makeOrder(token2.address, amount, token1.address, amount)
          result = await transaction.wait()
        })

        it('rejects invalid order ids', async () => {
          const invalidOrderId = 99999
          await expect(exchange.connect(user1).cancelOrder(invalidOrderId)).to.be.reverted
        })

       it('rejects unauthorized cancelations', async () => {
        /* Testing that, when user2 tries to cancel user1's order, this action in stopped */
          await expect(exchange.connect(user2).cancelOrder(1)).to.be.reverted 
        }) 

      })

    })

    describe('Filling orders', async () => {
      /* Before each function, the user fills the order (in this test, it is user2).  */
      describe("Success", () => {

      beforeEach(async () => {
        /*user2 fills order*/
        transaction = await exchange.connect(user2).fillOrder("1")
        result = await transaction.wait()
      })
      it("executes the trade and charges fees", async () => {
        /*make sure that trade happens*/

        /*Check balances for tokenGive (in the lesson, tokenGive is token1, called "DAPP")
        After trade, user1 (who made order) should have 0 DAPP: user1.address)).to.equal(tokens(0), 
        and user2 (who fills order) should have 1 DAPP: user2.address)).to.equal(tokens(1))*/
          expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(tokens(0))
          expect(await exchange.balanceOf(token1.address, user2.address)).to.equal(tokens(1))
          /*the dex fee account should not get the token (token1) of the order maker*/
          expect(await exchange.balanceOf(token1.address, feeAccount.address)).to.equal(tokens(0))

          /* token2/tokenGet */
          expect(await exchange.balanceOf(token2.address, user1.address)).to.equal(tokens(1))
          expect(await exchange.balanceOf(token2.address, user2.address)).to.equal(tokens(0.9))
          expect(await exchange.balanceOf(token2.address, feeAccount.address)).to.equal(tokens(0.1))
        })

        it("updates filled orders", async () => {
/* "orderFilled" is the mapping, and we input 1, and order ID number 1 should equal true */
            expect(await exchange.orderFilled(1)).to.equal(true)
        })
          
        it('emits a Trade event', async () => {
          const event = result.events[0]
          expect(event.event).to.equal('Trade')

          const args = event.args
          /*id is order id*/
          expect(args.id).to.equal(1)
          /*user is user2, who fills the order (in other part of contract, user created order)*/
          expect(args.user).to.equal(user2.address)
          expect(args.tokenGet).to.equal(token2.address)
          expect(args.amountGet).to.equal(tokens(1))
          expect(args.tokenGive).to.equal(token1.address)
          expect(args.amountGive).to.equal(tokens(1))
          expect(args.amountGive).to.equal(tokens(1))
          /*creator is the person who made the order*/
          expect(args.creator).to.equal(user1.address)
          expect(args.timestamp).to.at.least(1)

        })

      })

      describe("Failure", () => {
/* We check for: valid order id, order cannot be filled, and order cannot be cancelled */
        it("rejects invalid order ids", async () => {
          const invalidOrderId = 99999
          await expect(exchange.connect(user2).fillOrder(invalidOrderId)).to.be.reverted
        })
         it("rejects already filled orders", async () => {
/* We try to fill the same order twice, and it should be rejected */
          transaction = await exchange.connect(user2).fillOrder(1)
          await transaction.wait()

          await expect(exchange.connect(user2).fillOrder(1)).to.be.reverted

          })

          it("rejects cancelled orders", async () => {
/* We , and it should be rejected */
          transaction = await exchange.connect(user1).cancelOrder(1)
          await transaction.wait()

          await expect(exchange.connect(user2).fillOrder(1)).to.be.reverted

      })

    })

  })

  })  

})