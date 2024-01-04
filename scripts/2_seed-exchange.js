/* We connect with and read address data from config.json: */
const config = require('../src/config.json')


/*When this function is called with an argument of written-number-as-a-string,
it changes the number to a wei amount automatically. */
const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}


/* This is a function that couses a wait/delay
The argument is an amount of seconds, * 1000 to change it to milliseconds
"setTimeout" is used to make a particular amount of time for this function
We convert the number of seconds to milliseconds, because "setTimeout" expects milliseconds */
const wait = (seconds) => {
  const milliseconds = seconds * 1000
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

async function main() {
 
/* Get accounts from wallet
The wallets are unlocked, so we can sign transactions from them inside this code */
  const accounts = await ethers.getSigners()

/* Get network
 "chainId" is the network */
  const { chainId } = await ethers.provider.getNetwork()
  console.log("Using chainId:", chainId)

  /* Get deployed tokens from config.json */
  const DApp = await ethers.getContractAt('Token', config[chainId].DApp.address)
  console.log(`Dapp Token fetched: ${DApp.address}\n`)

  const mETH = await ethers.getContractAt('Token', config[chainId].mETH.address)
  console.log(`mETH Token fetched: ${mETH.address}\n`)

  const mDAI = await ethers.getContractAt('Token', config[chainId].mDAI.address)
  console.log(`mDAI Token fetched: ${mDAI.address}\n`)

  /* Get the deployed exchange */
  const exchange = await ethers.getContractAt('Exchange', config[chainId].exchange.address)
  console.log(`Exchange fetched: ${exchange.address}\n`)

/* Give tokens to account[1] */
/* Put tokens into other accounts, with a sender and receiver
sender is account 0, the deployer, who has all the tokens
The deployer can send their tokens to any account that they want
Account 0 gives 10,000 tokens to account 1 */
  const sender = accounts[0]
  const receiver = accounts[1]
/* "tokens" is the variable above */
  let amount = tokens(10000)

/* user1 (account 0) sends 10,000 mETH to receiver (account 1),
so there are multiple accounts that own the token */
  let transaction, result
  transaction = await mETH.connect(sender).transfer(receiver.address, amount)
  console.log(`Transferred ${amount} tokens from ${sender.address} to ${receiver.address}\n`)


/* Make exchange users */
  const user1 = accounts[0]
  const user2 = accounts[1]
  amount = tokens(10000)


/* user1 (who owns all the Dapp tokens) approves 10,000 Dapp */
  transaction = await DApp.connect(user1).approve(exchange.address, amount)
  await transaction.wait()
  console.log(`Approved ${amount} tokens from ${user1.address}`)

/* Deposit tokens to exchange */
/* user1 (who owns all the Dapp tokens) deposits 10,000 Dapp */
  transaction = await exchange.connect(user1).depositToken(DApp.address, amount)
  await transaction.wait()
  console.log(`Deposited ${amount} Ether from ${user1.address}\n`)

 
 /* user2 approves mETH (amount, in this situation, is 10,000) */
  transaction = await mETH.connect(user2).approve(exchange.address, amount)
  await transaction.wait()
  console.log(`Approved ${amount} tokens from ${user2.address}`)


/* user2 deposits mETH */
  transaction = await exchange.connect(user2).depositToken(mETH.address, amount)
  await transaction.wait()
  console.log(`Deposited ${amount} tokens from ${user2.address}\n`)

/* ORDERS */
/* We make an order and then cancel it */

/* user1 makes an order to get tokens mETH is get-token, DApp is token-give*/
  let orderId
  transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(100), DApp.address, tokens(5))
  result = await transaction.wait()
  console.log(`Made order from ${user1.address}`)


/* Cancel orders */
/* user1 cancels order 
We get order ID from event 
we get the result from the last transaction, we look at the event 
and we find the argument and the ID*/
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user1).cancelOrder(orderId)
  result = await transaction.wait()
  console.log(`Cancelled order from ${user1.address}\n`)

/* Wait 1 second
We call the function above, with the "wait" variable (  const wait = (seconds) => {  ), 
and there's a 1 second delay */
  await wait(1)


/* Make and fill orders */ 

/* user1 makes an order */
  transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(100), DApp.address, tokens(10))
  result = await transaction.wait()
  console.log(`Made order from ${user1.address}`)

/* user2 fills that order 
We use orderId for this */
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user2).fillOrder(orderId)
  result = await transaction.wait()
  console.log(`Filled order from ${user1.address}\n`)


/* Wait 1 second */
  await wait(1)

/* user1 makes another order */
  transaction = await exchange.makeOrder(mETH.address, tokens(50), DApp.address, tokens(15))
  result = await transaction.wait()
  console.log(`Made order from ${user1.address}`)

/* user2 fills another order */  
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user2).fillOrder(orderId)
  result = await transaction.wait()
  console.log(`Filled order from ${user1.address}\n`)

/* Wait 1 second */
  await wait(1)

/* user1 makes the third order */  
  transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(200), DApp.address, tokens(20))
  result = await transaction.wait()
  console.log(`Made order from ${user1.address}`)

/* user2 fills the third order */  
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user2).fillOrder(orderId)
  result = await transaction.wait()
  console.log(`Filled order from ${user1.address}\n`)

/* Wait 1 second */
  await wait(1)


/* Make orders that are still available 
user 1 makes buy orders and user2 makes sell orders */

/* user1 makes 10 orders, with a for-loop */
/* In this order, the person wants to get mETH and give Dapp 
We run the loop 10 times */  
  for(let i = 1; i <= 10; i++) {
    transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(10 * i), DApp.address, tokens(10))
    result = await transaction.wait()

    console.log(`Made order from ${user1.address}`)

/* Wait 1 second */
    await wait(1)
  }

/* user2 makes 10 orders, with a for-loop */
/* We run the loop 10 times */
  for (let i = 1; i <= 10; i++) {
    transaction = await exchange.connect(user2).makeOrder(DApp.address, tokens(10), mETH.address, tokens(10 * i))
    result = await transaction.wait()

    console.log(`Made order from ${user2.address}`)

/* Wait 1 second */
    await wait(1)
  }

}

/* Note from a developer, about the following code:
We recommend this pattern to be able to use async/await everywhere
and properly handle errors:*/
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
