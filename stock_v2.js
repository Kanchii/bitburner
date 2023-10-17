// Código pego no Discord

/** @param {import(".").NS} ns */
export async function main(ns) {
	ns.scriptKill("./stock_v2.js", "home");
	
    if(!ns.stock.hasTIXAPIAccess()){
        ns.toast(`Dont have 4S Data TIX API Access!`, "error", 7_500);
        return;
    }
	const stockHistory = new Map();
	const stockIncreases = new Map();
	const stockVolatility = new Map();
	const stocks = ns.stock.getSymbols();
	const maximumIteration = 10;
	let totalProfit = 0;
	let totalIterations = 0;
	const startTime = new Date();

	for (const stock of stocks) {
		stockHistory.set(stock, []);
		stockIncreases.set(stock, 0);
		stockVolatility.set(stock, []);
	}
 
	let updateCount = 0;
 
	async function updateStocks() {
		updateCount++;
		ns.print(`Update count: ${updateCount}`);
 
		for (const stock of stocks) {
			const stockPrice = ns.stock.getPrice(stock);
			const history = stockHistory.get(stock);
			const volatility = stockVolatility.get(stock);
			const position = ns.stock.getPosition(stock);
 
			if (position[0] > 0) {
				ns.print(`Currently owning ${position[0]} shares of ${stock}.`);
			}
 
			if (history.length > 0 && history[history.length - 1] !== 0) {
				const lastPrice = history[history.length - 1];
				const percentageChange = ((stockPrice - lastPrice) / lastPrice) * 100;
				volatility.push(Math.abs(percentageChange));
 
				if (percentageChange > 0) {
					const increases = stockIncreases.get(stock) + 1;
					stockIncreases.set(stock, increases);
				}
 
				ns.print(`${stock} - % Change: ${percentageChange.toFixed(2)}`);
			}
 
			history.push(stockPrice);
			if (history.length > 10) {
				history.shift();
				volatility.shift();
			}
		}
 
		if (updateCount % maximumIteration === 0) {
			updateCount = 0;
			const sortedStocks = Array.from(stockIncreases.entries())
				.sort((a, b) => b[1] - a[1] ||
					average(stockVolatility.get(b[0])) -
					average(stockVolatility.get(a[0])));
 
			ns.print("Stocks ranked by number of increases and volatility:");
			for (const [stock, increases] of sortedStocks) {
				ns.print(`${stock} - Increases: ${increases}, Avg Volatility: ${average(stockVolatility.get(stock)).toFixed(2)}%`);
			}
			
			let topStockIndex = 0;
			for (const stock of stocks) {
				const position = ns.stock.getPosition(stock);
				const playerMoney = ns.getServerMoneyAvailable("home") - 100000;
 
				if (position[0] > 0) {
					const increases = stockIncreases.get(stock);
 
					if (increases < Math.floor(maximumIteration / 2)) {
						const averageValue = ns.stock.getPosition(stock)[1];
						const valueSold = ns.stock.sellStock(stock, position[0]);
						if(valueSold > 0){
							const profit = getProfit(valueSold, averageValue, position[0]);
							totalProfit += profit;
							ns.tprint(`Sold all ${position[0]} (Profit: $ ${profit/1_000_000_000}b) shares of ${stock} due to less than ${Math.floor(maximumIteration / 2)} increases in the last ${maximumIteration} updates.`);
							continue;  // Continue to the next iteration to avoid buying immediately after selling
						}
					}
 
					const ownedVolatility = average(stockVolatility.get(stock));
					const higherVolatilityStocks = sortedStocks.filter(([s, inc]) =>
						average(stockVolatility.get(s)) > 2 * ownedVolatility && inc >= Math.floor(maximumIteration * 0.7));
 
					if (higherVolatilityStocks.length > 0) {
						const averageValue = ns.stock.getPosition(stock)[1];
						const valueSold = ns.stock.sellStock(stock, position[0]);
						if(valueSold > 0){
							const profit = getProfit(valueSold, averageValue, position[0]);
							totalProfit += profit;
							ns.tprint(`Sold all ${position[0]} shares of ${stock} (Profit: $ ${profit/1_000_000_000}b) to buy a higher volatility stock.`);
						}
 
						higherVolatilityStocks.sort((a, b) => average(stockVolatility.get(b[0])) - average(stockVolatility.get(a[0])));
						const [newStock,] = higherVolatilityStocks[0];
						const sharesToBuy = Math.floor(playerMoney / ns.stock.getAskPrice(newStock));
						const pricePerShare = ns.stock.buyStock(newStock, sharesToBuy);
						if(pricePerShare > 0){
							ns.tprint(`Bought ${sharesToBuy} shares of ${newStock} with higher volatility.`);
						}
					}
				} else if (playerMoney > 10_000_000) {
					const [topStock,] = sortedStocks[Math.min(sortedStocks.length - 1, topStockIndex++)];
					const sharesToBuy = Math.floor(playerMoney / ns.stock.getAskPrice(topStock));
					const pricePerShare = ns.stock.buyStock(topStock, sharesToBuy);
					if(pricePerShare > 0){
						ns.tprint(`Bought ${sharesToBuy} shares of ${topStock} - Increases: ${stockIncreases.get(topStock)}, Avg Volatility: ${average(stockVolatility.get(topStock)).toFixed(2)}%`);
					}
				}
			}
 
			for (const stock of stocks) {
				stockIncreases.set(stock, 0);
			}
		}
		if(updateCount === 0){
			const actualTime = new Date();
			const diffTimes = actualTime.getTime() - startTime.getTime();

			ns.tprint(`INFO ${millisecondsToHours(diffTimes)} [#${++totalIterations}] Total Profit Until Now: $ ${totalProfit/1_000_000_000}b`);
		}

		ns.print(`Current Iteration: ${updateCount}`);
		await ns.sleep(5000);
	}
 
	while (true) {
		await updateStocks();
	}
 
	function average(arr) {
		if (arr.length === 0) return 0;
		const sum = arr.reduce((a, b) => a + b, 0);
		return sum / arr.length;
	}

	function getProfit(value, averageValue, shares){
		return (value - averageValue) * shares;
	}

	function millisecondsToHours(timeDiff){
		var hh = Math.floor(timeDiff / 1000 / 60 / 60);   
		hh = ('0' + hh).slice(-2)
	
		timeDiff -= hh * 1000 * 60 * 60;
		var mm = Math.floor(timeDiff / 1000 / 60);
		mm = ('0' + mm).slice(-2)

		timeDiff -= mm * 1000 * 60;
		var ss = Math.floor(timeDiff / 1000);
		ss = ('0' + ss).slice(-2)

		// const hours = String(diffTime.getHours()).padStart(2, '0');
		// const minutes = String(diffTime.getMinutes()).padStart(2, '0');
		// const seconds = String(diffTime.getSeconds()).padStart(2, '0');

		return `${hh}:${mm}:${ss}`;
	}
}