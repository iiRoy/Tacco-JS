const dataAccess = require('node:fs');

const rawData = dataAccess.readFileSync('/dev/stdin', 'utf8');
const processedLines = rawData.trim().split("\n");
const [goalAmount, itemTypeAValue, itemTypeACost, itemTypeBValue, itemTypeBCost] = processedLines[0].split(" ").map(Number);

const highestPossibleCombinedValue = 1000 * itemTypeAValue + 1000 * itemTypeBValue;
const dpArraySize = highestPossibleCombinedValue + 1;

const minimumCosts = new Array(dpArraySize).fill(Number.MAX_SAFE_INTEGER);
minimumCosts[0] = 0;

for (let currentValuation = 0; currentValuation < dpArraySize; ++currentValuation) {
    if (minimumCosts[currentValuation] === Number.MAX_SAFE_INTEGER) {
        continue;
    }

    const nextValuationA = currentValuation + itemTypeAValue;
    if (nextValuationA < dpArraySize) {
        const calculatedCostA = minimumCosts[currentValuation] + itemTypeACost;
        if (calculatedCostA < minimumCosts[nextValuationA]) {
            minimumCosts[nextValuationA] = calculatedCostA;
        }
    }

    const nextValuationB = currentValuation + itemTypeBValue;
    if (nextValuationB < dpArraySize) {
        const calculatedCostB = minimumCosts[currentValuation] + itemTypeBCost;
        if (calculatedCostB < minimumCosts[nextValuationB]) {
            minimumCosts[nextValuationB] = calculatedCostB;
        }
    }
}

let finalResultCost = Number.MAX_SAFE_INTEGER;
for (let requiredValuation = goalAmount; requiredValuation < dpArraySize; ++requiredValuation) {
    if (minimumCosts[requiredValuation] < finalResultCost) {
        finalResultCost = minimumCosts[requiredValuation];
    }
}

process.stdout.write(String(finalResultCost === Number.MAX_SAFE_INTEGER ? Infinity : finalResultCost));