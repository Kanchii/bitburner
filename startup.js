/** @param {import(".").NS} ns */
export async function main(ns) {
  ns.killall("home", true);
  
  ns.tprint(`------------ RUNNING INFECT.JS ------------`);
  const pid = ns.run("./infect.js");
  while(ns.isRunning(pid)){
    await ns.asleep(50);
  }
  ns.tprint(`------------ FINISHED ------------`);

  ns.tprint(`------------ RUNNING PRIVATE_SERVER.JS ------------`);
  ns.run("./private_server.js");
  ns.tprint(`------------ FINISHED ------------`);

  ns.tprint(`------------ RUNNING UPGRADE_HOME.JS ------------`);
  ns.run("./upgrade_home.js");
  ns.tprint(`------------ FINISHED ------------`);
  
  ns.tprint(`------------ RUNNING GANG.JS ------------`);
  ns.run("./gang.js");
  ns.tprint(`------------ FINISHED ------------`);
  
  ns.tprint(`------------ RUNNING STOCK.JS ------------`);
  ns.run("./stock.js");
  ns.tprint(`------------ FINISHED ------------`);
  // ns.run("./corporation.js");
  
  ns.tprint(`------------ RUNNING LOOP.JS ------------`);
  ns.run("./loop.js");
  ns.tprint(`------------ FINISHED ------------`);

  ns.tprint(`------------ RUNNING HOME.JS ------------`);
  ns.run("./home.js");
  ns.tprint(`------------ FINISHED ------------`);
}