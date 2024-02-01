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
      contracts: [action.token],
      symbols: [action.symbol]
    }
      case "TOKEN_1_BALANCE_LOADED":
     return {
      ...state,
      balances: [action.balance]
    }

        case "TOKEN_2_LOADED":
     return {
      ...state,
      loaded: true,
      contracts: [...state.contracts, action.token],
      symbols: [...state.symbols, action.symbol]
    }
       case "TOKEN_2_BALANCE_LOADED":
     return {
      ...state,
      balances: [...state.balances, action.balance]
    }

    default:
      return state
  }

}


const DEFAULT_EXCHANGE_STATE = { 
  loaded: false, 
  contract: {}, 
  transaction: {
   isSuccessful: false 
 },
 allOrders: {
loaded: false,
  data: []
 },
 events: [] }


/* {} is empty object in default state
case "EXCHANGE_LOADED" is action
action.exchange stores the contract data */
export const exchange = (state = DEFAULT_EXCHANGE_STATE, action) => {
  let index, data

  switch (action.type) {
    case "EXCHANGE_LOADED":
     return {
      ...state,
      loaded: true,
      contract: action.exchange
    }

/* ORDERS LOADED (CANCELLED, FILLED & ALL) */


    case "CANCELLED_ORDERS_LOADED":
     return {
      ...state,
      cancelledOrders: {
      loaded: true,
      data: action.cancelledOrders
    }
  }

    case "FILLED_ORDERS_LOADED":
     return {
      ...state,
      filledOrders: {
      loaded: true,
      data: action.filledOrders
    }
  }

    case "ALL_ORDERS_LOADED":
     return {
      ...state,
      allOrders: {
      loaded: true,
      data: action.allOrders
    }
  }


/* BALANCE CASES */
   case "EXCHANGE_TOKEN_1_BALANCE_LOADED":
     return {
      ...state,
      balances: [action.balance]
    }
   case "EXCHANGE_TOKEN_2_BALANCE_LOADED":
     return {
      ...state,
      balances: [...state.balances, action.balance]
    }

/* TRANSFER CASES (DEPOSIT & WITHDRAW) */
/* Give data to app that deposit/transfer is pending */
   case "TRANSFER_REQUEST":
     return {
      ...state,
      transaction: {
      transactionType: "Transfer",
      isPending: true,
      isSuccessful: false
  },
  transferInProgress: true   
}

case "TRANSFER_SUCCESS":
     return {
      ...state,
      transaction: {
      transactionType: "Transfer",
      isPending: false,
      isSuccessful: true
  },
  transferInProgress: false,
  events: [action.event, ...state.events]   
}

case "TRANSFER_FAIL":
     return {
      ...state,
      transaction: {
      transactionType: "Transfer",
      isPending: false,
      isSuccessful: false,
      isError: true
  },
  transferInProgress: false,   
}


/* MAKING ORDERS CASES */
   case "NEW_ORDER_REQUEST":
     return {
      ...state,
      transaction: {
      transactionType: "New Order",
      isPending: true,
      isSuccessful: false
  },   
}


/*success section
data is an array*/
   case "NEW_ORDER_SUCCESS":
    /* prevent extra copies of orders, make sure orders are unique */
     index = state.allOrders.data.findIndex(order => order.id.toString() === action.order.id.toString())

    
    if(index === -1) {
      data = [...state.allOrders.data, action.order]
    } else {
      data = state.allOrders.data
    }

    return {
      ...state,
    allOrders: {
      ...state.allOrders,
    data
  },
    transaction: {
      transactionType: "New Order",
      isPending: false,
      isSuccessful: true
    },
    events: [action.event, ...state.events]
  }
 

   case "NEW_ORDER_FAIL":
     return {
      ...state,
      transaction: {
      transactionType: "New Order",
      isPending: false,
      isSuccessful: false,
      isError: true
  },   
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
