import { scanNetworkServersAsync, getRootAccess, getBestServerTargetAsync } from "./utils";

/**
 * @param {import(".").NS} ns
 */
export async function main(ns) {
  let hackableServers = await scanNetworkServersAsync(ns);
  let targets = (await getBestServerTargetAsync(ns))?.slice(0, 2);
  hackableServers.forEach(server => {
    if(!getRootAccess(ns, server)){
      return;
    }
    ns.killall(server);
    ns.scp(["./pirate-manager.js", "./pirate-hack.js", "./pirate-grow.js", "./pirate-weaken.js"], server, "home");
    ns.exec("./pirate-manager.js", server, 1, ...targets);
  });
}