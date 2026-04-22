const { readFileSync } = require('fs');
const { EOL } = require('os');

function acquireInputData() {
    const rawContent = readFileSync('/dev/stdin', 'utf8');
    const contentLines = rawContent.trim().split(EOL);
    return contentLines;
}

function prepareDataStructures(inputLines) {
    inputLines.shift();
    const primaryNumericArray = inputLines.shift().split(' ').map(Number);
    primaryNumericArray.sort((val1, val2) => val1 - val2);

    inputLines.shift();
    const secondaryNumericArray = inputLines.shift().split(' ').map(Number);
    const comparisonStrings = inputLines.shift().split(' ');

    return { primaryNumericArray, secondaryNumericArray, comparisonStrings };
}

function constructCumulativeSumMap(numericItems) {
    const sumMapping = new Map();
    let runningTotal = 0n;

    for (const itemValue of numericItems) {
        runningTotal += BigInt(itemValue);
        sumMapping.set(itemValue, runningTotal);
    }
    const distinctSortedKeys = Array.from(sumMapping.keys()).sort((k1, k2) => k1 - k2);
    return { sumMapping, distinctSortedKeys };
}

function determineEffectiveSum(queryKey, sumMap, sortedKeys) {
    if (sortedKeys.length === 0 || queryKey < sortedKeys[0]) {
        return 0n;
    }

    let lowPointer = 0;
    let highPointer = sortedKeys.length - 1;
    let bestFoundKey = 0;

    while (lowPointer <= highPointer) {
        const midPointer = Math.floor((lowPointer + highPointer) / 2);
        const currentKeyCandidate = sortedKeys[midPointer];

        if (currentKeyCandidate <= queryKey) {
            bestFoundKey = currentKeyCandidate;
            lowPointer = midPointer + 1;
        } else {
            highPointer = midPointer - 1;
        }
    }
    return sumMap.get(bestFoundKey) || 0n;
}

(function processInputAndComputeResults() {
    const allInputLines = acquireInputData();
    const { primaryNumericArray, secondaryNumericArray, comparisonStrings } = prepareDataStructures(allInputLines);

    const { sumMapping, distinctSortedKeys } = constructCumulativeSumMap(primaryNumericArray);

    const outputLines = [];

    for (let k = 0; k < secondaryNumericArray.length; k++) {
        const currentQueryValue = secondaryNumericArray[k];
        const stringForComparison = comparisonStrings[k];

        const resolvedSum = determineEffectiveSum(currentQueryValue, sumMapping, distinctSortedKeys);
        const targetValueAsBigInt = BigInt(stringForComparison);

        if (targetValueAsBigInt <= resolvedSum) {
            outputLines.push("Yes");
        } else {
            outputLines.push("No");
        }
    }
    console.log(outputLines.join(EOL));
})();