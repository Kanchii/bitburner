import { getBestServerTargetAsync, threadsToReduceSecurityLevelBy } from "./utils";

/** @param {import(".").NS} ns */
export async function main(ns) {
  let scriptFarmPath = "./int_farm.js";
  let scriptVirusPath = "./virus.js";
  let weakenScriptPath = "./weaken.js";

  ns.scriptKill(scriptFarmPath, "home");
  ns.scriptKill(scriptVirusPath, "home");
  ns.scriptKill(weakenScriptPath, "home");

  if(ns.gang.inGang() && ns.singularity.getOwnedAugmentations(false).length <= 30){
    let homeTotalRam = ns.getServerMaxRam("home") - ns.getServerUsedRam("home");

    let weakenTotalRamPercentage = 0.075;
    let weakenTotalRam = homeTotalRam * weakenTotalRamPercentage;
    let totalWeakenThreads = Math.floor(weakenTotalRam / ns.getScriptRam("./weaken.js"));
    ns.tprint(`Total Weaken Threads Used: ${totalWeakenThreads}`);
    ns.run("./weaken.js", totalWeakenThreads);
    
    let intFarmTotalRam = homeTotalRam * (1 - weakenTotalRamPercentage);
    let threads = Math.min(20000, Math.floor(intFarmTotalRam / ns.getScriptRam(scriptFarmPath)));
    for(let  i = 0; i < threads; i++){
      ns.run(scriptFarmPath, 1);
    }
  } else {
    let totalTargets = 4;
    let threads = 0;
    var bestTargets = await getBestServerTargetAsync(ns);
    do {
      totalTargets--;
      if(totalTargets <= 0){
        break;
      }
      var targets = bestTargets.slice(0, totalTargets);
      let homeTotalRam = ns.getServerMaxRam("home") - ns.getServerUsedRam("home") - 1000
      threads = Math.floor((homeTotalRam / ns.getScriptRam(scriptVirusPath)) / targets.length);
    } while(threads <= 0);

    bestTargets.slice(0, totalTargets).forEach(x => {
      ns.run(scriptVirusPath, threads, x);
    });
  }
}