/** @param {import(".").NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    const targets = ns.args;
    while(true){
        const serverUsableRam = ns.getServerMaxRam(ns.getHostname()) - ns.getServerUsedRam(ns.getHostname());
        if(serverUsableRam < ns.getScriptRam("./pirate-weaken.js")){
            ns.print(`ERROR Killing script because it don't have enought RAM to run scripts!`);
            return;
        }
        if(serverUsableRam > 128){
            const ramPerTarget = serverUsableRam / targets.length;
            let concurrentExecs = []
            targets.forEach(async target => {
                concurrentExecs.push(runAttack(ns, target, Math.floor(ramPerTarget)))
            });
            await Promise.allSettled(concurrentExecs);
            ns.print(`INFO -------------------- ATTACK FINISHED --------------------`);
        } else {
            await runAttack(ns, targets[0], serverUsableRam);
        }
    }
}

/**
 * @param {import(".").NS} ns
 * @param {string} target
 * @param {number} ram
 */
async function runAttack(ns, target, ram){
    let pidsRunning = [];
    const attackStrategy = getAttackStrategy(ns, target);
    ns.print(`SUCCESS -------------------- STRATEGY USED --------------------`);
    ns.print(`SUCCESS ${JSON.stringify(attackStrategy)}`);
    ns.print(`SUCCESS ----------------------------------------`);
    attackStrategy.forEach(async attackData => {
        const threads = Math.floor((ram * attackData.percent) / ns.getScriptRam(attackData.file));
        if(threads <= 0){
            ns.print(`ERROR Skipping because we don't have sufficient threads to attack ${target} using ${attackData.file}!`);
            return;
        }
        const pid = ns.run(attackData.file, {
            threads: threads
        }, target);

        pidsRunning.push(pid);
        await ns.asleep(250);
    });

    do {
        await ns.asleep(1_000);
    } while(pidsRunning.map(pid => ns.isRunning(pid)).includes(true));
}

/**
 * @param {import(".").NS} ns
 * @param {string} target
 * @returns {[{percent: number, file: string}]} Array with definitions of percentage and which file to run
 */
function getAttackStrategy(ns, target){
    const targetMinServerSecurityThreshold = ns.getServerMinSecurityLevel(target) + 5;
    const targetServerSecurity = ns.getServerSecurityLevel(target);

    const targetServerMoneyAvailable = ns.getServerMoneyAvailable(target);
    const targetMoneyAvailableThreshold = ns.getServerMaxMoney(target) * 0.75;

    ns.print(`INFO -------------------- ${target.toUpperCase()} --------`);
    ns.print(`INFO Server Money Threshold:    $${targetMoneyAvailableThreshold.toFixed(2)}`);
    ns.print(`INFO Server Current Money:      $${targetServerMoneyAvailable.toFixed(2)}`);
    ns.print(`INFO ----------------------------------------`);
    ns.print(`INFO Server Security Threshold: ${targetMinServerSecurityThreshold.toFixed(2)}`);
    ns.print(`INFO Server Current Security:   ${targetServerSecurity.toFixed(2)}`);
    ns.print(`INFO ----------------------------------------`);

    if(targetServerSecurity > targetMinServerSecurityThreshold){
        return [{percent: 0.3, file: "./pirate-grow.js"}, {percent: 0.7, file: "./pirate-weaken.js"}];
    }
    if(targetServerMoneyAvailable < targetMoneyAvailableThreshold){
        return [{percent: 0.6, file: "./pirate-grow.js"}, {percent: 0.4, file: "./pirate-weaken.js"}];
    }

    return [{percent: 0.25, file: "./pirate-hack.js"}, {percent: 0.25, file: "./pirate-weaken.js"},
            {percent: 0.25, file: "./pirate-grow.js"}, {percent: 0.25, file: "./pirate-weaken.js"}];
}