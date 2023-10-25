/** @param {import(".").NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");

  const hackFile = "./hack.js";
  const hackFileSize = ns.getScriptRam(hackFile);
  const thisScriptRam = ns.getScriptRam("./home.js");

  const currentRam = ns.getServerMaxRam("home") - ns.getServerUsedRam("home") - 64 + thisScriptRam;
  const totalThreads = Math.floor(currentRam / hackFileSize);
  if(totalThreads <= 0) {
    ns.tprint(`ERROR Without sufficient threads to starting HOME hacking!`)
    ns.exit();
  }

  ns.spawn(hackFile, totalThreads, "joesguns");

  // const filesPath = {
  //   int_farm: "./int_farm.js",
  //   weaken: "./weaken.js"
  // }

  // Object.values(filesPath).forEach(filePath => ns.scriptKill(filePath, "home"));

  // ns.tprint(`----------------------- TRAINING MODE -----------------------`);
  // let homeTotalRam = ns.getServerMaxRam("home") - ns.getServerUsedRam("home") - 256;
  // if(homeTotalRam <= 0){
  //   ns.tprint(`ERROR Without sufficient RAM to start farming INT!!`);
  //   ns.exit();
  // }

  // let weakenTotalRamPercentage = 0.075;
  // let weakenTotalRam = homeTotalRam * weakenTotalRamPercentage;
  // let totalWeakenThreads = Math.floor(weakenTotalRam / ns.getScriptRam(filesPath.weaken));
  // ns.tprint(`Total Weaken Threads Used: ${totalWeakenThreads}`);
  // ns.run(filesPath.weaken, totalWeakenThreads, "home", "inf");
  
  // let intFarmTotalRam = homeTotalRam * (1 - weakenTotalRamPercentage);
  // let threads = Math.min(20000, Math.floor(intFarmTotalRam / ns.getScriptRam(filesPath.int_farm)));
  // for(let  i = 0; i < threads; i++){
  //   ns.run(filesPath.int_farm, 1);
  // }
}