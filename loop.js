/** @param {import(".").NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    let iteration = 1;
    while(true){
        ns.print(`[Iteration #${iteration}] -------------------- TRYING TO BUY AUGMENTATIONS --------------------`);
        const pid = ns.run("./augments.js");
        while(ns.isRunning(pid)){
            await ns.asleep(50);
        }

        if(ns.singularity.getOwnedAugmentations(true).length - ns.singularity.getOwnedAugmentations(false).length >= 5){
            ns.run("./reset.js");
            break;
        }

        ns.singularity.checkFactionInvitations().forEach(x => {
            ns.print(`[Iteration #${iteration}] -------------------- ACCEPTING INVITATION --------------------`);
            ns.singularity.joinFaction(x)
        });

        if(ns.getPlayer().factions.includes("Daedalus") && !ns.singularity.isBusy() && !ns.singularity.getOwnedAugmentations(true).includes("The Red Pill")){
            ns.print(`[Iteration #${iteration}] -------------------- WORKING FOR DAEDALUS --------------------`);
            if(ns.singularity.getFactionFavor("Daedalus") >= 150){
                if(ns.getServerMoneyAvailable("home") > 300_000_000){
                    ns.singularity.donateToFaction("Daedalus", ns.getServerMoneyAvailable("home"));
                }
            } else {
                ns.singularity.workForFaction("Daedalus", "field", false);
            }
        } else if(!ns.gang.inGang()){
            if(ns.heart.break() <= -54000){
                ns.print(`[Iteration #${iteration}] -------------------- CREATING GANG --------------------`);
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
                    ns.print(`[Iteration #${iteration}] -------------------- CRIME: HOMICIDE --------------------`);
                    ns.singularity.commitCrime("Homicide", false);
                }
            }
        }

        await ns.asleep(15_000);
    }
}