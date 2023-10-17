import { scanNetworkServersAsync, getRootAccess, getBestServerTargetAsync } from "./utils";

class InfectHandler {
  /**
   * @param {import(".").NS} ns
   */
  constructor(ns){
    this.ns = ns;
    this.virusPath = "./virus.js";
    this.targets = [];
  }

  async setTargets(){
    let newTargets = (await getBestServerTargetAsync(this.ns))?.slice(0, 3);
    if(newTargets == []) newTargets = ["n00dles", "joesguns"]

    if(!newTargets.every(x => this.targets.includes(x))){
      this.targets = newTargets;
      this.ns.toast(`Infect targets setted to: ${this.targets.join(',')}`, "info");
    }
  }

  async run(){
    while(true){
      this.setTargets();

      let hackableServers = await scanNetworkServersAsync(this.ns);
      hackableServers?.forEach(server => {
        let hasRootAccess = getRootAccess(this.ns, server);
        if(!hasRootAccess){
          return;
        }
        let serverMaxRam = this.ns.getServerMaxRam(server);
        var lastTargets = this.ns.read("last_targets.txt")?.split(",");
        if(lastTargets[0] != this.virusPath){
          this.ns.killall(server);
        } else {
          if(this.targets.filter(x => !lastTargets.slice(1).includes(x)).length > 0){
            this.ns.killall(server);
          }
        }

        if(serverMaxRam > 128){
            var totalTargets = this.targets.length;
            var pieceOfRam = serverMaxRam / totalTargets;
            var threadPerTarget = Math.floor(pieceOfRam / this.ns.getScriptRam(this.virusPath));
            if(threadPerTarget > 0){
              this.targets.forEach(target => {
                let scriptInfo = this.ns.getRunningScript(this.virusPath, server, target);
                if(!scriptInfo || scriptInfo.threads < threadPerTarget){
                  this.ns.scp(this.virusPath, server, "home");
                  if(scriptInfo){
                      this.ns.kill(scriptInfo.filename, server, target);
                  }
                  this.ns.exec(this.virusPath, server, threadPerTarget, target);
                  this.ns.print(`INFO Server ${server} infected and targeting ${target}`);
                }
              });
            }
        } else {
          let maximumThreads = Math.floor(serverMaxRam / this.ns.getScriptRam(this.virusPath));
          if(maximumThreads <= 0){
            return;
          }
          let scriptInfo = this.ns.getRunningScript(this.virusPath, server, this.targets[0]);
          if(!scriptInfo || scriptInfo.threads < maximumThreads){
            this.ns.scp(this.virusPath, server, "home");
            if(scriptInfo){
              this.ns.kill(scriptInfo.filename, server, this.targets[0]);
            }
            this.ns.exec(this.virusPath, server, maximumThreads, this.targets[0]);
            this.ns.print(`INFO Server ${server} infected and targeting ${this.targets[0]}`);
          }
        }
      });

      this.ns.write("last_targets.txt", this.virusPath + "," + this.targets.join(','), "w");

      await this.ns.asleep(15_000);
    }
  }
}

/**
 * @param {import(".").NS} ns
 */
export async function main(ns) {
  let hackableServers = await scanNetworkServersAsync(ns);
  let targets = (await getBestServerTargetAsync(ns))?.slice(0, 3);
  hackableServers.forEach(server => {
    if(!getRootAccess(ns, server)){
      return;
    }
    ns.killall(server);
    ns.scp(["./pirate-manager.js", "./pirate-hack.js", "./pirate-grow.js", "./pirate-weaken.js"], server, "home");
    ns.exec("./pirate-manager.js", server, 1, ...targets);
  });
}