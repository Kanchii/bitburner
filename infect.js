import { scanNetworkServersAsync, getRootAccess, getBestServerTargetAsync } from "./utils";

/**
 * @param {import(".").NS} ns
 */
export async function main(ns) {
  ns.disableLog("ALL");
  var lastTargets = [];
  while(true){
    const targets = await getBestServerTargetAsync(ns, 1);
    if(!targets.every(x => lastTargets.includes(x))){
      ns.tprint(`INFO ------------------- [ INFECTING ] -------------------`);
      ns.tprint(`INFO ------------------- LAST TARGETS: ${"[" + lastTargets.join(", ") + "]"} -------------------`);
      ns.tprint(`INFO ------------------- NEW  TARGETS: ${"[" + targets.join(", ") + "]"} -------------------`);
      ns.tprint(`INFO ------------------- [ INFECTING ] -------------------`);
      
      lastTargets = targets;

      const hackableServers = await scanNetworkServersAsync(ns);
      hackableServers.forEach(server => {
        if(!getRootAccess(ns, server)){
          return;
        }
        ns.killall(server);
        ns.scp(["./pirate-manager.js", "./pirate-hack.js", "./pirate-grow.js", "./pirate-weaken.js"], server, "home");
        ns.exec("./pirate-manager.js", server, 1, ...targets);
      });
    }

    await ns.asleep(30_000);
  }
}