/** @param {import(".").NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    while(true){
        var playerMoney = ns.getServerMoneyAvailable("home");
        if(playerMoney > 500_000_000_000){
            ns.print(`-------------------- BUYING AUGMENTATIONS --------------------`);
            ns.run("./augments.js");
        }

        if(ns.singularity.getOwnedAugmentations(true).length - ns.singularity.getOwnedAugmentations(false).length >= 5){
            ns.run("./reset.js");
            break;
        }

        ns.singularity.checkFactionInvitations().forEach(x => ns.singularity.joinFaction(x));

        if(ns.getPlayer().factions.includes("Daedalus") && !ns.singularity.isBusy()){
            ns.print(`-------------------- WORKING FOR DAEDALUS --------------------`);
            ns.singularity.workForFaction("Daedalus", "hacking");
        } else if(!ns.gang.inGang()){
            if(ns.heart.break() >= 54000){
                ns.print(`-------------------- CREATING GANG --------------------`);
                ns.gang.createGang("Slum Snakes");
                ns.run("./gang.js");
            } else {
                if(ns.singularity.getCrimeChance("Homicide") < .93){
                    ns.print(`-------------------- STARTING WORKOUT --------------------`);
                    if(ns.getPlayer().skills.strength < 100){
                        ns.singularity.gymWorkout("Sector-12", "strenght");
                    } else if(ns.getPlayer().skills.defense < 100){
                        ns.singularity.gymWorkout("Sector-12", "defense");
                    } else if(ns.getPlayer().skills.dexterity < 100){
                        ns.singularity.gymWorkout("Sector-12", "dexterity");
                    } else {
                        ns.singularity.gymWorkout("Sector-12", "agility");
                    }
                } else {
                    ns.print(`-------------------- CRIME: HOMICIDE --------------------`);
                    ns.singularity.commitCrime("Homicide", false);
                }
            }
        }

        await ns.asleep(15_000);
    }
}