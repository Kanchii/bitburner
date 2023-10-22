import { millisecondsToHours } from "./utils";

const crimeTypes = {
    shoplift: "Shoplift",
    robStore: "Rob Store",
    mug: "Mug",
    larceny: "Larceny",
    dealDrugs: "Deal Drugs",
    bondForgery: "Bond Forgery",
    traffickArms: "Traffick Arms",
    homicide: "Homicide",
    grandTheftAuto: "Grand Theft Auto",
    kidnap: "Kidnap",
    assassination: "Assassination",
    heist: "Heist",
  }

/** @param {import(".").NS} ns */
export async function main(ns) {
    const crimeStats = ns.singularity.getCrimeStats("Homicide");
    const currentKarma = ns.heart.break();
    const targetKarma = -54_000;
    const timeToReachTargetKarma = ((-targetKarma + (currentKarma)) / crimeStats.karma) * crimeStats.time;

    ns.toast(`Total Karma = ${ns.heart.break()}`, "info");
    ns.tprint(`INFO Current Karma = ${currentKarma}\tTime left to create gang: ${millisecondsToHours(timeToReachTargetKarma)}`);
}