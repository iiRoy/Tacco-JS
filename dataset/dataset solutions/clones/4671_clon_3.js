const inputProcessor = require('readline');

let receivedLinesBuffer = [];

const lineInputInterface = inputProcessor.createInterface({
    input: process.stdin,
    output: process.stdout,
});

lineInputInterface.on('line', (currentLineData) => {
    receivedLinesBuffer.push(currentLineData);
});

lineInputInterface.on('close', () => {
    if (receivedLinesBuffer.length === 0) {
        console.error("Error: No input lines received.");
        return;
    }
    const paramString = receivedLinesBuffer.shift();

    const parameters = paramString.split(" ").map(Number);

    if (parameters.length !== 3) {
        console.error("Error: Expected 3 parameters (N, A, B) on the first line.");
        return;
    }

    const totalItemCount = parameters[0];
    const minSelectionCount = parameters[1];
    const maxSelectionCount = parameters[2];

    if (totalItemCount <= 0 || minSelectionCount <= 0 || maxSelectionCount <= 0) {
        console.error("Error: N, A, B must be positive integers.");
        return;
    }
    if (minSelectionCount > maxSelectionCount) {
        console.error("Error: Minimum selection count (A) cannot be greater than maximum (B).");
        return;
    }
    if (minSelectionCount > totalItemCount) {
        console.error("Error: Minimum selection count (A) cannot be greater than total items (N).");
        return;
    }

    if (receivedLinesBuffer.length === 0) {
        console.error("Error: Missing second line with item values.");
        return;
    }
    const valueString = receivedLinesBuffer.shift();

    const itemValueList = valueString.split(" ").map(Number);

    if (itemValueList.length !== totalItemCount) {
        console.error(`Error: Expected ${totalItemCount} item values, but got ${itemValueList.length}.`);
        return;
    }

    itemValueList.sort((val1, val2) => (val2 - val1));

    let currentSumForAverage = 0;
    const valueOccurrenceMap = {};

    for (let idx = 0; idx < totalItemCount; idx++) {
        const currentItem = itemValueList[idx];
        if (idx < minSelectionCount) {
            currentSumForAverage += currentItem;
        }

        valueOccurrenceMap[currentItem] = (valueOccurrenceMap[currentItem] || 0) + 1;
    }

    const maxAchievableAverage = currentSumForAverage / minSelectionCount;
    console.log(maxAchievableAverage.toFixed(8));

    let numberOfWays = 0;

    // Check if the largest value is the same as the (A+1)-th value.
    // This implies that all values from v[0] to v[A] are identical.
    // Note: itemValueList[minSelectionCount] will be undefined if minSelectionCount == totalItemCount.
    // In that case, the condition `itemValueList[0] === undefined` will be false (unless itemValueList[0] is also undefined, which it shouldn't be).
    // So if A=N, it falls into the 'else' block, which is correct (1 way to pick all N items).
    if (itemValueList[0] === itemValueList[minSelectionCount]) {
        const maxVal = itemValueList[0];
        const maxValFrequency = valueOccurrenceMap[maxVal];

        for (let k = minSelectionCount; k <= maxSelectionCount && k <= maxValFrequency; k++) {
            numberOfWays += calculateCombinations(maxValFrequency, k);
        }
    } else {
        // General case: The largest value is different from the (A+1)-th value.
        // The first 'minSelectionCount' items provide the unique maximum sum.
        // We need to count combinations based on the 'pivot' value (the A-th largest value).
        const pivotValue = itemValueList[minSelectionCount - 1];

        // Count how many times the 'pivotValue' appears in the top 'A' items.
        let requiredPivotCount = 0;
        for (let idx = 0; idx < minSelectionCount; idx++) {
            if (itemValueList[idx] === pivotValue) {
                requiredPivotCount++;
            }
        }

        // Get the total occurrences of the 'pivotValue' in the entire list.
        const totalPivotOccurrences = valueOccurrenceMap[pivotValue];

        numberOfWays = calculateCombinations(totalPivotOccurrences, requiredPivotCount);
    }

    console.log(numberOfWays);
});

function calculatePermutations(n, r) {
    if (r < 0 || r > n) {
        return 0;
    }
    let permutationResult = 1;
    for (let currentFactor = 0; currentFactor < r; currentFactor++) {
        permutationResult *= (n - currentFactor);
    }
    return permutationResult;
}

function calculateCombinations(n, r) {
    if (r < 0 || r > n) {
        return 0;
    }
    if (r === 0 || r === n) {
        return 1;
    }
    if (r > n / 2) {
        r = n - r;
    }

    let combResult = 1;
    for (let currentFactor = 0; currentFactor < r; currentFactor++) {
        combResult = combResult * (n - currentFactor) / (currentFactor + 1);
    }
    return Math.round(combResult);
}