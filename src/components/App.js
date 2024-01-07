import { useEffect } from "react";
import { useDispatch } from "react-redux";
import config from "../config.json";


import { 
  loadProvider, 
  loadNetwork, 
  loadAccount,
  loadToken
} from "../store/interactions";

function App() {
  const dispatch = useDispatch()

  const loadBlockchainData = async () => {
    /* This makes an RPC call to our node, to get connected account. 
    This function gets the account from Metamask and shows it on the console. */
    await loadAccount(dispatch)
    /* console.log the first account (account 0) */


    /* connect ethers to blockchain 
    provider is our connection to the blockchain with ethers
    PROVIDER_LOADED expects a connection*/
    const provider = loadProvider(dispatch)
    const chainId = await loadNetwork(provider, dispatch)
   

    /* Token smart contract 
    Contract(address = the address in config.json, abi, signerOrProvider = provider variable)*/
    await loadToken(provider, config[chainId].DApp.address, dispatch)
    /* we can get the symbol of the token, calling the function: */
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