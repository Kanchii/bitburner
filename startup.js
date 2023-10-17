/** @param {import(".").NS} ns */
export async function main(ns) {
  ns.killall("home");
  
  const pid = ns.run("./infect.js");
  while(ns.isRunning(pid)){
    await ns.asleep(50);
  }

  ns.run("./private_server.js");

  ns.run("./upgrade_home.js");
  
  ns.run("./gang.js");
  ns.run("./stock.js");
  // ns.run("./corporation.js");
  
  ns.run("./loop.js");

  ns.run("./home.js");
}