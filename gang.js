class GangHandler {
    /** @param {import(".").NS} ns */
    constructor(ns, gang=ns.gang){
        this.ns = ns;
        this.gang = gang;

        this.gangMembers = ["Weiss", "Duke", "Luiza", "Jubileu", "Nina", "Minnie", "Marley", "Bolt", "Juninho", "Kelly", "Mariellen", "Laika"];
        this.gangMemberJob = {
            "Weiss": "money",
            "Luiza": "money",
            "Juninho": "money",
            "Nina": "money",
            "Mariellen": "money",
            "Kelly": "fight",
            "Duke": "fight",
            "Jubileu": "fight",
            "Minnie": "fight",
            "Bolt": "fight",
            "Laika": "money",
            "Marley": "money",
        };
    }

    /**
     * 
     * @param {string} gangMember 
     * @returns {[string, number]} returns the main stats of the gang member and the actual value of the main stats in the following format: [mainStatsAsStr: string, mainStatsValue: number]
     */
    getGangMemberMainStats(gangMember){
        var job = this.gangMemberJob[gangMember]
        if(job === "money" && this.isHackingGang){
            return ["hack", this.gang.getMemberInformation(gangMember).hack];
        }
        return ["str", this.gang.getMemberInformation(gangMember).str];
    }

    gangMemberIsActive(gangMember){
        var gangMemberTask = this.gang.getMemberInformation(gangMember)?.task;
        return !gangMemberTask?.toLowerCase().startsWith("train") && !gangMemberTask.toLowerCase().startsWith("unassigned")
    }

    /**
     * Method used to await until player enter a gang
     */
    async setupGang(){
        while(!this.gang.inGang()){
            await this.ns.asleep(5_000);
        }
        this.otherGangs = ["NiteSec", "Slum Snakes", "Tetrads", "The Syndicate", "The Dark Army", "Speakers for the Dead", "The Black Hand"]
        .filter(x => x !== this.gang.getGangInformation().faction);

        this.ns.toast(`You're now the leader of a gang from faction ${this.gang.getGangInformation().faction}.`, "info", 5_000);
        
        this.isHackingGang = this.gang.getGangInformation()?.isHacking;
    }

    /**
     * Check and recruit new members, when possible
     */
    recruitMember(){
        if(this.gang.canRecruitMember()){
            let actualGangMembers = this.gang.getMemberNames();
            for(let gangMember of this.gangMembers){
                if(!actualGangMembers.includes(gangMember)){
                    this.ns.toast(`Recruiting ${gangMember}`, "success");
                    this.gang.recruitMember(gangMember);

                    return;
                }
            }
        }
    }

    /**
     * Try to ascend members based on the member job and their multipliers
     */
    ascendMembers(){
        for(var gangMember of this.gang.getMemberNames()){
            this.ns.print(`Checking member ${gangMember}`);
            var job = this.gangMemberJob[gangMember];
            this.ns.print(`Job of member ${gangMember}: ${job}`);
            if(job === "money"){
                let ascendMember = false;
                if(this.isHackingGang){
                    ascendMember = this.gang.getAscensionResult(gangMember)?.hack >= 1.3;
                } else {
                    ascendMember = this.gang.getAscensionResult(gangMember)?.str >= 1.3;
                }
                if(ascendMember){
                    this.gang.ascendMember(gangMember)
                    this.ns.toast(`Ascending ${gangMember}`, "info");
                }
            } else {
                if(this.gang.getAscensionResult(gangMember)?.str >= 1.5){
                    this.gang.ascendMember(gangMember)
                    this.ns.toast(`Ascending ${gangMember}`, "info");
                }
            }
        }
    }

    /**
     * Try to buy augmentations for the gang members, based on their main stats
     */
    buyAugmentations(){
        this.gang.getMemberNames().forEach(gangMember => {
            this.gang.getEquipmentNames()
                .filter(x => this.gang.getEquipmentType(x) === "Augmentation")
                .filter(x => {
                    var equipStats = this.gang.getEquipmentStats(x);
                    return !this.isHackingGang || (this.getGangMemberMainStats(gangMember)[0] === "hack" ? equipStats.hack !== undefined : equipStats.hack === undefined);
                })
                .filter(x => this.gang.getMemberInformation(gangMember).augmentations.indexOf(x) === -1)
            .forEach(equip => {
                if(this.ns.getServerMoneyAvailable("home") >= this.gang.getEquipmentCost(equip)){
                    this.gang.purchaseEquipment(gangMember, equip);
                    this.ns.toast(`Bought ${equip} (Augmentation) for ${gangMember}`, "info");
                }
            })
        })
    }

    /**
     * Try to buy equipments for the gang members, based on their main stats
     */
    buyEquipments(){
        this.gang.getMemberNames().forEach(gangMember => {
            this.gang.getEquipmentNames()
                .filter(x => {
                    var equipType = this.gang.getEquipmentType(x);
                    return !this.isHackingGang || (equipType === "Vehicle" ||
                        (this.getGangMemberMainStats(gangMember)[0] == "str" ? (equipType === "Weapon" || equipType === "Armor") : (equipType === "Rootkit")));
                })
                .filter(x => this.gang.getMemberInformation(gangMember).upgrades.indexOf(x) === -1)
            .forEach(equip => {
                if(this.ns.getServerMoneyAvailable("home") * 0.10 >= this.gang.getEquipmentCost(equip)){
                    this.gang.purchaseEquipment(gangMember, equip);
                    this.ns.print(`INFO Bought ${equip} for ${gangMember}`);
                }
            });
        })
    }

    /**
     * Assign tasks for the members of the gang based on their jobs and stats values
     */
    assignTasks(){
        this.gang.getMemberNames().forEach(gangMember => {
            var memberMainStats = this.getGangMemberMainStats(gangMember);
            if(this.gangMemberJob[gangMember] === "money"){
                if(memberMainStats[1] <= 2250){
                    this.gang.setMemberTask(gangMember, `Train ${memberMainStats[0] == "str" ? "Combat" : "Hacking"}`);
                } else {
                    this.gang.setMemberTask(gangMember, memberMainStats[0] == "str" ? "Human Trafficking" : "Money Laundering");
                }
            } else {
                if(memberMainStats[1] <= 1250){
                    this.gang.setMemberTask(gangMember, "Train Combat");
                } else {
                    this.gang.setMemberTask(gangMember, "Territory Warfare");
                }
            }
        });
    }

    /**
     * Check if is viable to start the territory warfare based on the minimum chance of winning a duel of territory with other gangs
     */
    territoryWar(){
        if(this.gang.getGangInformation().territory < 1){
            var chanceOfWin = Math.min(...this.otherGangs.map(x => this.gang.getChanceToWinClash(x)));
            this.ns.print(`Chance of win a territory duel: ${chanceOfWin * 100}%`);
            this.gang.setTerritoryWarfare(chanceOfWin >= 0.65);

            if(chanceOfWin > 0.9){
                this.setGangToWork();
            }
        } else {
            this.gang.setTerritoryWarfare(false);
            this.gangMembers.forEach(x => this.gangMemberJob[x] = "money");
        }
    }

    setGangToWork(){
        const fighters = this.gangMembers.filter(x => this.gangMemberJob[x] === "fight");
        if(fighters.length > 2){
            const numberOfGangMembersToConvert = fighters.length - 2;
            for(let i = 0; i < numberOfGangMembersToConvert; i++){
                this.gangMemberJob[fighters[i]] = "money";
            }
        }
    }
}

/** @param {import(".").NS} ns */
export async function main(ns) {
    var gangHandler = new GangHandler(ns);
    await gangHandler.setupGang();

    while(true){
        gangHandler.recruitMember();

        gangHandler.ascendMembers();

        gangHandler.buyAugmentations();

        gangHandler.buyEquipments();

        gangHandler.assignTasks();

        gangHandler.territoryWar();

        await ns.asleep(10_000);
    }
}