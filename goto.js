import { findPathToServer } from "./utils";

/** @param {import(".").NS} ns */
export async function main(ns) {
    ns.scriptKill("./int_farm.js", "home");
    var obj = ns.args[0];
    var pathToObj = findPathToServer(ns, "home", obj);
    for(var server of pathToObj){
        ns.singularity.connect(server);
        await ns.asleep(100);
    }
}