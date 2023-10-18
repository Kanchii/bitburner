let ATTACK_TYPE = {
    hack: "./pirate-hack.js",
    grow: "./pirate-grow.js",
    weaken: "./pirate-weaken.js"
}

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
        const threads = Math.floor((ram * attackData.percent) / ns.getScriptRam(attackData.attackType));
        if(threads <= 0){
            ns.print(`ERROR Skipping because we don't have sufficient threads to attack ${target} using ${attackData.attackType}!`);
            return;
        }
        const pid = ns.run(attackData.attackType, {
            threads: threads
        }, target);

        pidsRunning.push({pid: pid, attackType: attackData.attackType, percent: attackData.percent});
    });

    let weakenOrGrowRunning = true;
    do {
        weakenOrGrowRunning = pidsRunning.filter(x => x.attackType !== ATTACK_TYPE.hack && ns.isRunning(x.pid)).length > 0;
        if(weakenOrGrowRunning){
            pidsRunning.forEach(attackData => {
                if(attackData.attackType === ATTACK_TYPE.hack && !ns.isRunning(attackData.pid)){
                    const threads = Math.floor((ram * attackData.percent) / ns.getScriptRam(attackData.attackType));
                    attackData.pid = ns.run(ATTACK_TYPE.hack, threads, target);
                }
            });
        }
        
        await ns.asleep(50);
    } while(pidsRunning.map(pid => ns.isRunning(pid.pid)).includes(true));
}

/**
 * @param {import(".").NS} ns
 * @param {string} target
 * @returns {[{percent: number, attackType: string}]} Array with definitions of percentage and which file to run
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
        return [{percent: 0.3, attackType: ATTACK_TYPE.grow}, {percent: 0.7, attackType: ATTACK_TYPE.weaken}];
    }
    if(targetServerMoneyAvailable < targetMoneyAvailableThreshold){
        return [{percent: 0.6, attackType: ATTACK_TYPE.grow}, {percent: 0.4, attackType: ATTACK_TYPE.weaken}];
    }

    return [{percent: 0.9, attackType: ATTACK_TYPE.hack}, {percent: 0.05, attackType: ATTACK_TYPE.weaken}, {percent: 0.05, attackType: ATTACK_TYPE.grow}];
}