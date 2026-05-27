const fs = require('fs');

function parseInitialConfig(configLine) {
    const parts = configLine.split(' ').map(Number);
    return {
        adjustedN: parts[0] - 1,
        m: parts[1],
        p: parts[2]
    };
}

const rawInputData = fs.readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInputData.trim().split('\n');

const initialConfig = parseInitialConfig(inputLines.shift());
const totalAdjustedItems = initialConfig.adjustedN;
const numberOfGivenValues = initialConfig.m;
const targetPointValue = initialConfig.p;

let collectedValues = [];
for (let currentIdx = 0; currentIdx < numberOfGivenValues; currentIdx++) {
    const valueFromFile = Number(inputLines.shift());
    if (valueFromFile !== targetPointValue) {
        collectedValues.push(valueFromFile);
    }
}

collectedValues.push(targetPointValue);
collectedValues.sort((valA, valB) => valA - valB);

let minimumCalculatedCost = Infinity;
const totalCollectedValues = collectedValues.length;

for (let currentValIdx = 0; currentValIdx < totalCollectedValues; currentValIdx++) {
    const currentArrayValue = collectedValues[currentValIdx];

    if (currentArrayValue <= targetPointValue) {
        if (currentValIdx > 0) {
            const distanceToTarget = targetPointValue - currentArrayValue;
            const travelCostComponent = distanceToTarget * 2;
            const fixedCostComponent = (totalAdjustedItems - targetPointValue + 1);
            const previousValueComponent = collectedValues[currentValIdx - 1];
            const currentTotalCost = travelCostComponent + fixedCostComponent + previousValueComponent;
            minimumCalculatedCost = Math.min(minimumCalculatedCost, currentTotalCost);
        }
    }

    if (targetPointValue <= currentArrayValue) {
        if (currentValIdx < totalCollectedValues - 1) {
            const distanceToTarget = currentArrayValue - targetPointValue;
            const travelCostComponent = distanceToTarget * 2;
            const fixedCostComponent = targetPointValue;
            const nextValueComponent = (totalAdjustedItems - collectedValues[currentValIdx + 1] + 1);
            const currentTotalCost = travelCostComponent + fixedCostComponent + nextValueComponent;
            minimumCalculatedCost = Math.min(minimumCalculatedCost, currentTotalCost);
        }
    }
}

console.log(minimumCalculatedCost * 100);
