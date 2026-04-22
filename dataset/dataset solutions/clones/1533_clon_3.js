const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");

const inputLineSegments = rawInputData.split('\n');

let primaryDimension = parseInt(inputLineSegments[0].trim(), 10);

const primeModulus = 1000000007;

if (primaryDimension < 1) {
    primaryDimension = 1; 
}

const pathAccumulatorTable = [];
for (let rowIdx = 0; rowIdx < primaryDimension; ++rowIdx) {
    const currentRow = new Array(primaryDimension).fill(1);
    pathAccumulatorTable.push(currentRow);
}

for (let currentRow = 1; currentRow < primaryDimension; currentRow++) {
    const previousRow = currentRow - 1;
    for (let currentColumn = 1; currentColumn < primaryDimension; currentColumn++) {
        const previousColumn = currentColumn - 1;

        let intermediateSum = pathAccumulatorTable[previousRow][currentColumn] +
                              pathAccumulatorTable[currentRow][previousColumn];

        pathAccumulatorTable[currentRow][currentColumn] = intermediateSum % primeModulus;
    }
}

let finalResultAccumulator = 0;

const summationLoopLimit = Math.floor(primaryDimension / 3);

for (let currentIteration = 0; currentIteration < summationLoopLimit; currentIteration++) {
    const targetRowIndex = currentIteration;

    const offsetFactor = currentIteration + 1;
    const computedColumnIndex = primaryDimension - (offsetFactor * 3);

    if (computedColumnIndex >= 0 && computedColumnIndex < primaryDimension &&
        targetRowIndex >= 0 && targetRowIndex < primaryDimension) {

        const valueToAdd = pathAccumulatorTable[targetRowIndex][computedColumnIndex];
        finalResultAccumulator = (finalResultAccumulator + valueToAdd) % primeModulus;
    }
}

console.log(finalResultAccumulator);