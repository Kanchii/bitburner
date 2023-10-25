import { scanNetworkServersAsync } from "./utils";

/** @param {import(".").NS} ns */
export async function main(ns) {
    ns.rm("coding-contracts.txt");
    (await scanNetworkServersAsync(ns)).forEach(server => {
            const files = ns.ls(server, "contract");
            if(files.length > 0){
                ns.tprint(`INFO Contract(s) [${files.join(",")}] found at ${server}`);
                files.forEach(x => ns.write("coding-contracts.txt", `${x},${server}`, "a"));
            }
        });
}