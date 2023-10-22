/** @param {import(".").NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");

  const filesPath = {
    int_farm: "./int_farm.js",
    weaken: "./pirate-weaken.js",
    pirate_manager: "./pirate-manager.js"
  }

  Object.values(filesPath).forEach(filePath => ns.scriptKill(filePath, "home"));

  ns.tprint(`----------------------- TRAINING MODE -----------------------`);
  let homeTotalRam = ns.getServerMaxRam("home") - ns.getServerUsedRam("home") - 256;
  if(homeTotalRam <= 0){
    ns.tprint(`ERROR Without sufficient RAM to start farming INT!!`);
    ns.exit();
  }

  let weakenTotalRamPercentage = 0.075;
  let weakenTotalRam = homeTotalRam * weakenTotalRamPercentage;
  let totalWeakenThreads = Math.floor(weakenTotalRam / ns.getScriptRam(filesPath.weaken));
  ns.tprint(`Total Weaken Threads Used: ${totalWeakenThreads}`);
  ns.run(filesPath.weaken, totalWeakenThreads, "home", "inf");
  
  let intFarmTotalRam = homeTotalRam * (1 - weakenTotalRamPercentage);
  let threads = Math.min(20000, Math.floor(intFarmTotalRam / ns.getScriptRam(filesPath.int_farm)));
  for(let  i = 0; i < threads; i++){
    ns.run(filesPath.int_farm, 1);
  }
}