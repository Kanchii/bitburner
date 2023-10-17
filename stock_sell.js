/** @param {import(".").NS} ns */
export async function main(ns) {
    if(!ns.stock.hasWSEAccount() || !ns.stock.has4SDataTIXAPI() || !ns.stock.hasTIXAPIAccess() || !ns.stock.has4SData()){
        ns.toast("Player doesnt have all the requirements to run this script (stock_sell.js)", "error", 3_000);
        return;
    }

    ns.stock.getSymbols().filter(x => ns.stock.getPosition(x)[0] > 0).forEach(x => ns.stock.sellStock(x, ns.stock.getPosition(x)[0]));
}