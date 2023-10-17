/** @param {import(".").NS} ns */
export async function main(ns) {
    while(true){
        var totalMoneyAvailable = ns.getServerMoneyAvailable("home");
        if(ns.singularity.getUpgradeHomeRamCost() < totalMoneyAvailable){
            ns.singularity.upgradeHomeRam();
            ns.run("./startup.js", 1);
        } else if(ns.singularity.getUpgradeHomeCoresCost() < totalMoneyAvailable){
            ns.singularity.upgradeHomeCores();
            ns.run("./startup.js", 1);
        }

        await ns.asleep(10_000);
    }
}