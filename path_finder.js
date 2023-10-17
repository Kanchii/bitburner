import { findPathToServer } from "./utils";

/** @param {import(".").NS} ns */
export async function main(ns) {
    var targetServer = ns.args[0]
    if(targetServer == "end"){
        targetServer = "w0r1d_d43m0n";
    }
    else if(targetServer == "all"){
        var factions = ["CSEC", "avmnite-02h", "I.I.I.I", "run4theh111z", 'w0r1d_d43m0n'];
        for(var faction of factions){
            var path = findPathToServer(ns, "home", faction);
            if(!path){
                ns.tprint(`ERROR Couldn't find path to faction ${faction}`)
            } else {
                ns.tprint("-".repeat(20));
                path = path.map((currentServer, idx) => printServerPath(currentServer, idx));
                ns.tprint(`INFO ${faction}: ${path.join(` -> `)}`);
            }
        }

        return;
    }
    var path = findPathToServer(ns, "home", targetServer)
    if(path === null){
        ns.tprint(`Path not found. Probably the target ${targetServer} name is wrong!`)
    } else {
        path = path.map((currentServer, idx) => printServerPath(currentServer, idx))
        ns.tprint(path.join(` -> `))
    }

    function printServerPath(currentServer, idx){
        return `[${idx}] ${currentServer} (${ns.getServerRequiredHackingLevel(currentServer)})`;
    }
}