import { createSelector } from "reselect"
import { get, groupBy, reject, maxBy, minBy } from "lodash";
import moment from "moment"
import { ethers } from "ethers";

/* CSS color, GREEN for buy, and RED for sell */
const GREEN = "#25CE8F"
const RED = "#F45353"

const account = state => get(state, "provider.account")
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


/* USER'S OPEN ORDERS */
export const myOpenOrdersSelector = createSelector(
	account,
	tokens,
	openOrders,
	(account, tokens, orders) => {
		if (!tokens[0] || !tokens[1]) { return }

/* Filter to get orders made by current account,
with user key for orders */
	orders = orders.filter((o) => o.user === account)

/* Filter orders with token-pair addresses */
orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)
orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)
	
	/*add display features*/
	orders = decorateMyOpenOrders(orders, tokens)

	/* Sort orders by date decreasing, with most recent orders at the top */
	orders = orders.sort((a, b) => b.timestamp - a.timestamp)

	return orders

	}
   )


const decorateMyOpenOrders = (orders, tokens) => {
	return(
		orders.map((order)  => {
			order = decorateOrder(order, tokens)
			order = decorateMyOpenOrder(order, tokens)
			return(order)
		})

	)
	
}

const decorateMyOpenOrder = (order, tokens) => {
	let orderType = order.tokenGive === tokens[1].address ? "buy" : "sell"

	return({
		...order,
		orderType,
		orderTypeClass: (orderType === "buy" ? GREEN : RED)
	})
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

/* Calculate token price to 5 decimal places */
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


/* return ({
    ...order,
    token1Amount: ethers.utils.formatUnits(token1Amount, "ether"),
    token0Amount: ethers.utils.formatUnits(token0Amount, "ether"),
    tokenPrice,
    formattedTimestamp: moment.unix(order.timestamp).format('h:mm:ssa d MMM D')
  }) */


/* ALL FILLED ORDERS */
export const filledOrdersSelector = createSelector(
	filledOrders,
	tokens,
	(orders, tokens) => {
		/* We make sure that we have data of both tokens*/
		if (!tokens[0] || !tokens[1]) { return }

/* filter orders for selected tokens, with JavaScript filter function,
filtering an array, and returning a new array */
orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)
orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)

/* Sort orders re time, earlier => later, for price comparison */

orders = orders.sort((a, b) => a.timestamp - b.timestamp)


/* Add green/red color */


/* Sort orders re time, later => earlier, for UI */


/* Adding green/red by calling the function */
orders = decorateFilledOrders(orders, tokens)

orders = orders.sort((a, b) => b.timestamp - a.timestamp)

  return orders

  }
 )

const decorateFilledOrders = (orders, tokens) => {
	/* Keep track of previous order to compare history/prices */
	let previousOrder = orders[0]

	return(
	  orders.map((order) => {
		/* Add green/red to each order */

	  	/* Get order price */
	  	order = decorateOrder(order, tokens)
	  	order = decorateFilledOrder(order, previousOrder)
	  	previousOrder = order

		return order

	  })
	)
}


/* Singular "Order" for individual orders, "Orders" for a group of orders */
const decorateFilledOrder = (order, previousOrder) => {
	return({
		...order,
		tokenPriceClass: tokenPriceClass(order.tokenPrice, order.id, previousOrder)

	})
}

const tokenPriceClass = (tokenPrice, orderId, previousOrder) => {
	if (previousOrder.id === orderId) {
		return GREEN
	}

	if (previousOrder.tokenPrice <= tokenPrice) {
		return GREEN
	} else {
		return RED
  }
 }

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

/* SELECTOR FOR PRICE CHART */

export const priceChartSelector = createSelector(
	filledOrders, 
	tokens, 
	(orders, tokens) => {
/* We make sure that we have data of both tokens*/
		if (!tokens[0] || !tokens[1]) { return }

/* filter orders for selected tokens, with JavaScript filter function,
filtering an array, and returning a new array */
orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)
orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)

/* Sort orders re timestamp/date, increasing (earlier to later) */
orders = orders.sort((a, b) => a.timestamp - b.timestamp)

/* Add information re orders, and features of items shown */
orders = orders.map((o) => decorateOrder(o, tokens))

let secondLastOrder, lastOrder
/* Get the last 2 elements from the array, for last 2 orders & price change */
[secondLastOrder, lastOrder] = orders.slice(orders.length - 2, orders.length)

const lastPrice = get(lastOrder, "tokenPrice", 0)

/* Get second last order price */
const secondLastPrice = get(secondLastOrder, "tokenPrice", 0)

return ({
	lastPrice,
	lastPriceChange: (lastPrice >= secondLastPrice ? "+" : "-"),
	series: [{
		data: buildGraphData(orders)
		}]
})

  }
)

const buildGraphData = (orders) => {
	/* Group orders re periods for the graph */
	/* This gives an object, using the moment library, and using moment, we can format */
orders = groupBy(orders, (o) => moment.unix(o.timestamp).startOf("hour").format())

/* We get unique day/hour/etc, for the data of a particular period,
and use it for the time of each candlestick */
const hours = Object.keys(orders)

/* Make the graph series */
const graphData = hours.map((hour) => {

	/* Get all orders from current period
	hour/day/etc is the object key */
	const group = orders[hour]

	/* Calculate price values: opening, high, low, closing */
	/* We select the first/earliest order in the sorted array */
	const open = group[0]
	const high = maxBy(group, "tokenPrice")
	const low = minBy(group, "tokenPrice")
	/* We select the last/latest order in the sorted array */
	const close = group[group.length -1]

	return({
		x: new Date(hour),
		y: [open.tokenPrice, high.tokenPrice, low.tokenPrice, close.tokenPrice]
	})
  })

	return graphData

}
