/** @param {import(".").NS} ns */
export async function main(ns) {
    var targetServer = ns.args[0];
    var minimumSecurityThreshold = ns.getServerMinSecurityLevel(targetServer) + 3;
    var minimumMoneyThreshold = ns.getServerMaxMoney(targetServer) * 0.75;
    while (true) {
      if (ns.getServerMoneyAvailable(targetServer) < minimumMoneyThreshold) {
        await ns.grow(targetServer);
      } else if (ns.getServerSecurityLevel(targetServer) > minimumSecurityThreshold) {
        await ns.weaken(targetServer);
      }  else {
        await ns.hack(targetServer);
      }
    }
  }