
/** @param {import(".").NS} ns */
export async function main(ns) {
    const target = ns.args[0];
    const moneyThreshold = ns.getServerMaxMoney(target) * 0.75;
    const securityThreshold = ns.getServerMinSecurityLevel(target) + 3;
    while(true){
        if(ns.getServerSecurityLevel(target) > securityThreshold){
            await ns.weaken(target);
        } else if(ns.getServerMoneyAvailable(target) < moneyThreshold){
            await ns.grow(target);
        } else {
            await ns.hack(target);
        }
    }
}