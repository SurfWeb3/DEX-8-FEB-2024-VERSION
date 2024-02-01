import { createSelector } from "reselect"
import { get, groupBy, reject } from "lodash";
import moment from "moment"
import { ethers } from "ethers";

/* CSS color, GREEN for buy, and RED for sell */
const GREEN = "#25CE8F"
const RED = "#F45353"

const tokens = state => get(state, "tokens.contracts")
const allOrders = state => get(state, "exchange.allOrders.data", [])
const cancelledOrders = state => get(state, "exchange.cancelledOrders.data", [])
const filledOrders = state => get(state, "exchange.filledOrders.data", [])



/* "state" is the Redux state */
const openOrders = state => {
	const all = allOrders(state)
	const filled = filledOrders(state)
	const cancelled = cancelledOrders(state)

/* Any orderFilled OR (||) orderCancelled, reject it */
	const openOrders = reject(all, (order) => {
		const orderFilled = filled.some((o) => o.id.toString() === order.id.toString())
		const orderCancelled = cancelled.some((o) => o.id.toString() === order.id.toString())
		return(orderFilled || orderCancelled)
	})

	return openOrders

}

const decorateOrder = (order, tokens) => {
/* While dex is being built, token0 is DApp, and token1 is mETH  */
	let token0Amount, token1Amount

	if (order.tokenGive === tokens[1].address) {
/* The amount of DApp we are giving */
		token0Amount = order.amountGive
/* The amount of mETH we want */
		token1Amount = order.amountGet
    } else {
/* The amount of DApp we want */
    	token0Amount = order.amountGet
/* The amount of mETH we are giving */
    	token1Amount = order.amountGive
    }

    const precision = 100000
    let tokenPrice = (token1Amount / token0Amount)
    tokenPrice = Math.round(tokenPrice * precision) / precision
	
	return({
		...order,
    token0Amount: ethers.utils.formatUnits(token0Amount, "ether"),
    token1Amount: ethers.utils.formatUnits(token1Amount, "ether"),
    tokenPrice,
    formattedTimestamp: moment.unix(order.timestamp).format("h:mm:ssa d MMM D")
	})

}  


/*
  return ({
    ...order,
    token1Amount: ethers.utils.formatUnits(token1Amount, "ether"),
    token0Amount: ethers.utils.formatUnits(token0Amount, "ether"),
    tokenPrice,
    formattedTimestamp: moment.unix(order.timestamp).format('h:mm:ssa d MMM D')
  })

 */


/* ORDER BOOK */

export const orderBookSelector = createSelector(
	openOrders, tokens, 
	(orders, tokens) => {
/* We make sure that we have data of both tokens*/
		if (!tokens[0] || !tokens[1]) { return }

/* filter orders for selected tokens, with JavaScript filter function,
filtering an array, and returning a new array */
orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)
orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)

/* Add more information to order information */

orders = decorateOrderBookOrders(orders, tokens)
/* group orders by orderType */
orders = groupBy(orders, "orderType")

/* Get "buy" orders */
const buyOrders = get(orders, "buy", [])

/* Sort "buy" orders by token price 
Higher price before lower price, price decreasing */
orders = {
	...orders,
	buyOrders: buyOrders.sort((a, b) => b.tokenPrice - a.tokenPrice)
}

/* Get "sell" orders */
const sellOrders = get(orders, "sell", [])

/* Sort "sell" orders by token price */
orders = {
	...orders,
	sellOrders: sellOrders.sort((a, b) => b.tokenPrice - a.tokenPrice)
  }

  return orders
})

const decorateOrderBookOrders = (orders, tokens) => {

	return(
	  orders.map((order) => {
	    order = decorateOrder(order, tokens)
	    order = decorateOrderBookOrder(order, tokens)
	    return(order)
	
    }) 
  )
}



const decorateOrderBookOrder = (order, tokens) => {
	const orderType = order.tokenGive === tokens[1].address ? "buy" : "sell"

	return({
		...order,
		orderType,
		orderTypeClass: (orderType === "buy" ? GREEN : RED),
/* If orderTRype is buy, we do the opposite and sell, or/else buy is the default */
		orderFillAction: (orderType === "buy" ? "sell" : "buy")
  })
}