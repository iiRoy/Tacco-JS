const fileSystem = require('fs');
const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');

let inputLines = rawInputData.trim().split('\n');

const dimensionsLine = inputLines.shift().split(' ').map(Number);
const numDItems = dimensionsLine[0];
const numCItems = dimensionsLine[1];

const dValues = Array.from({ length: numDItems }, () => Number(inputLines.shift()));

const cCosts = Array.from({ length: numCItems }, () => Number(inputLines.shift()));

const memoTable = Array.from({ length: numCItems + 1 }, () =>
    Array(numDItems + 1).fill(Infinity)
);

memoTable[0][0] = 0;

for (let cIdx = 0; cIdx < numCItems; cIdx++) {
    for (let dIdx = 0; dIdx < numDItems; dIdx++) {
        const currentPathCost = memoTable[cIdx][dIdx];

        // Transition 1: Do not use the current cCost[cIdx] for dValues[dIdx].
        // This means we carry over the cost from the previous c-item state (cIdx)
        // to the next c-item state (cIdx + 1) for the same d-item (dIdx).
        memoTable[cIdx + 1][dIdx] = Math.min(
            memoTable[cIdx + 1][dIdx],
            currentPathCost
        );

        // Transition 2: Use the current cCost[cIdx] for dValues[dIdx].
        // This means we add the cost of cCosts[cIdx] * dValues[dIdx]
        // and move to the next c-item state (cIdx + 1) and next d-item state (dIdx + 1).
        if (currentPathCost !== Infinity) {
            const costIfApplied = currentPathCost + cCosts[cIdx] * dValues[dIdx];
            memoTable[cIdx + 1][dIdx + 1] = Math.min(
                memoTable[cIdx + 1][dIdx + 1],
                costIfApplied
            );
        }
    }
}

let overallMinCost = Infinity;
for (let finalCIdx = 0; finalCIdx <= numCItems; finalCIdx++) {
    const costAtTargetD = memoTable[finalCIdx][numDItems];
    overallMinCost = Math.min(overallMinCost, costAtTargetD);
}

console.log(overallMinCost);
