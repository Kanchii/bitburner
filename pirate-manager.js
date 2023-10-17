/** @param {import(".").NS} ns */
export async function main(ns) {
    const targets = ns.args[0];
    while(true){
        const serverMaxRam = ns.getServerMaxRam(ns.getHostname());
        if(serverMaxRam > 128){
            const ramPerTarget = serverMaxRam / targets.length;
            targets.forEach(async target => {
                await runAttack(ns, target, Math.floor(ramPerTarget))
            });
        } else {
            await runAttack(ns, targets[0], serverMaxRam);
        }
        await ns.sleep(5_000);
    }
}

/**
 * @param {import(".").NS} ns
 * @param {string} target
 * @param {number} ram
 */
async function runAttack(ns, target, ram){
    let pidsRunning = [];
    getAttackStrategy(ns, target).forEach(attackData => {
        const pid = ns.run(attackData.file, {
            threads: Math.floor((ram * attackData.percent) / ns.getScriptRam(attackData.file))
        }, target);

        pidsRunning.push(pid);
    });

    do {
        await ns.sleep(1_000);
    } while(pidsRunning.every(pid => !ns.isRunning(pid)));
}

function getAttackStrategy(ns, target){
    const targetMinServerSecurityThreshold = ns.getServerMinSecurityLevel(target) + 5;
    const targetServerSecurity = ns.getServerSecurityLevel(target);
    const targetServerMoneyAvailable = ns.getServerMoneyAvailable(target);
    const targetMoneyAvailableThreshold = ns.getServerMaxMoney(target) * 0.75;
    if(targetServerSecurity > targetMinServerSecurityThreshold){
        return [{percent: 0.3, file: "./pirate-grow.js"}, {percent: 0.7, file: "./pirate-weaken.js"}];
    }
    if(targetServerMoneyAvailable < targetMoneyAvailableThreshold){
        return [{percent: 0.6, file: "./pirate-grow.js"}, {percent: 0.4, file: "./pirate-weaken.js"}];
    }

    return [{percent: 0.25, file: "./pirate-hack.js"}, {percent: 0.25, file: "./pirate-weaken.js"},
            {percent: 0.25, file: "./pirate-grow.js"}, {percent: 0.25, file: "./pirate-weaken.js"}];
}