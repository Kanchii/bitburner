import { millisecondsToHours } from "./utils";

const BILLION_CONST = 1_000_000_000;
const TRANSACTION_FEE = 100_000;
const MAXIMUM_TICK_COUNT = 12;

/** @param {import(".").NS} ns */
export async function main(ns) {
    if(!ns.stock.hasWSEAccount() || !ns.stock.has4SDataTIXAPI() || !ns.stock.hasTIXAPIAccess() || !ns.stock.has4SData()){
        ns.toast("Player doesnt have all the requirements to run this script", "error", 3_000);
        return;
    }
    
    let totalProfit = 0;
    let tickCount = -1;
    const startTime = new Date();
    let stockTickCount = {}

    while(true){
        ++tickCount;
        const timeAsString = millisecondsToHours(new Date().getTime() - startTime.getTime());

        const candidatesToSell = ns.stock.getSymbols().filter(x => ns.stock.getForecast(x) <= 0.5 || stockTickCount[x] >= 8);
        candidatesToSell.forEach(x => {
            const stockPosition = ns.stock.getPosition(x);
            if(stockPosition[0] > 0){
                const soldShareValue = ns.stock.sellStock(x, stockPosition[0]);
                if(soldShareValue > 0){
                    ns.tprint(`[${timeAsString}] Sold ${stockPosition[0]} shares of ${x} (PROFIT = $${((soldShareValue - stockPosition[1]) * stockPosition[0])/BILLION_CONST}b)!!!`);
                    totalProfit += (soldShareValue - stockPosition[1]) * stockPosition[0];
                    stockTickCount[x] = 0;
                }
            }
        });

        if(tickCount % MAXIMUM_TICK_COUNT === 0){
            tickCount = 0;

            // Buying new stocks
            ns.stock.getSymbols().filter(x => ns.stock.getPosition(x)[0] === 0 && ns.stock.getForecast(x) >= 0.6)
                .sort((a, b) => ns.stock.getForecast(b) - ns.stock.getForecast(a))
                .slice(0, 5)
                .sort((a, b) => ns.stock.getVolatility(b) - ns.stock.getVolatility(a))
                .forEach(x => {
                    const playerMoney = ns.getServerMoneyAvailable("home") - TRANSACTION_FEE;
                    const maxSharesToBuy = Math.floor(playerMoney / ns.stock.getAskPrice(x));
                    const boughtSharePrice = ns.stock.buyStock(x, maxSharesToBuy);
                    if(boughtSharePrice > 0){
                        ns.tprint(`[${timeAsString}] Bought ${maxSharesToBuy} shares of ${x}!!!`);
                        stockTickCount[x] = 0;
                    }
                });

            // Raising position
            ns.stock.getSymbols().filter(x => ns.stock.getPosition(x)[0] > 0 && ns.stock.getForecast(x) >= 0.65)
                .sort((a, b) => ns.stock.getForecast(b) - ns.stock.getForecast(a))
                .slice(0, 5)
                .sort((a, b) => ns.stock.getVolatility(b) - ns.stock.getVolatility(a))
                .forEach(x => {
                    const playerMoney = ns.getServerMoneyAvailable("home") - TRANSACTION_FEE;
                    const maxSharesToBuy = Math.floor(playerMoney / ns.stock.getAskPrice(x));
                    const boughtSharePrice = ns.stock.buyStock(x, maxSharesToBuy);
                    if(boughtSharePrice > 0){
                        ns.tprint(`[${timeAsString}] Raised ${maxSharesToBuy} shares of ${x}!!!`);
                    }
                });
            
            Object.keys(stockTickCount).forEach(x => stockTickCount[x]++);
            
            const profitAfterSell = ns.stock.getSymbols()
                .filter(x => ns.stock.getPosition(x)[0] > 0)
                .map(x => ns.stock.getSaleGain(x, ns.stock.getPosition(x)[0], "Long") - (ns.stock.getPosition(x)[1] * ns.stock.getPosition(x)[0] + TRANSACTION_FEE))
                .reduce((prev, cur) => prev + cur, 0);
            ns.tprint("ERROR --------------------")
            ns.tprint(`INFO [${timeAsString}] CURRENT PROFIT = $${totalProfit / BILLION_CONST}b`);
            ns.tprint(`SUCCESS [${timeAsString}] POTENTIAL PROFIT = $${profitAfterSell / BILLION_CONST}b`);
            ns.tprint("ERROR --------------------");
        }
        
        await ns.sleep(2_500);
    }
}