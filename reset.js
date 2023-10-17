/** @param {import(".").NS} ns */
export async function main(ns) {
    ns.run("./stock_sell.js");
    await ns.sleep(5_000);
    ns.singularity.softReset("./startup.js");
}