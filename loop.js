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

        if(ns.getPlayer().factions.includes("Daedalus") &&
                !ns.singularity.getOwnedAugmentations(true).includes("The Red Pill") &&
                ns.singularity.getOwnedAugmentations(false).includes("The Blade's Simulacrum")){
            ns.print(`[Iteration #${iteration}] -------------------- WORKING FOR DAEDALUS --------------------`);
            if(ns.singularity.getFactionFavor("Daedalus") >= 150){
                if(ns.getServerMoneyAvailable("home") > 300_000_000){
                    ns.singularity.donateToFaction("Daedalus", ns.getServerMoneyAvailable("home"));
                }
            } else {
                ns.singularity.workForFaction("Daedalus", "field", false);
                ns.run("./share.js");
            }
        } else if(!ns.gang.inGang()){
            if(ns.heart.break() <= -54000){
                ns.print(`[Iteration #${iteration}] -------------------- CREATING GANG --------------------`);
                ns.gang.createGang("Slum Snakes");
                ns.run("./gang.js");
            } else {
                if(ns.singularity.getCrimeChance("Homicide") < .93){
                    ns.print(`[Iteration #${iteration}] -------------------- STARTING WORKOUT --------------------`);
                    if(ns.getPlayer().skills.strength < 85){
                        ns.print(`[Iteration #${iteration}] -------------------- TRAINING STRENGHT --------------------`);
                        ns.singularity.gymWorkout("powerhouse gym", "str", false);
                    } else if(ns.getPlayer().skills.defense < 85){
                        ns.print(`[Iteration #${iteration}] -------------------- TRAINING DEFENSE --------------------`);
                        ns.singularity.gymWorkout("powerhouse gym", "def", false);
                    } else if(ns.getPlayer().skills.dexterity < 85){
                        ns.print(`[Iteration #${iteration}] -------------------- TRAINING DEXTERITY --------------------`);
                        ns.singularity.gymWorkout("powerhouse gym", "dex", false);
                    } else {
                        ns.print(`[Iteration #${iteration}] -------------------- TRAINING AGILITY --------------------`);
                        ns.singularity.gymWorkout("powerhouse gym", "agi", false);
                    }
                } else {
                    ns.print(`[Iteration #${iteration}] -------------------- CRIME: HOMICIDE --------------------`);
                    ns.singularity.commitCrime("Homicide", false);
                }
            }
        }

        await ns.asleep(15_000);
        iteration++;
    }
}