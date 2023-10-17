import { getRootAccess } from "./utils";

/** @param {import(".").NS} ns */
export async function main(ns) {
    ns.scriptKill("./int_farm.js", "home");
    let targets = []
    if(ns.args.length > 0){
        targets = [ns.args[0] === "end" ? "w0r1d_d43m0n" : ns.args[0]]
    } else {
        targets = ["CSEC", "avmnite-02h", "I.I.I.I", "run4theh111z"];
    }
    for(let target of targets){
        ns.run("./goto.js", 1, target);

        await ns.asleep(4_000);
        if(getRootAccess(ns, target)){
            ns.toast(`Installing backdoor at ${target}`, "info");
            await ns.singularity.installBackdoor();
        }

        await ns.asleep(2_000);
        ns.run("./goto.js", 1, "home");
    }
    ns.run("./home.js");
}