import { useEffect } from "react";
import { useDispatch } from "react-redux";
import config from "../config.json";


import { 
  loadProvider, 
  loadNetwork, 
  loadAccount,
  loadTokens,
  loadExchange
} from "../store/interactions";

function App() {
  const dispatch = useDispatch()

  const loadBlockchainData = async () => {

       /* connect ethers to blockchain 
    provider is our connection to the blockchain with ethers
    PROVIDER_LOADED expects a connection*/
    const provider = loadProvider(dispatch)

    /* Get current network's chainId (for example Hardhat: 31337) */
    const chainId = await loadNetwork(provider, dispatch)

    /* This makes an RPC call to our node, to get connected account. 
    This function gets the account from Metamask and shows it on the console. 
    Get current account and balance from Metamask, etc. */
    await loadAccount(provider, dispatch)
   

    /* Token smart contract 
    Contract(address = the address in config.json, abi, signerOrProvider = provider variable)
    DApp is in config.json, we input DApp here and read token address that's in config.json 
    Load token smart contracts */
    const DApp = config[chainId].DApp
    const mETH = config[chainId].mETH
    await loadTokens(provider, [DApp.address, mETH.address], dispatch)
    /* we can get the symbol of the token, calling the function: */

    /* we call loadExchange function, to load the exchange contract 
    Load exchange smart contract */
    const exchangeConfig = config[chainId].exchange
    await loadExchange(provider, exchangeConfig.address, dispatch)
    

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