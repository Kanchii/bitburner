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
      var ramPerTarget = (ns.getServerMaxRam(server) - ns.getServerUsedRam(server)) / targets.length;
      for(var i = 0; i < targets.length; i++){
        let totalThreads = Math.ceil(ramPerTarget / ns.getScriptRam("./hack.js"));
        while(totalThreads > 0 && totalThreads * ns.getScriptRam("./hack.js") > (ns.getServerMaxRam(server) - ns.getServerUsedRam(server))){
          totalThreads--;
        }
        if(totalThreads <= 0) continue;
        ns.exec("./hack.js", server, totalThreads, targets[i]);
      }
    });
    await ns.asleep(30_000);
  }
}