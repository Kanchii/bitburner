import { getPrograms } from "./utils";

/** @param {import(".").NS} ns */
export async function main(ns) {
    let programsToBuy = getPrograms(ns, false);

    programsToBuy.forEach(x => {
        var cost = ns.singularity.getDarkwebProgramCost(x);
        if(cost <= ns.getServerMoneyAvailable("home")){
            if(ns.singularity.purchaseProgram(x)){
                ns.toast(`Bought program ${x}`, "success", 3_000);
            }
        }
    });
}