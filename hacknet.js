
/** @param {import(".").NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    const moneyModeOnly = ns.args.length > 0;
    const hacknet = ns.hacknet;
    const hacknetFormula = ns.formulas.hacknetServers;
    while(true){
        while(hacknet.spendHashes("Sell for Money")){}
        if(moneyModeOnly){
          await ns.asleep(250);
          continue;
        }
        let nodesToUpgrade = [];
        if(hacknet.numNodes() < hacknet.maxNumNodes()){
            nodesToUpgrade.push({
                title: `PURCHASE NEW NODE`,
                cost: hacknet.getPurchaseNodeCost(),
                hashGain: hacknetFormula.hashGainRate(1, 0, 1, 1),
                score: hacknetFormula.hashGainRate(1, 0, 1, 1) / hacknet.getPurchaseNodeCost(),
                id: hacknet.numNodes() + 1,
                upgrade: hacknet.purchaseNode
            });
        }

        for(let i = 0; i < hacknet.numNodes(); i++){
            const nodeStats = hacknet.getNodeStats(i);
            const currentHashGain = hacknetFormula.hashGainRate(nodeStats.level, nodeStats.ramUsed, nodeStats.ram, nodeStats.cores);
            
            const coreUpgradeCost = hacknet.getCoreUpgradeCost(i);
            const coreUpgradeHashGain = hacknetFormula.hashGainRate(nodeStats.level, nodeStats.ramUsed, nodeStats.ram, nodeStats.cores + 1) - currentHashGain;
            const coreUpgradeScore = coreUpgradeHashGain / coreUpgradeCost;
            nodesToUpgrade.push({
                title: `UPGRADE CORE`,
                cost: coreUpgradeCost,
                hashGain: coreUpgradeHashGain,
                score: coreUpgradeScore,
                id: i,
                upgrade: hacknet.upgradeCore
            });

            const ramUpgradeCost = hacknet.getRamUpgradeCost(i);
            const ramUpgradeHashGain = hacknetFormula.hashGainRate(nodeStats.level, nodeStats.ramUsed, nodeStats.ram * 2, nodeStats.cores) - currentHashGain;
            const ramUpgradeScore = ramUpgradeHashGain / ramUpgradeCost;
            nodesToUpgrade.push({
                title: `UPGRADE RAM`,
                cost: ramUpgradeCost,
                hashGain: ramUpgradeHashGain,
                score: ramUpgradeScore,
                id: i,
                upgrade: hacknet.upgradeRam
            });

            const cacheUpgradeCost = hacknet.getCacheUpgradeCost(i);
            const cacheUpgradeHashGain = 0;
            const cacheUpgradeScore = 0;
            nodesToUpgrade.push({
                title: `UPGRADE CACHE`,
                cost: cacheUpgradeCost,
                hashGain: cacheUpgradeHashGain,
                score: cacheUpgradeScore,
                id: i,
                upgrade: hacknet.upgradeCache
            });

            const levelUpgradeCost = hacknet.getLevelUpgradeCost(i);
            const levelUpgradeHashGain = hacknetFormula.hashGainRate(nodeStats.level + 1, nodeStats.ramUsed, nodeStats.ram, nodeStats.cores) - currentHashGain;
            const levelUpgradeScore = levelUpgradeHashGain / levelUpgradeCost;
            nodesToUpgrade.push({
                title: `UPGRADE LEVEL`,
                cost: levelUpgradeCost,
                hashGain: levelUpgradeHashGain,
                score: levelUpgradeScore,
                id: i,
                upgrade: hacknet.upgradeLevel
            });
        }

        nodesToUpgrade.filter(node => node.cost <= ns.getServerMoneyAvailable("home"))
            .sort((a, b) => b.score - a.score || b.hashGain - a.hashGain || a.cost - b.cost)
                .forEach(node => {
                    const upgraded = node.upgrade(node.id);
                    if(upgraded !== -1 && upgraded){
                        ns.print(`NODE ${node.id}\n----- ${node.title}\n---------- COST: ${node.cost / 1_000_000}M\n---------- HASH GAIN: ${node.hashGain}\n---------- SCORE: ${node.score}\n\n`);
                    }
                });
        
        await ns.asleep(250);
    }
}