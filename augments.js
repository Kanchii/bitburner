/** @param {import(".").NS} ns */
export async function main(ns) {
    do {
        var newAugBought = false;
        ns.getPlayer().factions.sort((a, b) => {
            var gangName = ns.gang.inGang() ? ns.gang.getGangInformation().faction : undefined;
            return a === gangName ? -1 : (b === gangName ? 1 : 0)
        })
            .forEach(faction => {
            ns.singularity.getAugmentationsFromFaction(faction)
            .filter(aug => {
                var augStats = ns.singularity.getAugmentationStats(aug);
                return ns.singularity.getFactionRep(faction) && (augStats.hacking > 1 ||  augStats.hacking_chance > 1 ||  augStats.hacking_exp > 1 || augStats.hacking_grow > 1 || 
                    augStats.hacking_money > 1 ||  augStats.hacking_speed > 1 || augStats.faction_rep > 1);
            })
            .filter(aug => aug.startsWith("NeuroFlux Governor") || aug.startsWith("The Red Pill") || !(ns.singularity.getOwnedAugmentations().includes(aug)))
            .sort((a, b) => ns.singularity.getAugmentationPrice(b) - ns.singularity.getAugmentationPrice(a))
            .forEach(aug => {
                if(buyPurchaseAugmentation(ns, aug, faction)){
                    newAugBought = true;
                }
            });
        });
    } while(newAugBought);
}

/** @param {import(".").NS} ns */
function buyPurchaseAugmentation(ns, aug, faction){
    if(aug === undefined || aug === ""){
        return false;
    }
    let prereq = ns.singularity.getAugmentationPrereq(aug);
    let allBought = true;
    for(let x of prereq){
        if(ns.singularity.getOwnedAugmentations(true).includes(x)){
            continue;
        }
        if(!buyPurchaseAugmentation(ns, x, faction)){
            allBought = false;
        }
    }

    if(allBought){
        return ns.singularity.purchaseAugmentation(faction, aug);
    }
    return false;
}