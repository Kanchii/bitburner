/** @param {import(".").NS} ns */
export async function main(ns) {
  ns.killall("home");
  
  ns.run("./infect.js");

  ns.run("./private_server.js");

  ns.run("./upgrade_home.js");
  
  ns.run("./gang.js");
  ns.run("./stock.js");
  // ns.run("./corporation.js");
  
  ns.run("./loop.js");

  ns.run("./home.js");
}