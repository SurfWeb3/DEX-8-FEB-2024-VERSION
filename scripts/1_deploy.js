async function main() {
  console.log(`Preparing deployment...\n`)

  /* Get contract to deploy */
  const Token = await ethers.getContractFactory("Token")
  const Exchange = await ethers.getContractFactory("Exchange")

/* Get accounts */
  const accounts = await ethers.getSigners()

  /*console.log, for addresses of the first and second accounts*/
  console.log(`Accounts fetched:\n${accounts[0].address}\n${accounts[1].address}\n`)

  /* Deploy contracts for exchange and tokens. 
  We already deployed the Token contract, so we just change the name of it here.
  We get contracts to deploy in "Get contract to deploy" section above
  We give the DEX a fee account, 
  which is account 1, followed by fee %: Exchange.deploy(accounts[1].address, 10) */
  const dapp = await Token.deploy("Dapp University", "DAPP", "1000000")
  await dapp.deployed()
  console.log(`DAPP Deployed to: ${dapp.address}`)

  const mETH = await Token.deploy("mETH", "mETH", "1000000")
  await mETH.deployed()
  console.log(`mETH Deployed to: ${mETH.address}`)

  const mDAI = await Token.deploy("mDAI", "mDAI", "1000000")
  await mDAI.deployed()
  console.log(`mDAI Deployed to: ${mDAI.address}`)

  const exchange = await Exchange.deploy(accounts[1].address, 10)
  await exchange.deployed()
  console.log(`Exchange Deployed to: ${exchange.address}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
