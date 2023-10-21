/**
 * @param {import(".").NS} ns
 */
export async function main(ns) {
    ns.disableLog("ALL");

    while(true){
        if(ns.bladeburner.getCurrentAction().name !== "Training"){
            ns.bladeburner.startAction("Training");
        }

        await ns.asleep(5_000);
    }
}