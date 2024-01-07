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

    default:
      return state
  }

}

export const tokens = (state = { loaded: false, contract: null }, action) => {
  switch (action.type) {
    case "TOKEN_LOADED":
     return {
      ...state,
      loaded: true,
      contract: action.token,
      symbol: action.symbol
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
