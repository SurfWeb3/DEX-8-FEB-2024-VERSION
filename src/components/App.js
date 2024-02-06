import { useEffect } from "react";
import { useDispatch } from "react-redux";
import config from "../config.json";


import { 
  loadProvider, 
  loadNetwork, 
  loadAccount,
  loadTokens,
  loadExchange,
  loadAllOrders,
  subscribeToEvents

} from "../store/interactions";

/* We import navigation bar React component */
import Navbar from "./Navbar"
/* We import Markets React component (for trading pairs) */
import Markets from "./Markets"
import Balance from "./Balance"
import Order from "./Order"
import PriceChart from "./PriceChart"
import Transactions from "./Transactions"
import Trades from "./Trades"
import OrderBook from "./OrderBook"
import Alert from "./Alert"





function App() {
  const dispatch = useDispatch()

  const loadBlockchainData = async () => {

       /* connect ethers to blockchain 
    provider is our connection to the blockchain with ethers
    PROVIDER_LOADED expects a connection*/
    const provider = loadProvider(dispatch)

    /* Get current network's chainId (for example Hardhat: 31337) */
    const chainId = await loadNetwork(provider, dispatch)

    /* Load page again when network changes (when network/chain ID changes) 
   "window" is a global JavaScript variable, "location" is the URL, 
   and the instruction "reload()" calls a function to load the page again */
    window.ethereum.on("chainChanged", () => {
      window.location.reload()

    })

    /* This makes an RPC call to our node, to get connected account. 
    This function gets the account from Metamask and shows it on the console. 
    Get current account and balance from Metamask, etc. 
    THIS WAS COPIED AND MOVED TO NAVBAR: await loadAccount(provider, dispatch)
    But it is also used here, for when the account using the page 
    is changed to another account*/
    window.ethereum.on("accountsChanged", () => {
      loadAccount(provider, dispatch)

    })
   

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
    const exchange = await loadExchange(provider, exchangeConfig.address, dispatch)

/* Call function in Interactions.js, 
Get all orders: open, filled, cancelled */
    loadAllOrders(provider, exchange, dispatch)


    /* Listen to events */
    subscribeToEvents(exchange, dispatch)
    

  }

  useEffect(() => {
    loadBlockchainData()
  })

  return (
    <div>

      <Navbar />

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          <Markets />

          <Balance />

          <Order />

        </section>
        <section className='exchange__section--right grid'>

          <PriceChart />

          <Transactions />

          <Trades />

          <OrderBook />

        </section>
      </main>

      <Alert />

    </div>
  );
}

export default App;