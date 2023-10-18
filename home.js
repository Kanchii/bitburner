import { getBestServerTargetAsync, threadsToReduceSecurityLevelBy } from "./utils";

/** @param {import(".").NS} ns */
export async function main(ns) {
  const scriptFarmPath = "./int_farm.js";
  const pirateManagerPath = "./pirate-manager.js";

  ns.scriptKill(scriptFarmPath, "home");
  ns.scriptKill(pirateManagerPath, "home");

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
    const bestTargets = await getBestServerTargetAsync(ns, 2)
    ns.run(pirateManagerPath, 1, ...bestTargets);
  }
}