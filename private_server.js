class PrivateServerHandle {
    /** @param {import(".").NS} ns */
    constructor(ns){
        this.ns = ns;
        this.startRam = 4;
    }

    async run(){
        await this.buy();
        await this.upgrade();
    }   

    async buy(){
        while(this.ns.getPurchasedServers().length < this.ns.getPurchasedServerLimit()){
            var purchasableServerName = `pserv-${this.ns.getPurchasedServers().length}`;
            if(this.ns.getServerMoneyAvailable("home") >= this.ns.getPurchasedServerCost(this.startRam)){
                this.ns.purchaseServer(purchasableServerName, this.startRam);
                this.ns.toast(`Server ${purchasableServerName} bought with RAM ${this.startRam}`, "success");
            }

            await this.ns.asleep(250);
        }
    }

    async upgrade(){
        let purchasedServers = this.ns.getPurchasedServers();
        while(Math.min(...purchasedServers.map(pserv => this.ns.getServerMaxRam(pserv))) < this.ns.getPurchasedServerMaxRam() / 4){
            purchasedServers
                .filter(pserv => this.ns.getServerMaxRam(pserv) < this.ns.getPurchasedServerMaxRam())
                .sort((a, b) => this.ns.getServerMaxRam(a) - this.ns.getServerMaxRam(b))
                .forEach(pserv => {
                    let upgradedServerRam = this.ns.getServerMaxRam(pserv);
                    let willUpgrade = false;
                    while(this.ns.getPurchasedServerUpgradeCost(pserv, upgradedServerRam * 2) < this.ns.getServerMoneyAvailable("home") * 0.50){
                        upgradedServerRam *= 2;
                        willUpgrade = true;
                        if(upgradedServerRam >= this.ns.getPurchasedServerMaxRam()) break;
                    }
                    if(!willUpgrade) return;

                    this.ns.print(`Cost to upgrade server ${pserv} to RAM ${upgradedServerRam} = ${this.ns.getPurchasedServerUpgradeCost(pserv, upgradedServerRam) / 1_000_000}M`);
                    if(this.ns.getPurchasedServerUpgradeCost(pserv, upgradedServerRam) < this.ns.getServerMoneyAvailable("home") * 0.50){
                        this.ns.upgradePurchasedServer(pserv, upgradedServerRam);
                        this.ns.toast(`Server ${pserv} upgraded to RAM ${upgradedServerRam}`, "success");
                    }
                });
            
            await this.ns.asleep(500);
        }
    }
}

/** @param {import("../../.").NS} ns */
export async function main(ns) {
    var privateServerHandler = new PrivateServerHandle(ns);
    await privateServerHandler.run();
}