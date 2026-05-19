const fileSystem = require('fs');
const rawInput = fileSystem.readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInput.trim().split('\n');

const dimensions = inputLines.shift().split(' ').map(Number);
const itemCount = dimensions[0];
const costCount = dimensions[1];

const itemValues = [];
for (let k = 0; k < itemCount; k++) {
    itemValues.push(Number(inputLines.shift()));
}

const costFactors = [];
for (let k = 0; k < costCount; k++) {
    costFactors.push(Number(inputLines.shift()));
}

let previousRow = Array(itemCount + 1).fill(Infinity);
previousRow[0] = 0;

let minOverallCost = previousRow[itemCount];

for (let currentCostIdx = 0; currentCostIdx < costCount; currentCostIdx++) {
    let currentRow = Array(itemCount + 1).fill(Infinity);
    currentRow[0] = 0;

    for (let j = 0; j <= itemCount; j++) {
        currentRow[j] = previousRow[j];
    }

    for (let j = 0; j < itemCount; j++) {
        if (previousRow[j] !== Infinity) {
            currentRow[j + 1] = Math.min(
                currentRow[j + 1],
                previousRow[j] + costFactors[currentCostIdx] * itemValues[j]
            );
        }
    }
    previousRow = currentRow;
    minOverallCost = Math.min(minOverallCost, previousRow[itemCount]);
}

console.log(minOverallCost);
