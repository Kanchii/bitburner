import { scanNetworkServersAsync, getRootAccess, getBestServerTargetAsync } from "./utils";

/**
 * @param {import(".").NS} ns
 */
export async function main(ns) {
  ns.disableLog("ALL");
  var lastTargets = [];
  while(true){
    const targets = await getBestServerTargetAsync(ns, 2);
    let killAll = false;
    if(!targets.every(x => lastTargets.includes(x))){
      ns.tprint(`INFO ------------------- [ INFECTING ] -------------------`);
      ns.tprint(`INFO ------------------- LAST TARGETS: ${"[" + lastTargets.join(", ") + "]"} -------------------`);
      ns.tprint(`INFO ------------------- NEW  TARGETS: ${"[" + targets.join(", ") + "]"} -------------------`);
      ns.tprint(`INFO ------------------- [ INFECTING ] -------------------`);
      
      lastTargets = targets;
      killAll = true;
    }

    const hackableServers = await scanNetworkServersAsync(ns);
    hackableServers.forEach(async server => {
      if(!getRootAccess(ns, server)){
        return;
      }
      if(killAll){
        ns.killall(server);
      }

      ns.scp("./hack.js", server, "home");
      let targetIndex = 0;
      while((ns.getServerMaxRam(server) - ns.getServerUsedRam(server)) >= ns.getScriptRam("./hack.js")){
        ns.exec("./hack.js", server, 1, targets[targetIndex]);
        await ns.asleep(50);

        targetIndex = (targetIndex + 1) % (targets.length);
      }
    });
    await ns.asleep(30_000);
  }
}