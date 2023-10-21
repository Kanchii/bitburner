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
        let pid = ns.run("./goto.js", 1, target);
        while(ns.isRunning(pid)){
            await ns.asleep(25);
        }

        try {
            if(getRootAccess(ns, target)){
                ns.toast(`Installing backdoor at ${target}`, "info");
                await ns.singularity.installBackdoor();
            }
        } catch(_) {}

        pid = ns.run("./goto.js", 1, "home");
        while(ns.isRunning(pid)){
            await ns.asleep(25);
        }
    }
    ns.run("./home.js");
}