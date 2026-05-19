var rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

var processedLines = rawInputContent.trim().split("\n");

var firstDataLine = processedLines.shift();
var numericParams = firstDataLine.split(" ").map(Number);

var requiredValue = numericParams[0];
var factorA = numericParams[1];
var priceB = numericParams[2];
var factorC = numericParams[3];
var priceD = numericParams[4];

var lowestTotalCost = Infinity;

const MAX_ITERATION_LIMIT = 1000;

function meetsRequirement(valI, valJ, reqVal, fA, fC) {
    var currentSum = (fA * valI) + (fC * valJ);
    return currentSum >= reqVal;
}

function computeCurrentCost(valI, valJ, pB, pD) {
    var totalCost = (pB * valI) + (pD * valJ);
    return totalCost;
}

for (var counterI = 0; counterI <= MAX_ITERATION_LIMIT; counterI++) {
    for (var counterJ = 0; counterJ <= MAX_ITERATION_LIMIT; counterJ++) {
        if (meetsRequirement(counterI, counterJ, requiredValue, factorA, factorC)) {
            var currentCalculatedCost = computeCurrentCost(counterI, counterJ, priceB, priceD);
            lowestTotalCost = Math.min(lowestTotalCost, currentCalculatedCost);
        }
    }
}

console.log(lowestTotalCost);
