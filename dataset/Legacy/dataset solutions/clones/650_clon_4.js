var sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');
var [paramA, paramB, paramC] = sourceData.trim().split(" ").map(Number);

const rateOfConsumption = paramA;
const fixedCostPerCycle = paramB;
let currentQuantity = paramC;

const cycleCost = fixedCostPerCycle + (7 * rateOfConsumption);
const thresholdForFullCycle = 6 * rateOfConsumption;

let completedCycles = 0;
if (currentQuantity >= thresholdForFullCycle + 1) {
    completedCycles = Math.floor((currentQuantity - (thresholdForFullCycle + 1)) / cycleCost) + 1;
}

const totalCycleTime = completedCycles * 7;
const remainingQuantity = currentQuantity - (completedCycles * cycleCost);

const finalPartialTime = Math.ceil(remainingQuantity / rateOfConsumption);

const totalElapsedDuration = totalCycleTime + Math.max(0, finalPartialTime);

console.log(totalElapsedDuration);
