/**
 * @param {import(".").NS} ns 
 * @returns {Promise<string[]>} Array containg all servers that are hackable by player
 */
export async function scanNetworkServersAsync(ns){
    var servers = ns.scan().filter(x => x !== "home" && !x.startsWith("hacknet"));
    var index = 0
    do {
        var currentServer = servers[index]
        index++

        ns.scan(currentServer).forEach(scannedServer => {
            if(servers.indexOf(scannedServer) >= 0 || scannedServer === "home" || scannedServer.startsWith("hacknet")){
                return;
            }
            servers.push(scannedServer)
        });
    } while(index < servers.length)

    return servers
}

/**
 * 
 * @param {import(".").NS} ns
 * @param {bool} owned
 * @returns {string[]} List of all programs owned by the player
 */
export function getPrograms(ns, owned = false){
    return [
        "BruteSSH.exe",
        "FTPCrack.exe",
        "relaySMTP.exe",
        "HTTPWorm.exe",
        "SQLInject.exe"
    ].filter(program => owned ? ns.fileExists(program) : !ns.fileExists(program));
}

/**
 * 
 * @param {import(".").NS} ns 
 * @param {string} target 
 * @returns {boolean} True if the player has root access to the server. False, otherwise
 */
export function getRootAccess(ns, target){
    if(ns.hasRootAccess(target)){
        return true;
    }
    var crackPortsFilename = ["NUKE.exe", "BruteSSH.exe", "FTPCrack.exe", "relaySMTP.exe", "HTTPWorm.exe", "SQLInject.exe"]
    var crackPortsFunc = [ns.nuke, ns.brutessh, ns.ftpcrack, ns.relaysmtp, ns.httpworm, ns.sqlinject]
    var portsNeeds = ns.getServerNumPortsRequired(target);

    for(var i = portsNeeds; i >= 0; i--){
        if(!ns.fileExists(crackPortsFilename[i], "home")){
        return false;
        }

        crackPortsFunc[i](target);
    }

    return ns.hasRootAccess(target);
}

/**
 * 
 * @param {string} server 
 * @param {import("../../../.").NS} ns 
 * @returns {number} Total server available RAM
 */
export function getServerCurrentRam(ns, server) {
    return ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
}

/**
 * @param {import(".").NS} ns 
 * @param {number} limit
 * @returns {Promise<string[]>} Best targets array
 */
export async function getBestServerTargetAsync(ns, limit = undefined){
    let networkServers = await scanNetworkServersAsync(ns);
    let simulatedServers = []
    for(let networkServer of networkServers){
        if(!getRootAccess(ns, networkServer)){
            continue;
        }

        simulatedServers.push({
            hackLevelRequired: ns.getServer(networkServer).requiredHackingSkill,
            serverName: networkServer,
            maxMoney: ns.getServerMaxMoney(networkServer)
        });
    }

    return simulatedServers.filter(serverInfo => serverInfo.hackLevelRequired <= Math.ceil(ns.getPlayer().skills.hacking / 4) && serverInfo.maxMoney > 0)
        .sort((a, b) => b.maxMoney - a.maxMoney)
        .map(x => x.serverName)
        .slice(0, limit);
}

/**
 * 
 * @param {import(".").NS} ns 
 * @param {string} currentServer 
 * @param {string} obj
 * @returns {[string]} Array that contains de path from "home" to target
 */
export function findPathToServer(ns, currentServer, obj){
    return buildPathToServer(ns, currentServer, obj, {});
}

/**
 * 
 * @param {import(".").NS} ns 
 * @param {string} currentServer 
 * @param {string} obj 
 * @param {[string:bool]} visited 
 * @returns {[string]} Array that contains de path from "home" to target
 */
export function buildPathToServer(ns, currentServer, obj, visited){
    if(currentServer == obj){
        return [currentServer]
    }
    visited[currentServer] = true;
    var servers = ns.scan(currentServer)
    for(var server of servers){
        if(visited[server]){
            continue;
        }
        var res = buildPathToServer(ns, server, obj, visited)
        if(res != null){
            return [currentServer, ...res]
        }
    }

    return null
}

/**
 * 
 * @param {import(".").NS} ns 
 * @param {string} currentServer 
 * @param {number} targetSecurityLevelReduce 
 * @returns {int} Number of threads needed to reduce security level by `targetSecurityLevelReduce`
 */
export function threadsToReduceSecurityLevelBy(ns, currentServer, targetSecurityLevelReduce){
    let l = 1, r = 1e9;
    while(l < r){
        let mid = Math.floor(l + (r-l)/2);
        let res = ns.weakenAnalyze(mid, ns.getServer(currentServer).cpuCores);
        if(res >= targetSecurityLevelReduce){
            r = mid;
        } else {
            l = mid + 1;
        }
    }

    return l
}

/**
 * 
 * @param {number} timeDiff 
 * @returns {string} Formated string for hours (hh:mm:ss)
 */
export function millisecondsToHours(timeDiff){
    var hh = Math.floor(timeDiff / 1000 / 60 / 60);   
    hh = ('0' + hh).slice(-2)

    timeDiff -= hh * 1000 * 60 * 60;
    var mm = Math.floor(timeDiff / 1000 / 60);
    mm = ('0' + mm).slice(-2)

    timeDiff -= mm * 1000 * 60;
    var ss = Math.floor(timeDiff / 1000);
    ss = ('0' + ss).slice(-2)

    return `${hh}:${mm}:${ss}`;
}