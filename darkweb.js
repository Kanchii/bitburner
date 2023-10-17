/** @param {import(".").NS} ns */
export async function main(ns) {
    var bought = ns.singularity.purchaseTor();
    if(bought === false){
        ns.tprint("ERROR You don't have money to buy Tor!");
        return;
    }

    let programsToBuy = [
        "BruteSSH.exe",
        "FTPCrack.exe",
        "relaySMTP.exe",
        "HTTPWorm.exe",
        "SQLInject.exe"
    ]

    programsToBuy.forEach(x => {
        var cost = ns.singularity.getDarkwebProgramCost(x);
        if(cost <= ns.getServerMoneyAvailable("home")){
            if(ns.singularity.purchaseProgram(x)){
                ns.toast(`Bought program ${x}`, "success", 3_000);
            }
        }
    });
}