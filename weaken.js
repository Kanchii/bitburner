/** @param {import(".").NS} ns */
export async function main(ns) {
    if(ns.args.includes("inf")){
        while(true){
            await ns.weaken(ns.args[0]);
        }
    } else {
        await ns.weaken(ns.args[0]);
    }
}