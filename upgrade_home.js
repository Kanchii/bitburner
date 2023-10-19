/** @param {import(".").NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    while(true){
        var totalMoneyAvailable = ns.getServerMoneyAvailable("home");
        if(ns.singularity.getUpgradeHomeRamCost() < totalMoneyAvailable){
            ns.singularity.upgradeHomeRam();
            ns.run("./startup.js");
        } else if(ns.singularity.getUpgradeHomeCoresCost() < totalMoneyAvailable){
            ns.singularity.upgradeHomeCores();
        }

        await ns.asleep(10_000);
    }
}