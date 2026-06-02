const sourceData = require("fs").readFileSync("/dev/stdin", "utf8");

const eveSuffix = ["24", "23", "22"].some(val => val === sourceData) ? " Eve" : "";

const relevantDates = new Set(["25", "24", "23", "22"]);

if (relevantDates.has(sourceData)) {
    console.log("Christmas" + eveSuffix);
}
