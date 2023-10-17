// Código pego no Discord

// Based on Sordani's corp.js, with some improvements
// Important
// - Fix pre-Market-TA.II product pricing
// - Use DarkTechnomancer's employee ratios
// - Don't bother starting useless industries; instead start a second
//   tobacco industry after round 4
// - Fix supply chain issues
// - Automatic boost material scaling
//
// Less important
// - More try/catch around stuff that can throw exceptions, like
//   making new divisions
// - Remove some unnecessary sleeps
// - Detection for "BN13 mode" (the setup is in another script)
// - Rename the real restaurant division to not collide with the fraud
//   division (not that it gets created anyway)
 
export class Business {
    /**@type {NS} */
    ns
    c
    corpName
    divNames
    divTypes
    jobs
    boostStock
    lvlUps
    cities
    boostPhases
    stage
    mats
    divProd
    startTime
    checkStageBool
    constructor(ns) {
      /**@type {NS} */
      this.ns = ns;
      this.c = ns.corporation;
      this.corpName = "TerraCorp";
      this.divNames = {
        agriName: "AgriCorp",
        tobaccoName: "CamelCorp",
        waterName: "AquaCorp",
        chemName: "ChemCorp",
        restName: "DelTacoCorp",
        restFraudNames: ["BurgerKingCorp", "SubWayCorp", "OliveGardenCorp", "JackInTheBoxCorp", "PopeyesCorp"]
      };
      this.divTypes = {
        agriType: "Agriculture",
        tobaccoType: "Tobacco",
        waterType: "Spring Water",
        chemType: "Chemical",
        restType: "Restaurant"
      };
      this.divProd = {
        tob: "Tobacco v",
        comp: "Asus v",
        soft: "Jarvis v",
        rob: "Chappy v",
        phar: "CureAll v",
        heal: "Kaiser #",
        real: "Apartments #",
        rest: {
          del: "DelTaco #",
          bk: "BurgerKing #",
          sw: "SubWay #",
          og: "OliveGarden #",
          jb: "JackInTheBox #",
          pe: "PopEyes #",
        }
      };
   
      this.jobs = ["Operations", "Engineer", "Business", "Management", "Research & Development", "Intern"];
      this.boostStock = ["Hardware", "Robots", "AI Cores", "Real Estate"];
      this.lvlUps = ["Smart Factories", "Smart Storage", "FocusWires", "Neural Accelerators", "Speech Processor Implants", "Nuoptimal Nootropic Injector Implants", "Wilson Analytics", "Project Insight", "ABC SalesBots", "DreamSense"];
      this.unlocks = ["Smart Supply", "Exports"];
      this.cities = ["Aevum", "Chongqing", "New Tokyo", "Ishima", "Volhaven", "Sector-12"];
      this.mats = ["Water", "Food", "Plants", "Chemicals", "Drugs", "Ore", "Metal"];
      this.startTime = Date.now();
      this.stage = [0, 0]; //stage, step
      this.checkStageBool = false;
   
    }
   
    //Tea and Party function
    teaParty() {
      for (const division of this.ns.corporation.getCorporation().divisions) {
        if (this.ns.corporation.hasResearched(division, "AutoBrew") && this.ns.corporation.hasResearched(division, "AutoPartyManager")) { continue; }
        for (const city of this.ns.corporation.getDivision(division).cities) {
          const office = this.ns.corporation.getOffice(division, city);
          if (office.avgEnergy < 98) { this.ns.corporation.buyTea(division, city); }
          if (office.avgMorale < 98) { this.ns.corporation.throwParty(division, city, 500_000); }
        }
      }
    }
   
    //function to replicate smart supply and save money earlygame should we need it (agriculture)
    dumbSupply() { //this is largely unneeded, but would only be used in this script, so it will
      //remain here in expectation for changes to happen again and this needing to be solved again.
      if (this.ns.corporation.hasUnlock("Smart Supply")) { return; }
      const divs = this.ns.corporation.getCorporation().divisions;
      for (const divName of divs) {
        const div = this.ns.corporation.getDivision(divName);
        const industry = this.ns.corporation.getIndustryData(div.type);
        for (const city of div.cities) {
          const office = this.ns.corporation.getOffice(divName, city);
          const opProd = office.employeeProductionByJob.Operations || 0;
          const engrProd = office.employeeProductionByJob.Engineer || 0;
          const mgmtProd = office.employeeProductionByJob.Management || 0;
          const totalProd = opProd + engrProd + mgmtProd;
          if (totalProd === 0) continue;
          const mgmtFactor = 1 + mgmtProd / (1.2 * totalProd);
          const prod = (Math.pow(opProd, 0.4) + Math.pow(engrProd, 0.3)) * mgmtFactor * 0.05;
          const tProd =
            prod *
            div.productionMult *
            (1 + this.ns.corporation.getUpgradeLevel("Smart Factories") * 3 / 100)
            // * research multipliers, once I figure out how to access them.
            ;
          const required = industry.requiredMaterials;
          for (const [mat, amount] of Object.entries(required)) {
            const stored = this.ns.corporation.getMaterial(divName, city, mat).stored / 10;
            const needed = Math.max(amount * tProd - stored, 0);
            this.ns.corporation.buyMaterial(divName, city, mat, needed);
          }
        }
      }
    }
   
    initialUpgrades(upFunds = this.ns.corporation.getCorporation().funds) {
      // TODO: adjust amounts for BN13 mode
      for (let i = 0; i < 20; i++) {
        if (this.ns.corporation.getUpgradeLevelCost(this.lvlUps[1]) * 6 > upFunds) { break; }
        upFunds -= this.ns.corporation.getUpgradeLevelCost(this.lvlUps[1]);
        this.ns.corporation.levelUpgrade(this.lvlUps[1]); //most upgrades to level 20
        upFunds -= this.ns.corporation.getUpgradeLevelCost(this.lvlUps[2]);
        this.ns.corporation.levelUpgrade(this.lvlUps[2]);
        upFunds -= this.ns.corporation.getUpgradeLevelCost(this.lvlUps[3]);
        this.ns.corporation.levelUpgrade(this.lvlUps[3]);
        upFunds -= this.ns.corporation.getUpgradeLevelCost(this.lvlUps[4]);
        this.ns.corporation.levelUpgrade(this.lvlUps[4]);
        upFunds -= this.ns.corporation.getUpgradeLevelCost(this.lvlUps[5]);
        this.ns.corporation.levelUpgrade(this.lvlUps[5]);
        upFunds -= this.ns.corporation.getUpgradeLevelCost(this.lvlUps[9]);
        this.ns.corporation.levelUpgrade(this.lvlUps[9]);
      }
      for (let i = 0; i < 10; i++) {
        if (this.ns.corporation.getUpgradeLevelCost(this.lvlUps[6]) > upFunds) { break; }
        upFunds -= this.ns.corporation.getUpgradeLevelCost(this.lvlUps[6]);
        this.ns.corporation.levelUpgrade(this.lvlUps[6]); // wilson's level 10
      }
      for (let i = 0; i < 50; i++) {
        if (this.ns.corporation.getUpgradeLevelCost[this.lvlUps[8]] > upFunds) { break; }
        upFunds -= this.ns.corporation.getUpgradeLevelCost[this.lvlUps[8]];
        this.ns.corporation.levelUpgrade(this.lvlUps[8]); // ABC salesbots level 50
      }
    }
   
    //sets stage to appropriate step
    setStage() {
      //this.stage should be incremented based on existing data checks.
      if (this.checkStageBool) { return; }
      if (this.ns.corporation.hasCorporation()) {
        if (this.ns.corporation.getCorporation().divisions.includes(this.divNames.tobaccoName)) {
          if (this.ns.corporation.getInvestmentOffer().round >= 3 && this.ns.corporation.getDivision(this.divNames.tobaccoName).products.length >= 1 && this.ns.corporation.getCorporation().divisions.includes(this.divNames.chemName)) {
            this.stage[0] = 10; //just checks to see if we've made it to the last step of the checkStage() so we can go straight to-the-moon again.
          }
        }
        else if (this.ns.corporation.getUpgradeLevel(this.lvlUps[8]) >= 5) {
          this.stage[0] = 6;
        } else if (this.ns.corporation.getCorporation().public && this.ns.corporation.getCorporation().funds > 1e15) {
          // BN13 fraud mode; jump into building a company
          this.initialUpgrades();
          this.stage[0] = 8;
        }
      }
      this.checkStageBool = true;
    }
   
    //Check which action should be done at this point and do it
    //Importantly none of these functions wait for a number of cycles on their own, rather they count cycles while letting the loop to work every cycle.
    /** @param {import(".").NS} ns */
    async checkStage() {
      this.setStage();
      switch (this.stage[0]) {
        case 0:
          this.ns.print("initial purchases");
          this.startstuff(); // stage 0
          break;
        case 1:
          if (this.stage[1] == 0) this.ns.print("waiting for the employers stats to rise");
          this.employeeSatisfactionCheck(); //stage 1
          break;
        case 2:
          if (this.stage[1] == 0) this.ns.print("Imbezzlement initiating");
          this.restaurantFraud(1); //stage 2
          break;
        case 3:
          if (this.stage[1] == 0) this.ns.print("Accepting the first investor offer.");
          this.invest(); //stage 3 //1st investor offer is around 15 trillion
          break;
        case 4:
          if (this.stage[1] == 0) this.ns.print("Now to do it again but times 6");
          await this.enronFraudPrep(); //stage 4 // this is where we're still building
          break;
        case 5:
          if (this.stage[1] == 0) this.ns.print("Waiting for the employers stats to rise for the second time");
          this.employeeSatisfactionCheck(); //stage 5
          break;
        case 6:
          if (this.stage[1] == 0) this.ns.print("Buying false securities material batch");
          this.restaurantFraud(2); //stage 6
          break;
        case 7:
          if (this.stage[1] == 0) this.ns.print("Accepting the second investor offer");
          this.invest(this.ns.corporation.getInvestmentOffer().round); //stage 7 //2nd investor offer is around 4 quadrillion
          break;
        case 8:
          if (this.stage[1] == 0) this.ns.print("Time to actually make a real company");
          this.expand(); //stage 8 //if selling off divisions becomes scriptable, sell this.divNames.restFraudNames around here.
          break;
        case 9:
          if (this.stage[1] == 0) this.ns.print("Assigning Employees and Starting a product");
          this.reAssignEmployees(); //stage 9
          break;
        case 10:
          if (this.stage[1] == 0) this.ns.print("Purchasing Boost Materials");
          this.stage[0]++;
          this.boostPurchase(); //stage 10
          break;
        case 11:
          if (this.stage[1] == 0) this.ns.print("The initial setup is complete. executing 'To the moon...' logic");
          this.stage[1]++;
          //stage 10
          break;
      }
    }
   
    //Corp initialization. Creating the corp, expanding to restaurant and its' cities,
    //hiring and assigning in those cities and buying some upgrades
    startstuff() {
      if (this.stage[1] == 0) {
        if (!this.ns.corporation.hasCorporation()) { try { this.ns.corporation.createCorporation(this.corpName, false); } catch { this.ns.print("not in bitnode 3, attempting to self-fund"); } }
        if (!this.ns.corporation.hasCorporation()) { try { this.ns.corporation.createCorporation(this.corpName); } catch { this.ns.print("self funding failed, requires 150 billion in cash available."); this.ns.exit(); } }
        this.stage[1] = 1;
      }
      if (this.stage[1] == 1) {
        if (!this.ns.corporation.getCorporation().divisions.includes(this.divNames.restName)) { this.ns.corporation.expandIndustry(this.divTypes.restType, this.divNames.restName); }
        this.stage[1] = 2;
      }
      if (this.stage[1] == 2) {
        for (let city of this.cities) {
          if (!this.ns.corporation.getDivision(this.divNames.restName).cities.includes(city)) { this.ns.corporation.expandCity(this.divNames.restName, city); }
          if (!this.ns.corporation.hasWarehouse(this.divNames.restName, city)) { this.ns.corporation.purchaseWarehouse(this.divNames.restName, city); }
          this.ns.corporation.upgradeOfficeSize(this.divNames.restName, city, 3);
          while (this.ns.corporation.hireEmployee(this.divNames.restName, city)) { } //hires employee and returns true. empty brackets simply makes it test the statement immediately again.
          this.ns.corporation.setAutoJobAssignment(this.divNames.restName, city, this.jobs[2], 6);
        }
        for (let i = 0; i < 26; i++) { this.ns.corporation.hireAdVert(this.divNames.restName); }
   
        for (let i = 0; i < 2; i++) { this.ns.corporation.levelUpgrade(this.lvlUps[8]); }
        for (let city of this.cities) { this.ns.corporation.upgradeWarehouse(this.divNames.restName, city, 1); }
   
        this.stage[0] += 1;
        this.stage[1] = 0;
      }
    }
   
    //expand to Agriculture, Tobacco, and Chemicals
    expand() {
      if (this.stage[1] == 0) {
        this.ns.corporation.purchaseUnlock("Smart Supply");
        this.ns.corporation.expandIndustry(this.divTypes.agriType, this.divNames.agriName);
        this.ns.corporation.expandIndustry(this.divTypes.chemType, this.divNames.chemName);
        this.ns.corporation.expandIndustry(this.divTypes.tobaccoType, this.divNames.tobaccoName);
        const newDivs = [this.divNames.agriName, this.divNames.chemName, this.divNames.tobaccoName];
        for (const division of newDivs) {
          for (let city of this.cities) {
            if (!this.ns.corporation.getDivision(division).cities.includes(city)) { this.ns.corporation.expandCity(division, city); }
            if (!this.ns.corporation.hasWarehouse(division, city)) { this.ns.corporation.purchaseWarehouse(division, city); }
            this.ns.corporation.setSmartSupply(division, city, true);
            this.ns.corporation.upgradeOfficeSize(division, city, 30 - this.ns.corporation.getOffice(division, city).size);
            while (this.ns.corporation.hireEmployee(division, city)) { }
            this.ns.corporation.upgradeWarehouse(division, city, (20 - this.ns.corporation.getWarehouse(division, city).level))
          }
        }
        for (let i = 0; i < 100; i++) {
          this.ns.corporation.hireAdVert(this.divNames.tobaccoName)
        }
        this.ns.corporation.upgradeOfficeSize(this.divNames.tobaccoName, this.cities[0], 30);
        while (this.ns.corporation.hireEmployee(this.divNames.tobaccoName, this.cities[0])) { }
      }
      this.stage[0] += 1;
    }
   
    //Wait till the employee stats are high enough and then go to the next stage
    employeeSatisfactionCheck() {
      this.ns.clearLog();
      const overallAvgs = [];
      let finalMorAvg = 0;
      let finalEneAvg = 0;
      for (const division of this.ns.corporation.getCorporation().divisions) {
        const avgs = [0, 0];
        this.ns.print("   " + division);
        this.ns.print("");
        for (const city of this.ns.corporation.getDivision(division).cities) {
          avgs[0] += this.ns.corporation.getOffice(division, city).avgMorale;
          avgs[1] += this.ns.corporation.getOffice(division, city).avgEnergy;
        }
        this.ns.print("   avg morale: " + (avgs[0] / 6).toFixed(3) + "/95");
        this.ns.print("   avg energy: " + (avgs[1] / 6).toFixed(3) + "/95");
        overallAvgs.push(avgs);
        this.stage[1]++;
      }
      for (let i = 0; i < overallAvgs.length; i++) {
        finalMorAvg += overallAvgs[i][0];
        finalEneAvg += overallAvgs[i][1];
      }
      finalMorAvg = finalMorAvg / (this.ns.corporation.getCorporation().divisions.length * this.cities.length);
      finalEneAvg = finalEneAvg / (this.ns.corporation.getCorporation().divisions.length * this.cities.length);
      if (finalMorAvg >= 95 && finalEneAvg >= 95 && this.stage[1] > 0) {
        this.stage[0] += 1; this.stage[1] = 0;
      }
    }
   
    //Fill Warehouses with Real Estate to sell
    restaurantFraud(phase) {
      if (phase == 1) {
        if (this.stage[1] == 0) {
          for (const city of this.ns.corporation.getDivision(this.divNames.restName).cities) {
            const rlEstConst = this.ns.corporation.getMaterialData(this.boostStock[3]);
            const warehouse = this.ns.corporation.getWarehouse(this.divNames.restName, city);
            this.ns.corporation.buyMaterial(this.divNames.restName, city, this.boostStock[3], (((warehouse.size - warehouse.sizeUsed) / rlEstConst.size) / 10));
          }
          this.stage[1] = 1;
        } else if (this.stage[1] == 1) {
          if (this.ns.corporation.getWarehouse(this.divNames.restName, this.cities[0]).sizeUsed >= this.ns.corporation.getWarehouse(this.divNames.restName, this.cities[0]).size * 0.95) {
            for (const city of this.ns.corporation.getDivision(this.divNames.restName).cities) {
              this.ns.corporation.buyMaterial(this.divNames.restName, city, this.boostStock[3], 0);
            }
            this.stage[1] = 2;
          }
        } else if (this.stage[1] == 2) {
          for (const city of this.ns.corporation.getDivision(this.divNames.restName).cities) {
            this.ns.corporation.sellMaterial(this.divNames.restName, city, this.boostStock[3], "MAX", "MP");
          }
          this.stage[0] += 1;
          this.stage[1] = 0;
        }
   
      }
      if (phase == 2) {
        if (this.stage[1] == 0) {
          for (const division of this.ns.corporation.getCorporation().divisions) {
            for (const city of this.ns.corporation.getDivision(division).cities) {
              const rlEstConst = this.ns.corporation.getMaterialData(this.boostStock[3]);
              const warehouse = this.ns.corporation.getWarehouse(division, city);
              this.ns.corporation.buyMaterial(division, city, this.boostStock[3], (((warehouse.size - warehouse.sizeUsed) / rlEstConst.size) / 10));
            }
          }
          this.stage[1] = 1;
        } else if (this.stage[1] == 1) {
          if (this.ns.corporation.getWarehouse(this.divNames.restName, this.cities[0]).sizeUsed >= this.ns.corporation.getWarehouse(this.divNames.restName, this.cities[0]).size * 0.95) {
            for (const division of this.ns.corporation.getCorporation().divisions) {
              for (const city of this.ns.corporation.getDivision(division).cities) {
                this.ns.corporation.buyMaterial(division, city, this.boostStock[3], 0);
              }
            }
            this.stage[1] = 2;
          }
        } else if (this.stage[1] == 2) {
          for (const division of this.ns.corporation.getCorporation().divisions) {
            for (const city of this.ns.corporation.getDivision(division).cities) {
              this.ns.corporation.sellMaterial(division, city, this.boostStock[3], "MAX", "MP");
            }
          } //we will be left with negative 1.7 trillion.
          this.stage[0] += 1;
          this.stage[1] = 0;
        }
      }
    }
   
    //Assigning employees everywhere (and making a product at tobacco)
    reAssignEmployees() {
      for (let i = 0; i < 50; i++) {
        this.ns.corporation.levelUpgrade(this.lvlUps[7])
      }
      const divs = [this.divNames.agriName, this.divNames.chemName, this.divNames.tobaccoName];
      const rests = [this.divNames.restName, this.divNames.restFraudNames[0], this.divNames.restFraudNames[1], this.divNames.restFraudNames[2], this.divNames.restFraudNames[3], this.divNames.restFraudNames[4]];
      for (const division of this.ns.corporation.getCorporation().divisions) {
        for (const city of this.cities) {
          for (const job of this.jobs) { //set all jobs to none everywhere
            this.ns.corporation.setAutoJobAssignment(division, city, job, 0);
          }
        }
      }
      for (const rest of rests) {
        for (const city of this.cities) { //set all these fools to research and development.
          this.ns.corporation.setAutoJobAssignment(rest, city, this.jobs[4], this.ns.corporation.getOffice(rest, city).numEmployees);
        } //we won't be restauranting for a bit.
      }
   
      //this.jobs = ["Operations", "Engineer", "Business", "Management", "Research & Development"];
      for (let i = 0; i < 2; i++) { //this will work for agriculture and chemicals.
        for (const city of this.cities) {
          this.ns.corporation.setAutoJobAssignment(divs[i], city, this.jobs[4], 6);
          this.ns.corporation.setAutoJobAssignment(divs[i], city, this.jobs[0], 6);
          this.ns.corporation.setAutoJobAssignment(divs[i], city, this.jobs[1], 9);
          this.ns.corporation.setAutoJobAssignment(divs[i], city, this.jobs[2], 3);
          this.ns.corporation.setAutoJobAssignment(divs[i], city, this.jobs[3], 6);
        }
      }
      //now tobacco
      this.ns.corporation.setAutoJobAssignment(divs[2], this.cities[0], this.jobs[4], 0); //this formula scales, and is for product city
      this.ns.corporation.setAutoJobAssignment(divs[2], this.cities[0], this.jobs[0], Math.floor(this.ns.corporation.getOffice(divs[2], this.cities[0]).numEmployees * 0.06));
      this.ns.corporation.setAutoJobAssignment(divs[2], this.cities[0], this.jobs[1], Math.floor(this.ns.corporation.getOffice(divs[2], this.cities[0]).numEmployees * 0.3));
      this.ns.corporation.setAutoJobAssignment(divs[2], this.cities[0], this.jobs[2], Math.floor(this.ns.corporation.getOffice(divs[2], this.cities[0]).numEmployees * 0.08));
      this.ns.corporation.setAutoJobAssignment(divs[2], this.cities[0], this.jobs[3], Math.floor(this.ns.corporation.getOffice(divs[2], this.cities[0]).numEmployees * 0.56));
      let rdNum = 0; //in a try/catch bracket because it tries to break the script otherwise.
      try { while (this.ns.corporation.setAutoJobAssignment(divs[2], this.cities[0], this.jobs[4], rdNum++)) { } } catch { };
   
      for (let i = 1; i < 6; i++) { //support cities
        this.ns.corporation.setAutoJobAssignment(divs[2], this.cities[i], this.jobs[4], 0);
        this.ns.corporation.setAutoJobAssignment(divs[2], this.cities[i], this.jobs[0], Math.max(Math.floor(this.ns.corporation.getOffice(divs[2], this.cities[i]).numEmployees / 20), 1));
        this.ns.corporation.setAutoJobAssignment(divs[2], this.cities[i], this.jobs[1], Math.max(Math.floor(this.ns.corporation.getOffice(divs[2], this.cities[i]).numEmployees / 20), 1));
        this.ns.corporation.setAutoJobAssignment(divs[2], this.cities[i], this.jobs[2], Math.max(Math.floor(this.ns.corporation.getOffice(divs[2], this.cities[i]).numEmployees / 20), 1));
        this.ns.corporation.setAutoJobAssignment(divs[2], this.cities[i], this.jobs[3], Math.max(Math.floor(this.ns.corporation.getOffice(divs[2], this.cities[i]).numEmployees / 20), 1));
        //this little gem of a logic will assign all remaining employees to the remaining job incrementally
        let rdNum = 0; //in a try/catch bracket because it tries to break the script otherwise.
        try { while (this.ns.corporation.setAutoJobAssignment(divs[2], this.cities[i], this.jobs[4], rdNum++)) { } } catch { };
      }
      //finally, lets start a product.
      const funds = this.ns.corporation.getCorporation().funds * 0.01
      this.ns.corporation.makeProduct(this.divNames.tobaccoName, this.cities[0], this.divProd.tob + 1, funds, funds);
   
      this.stage[0]++;
      this.stage[1] = 0;
    }
   
    //Accept investor offers after 10 cycles
    invest() {
      if (this.stage[1] == 0) {
        this.ns.print("waiting for a bit, just in case the investors might give a bit more money");
      }
      //investor evaluation takes into account 10 cycles
      //and we want them to take into account the current high earning cycles,
      //not the old low earning cycles, so we'll wait for a bit
      if (this.stage[1] <= 10) {
        this.ns.print("waiting cycles: " + this.stage[1] + "/10. investors are currently offering: " + this.ns.formatNumber(this.ns.corporation.getInvestmentOffer().funds, 3));
        this.stage[1] += 1;
      }
      else if (this.ns.corporation.getCorporation().state != "PURCHASE") { this.ns.sleep(0); }
      else {
        this.ns.tprint("funds remaining before accepting investment round: " + this.ns.formatNumber(this.ns.corporation.getCorporation().funds, 3));
        this.ns.tprint("investment offer round " + this.ns.corporation.getInvestmentOffer().round + ": " + this.ns.formatNumber(this.ns.corporation.getInvestmentOffer().funds, 3));
        this.ns.corporation.acceptInvestmentOffer();
        this.stage[0] += 1;
        this.stage[1] = 0;
      }
    }
   
    //this is where we go ham and expand to 6 restaurants and do securities fraud on all 6 of them.
    async enronFraudPrep() {
      const funds = this.ns.corporation.getCorporation().funds;
      let upFunds = funds * 0.1;
      let adVFunds = funds * 0.2;
      let offFunds = funds * 0.2;
      let wareFunds = funds * 0.05;
      if (this.stage[1] == 0) {
        const fraudNames = [];
        fraudNames.push(this.divNames.restName);
        for (const name of this.divNames.restFraudNames) {
          fraudNames.push(name);
        }
        for (const div of fraudNames) {
          if (div == this.divNames.restName) { continue; }
          this.ns.corporation.expandIndustry(this.divTypes.restType, div);
          for (let city of this.cities) {
            if (!this.ns.corporation.getDivision(div).cities.includes(city)) { this.ns.corporation.expandCity(div, city); }
            if (!this.ns.corporation.hasWarehouse(div, city)) { this.ns.corporation.purchaseWarehouse(div, city) }
            this.ns.corporation.upgradeOfficeSize(div, city, 3);
            while (this.ns.corporation.hireEmployee(div, city, this.jobs[2])) { }
            this.ns.corporation.upgradeWarehouse(div, city, 2);
          }
          for (let i = 0; i < 24; i++) { this.ns.corporation.hireAdVert(div) }
          //the goal here is to set the new rest divs exactly to the old one, and then upgrade them all equally together.
        }
        //all new upgrades done to all 6 divs start here.
        //this.lvlUps = ["Smart Factories", "Smart Storage", "FocusWires", "Neural Accelerators", "Speech Processor Implants", "Nuoptimal Nootropic Injector Implants", "Wilson Analytics", "Project Insight", "ABC SalesBots"];
        this.initialUpgrades(upFunds);
        this.stage[1] += 1;
      }
      if (this.stage[1] == 1) {
        while (adVFunds >= this.ns.corporation.getHireAdVertCost(this.divNames.restName) * this.ns.corporation.getCorporation().divisions.length || (offFunds >= this.ns.corporation.getOfficeSizeUpgradeCost(this.divNames.restName, this.cities[0], 3) * 6 * this.ns.corporation.getCorporation().divisions.length)) {
          for (const division of this.ns.corporation.getCorporation().divisions) {
            if (adVFunds > this.ns.corporation.getHireAdVertCost(division)) {
              adVFunds -= this.ns.corporation.getHireAdVertCost(division);
              this.ns.corporation.hireAdVert(division);
            }
            for (const city of this.cities) {
              if (offFunds > this.ns.corporation.getOfficeSizeUpgradeCost(division, city, 3)) {
                offFunds -= this.ns.corporation.getOfficeSizeUpgradeCost(division, city, 3);
                this.ns.corporation.upgradeOfficeSize(division, city, 3);
                while (this.ns.corporation.hireEmployee(division, city, "Business")) { }
              }
              if (wareFunds > this.ns.corporation.getUpgradeWarehouseCost(division, city)) {
                wareFunds -= this.ns.corporation.getUpgradeWarehouseCost(division, city);
                this.ns.corporation.upgradeWarehouse(division, city);
              }
            }
          }
          await this.ns.sleep(0);
        } //these numbers leave us with 1.1 trillion left to purchase materials with in bitnode 3.
      }
   
      this.stage[0] += 1;
    }
   
    //all functions to be done to the moon go here onward.
   
    //purchases all division upgrades.
    async divisPurchases() {
      const prodCity = this.cities[0]; //if you write functions outside of classes then bring them in, bandaid solutions are easiest.
      const supportCities = [this.cities[1], this.cities[2], this.cities[3], this.cities[4], this.cities[5]];
      const divisions = this.ns.corporation.getCorporation().divisions
      let funds = this.ns.corporation.getCorporation().funds * 0.2;
      //we want to concentrate on a single product producing division. Tobacco is the current winner.
      let tobaccoFunds = this.ns.corporation.getCorporation().funds * 0.8;
      for (const division of divisions) {
        if (this.divNames.restFraudNames.includes(division)) { continue; }
        if (this.divNames.restName.includes(division) && this.ns.corporation.getCorporation().funds < 1e21) { continue; }
        if (this.ns.corporation.getDivision(division).makesProducts) {
          this.ns.corporation.setSmartSupply(division, this.cities[0], true); //for this.divNames.restName specifically.
          let advertCost = this.ns.corporation.getHireAdVertCost(division);
          let officeExpCost = this.ns.corporation.getOfficeSizeUpgradeCost(division, prodCity, 3);
          let supportExps = [];
          let supportWHs = [];
          for (const city of supportCities) {
            this.ns.corporation.setSmartSupply(division, city, true); //for this.divNames.restName specifically.
            supportExps.push(this.ns.corporation.getOfficeSizeUpgradeCost(division, city, 3));
            supportWHs.push(this.ns.corporation.getUpgradeWarehouseCost(division, city));
          }
          let supportExpCost = 0;
          let supportWHCost = 0;
          for (let i = 0; i < supportExps.length; i++) {
            supportExpCost += supportExps[i];
            supportWHCost += supportWHs[i];
          }
          let y = Math.max(this.ns.corporation.getOffice(division, prodCity).size, this.ns.corporation.getOffice(division, supportCities[0]).size, this.ns.corporation.getOffice(division, supportCities[1]).size, this.ns.corporation.getOffice(division, supportCities[2]).size, this.ns.corporation.getOffice(division, supportCities[3]).size, this.ns.corporation.getOffice(division, supportCities[4]).size);
          if (!supportExps.every((number) => number === supportExps[0])) {
            while (!supportExps.every((number) => number === supportExps[0])) {
              if (funds < supportExpCost) { return; }
              for (const city of supportCities) {
                while (this.ns.corporation.getOffice(division, city).numEmployees < y) {
                  this.ns.corporation.upgradeOfficeSize(division, city, 3);
                  while (this.ns.corporation.hireEmployee(division, city));
                  funds = this.ns.corporation.getCorporation().funds * 0.5;
                  await this.ns.sleep(0);
                }
              }
              y = Math.max(this.ns.corporation.getOffice(division, prodCity).size, this.ns.corporation.getOffice(division, supportCities[0]).size, this.ns.corporation.getOffice(division, supportCities[1]).size, this.ns.corporation.getOffice(division, supportCities[2]).size, this.ns.corporation.getOffice(division, supportCities[3]).size, this.ns.corporation.getOffice(division, supportCities[4]).size);
              supportExps = [];
              for (const city of supportCities) {
                supportExps.push(this.ns.corporation.getOfficeSizeUpgradeCost(division, city, 3));
              }
              await this.ns.sleep(0);
            }
          }
          while (this.ns.corporation.getOffice(division, prodCity).size < this.ns.corporation.getOffice(division, supportCities[0]).size + 30) {
            this.ns.corporation.upgradeOfficeSize(division, prodCity, 3);
            while (this.ns.corporation.hireEmployee(division, prodCity));
            funds = this.ns.corporation.getCorporation().funds * 0.5;
            await this.ns.sleep(0);
          }
          let z = Math.max(this.ns.corporation.getWarehouse(division, prodCity).level, this.ns.corporation.getWarehouse(division, supportCities[0]).level, this.ns.corporation.getWarehouse(division, supportCities[1]).level, this.ns.corporation.getWarehouse(division, supportCities[2]).level, this.ns.corporation.getWarehouse(division, supportCities[3]).level, this.ns.corporation.getWarehouse(division, supportCities[4]).level);
          while (!supportWHs.every((number) => number === supportWHs[0])) {
            if (funds < supportWHCost) { return; }
            for (const city of supportCities) {
              while (this.ns.corporation.getWarehouse(division, city).level < z) {
                this.ns.corporation.upgradeWarehouse(division, city);
                funds = this.ns.corporation.getCorporation().funds * 0.5;
                await this.ns.sleep(0);
              }
            }
            if (this.ns.corporation.getWarehouse(division, prodCity).level < z) { this.ns.corporation.upgradeWarehouse(division, prodCity); }
            funds = this.ns.corporation.getCorporation().funds * 0.75;
            supportWHs = [];
            for (const city of supportCities) {
              supportWHs.push(this.ns.corporation.getUpgradeWarehouseCost(division, city));
            }
            supportWHCost = 0;
            for (let i = 0; i < supportWHs.length; i++) {
              supportWHCost += supportWHs[i];
            }
            await this.ns.sleep(0);
          }
          if (this.ns.corporation.getOffice(division, supportCities[0]).size < 30) {
            for (const city of supportCities) {
              this.ns.corporation.upgradeOfficeSize(division, city, (30 - this.ns.corporation.getOffice(division, city).size));
              while (this.ns.corporation.hireEmployee(division, city)) { }
            }
          }
          if (division == "CamelCorp") {
            if (divisions.includes('CamelCorp 2')) continue;
            if (tobaccoFunds >= advertCost || tobaccoFunds >= officeExpCost) {
              if (tobaccoFunds >= advertCost) {
                this.ns.corporation.hireAdVert(division);
              }
              if (officeExpCost < advertCost) {
                if (officeExpCost < supportExpCost) {
                  this.ns.corporation.upgradeOfficeSize(division, prodCity, 3);
                  while (this.ns.corporation.hireEmployee(division, prodCity));
                  funds = this.ns.corporation.getCorporation().funds * 0.5;
                }
                else {
                  for (const city of supportCities) {
                    this.ns.corporation.upgradeOfficeSize(division, city, 3);
                    while (this.ns.corporation.hireEmployee(division, city)) { }
                    funds = this.ns.corporation.getCorporation().funds * 0.5;
                  }
                }
              }
            }
            await this.ns.sleep(0);
          }
          if (division == "CamelCorp 2") {
            // BLAST IT
            while (tobaccoFunds > this.ns.corporation.getHireAdVertCost(division)) {
              tobaccoFunds -= this.ns.corporation.getHireAdVertCost(division)
              this.ns.corporation.hireAdVert(division);
            }
            if (officeExpCost < advertCost) {
              if (officeExpCost < supportExpCost) {
                this.ns.corporation.upgradeOfficeSize(division, prodCity, 3);
                while (this.ns.corporation.hireEmployee(division, prodCity));
                funds = this.ns.corporation.getCorporation().funds * 0.5;
              }
              else {
                for (const city of supportCities) {
                  this.ns.corporation.upgradeOfficeSize(division, city, 3);
                  while (this.ns.corporation.hireEmployee(division, city)) { }
                  funds = this.ns.corporation.getCorporation().funds * 0.5;
                }
              }
            }
            await this.ns.sleep(0);
          }
          if ((funds * 0.8) / divisions.length >= advertCost || (funds * 0.8) / divisions.length >= officeExpCost) {
            if (officeExpCost > advertCost) { this.ns.corporation.hireAdVert(division); }
            if (officeExpCost < advertCost) {
              if (officeExpCost < supportExpCost) {
                this.ns.corporation.upgradeOfficeSize(division, prodCity, 3);
                while (this.ns.corporation.hireEmployee(division, prodCity));
                funds = this.ns.corporation.getCorporation().funds * 0.5;
              }
              else {
                for (const city of supportCities) {
                  this.ns.corporation.upgradeOfficeSize(division, city, 3);
                  while (this.ns.corporation.hireEmployee(division, city)) { }
                  funds = this.ns.corporation.getCorporation().funds * 0.5;
                }
              }
            }
            await this.ns.sleep(0);
          }
          while ((funds * 0.01) / divisions.length >= this.ns.corporation.getUpgradeWarehouseCost(division, supportCities[0]) * 6) {
            this.ns.corporation.upgradeWarehouse(division, prodCity);
            for (const city of supportCities) {
              this.ns.corporation.upgradeWarehouse(division, city);
            }
            await this.ns.sleep(0);
          }
        }
        else {
          let officeExps = [];
          let warehouseUps = [];
          for (const city of this.cities) {
            officeExps.push(this.ns.corporation.getOfficeSizeUpgradeCost(division, city, 3));
            warehouseUps.push(this.ns.corporation.getUpgradeWarehouseCost(division, city));
          }
          let officeExpCost = 0;
          let warehouseCost = 0;
          for (let i = 0; i < officeExps.length; i++) {
            officeExpCost += officeExps[i];
            warehouseCost += warehouseUps[i];
          }
          let y = Math.max(this.ns.corporation.getOffice(division, this.cities[0]).size, this.ns.corporation.getOffice(division, this.cities[1]).size, this.ns.corporation.getOffice(division, this.cities[2]).size, this.ns.corporation.getOffice(division, this.cities[3]).size, this.ns.corporation.getOffice(division, this.cities[4]).size, this.ns.corporation.getOffice(division, this.cities[5]).size);
          while (!officeExps.every((number) => number === officeExps[0])) {
            if (funds < officeExpCost) { return; }
            for (const city of this.cities) {
              while (this.ns.corporation.getOffice(division, city).numEmployees < y) {
                this.ns.corporation.upgradeOfficeSize(division, city, 3);
                while (this.ns.corporation.hireEmployee(division, city));
                funds = this.ns.corporation.getCorporation().funds * 0.5;
                await this.ns.sleep(0);
              }
            }
            officeExps = [];
            for (const city of this.cities) {
              officeExps.push(this.ns.corporation.getOfficeSizeUpgradeCost(division, city, 3));
            }
            officeExpCost = 0;
            for (let i = 0; i < officeExps.length; i++) {
              officeExpCost += officeExps[i];
            }
            y = Math.max(this.ns.corporation.getOffice(division, this.cities[0]).size, this.ns.corporation.getOffice(division, this.cities[1]).size, this.ns.corporation.getOffice(division, this.cities[2]).size, this.ns.corporation.getOffice(division, this.cities[3]).size, this.ns.corporation.getOffice(division, this.cities[4]).size, this.ns.corporation.getOffice(division, this.cities[5]).size);
            funds = this.ns.corporation.getCorporation().funds * 0.75;
            await this.ns.sleep(0);
          }
          let z = this.ns.corporation.getWarehouse(division, this.cities[0]).level;
          while (!warehouseUps.every((number) => number === warehouseUps[0])) {
            if (funds < warehouseUps) { return; }
            for (const city of this.cities) {
              while (this.ns.corporation.getWarehouse(division, city).level < z) {
                this.ns.corporation.upgradeWarehouse(division, city);
                await this.ns.sleep(0);
              }
            }
            warehouseUps = [];
            for (const city of this.cities) {
              warehouseUps.push(this.ns.corporation.getUpgradeWarehouseCost(division, city));
            }
            warehouseCost = 0;
            for (let i = 0; i < warehouseUps.length; i++) {
              warehouseCost += warehouseUps[i];
            }
            funds = this.ns.corporation.getCorporation().funds * 0.75;
            await this.ns.sleep(0);
          }
          if ((funds * 0.8) / (divisions.length) >= officeExpCost) {
            for (const city of this.cities) {
              this.ns.corporation.upgradeOfficeSize(division, city, 3);
              while (this.ns.corporation.hireEmployee(division, city));
            }
            funds = this.ns.corporation.getCorporation().funds * 0.75;
            await this.ns.sleep(0);
          }
          if ((funds * 0.2) / (divisions.length) >= warehouseCost) {
            for (const city of this.cities) {
              this.ns.corporation.upgradeWarehouse(division, city);
            }
            funds = this.ns.corporation.getCorporation().funds * 0.75;
            await this.ns.sleep(0);
          }
        }
      }
    }
   
    //function to assign employees to appropriate positions
    humanResources() {
      const prodCity = this.cities[0];
      const supportCities = [this.cities[1], this.cities[2], this.cities[3], this.cities[4], this.cities[5]];
      for (const division of this.ns.corporation.getCorporation().divisions) {
        if (this.divNames.restFraudNames.includes(division)) { continue; }
        if (this.divNames.restName == division && this.ns.corporation.getCorporation().funds < 1e21) { continue; }
        if (this.ns.corporation.getDivision(division).makesProducts) {
          if (this.ns.corporation.getOffice(division, prodCity).size > this.ns.corporation.getOffice(division, prodCity).numEmployees) { while (this.ns.corporation.hireEmployee(division, prodCity)) { } }
          for (const job of this.jobs) {
            this.ns.corporation.setAutoJobAssignment(division, prodCity, job, 0);
          }
          this.ns.corporation.setAutoJobAssignment(division, prodCity, this.jobs[5], 0);
          let ops = Math.floor(this.ns.corporation.getOffice(division, prodCity).numEmployees * 0.06),
            eng = Math.floor(this.ns.corporation.getOffice(division, prodCity).numEmployees * 0.3),
            bus = Math.floor(this.ns.corporation.getOffice(division, prodCity).numEmployees * 0.08),
            man = Math.floor(this.ns.corporation.getOffice(division, prodCity).numEmployees * 0.56),
            res = this.ns.corporation.getOffice(division, prodCity).numEmployees - ops - eng - bus - man;
          this.ns.corporation.setAutoJobAssignment(division, prodCity, this.jobs[0], ops);
          this.ns.corporation.setAutoJobAssignment(division, prodCity, this.jobs[1], eng);
          this.ns.corporation.setAutoJobAssignment(division, prodCity, this.jobs[2], bus);
          this.ns.corporation.setAutoJobAssignment(division, prodCity, this.jobs[3], man);
          this.ns.corporation.setAutoJobAssignment(division, prodCity, this.jobs[4], res);
          for (const city of supportCities) {
            if (this.ns.corporation.getOffice(division, city).size > this.ns.corporation.getOffice(division, city).numEmployees) { while (this.ns.corporation.hireEmployee(division, city)) { } }
            for (const job of this.jobs) {
              this.ns.corporation.setAutoJobAssignment(division, city, job, 0);
            }
            this.ns.corporation.setAutoJobAssignment(division, city, this.jobs[5], 0);
            this.ns.corporation.setAutoJobAssignment(division, city, this.jobs[0], Math.max(Math.floor(this.ns.corporation.getOffice(division, city).numEmployees / 20), 1));
            this.ns.corporation.setAutoJobAssignment(division, city, this.jobs[1], Math.max(Math.floor(this.ns.corporation.getOffice(division, city).numEmployees / 20), 1));
            this.ns.corporation.setAutoJobAssignment(division, city, this.jobs[2], Math.max(Math.floor(this.ns.corporation.getOffice(division, city).numEmployees / 20), 1));
            if (this.ns.corporation.getOffice(division, city).numEmployees <= 3) { continue; }
            this.ns.corporation.setAutoJobAssignment(division, city, this.jobs[3], Math.max(Math.floor(this.ns.corporation.getOffice(division, city).numEmployees / 20), 1));
            let rdNum = 0;
            try { while (this.ns.corporation.setAutoJobAssignment(division, city, this.jobs[4], rdNum++)) { } } catch { };
          }
        }
        else {
          for (const city of this.cities) {
            if (this.ns.corporation.getOffice(division, city).size > this.ns.corporation.getOffice(division, city).numEmployees) { while (this.ns.corporation.hireEmployee(division, city)) { } }
            for (const job of this.jobs) {
              this.ns.corporation.setAutoJobAssignment(division, city, job, 0);
            }
            this.ns.corporation.setAutoJobAssignment(division, city, this.jobs[5], 0);
            this.ns.corporation.setAutoJobAssignment(division, city, this.jobs[0], Math.max(Math.floor(this.ns.corporation.getOffice(division, city).numEmployees / 5), 1));
            this.ns.corporation.setAutoJobAssignment(division, city, this.jobs[2], Math.max(Math.floor(0.5 * this.ns.corporation.getOffice(division, city).numEmployees / 5), 1));
            this.ns.corporation.setAutoJobAssignment(division, city, this.jobs[3], Math.max(Math.floor(this.ns.corporation.getOffice(division, city).numEmployees / 5), 1));
            if (this.ns.corporation.getOffice(division, city).numEmployees <= 3) { continue; }
            this.ns.corporation.setAutoJobAssignment(division, city, this.jobs[4], Math.max(Math.floor(this.ns.corporation.getOffice(division, city).numEmployees / 5), 1));
            let engNum = 0;
            try { while (this.ns.corporation.setAutoJobAssignment(division, city, this.jobs[1], engNum++)) { } } catch { };
          }
        }
      }
    }
   
    //function to spend research points
    rAndD() {
      const rdNames = ["Hi-Tech R&D Laboratory", "Market-TA.I", "Market-TA.II", "Automatic Drug Administration", "Go-Juice", "Overclock", "Sti.mu", "CPH4 Injections", "Drones", "Drones - Assembly", "Drones - Transport", "Self-Correcting Assemblers", "AutoBrew", "AutoPartyManager"];
      const prodrdNames = ["uPgrade: Fulcrum", "uPgrade: Capacity.I", "uPgrade: Dashboard"];
   
      for (const division of this.ns.corporation.getCorporation().divisions) {
        if (division == 'CamelCorp' && this.ns.corporation.getCorporation().divisions.includes('CamelCorp 2')) {
          for (const name of rdNames) {
            if (this.ns.corporation.getDivision(division).researchPoints >= this.ns.corporation.getResearchCost(division, name) && !this.ns.corporation.hasResearched(division, name)) { this.ns.corporation.research(division, name); }
          }
          continue;
        }
   
        if (this.ns.corporation.getDivision(division).researchPoints > 12000 && !this.ns.corporation.hasResearched(division, rdNames[0])) { this.ns.corporation.research(division, rdNames[0]); }
        if (!this.ns.corporation.hasResearched(division, rdNames[0])) { continue; }
        if (this.ns.corporation.getDivision(division).researchPoints > 1.4e5 && !this.ns.corporation.hasResearched(division, rdNames[2])) { this.ns.corporation.research(division, rdNames[1]); this.ns.corporation.research(division, rdNames[2]); }
        if (!this.ns.corporation.hasResearched(division, rdNames[2])) { continue; }
        if (this.ns.corporation.getDivision(division).researchPoints > 1.5e5 && !this.ns.corporation.hasResearched(division, rdNames[4])) { this.ns.corporation.research(division, rdNames[3]); this.ns.corporation.research(division, rdNames[4]); }
        if (!this.ns.corporation.hasResearched(division, rdNames[4])) { continue; }
        if (this.ns.corporation.getDivision(division).researchPoints > 1.5e5 && !this.ns.corporation.hasResearched(division, rdNames[6])) { this.ns.corporation.research(division, rdNames[5]); this.ns.corporation.research(division, rdNames[6]); }
        if (!this.ns.corporation.hasResearched(division, rdNames[6])) { continue; }
        if (this.ns.corporation.getDivision(division).researchPoints > 1e5 && !this.ns.corporation.hasResearched(division, rdNames[7])) { this.ns.corporation.research(division, rdNames[7]); }
        for (const name of rdNames) {
          if (this.ns.corporation.getDivision(division).researchPoints >= this.ns.corporation.getResearchCost(division, name) * 30 && !this.ns.corporation.hasResearched(division, name)) { this.ns.corporation.research(division, name); }
        }
        if (this.ns.corporation.getDivision(division).makesProducts) {
          if (this.ns.corporation.getDivision(division).researchPoints >= (this.ns.corporation.getResearchCost(division, prodrdNames[0]) * 3.5) * 10) {
            for (const name of prodrdNames) { this.ns.corporation.research(division, name); }
          }
        }
      }
    }
   
    //function to set prices
    setPrices() {
      for (const division of this.ns.corporation.getCorporation().divisions) {
        const divType = this.ns.corporation.getDivision(division).type;
        const divData = this.ns.corporation.getIndustryData(divType);
        for (const city of this.cities) {
          if (this.ns.corporation.getDivision(division).makesProducts) {
            const prods = this.ns.corporation.getDivision(division).products
            for (const prod of prods) {
              const prodData = this.ns.corporation.getProduct(division, city, prod);
              if (prodData.developmentProgress < 100 && !this.ns.corporation.hasResearched(division, "uPgrade: Dashboard")) { continue; }
              if (this.ns.corporation.hasResearched(division, "Market-TA.II")) {
                this.ns.corporation.sellProduct(division, city, prod, "MAX", "MP", true);
                this.ns.corporation.setProductMarketTA2(division, prod, true);
              } else { //this logic is terrible, but will do the trick. market-TA.II is too good.
                let x = 1;
                if (typeof prodData.desiredSellPrice === "string") {
                  if (parseFloat(prodData.desiredSellPrice.slice(3)) != null && parseFloat(prodData.desiredSellPrice.slice(3)) > 0) {
                    x = parseFloat(prodData.desiredSellPrice.slice(3));
                    if (prodData.stored === 0) {
                      if (x < prodData.rating / 10) {
                        x = prodData.rating / 10;
                      }
                      x *= 1.5;
                    } else {
                      const buffer = Math.max(prodData.productionAmount, 1);
                      let desired = prodData.stored - buffer > 0 ? prodData.stored - buffer : 1;
                      if (desired > prodData.productionAmount * 1.1) {
                        desired = prodData.productionAmount * 1.1;
                      }
                      const xMult = Math.max(0.33, Math.sqrt(prodData.actualSellAmount / desired));
                      x *= xMult;
                    }
                  }
                }
                if (!(x > 0)) { this.nstprint("x tried to be " + x + " for " + prod + " in " + division + ", " + city + ". correcting to 1"); x = 1; }
                this.ns.corporation.sellProduct(division, city, prod, "MAX", "MP*" + x, true);
              }
            }
          }
          if (divData.producedMaterials) {
            for (const mat of divData.producedMaterials) {
              const matData = this.ns.corporation.getMaterial(division, city, mat);
              const matConst = this.ns.corporation.getMaterialData(mat);
              if (this.ns.corporation.hasResearched(division, "Market-TA.II")) {
                this.ns.corporation.sellMaterial(division, city, mat, "MAX", "MP");
                this.ns.corporation.setMaterialMarketTA2(division, city, mat, true);
              } else {
                if (mat == 'Minerals') {
                  // Minerals clog up the warehouse (we make enough ore anyway)
                  this.ns.corporation.limitMaterialProduction(division, city, "Minerals", 0.001);
                  this.ns.corporation.sellMaterial(division, city, mat, "MAX", "0");
                } else {
                  this.ns.corporation.sellMaterial(division, city, mat, "MAX", matData.marketPrice + (matData.quality / matConst.baseMarkup));
                }
              }
            } //the above line is perfect logic for materials. it's effectively market.TA.I.
          }
        }
      }
    }
   
    //function to manage exports
    marketPlace() {
      const divNames = ["AgriCorp", "CamelCorp", "AquaCorp", "ChemCorp", "GoronCorp", "ForgeCorp", "MicroCorp", "SkyNetCorp", "RobotnicCorp", "ZoraCorp", "PharmaCorp", "HeartCorp", "CoiCorp", "McCorp", "JeffGoldblumCorp"];
      const mats = ["Food", "Plants", "Water", "Chemicals", "Drugs", "Ore", "Metal", "Hardware", "AI Cores", "Robots", "Real Estate"];
      const divisions = this.ns.corporation.getCorporation().divisions;
      for (const city of this.cities) {
        for (const mat of mats) { //this clears existing imports because the current game will allow infinite duplicates.
          for (const div of divisions) {
            const exports = this.ns.corporation.getMaterial(div, city, mat).exports;
            for (const exp of exports) {
              this.ns.corporation.cancelExportMaterial(div, city, exp.division, exp.city, mat, exp.amount);
            }
          }
        }
        if (divisions.includes(divNames[1])) {
          if (divisions.includes(divNames[0])) {
            if (divisions.includes("CamelCorp 2")) {
              this.ns.corporation.exportMaterial(divNames[0], city, "CamelCorp 2", city, "Plants", "(IINV+IPROD)*(-1)");
            }
            this.ns.corporation.exportMaterial(divNames[0], city, divNames[1], city, "Plants", "(IINV+IPROD)*(-1)");
          }
        }
        if (divisions.includes(divNames[3])) {
          if (divisions.includes(divNames[0])) {
            this.ns.corporation.exportMaterial(divNames[0], city, divNames[3], city, "Plants", "(IINV+IPROD)*(-1)");
            this.ns.corporation.exportMaterial(divNames[3], city, divNames[0], city, "Chemicals", "(IINV+IPROD)*(-1)");
          }
          if (divisions.includes(divNames[2])) { this.ns.corporation.exportMaterial(divNames[2], city, divNames[3], city, "Water", "(IINV+IPROD)*(-1)"); }
        }
        if (divisions.includes(divNames[5])) {
          this.ns.corporation.exportMaterial(divNames[4], city, divNames[5], city, "Ore", "(IINV+IPROD)*(-1)");
        }
        if (divisions.includes(divNames[6])) {
          this.ns.corporation.exportMaterial(divNames[5], city, divNames[6], city, "Metal", "(IINV+IPROD)*(-1)");
          if (divisions.includes(divNames[9])) this.ns.corporation.exportMaterial(divNames[6], city, divNames[9], city, "Hardware", "(IPROD)*(-1)");
          // this is a (bad) heuristic for having enough production to feedback to ore; before that,
          // feeding forward to water gives better quality 
          if (this.ns.corporation.getCorporation().public) {
            if (divisions.includes(divNames[4])) this.ns.corporation.exportMaterial(divNames[6], city, divNames[4], city, "Hardware", "(IPROD)*(-1)");
          }
          /*  look, we don't produce enough hardware as it is.
          if (divisions.includes(divNames[7])) this.ns.corporation.exportMaterial(divNames[6], city, divNames[7], city, "Hardware", "(IPROD)*(-1)");
          if (divisions.includes(divNames[8])) this.ns.corporation.exportMaterial(divNames[6], city, divNames[8], city, "Hardware", "(IPROD)*(-1)");
          if (divisions.includes(divNames[14])) this.ns.corporation.exportMaterial(divNames[6], city, divNames[14], city, "Hardware", "(IPROD)*(-1)");
          */
        }
        if (divisions.includes(divNames[8])) {
          // AI cores are also a boost material
          if (divisions.includes(divNames[7])) this.ns.corporation.exportMaterial(divNames[7], city, divNames[8], city, "AI Cores", "(IPROD)*(-1)");
          if (divisions.includes(divNames[11])) this.ns.corporation.exportMaterial(divNames[8], city, divNames[11], city, "Robots", "(IPROD)*(-1)");
        }
        if (divisions.includes(divNames[9])) {
          this.ns.corporation.exportMaterial(divNames[9], city, divNames[0], city, "Water", "(IINV+IPROD)*(-1)");
          this.ns.corporation.exportMaterial(divNames[9], city, divNames[3], city, "Water", "(IINV+IPROD)*(-1)");
        }
        if (divisions.includes(divNames[10])) {
          this.ns.corporation.exportMaterial(divNames[3], city, divNames[10], city, "Chemicals", "(IINV+IPROD)*(-1)");
          this.ns.corporation.exportMaterial(divNames[9], city, divNames[10], city, "Water", "(IINV+IPROD)*(-1)");
        }
        if (divisions.includes(divNames[11])) {
          this.ns.corporation.exportMaterial(divNames[0], city, divNames[11], city, "Food", "(IINV+IPROD)*(-1)");
          this.ns.corporation.exportMaterial(divNames[10], city, divNames[11], city, "Drugs", "(IINV+IPROD)*(-1)");
        }
        if (divisions.includes(divNames[12])) {
          this.ns.corporation.exportMaterial(divNames[0], city, divNames[12], city, "Plants", "(IINV+IPROD)*(-1)");
          this.ns.corporation.exportMaterial(divNames[12], city, divNames[11], city, "Food", "(IINV+IPROD)*(-1)");
        }
        if (divisions.includes(divNames[13])) {
          if (divisions.includes(divNames[0])) { this.ns.corporation.exportMaterial(divNames[0], city, divNames[13], city, "Food", "(IINV+IPROD)*(-1)"); }
          if (divisions.includes(divNames[12])) { this.ns.corporation.exportMaterial(divNames[12], city, divNames[13], city, "Food", "(IINV+IPROD)*(-1)"); }
          if (divisions.includes(divNames[2])) { this.ns.corporation.exportMaterial(divNames[2], city, divNames[13], city, "Water", "(IINV+IPROD)*(-1)"); }
          if (divisions.includes(divNames[9])) { this.ns.corporation.exportMaterial(divNames[9], city, divNames[13], city, "Water", "(IINV+IPROD)*(-1)"); }
        }
        if (divisions.includes(divNames[14])) {
          if (divisions.includes(divNames[0])) this.ns.corporation.exportMaterial(divNames[0], city, divNames[14], city, "Plants", "(IINV+IPROD)*(-1)");
          if (divisions.includes(divNames[2])) this.ns.corporation.exportMaterial(divNames[2], city, divNames[14], city, "Water", "(IINV+IPROD)*(-1)");
          if (divisions.includes(divNames[9])) this.ns.corporation.exportMaterial(divNames[9], city, divNames[14], city, "Water", "(IINV+IPROD)*(-1)");
          if (divisions.includes(divNames[5])) this.ns.corporation.exportMaterial(divNames[5], city, divNames[14], city, "Metal", "(IINV+IPROD)*(-1)");
        }
      }
    }
   
    //function to create products continuously
    makeProd() {
      const divNames = ["CamelCorp", "MicroCorp", "SkyNetCorp", "RobotnicCorp", "PharmaCorp", "HeartCorp", "McCorp", "JeffGoldblumCorp", "CamelCorp 2"];
      const prodNames = ["Tobacco v", "Asus v", "Jarvis v", "Chappy v", "CureAll v", "Kaiser #", "Wendeez #", "Apartments #", "Tobacco2 v"];
      const divisions = this.ns.corporation.getCorporation().divisions;
      for (let i = 0; i < divNames.length; i++) {
        if (!divisions.includes(divNames[i])) { continue; }
        if (divNames[i] == this.divNames.restName && this.ns.corporation.getCorporation().funds < 1e21) { continue; }
        const prodMax = this.ns.corporation.hasResearched(divNames[i], "uPgrade: Capacity.I") ? 4 : 3;
        let products = this.ns.corporation.getDivision(divNames[i]).products;
        let version = (this.ns.corporation.getDivision(divNames[i]).products.length > 0) ? parseInt(products.at(-1).at(-1)) + 1 : 1;
        if (products.length >= prodMax && this.ns.corporation.getProduct(divNames[i], this.cities[0], products[prodMax - 1]).developmentProgress < 100) { continue; }
        if (products[0]?.developmentProgress < 100 || products[1]?.developmentProgress < 100 || products[2]?.developmentProgress < 100) { continue; }
        if (products.length >= prodMax && this.ns.corporation.getProduct(divNames[i], this.cities[0], products[prodMax - 1]).developmentProgress >= 100) { this.ns.corporation.discontinueProduct(divNames[i], products[0]); }
        this.ns.corporation.makeProduct(divNames[i], this.cities[0], (prodNames[i] + version), Math.abs(this.ns.corporation.getCorporation().funds * 0.01), Math.abs(this.ns.corporation.getCorporation().funds * 0.01));
      }
    }
   
    //function to purchase corp-wide upgrades.
    async corpPurchases() {
      const upgradeFunds = this.ns.corporation.getCorporation().funds;
      if (!this.ns.corporation.hasUnlock("Export") && upgradeFunds > this.ns.corporation.getUnlockCost("Export")) { this.ns.corporation.purchaseUnlock("Export"); }
      if (!this.ns.corporation.hasUnlock("Smart Supply") && upgradeFunds > this.ns.corporation.getUnlockCost("Smart Supply") * 10) {
        this.ns.corporation.purchaseUnlock("Smart Supply");
        for (const division of this.ns.corporation.getCorporation().divisions) {
          for (const city of this.ns.corporation.getDivision(division).cities) {
            this.ns.corporation.setSmartSupply(division, city, true);
          }
        }
      }
      //this.lvlUps = ["Smart Factories", "Smart Storage", "FocusWires", "Neural Accelerators", "Speech Processor Implants", "Nuoptimal Nootropic Injector Implants", "Wilson Analytics", "Project Insight", "ABC SalesBots", "DreamSense"];
      const wilsonCost = this.ns.corporation.getUpgradeLevelCost(this.lvlUps[6]);
      const labCost = this.ns.corporation.getUpgradeLevelCost(this.lvlUps[7]);
      const abcCost = this.ns.corporation.getUpgradeLevelCost(this.lvlUps[8]);
      while (this.ns.corporation.getUpgradeLevel(this.lvlUps[0]) != this.ns.corporation.getUpgradeLevel(this.lvlUps[1])) {
        if (this.ns.corporation.getUpgradeLevel(this.lvlUps[0]) < this.ns.corporation.getUpgradeLevel(this.lvlUps[1])) {
          this.ns.corporation.levelUpgrade(this.lvlUps[0]);
        }
        else {
          this.ns.corporation.levelUpgrade(this.lvlUps[1]);
        }
        await this.ns.sleep(0);
      }
      const factCost = this.ns.corporation.getUpgradeLevelCost(this.lvlUps[0]) + this.ns.corporation.getUpgradeLevelCost(this.lvlUps[1]);
      let augLevels = [];
      for (let i = 2; i < 6; i++) {
        augLevels.push(this.ns.corporation.getUpgradeLevel(this.lvlUps[i]));
      }
      while (!augLevels.every((number) => number === augLevels[0])) {
        await this.ns.sleep(0);
        while (this.ns.corporation.getUpgradeLevel(this.lvlUps[2]) < this.ns.corporation.getUpgradeLevel(this.lvlUps[3]) || this.ns.corporation.getUpgradeLevel(this.lvlUps[2]) < this.ns.corporation.getUpgradeLevel(this.lvlUps[4]) || this.ns.corporation.getUpgradeLevel(this.lvlUps[2]) < this.ns.corporation.getUpgradeLevel(this.lvlUps[5])) {
          this.ns.corporation.levelUpgrade(this.lvlUps[2]);
          await this.ns.sleep(0);
        }
        while (this.ns.corporation.getUpgradeLevel(this.lvlUps[2]) > this.ns.corporation.getUpgradeLevel(this.lvlUps[3])) {
          this.ns.corporation.levelUpgrade(this.lvlUps[3]);
          await this.ns.sleep(0);
        }
        while (this.ns.corporation.getUpgradeLevel(this.lvlUps[2]) > this.ns.corporation.getUpgradeLevel(this.lvlUps[4])) {
          this.ns.corporation.levelUpgrade(this.lvlUps[4]);
          await this.ns.sleep(0);
        }
        while (this.ns.corporation.getUpgradeLevel(this.lvlUps[2]) > this.ns.corporation.getUpgradeLevel(this.lvlUps[5])) {
          this.ns.corporation.levelUpgrade(this.lvlUps[5]);
          await this.ns.sleep(0);
        }
        augLevels = [];
        for (let i = 2; i < 6; i++) {
          augLevels.push(this.ns.corporation.getUpgradeLevel(this.lvlUps[i]));
        }
        await this.ns.sleep(0);
      }
      const employeeUpCost = this.ns.corporation.getUpgradeLevelCost(this.lvlUps[2]) + this.ns.corporation.getUpgradeLevelCost(this.lvlUps[3]) + this.ns.corporation.getUpgradeLevelCost(this.lvlUps[4]) + this.ns.corporation.getUpgradeLevelCost(this.lvlUps[5]);
      if (upgradeFunds > wilsonCost) { this.ns.corporation.levelUpgrade(this.lvlUps[6]); return; }
      if (upgradeFunds < employeeUpCost) { return; }
      if (employeeUpCost / 2 > labCost) { this.ns.corporation.levelUpgrade(this.lvlUps[7]); return; }
      if (employeeUpCost > factCost) { this.ns.corporation.levelUpgrade(this.lvlUps[0]); this.ns.corporation.levelUpgrade(this.lvlUps[1]); return; }
      if (upgradeFunds > abcCost) { this.ns.corporation.levelUpgrade(this.lvlUps[8]); return; }
      if (upgradeFunds * 0.5 > this.ns.corporation.getUpgradeLevelCost(this.lvlUps[9])) { this.ns.corporation.levelUpgrade(this.lvlUps[9]); return; }
      for (let i = 2; i < 6; i++) {
        this.ns.corporation.levelUpgrade(this.lvlUps[i]);
      }
    }
   
    //function to expand to other industries.
    expansionPlan() {
      // agri, tob, chem first. ore, refinery, hardware, water second, everything else after (but they're memes
      // anyway; camelcorp will stay orders of magnitude ahead)
      // spring water sucks so don't even bother, the production multiplier and quality are both garbo tier
      // if you had to pick one industry to go into after water, it would probably be real estate?
      let funds = this.ns.corporation.getCorporation().funds;
      const divisionNames =
        ["AgriCorp", "CamelCorp", "AquaCorp", "ChemCorp", "GoronCorp",
          "ForgeCorp", "MicroCorp", "SkyNetCorp", "RobotnicCorp", "JeffGoldblumCorp",
          "PharmaCorp", "HeartCorp", "CoiCorp", "McCorp", "ZoraCorp",
          "CamelCorp 2"];
      const divisionTypes =
        ["Agriculture", "Tobacco", "Spring Water", "Chemical", "Mining",
          "Refinery", "Computer Hardware", "Software", "Robotics", "Real Estate",
          "Pharmaceutical", "Healthcare", "Fishing", "Restaurant", "Water Utilities",
          "Tobacco"];
      const divisionFundsReq =
        [6e10, 7e10, Infinity, 7.5e11, 1e16,
          1e16, 1e16, Infinity, Infinity, Infinity,
          Infinity, Infinity, Infinity, Infinity, 1e16,
          1e19];
      const divisions = this.ns.corporation.getCorporation().divisions;
      for (let i = 0; i < divisionNames.length; i++) {
        if (funds >= divisionFundsReq[i] && !divisions.includes(divisionNames[i])) {
          try {
            this.ns.corporation.expandIndustry(divisionTypes[i], divisionNames[i]);
            for (const city of this.cities) {
              if (!this.ns.corporation.getDivision(divisionNames[i]).cities.includes(city)) { this.ns.corporation.expandCity(divisionNames[i], city); }
              if (!this.ns.corporation.hasWarehouse(divisionNames[i], city)) { this.ns.corporation.purchaseWarehouse(divisionNames[i], city); }
              funds = this.ns.corporation.getCorporation().funds;
            }
          } catch { }
        }
      }
      if (funds > 1e40 && !this.ns.corporation.getCorporation().public) {
        if (!this.ns.corporation.hasUnlock("Government Partnership")) { this.ns.corporation.purchaseUnlock("Government Partnership"); }
        if (!this.ns.corporation.hasUnlock("Shady Accounting")) { this.ns.corporation.purchaseUnlock("Shady Accounting"); }
        this.ns.corporation.goPublic(0);
        this.ns.corporation.issueDividends(0.001);
        this.ns.tprint("Went Public. dividends set to 0.001. time elapsed: " + this.ns.tFormat(Date.now() - this.startTime));
      } //going public happens in bitnode 3 at 2 hours 15 minutes. keep it running to boost your dividends to the sky.
    }
   
    //function to check all the warehouses in each division to make sure we have space to produce and sell
    warehouseSafety() {
      for (const division of this.ns.corporation.getCorporation().divisions) {
        for (const city of this.cities) {
          const warehouse = this.ns.corporation.getWarehouse(division, city)
          if (warehouse.sizeUsed >= warehouse.size * 0.95) {
            let x = warehouse.sizeUsed
            for (const mat of this.mats) {
              const matData = this.ns.corporation.getMaterial(division, city, mat);
              const matConst = this.ns.corporation.getMaterialData(mat);
              const spaceTaken = matData.stored * matConst.size;
              if (spaceTaken >= x * 0.1) {
                this.ns.corporation.sellMaterial(division, city, mat, "MAX*0.5", "MP*0.1");
              }
            }
          }
        }
      }
    }
   
    //function to buy boost materials
    boostPurchase() {
      // boost material quality *does not matter* so just buy off the market
      const boostOrder = ["AI Cores", "Hardware", "Real Estate", "Robots"];
      const divBoost = { //data map that will organize purchase orders.
        // note: first and second never get used because of real estate fraud lol
        agri: {
          name: "AgriCorp",
          first: [932, 1092, 68256, 0],
          second: [6077, 6808, 315264, 815],
          third: [19893, 22159, 978368, 3579],
          factors: [0.3, 0.2, 0.72, 0.3],
        },
        chem: {
          name: "ChemCorp",
          first: [1164, 2967, 41116, 0],
          second: [6906, 14928, 184644, 981],
          third: [22461, 47337, 573536, 4092],
          factors: [0.2, 0.2, 0.25, 0.25],
        },
        tob: {
          name: "CamelCorp",
          first: [1421, 2703, 37944, 12],
          second: [7190, 12317, 153296, 1551],
          third: [23345, 39242, 476396, 5858],
          factors: [0.15, 0.15, 0.15, 2],
        },
        tob2: {
          name: "CamelCorp 2",
          first: [1421, 2703, 37944, 12],
          second: [7190, 12317, 153296, 1551],
          third: [23345, 39242, 476396, 5858],
          factors: [0.15, 0.15, 0.15, 2],
        },
        sprng: {
          name: "AquaCorp",
          first: [1342, 0, 73167, 0],
          second: [9675, 0, 406500, 0],
          third: [33008, 0, 1339833, 0],
          factors: [0.1, 0, 0.2, 0],
        },
        mining: {
          name: "GoronCorp",
          first: [1779, 2877, 29891, 0],
          second: [8873, 13385, 124469, 1375],
          third: [28560, 42552, 386969, 5312],
          factors: [0.45, 0, 0.3, 0.45],  // Because hardware is an input its scaling doesn't matter
        },
        refinery: {
          name: "ForgeCorp",
          first: [1089, 3913, 31273, 0],
          second: [6165, 18014, 132800, 1277],
          third: [20165, 56903, 412800, 5011],
          factors: [0.3, 0.5, 0.3, 0.4],
        },
        hardware: {
          name: "MicroCorp",
          first: [1533, 0, 42300, 270],
          second: [7866, 0, 175633, 2670],
          third: [25600, 0, 548967, 9390],
          factors: [0.19, 0, 0.2, 0.36],
        },
        software: {
          name: "SkyNetCorp",
          first: [1308, 3685, 29629, 0],
          second: [9021, 21540, 158190, 29],
          third: [29021, 67837, 491524, 1140],
          factors: [0.18, 0.25, 0.15, 0.05],
        },
        robotics: {
          name: "RobotnicCorp",
          first: [1871, 1645, 42849, 0],
          second: [12045, 10850, 228895, 0],
          third: [40533, 36625, 749826, 0],
          factors: [0.35, 0.19, 0.32, 0],
        },
        utilities: {
          name: "ZoraCorp",
          first: [1956, 0, 60889, 0],
          second: [9662, 0, 253538, 1532],
          third: [31200, 0, 792000, 5840],
          factors: [0.4, 0, 0.5, 0.4],
        },
        health: {
          name: "HeartCorp",
          first: [1442, 2736, 38333, 0],
          second: [7831, 13385, 166125, 1166],
          third: [25331, 42552, 516125, 4666],
          factors: [0.1, 0.1, 0.1, 0.1],
        },
        fishing: {
          name: "CoiCorp",
          first: [887, 3547, 20312, 194],
          second: [5054, 15700, 82812, 2277],
          third: [16721, 49727, 257812, 8110],
          factors: [0.2, 0.35, 0.15, 0.5],
        },
        restaurant: {
          name: "McCorp",
          first: [2275, 2275, 10600, 166],
          second: [10608, 10608, 43933, 2166],
          third: [33942, 33942, 137267, 7766],
          factors: [0.25, 0.15, 0.05, 0.3],
        },
        realestate: {
          name: "JeffGoldblumCorp",
          first: [3484, 53, 0, 297],
          second: [15484, 1720, 0, 2697],
          third: [49084, 6387, 0, 9417],
          factors: [0.6, 0.05, 0, 0.6],
        },
        pharma: {
          name: "PharmaCorp",
          first: [0, 0, 0, 0],
          second: [0, 0, 0, 0],
          third: [0, 0, 0, 0],
          factors: [0.2, 0.15, 0.05, 0.25],
        },
      };
   
      for (const division of this.ns.corporation.getCorporation().divisions) {
        for (const city of this.ns.corporation.getDivision(division).cities) {
          for (const div of Object.values(divBoost)) {
            if (division != div.name) { continue; }
            try {
              //first increase warehouse. buffer for production and required materials 
              //should be 50% and boost space should be 50% roughly
              if (this.ns.corporation.getWarehouse(division, city).size < 1000 && this.ns.corporation.getCorporation().funds > this.ns.corporation.getUpgradeWarehouseCost(division, city)) { while (this.ns.corporation.getCorporation().funds > this.ns.corporation.getUpgradeWarehouseCost(division, city) && this.ns.corporation.getWarehouse(division, city).size < 1000) { this.ns.corporation.upgradeWarehouse(division, city); } }
              if (this.ns.corporation.getWarehouse(division, city).size < 1000) { continue; }
              for (let i = 0; i < 4; i++) {
                if (this.ns.corporation.getMaterial(division, city, boostOrder[i]).stored < div.first[i] && this.ns.corporation.getCorporation().funds > this.ns.corporation.getMaterial(division, city, boostOrder[i]).marketPrice * (div.first[i] - this.ns.corporation.getMaterial(division, city, boostOrder[i]).stored)) {
                  this.ns.corporation.bulkPurchase(division, city, boostOrder[i], div.first[i] - this.ns.corporation.getMaterial(division, city, boostOrder[i]).stored);
                }
              }
              if (this.ns.corporation.getWarehouse(division, city).size < 5000 && this.ns.corporation.getCorporation().funds > this.ns.corporation.getUpgradeWarehouseCost(division, city)) { while (this.ns.corporation.getCorporation().funds > this.ns.corporation.getUpgradeWarehouseCost(division, city) && this.ns.corporation.getWarehouse(division, city).size < 5000) { this.ns.corporation.upgradeWarehouse(division, city); } }
              if (this.ns.corporation.getWarehouse(division, city).size < 5000) { continue; }
              for (let i = 0; i < 4; i++) {
                if (this.ns.corporation.getMaterial(division, city, boostOrder[i]).stored < div.second[i] && this.ns.corporation.getCorporation().funds > this.ns.corporation.getMaterial(division, city, boostOrder[i]).marketPrice * (div.second[i] - this.ns.corporation.getMaterial(division, city, boostOrder[i]).stored)) {
                  this.ns.corporation.bulkPurchase(division, city, boostOrder[i], div.second[i] - this.ns.corporation.getMaterial(division, city, boostOrder[i]).stored);
                }
              }
              if (this.ns.corporation.getWarehouse(division, city).size < 20000 && this.ns.corporation.getCorporation().funds > this.ns.corporation.getUpgradeWarehouseCost(division, city)) { while (this.ns.corporation.getCorporation().funds > this.ns.corporation.getUpgradeWarehouseCost(division, city) && this.ns.corporation.getWarehouse(division, city).size < 20000) { this.ns.corporation.upgradeWarehouse(division, city); } }
              if (this.ns.corporation.getWarehouse(division, city).size < 20000) { continue; }
              for (let i = 0; i < 4; i++) {
                if (this.ns.corporation.getMaterial(division, city, boostOrder[i]).stored < div.third[i] && this.ns.corporation.getCorporation().funds > this.ns.corporation.getMaterial(division, city, boostOrder[i]).marketPrice * (div.third[i] - this.ns.corporation.getMaterial(division, city, boostOrder[i]).stored)) {
                  this.ns.corporation.bulkPurchase(division, city, boostOrder[i], div.third[i] - this.ns.corporation.getMaterial(division, city, boostOrder[i]).stored);
                }
              }
   
              if (this.ns.corporation.getWarehouse(division, city).size < 40000) { continue; }
              if (!div.factors) continue;
              // TODO: would be best to actually calculate the size of input/output materials
              // and calculate target boost materials based on that
              let targetSize = this.ns.corporation.getWarehouse(division, city).size / 4;
              if (div.name == 'ChemCorp' || div.name == 'CamelCorp' || div.name == 'MicroCorp' || div.name == 'CamelCorp 2') targetSize *= 2;
              let boost = optimizeCorpoMaterials([0.1, 0.06, 0.005, 0.5], div.factors, targetSize)
              try {
   
                // automatic scaling wheee
                for (let i = 0; i < 4; i++) {
                  if (this.ns.corporation.getMaterial(division, city, boostOrder[i]).stored < boost[i] &&
                    this.ns.corporation.getCorporation().funds > this.ns.corporation.getMaterial(division, city, boostOrder[i]).marketPrice * (boost[i] - this.ns.corporation.getMaterial(division, city, boostOrder[i]).stored)) {
                    this.ns.corporation.bulkPurchase(division, city, boostOrder[i], boost[i] - this.ns.corporation.getMaterial(division, city, boostOrder[i]).stored);
                  }
                }
              } catch { }
            } catch { }
          }
        }
      }
    }
   
    //logic to accept the 3rd and 4th investors
    investAgain() {
      if (this.ns.corporation.getInvestmentOffer().funds > 3e16 && this.ns.corporation.getInvestmentOffer().round == 3) {
        this.ns.tprint("round 3 investment offer accepted: " + this.ns.formatNumber(this.ns.corporation.getInvestmentOffer().funds, 3));
        this.ns.corporation.acceptInvestmentOffer();
      } else if (this.ns.corporation.getInvestmentOffer().funds > 5e18 && this.ns.corporation.getInvestmentOffer().round == 4) {
        this.ns.tprint("round 4 investment offer accepted: " + this.ns.formatNumber(this.ns.corporation.getInvestmentOffer().funds, 3));
        this.ns.corporation.acceptInvestmentOffer();
      }
    }
   
    //routine function to bribe all factions possible to 1 quadrillion rep.
    bribeFactions() {
      const factionList = this.ns.getPlayer().factions;
      for (const faction of factionList) { this.ns.corporation.bribe(faction, 1e24); }
   
    }
   
    //function to make the log pretty
    logPrint() {
      this.ns.resizeTail(350, 300);
      this.ns.clearLog();
      this.ns.print("Corporation: " + this.ns.corporation.getCorporation().name);
      this.ns.print("Divisions: " + this.ns.corporation.getCorporation().divisions.length);
      this.ns.print("Earnings: " + this.ns.formatNumber(this.ns.corporation.getCorporation().revenue));
      this.ns.print("Expenses: " + this.ns.formatNumber(this.ns.corporation.getCorporation().expenses));
      this.ns.print("Profit: " + this.ns.formatNumber(this.ns.corporation.getCorporation().revenue - this.ns.corporation.getCorporation().expenses));
      this.ns.print("Funds: " + this.ns.formatNumber(this.ns.corporation.getCorporation().funds, 3));
      if (this.ns.corporation.getInvestmentOffer().round <= 4 && !this.ns.corporation.getCorporation().public) { this.ns.print("Investment offers accepted: " + (this.ns.corporation.getInvestmentOffer().round - 1)); } else if (!this.ns.corporation.getCorporation().public) { this.ns.print("All investment offers accepted."); } else { this.ns.print("Gone public: True"); }
      if (this.ns.corporation.getInvestmentOffer().round <= 4 && !this.ns.corporation.getCorporation().public) { this.ns.print("Round " + this.ns.corporation.getInvestmentOffer().round + " Inv Offer: " + this.ns.formatNumber(this.ns.corporation.getInvestmentOffer().funds, 3)); }
      this.ns.print("Shares owned: " + this.ns.formatNumber(this.ns.corporation.getCorporation().numShares));
      if (this.ns.corporation.getCorporation().public) { this.ns.print("Dividends: " + this.ns.corporation.getCorporation().dividendEarnings); }
      this.ns.print("Time Elapsed: " + this.ns.tFormat(Date.now() - this.startTime));
    }
  }
   
  function optimizeCorpoMaterials(weights, factors, spaceConstraint) {
    let p = factors.reduce((a, b) => a + b, 0);
    let w = weights.reduce((a, b) => a + b, 0);
    let r = [];
   
    for (let i = 0; i < weights.length; ++i) {
      let m = (spaceConstraint - 500 * ((weights[i] / factors[i]) * (p - factors[i]) - (w - weights[i]))) / (p / factors[i]) / weights[i];
      if (factors[i] <= 0 || m < 0) {
        let w = weights, f = factors;
        w.splice(i, 1);
        f.splice(i, 1);
        r = optimizeCorpoMaterials(w, f, spaceConstraint);
        r.splice(i, 0, 0);
      } else {
        m = Math.round(m);
        r.push(m);
      }
    }
    return r;
  }
   
  /** @param {import(".").NS} ns */
  export async function main(ns) {
    ns.disableLog("ALL");
    ns.tail();
    const bus = new Business(ns);
    await bus.checkStage(); //function to figure out what stage/stage the corp is at
    let playerFactions = ns.getPlayer().factions;
    let factionCount = playerFactions.length;
    let previousFactionCount = 0;
   
    while (bus.stage[0] < 10) { //this is the this.step 0-9
      while (ns.corporation.getCorporation().state != "START") {
        //when you make your main script, put things you want to be done
        //potentially multiple times every cycle, like buying upgrades, here.
        await ns.sleep(0);
      }
   
      while (ns.corporation.getCorporation().state == "START") {
        //same as above
        await ns.sleep(0);
      }
      //and to this part put things you want done exactly once per cycle
      bus.teaParty();
      await bus.checkStage();
      bus.dumbSupply();
    }
   
    bus.expansionPlan();
   
    while (bus.stage[0] >= 10) { //this is the to the moon loop.
      let buyLoop = true;
      while (ns.corporation.getCorporation().state != "START") {
        //when you make your main script, put things you want to be done
        //potentially multiple times every cycle, like buying upgrades, here.
        if (buyLoop) {
          let funds = ns.corporation.getCorporation().funds;
          await bus.corpPurchases();
          await bus.divisPurchases();
          if (funds == ns.corporation.getCorporation().funds) buyLoop = false;
        } else {
          await ns.sleep(10);
        }
      }
      bus.humanResources();  // because divisPurchases can expand offices
   
      while (ns.corporation.getCorporation().state == "START") {
        //same as above
        await ns.sleep(0);
      }
      //and to this part put things you want done exactly once per cycle
      bus.investAgain();
      bus.expansionPlan();
      bus.boostPurchase();
      bus.setPrices();
      bus.makeProd();
      bus.rAndD();
      bus.humanResources();
      bus.marketPlace();
      bus.warehouseSafety();
      bus.dumbSupply();
      bus.teaParty();
      bus.logPrint();
      playerFactions = ns.getPlayer().factions;
      factionCount = playerFactions.length;
      if (factionCount > previousFactionCount && ns.corporation.getCorporation().public) {
        bus.bribeFactions();
        previousFactionCount = factionCount;
      }
    }
  }