/** @param {import(".").NS} ns */
export async function main(ns) {
  ns.killall("home", true);
  
  ns.tprint(`------------ RUNNING INFECT.JS ------------`);
  ns.run("./infect.js");
  ns.tprint(`------------ FINISHED ------------`);

  ns.tprint(`------------ RUNNING HACKNET.JS ------------`);
  ns.run("./hacknet.js");
  ns.tprint(`------------ FINISHED ------------`);

  ns.tprint(`------------ RUNNING PRIVATE_SERVER.JS ------------`);
  ns.run("./private_server.js");
  ns.tprint(`------------ FINISHED ------------`);

  ns.tprint(`------------ RUNNING UPGRADE_HOME.JS ------------`);
  ns.run("./upgrade_home.js");
  ns.tprint(`------------ FINISHED ------------`);

  ns.tprint(`------------ RUNNING LOOP.JS ------------`);
  ns.run("./loop.js");
  ns.tprint(`------------ FINISHED ------------`);

  // ns.tprint(`------------ RUNNING GANG.JS ------------`);
  // ns.run("./gang.js");
  // ns.tprint(`------------ FINISHED ------------`);

  ns.tprint(`------------ RUNNING STOCK.JS ------------`);
  ns.run("./stock.js");
  ns.tprint(`------------ FINISHED ------------`);

  // ns.tprint(`------------ RUNNING BLADEBURNER.JS ------------`);
  // ns.run("./bladeburner.js");
  // ns.tprint(`------------ FINISHED ------------`);

  // ns.tprint(`------------ RUNNING CORPORATION.JS ------------`);
  // ns.run("./corporation.js");
  // ns.tprint(`------------ FINISHED ------------`);

  ns.tprint(`------------ RUNNING SHARE.JS ------------`);
  ns.run("./share.js");
  ns.tprint(`------------ FINISHED ------------`);

  ns.tprint(`------------ RUNNING HOME.JS ------------`);
  ns.spawn("./home.js");
  ns.tprint(`------------ FINISHED ------------`);
}