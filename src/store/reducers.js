/* We make a Redux reducer of the Ethers provider
The default state value is an empty object: {} 
With PROVIDER_LOADED, we update the state with the connection
the provider has a connection value, stored in the database (provider key, connection value)
...state updates the state, and does this: 
it makes a copy of current state, and at the end, adds the value: connection: action.connection
If there is no new data, it returns default value "state" */
export const provider = (state = {}, action) => {
  switch (action.type) {
    case "PROVIDER_LOADED":
      return {
        ...state,
        connection: action.connection
      }

    case "NETWORK_LOADED":
      return {
        ...state,
        chainId: action.chainId
      }
    case "ACCOUNT_LOADED":
      return {
        ...state,
        account: action.account
      }

      case "ETHER_BALANCE_LOADED":
      return {
        ...state,
        balance: action.balance
      }

    default:
      return state
  }

}

const DEFAULT_TOKENS_STATE = {
  loaded: false,
  contracts: [],
  symbols: []
}

/* [], enpty array, is used as default state */
export const tokens = (state = DEFAULT_TOKENS_STATE, action) => {
  switch (action.type) {
    case "TOKEN_1_LOADED":
     return {
      ...state,
      loaded: true,
      contracts: [...state.contracts, action.token],
      symbols: [...state.symbols, action.symbol]
    }

        case "TOKEN_2_LOADED":
     return {
      ...state,
      loaded: true,
      contracts: [...state.contracts, action.token],
      symbols: [...state.symbols, action.symbol]
    }

    default:
      return state
  }

}

/* {} is empty object in default state
case "EXCHANGE_LOADED" is action
action.exchange stores the contract data */
export const exchange = (state = { loaded: false, contract: {} }, action) => {
  switch (action.type) {
    case "EXCHANGE_LOADED":
     return {
      ...state,
      loaded: true,
      contract: action.exchange
    }

    default:
      return state
  }

}






/* THIS IS AN EXAMPLE OF A REDUCER FUNCTION FOR THE REDUX WEBSITE
{ value: 0 } is a default value:
function counterReducer(state = { value: 0 }, action) {
  switch (action.type) {
    case 'counter/incremented':
      return { value: state.value + 1 }
    case 'counter/decremented':
      return { value: state.value - 1 }
    default:
      return state
  }
} */
