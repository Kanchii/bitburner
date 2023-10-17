/** @param {import(".").NS} ns */
export async function main(ns) {
    while(true){
        var playerMoney = ns.getServerMoneyAvailable("home");
        if(playerMoney > 1_000_000_000_000){
            ns.run("./augments.js");
        }

        if(ns.singularity.getOwnedAugmentations(true).length - ns.singularity.getOwnedAugmentations(false).length >= 5){
            ns.run("./reset.js");
            break;
        }

        if(!ns.hasTorRouter()){
            ns.run("./darkweb.js");
        }

        ns.singularity.checkFactionInvitations().forEach(x => ns.singularity.joinFaction(x));

        if(!ns.singularity.isBusy() && ns.getPlayer().factions.includes("Daedalus")){
            ns.singularity.workForFaction("Daedalus", "hacking");
        }

        await ns.asleep(15_000);
    }
}