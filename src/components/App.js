import { useEffect } from "react";
import { ethers } from "ethers";
import config from "../config.json";
import TOKEN_ABI from "../abis/Token.json";
import '../App.css';




function App() {

  const loadBlockchainData = async () => {
    /* This makes an RPC call to our node, to get connected account. 
    This function gets the account from Metamask and shows it on the console. */
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
    /* console.log the first account (account 0) */
    console.log(accounts[0])

    /* connect ethers to blockchain 
    provider is our connection to the blockchain with ethers*/
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const { chainId } = await provider.getNetwork()
    console.log(chainId)

    console.log()

    /* Token smart contract 
    Contract(address = the address in config.json, abi, signerOrProvider = provider variable)*/
    const token = new ethers.Contract(config[chainId].DApp.address, TOKEN_ABI, provider)
    console.log(token.address)
    /* we can get the symbol of the token, calling the function: */
    const symbol = await token.symbol()
    console.log(symbol)
  }

  useEffect(() => {
    loadBlockchainData()
  })

  return (
    <div>

      {/* Navbar */}

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          {/* Markets */}

          {/* Balance */}

          {/* Order */}

        </section>
        <section className='exchange__section--right grid'>

          {/* PriceChart */}

          {/* Transactions */}

          {/* Trades */}

          {/* OrderBook */}

        </section>
      </main>

      {/* Alert */}

    </div>
  );
}

export default App;