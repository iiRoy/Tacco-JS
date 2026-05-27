'use strict';

const deriveAdjustedSequence = (sourceNumbers) => {
    const transformed = [];
    let currentPosition = 0;
    const limit = sourceNumbers.length;
    while (currentPosition < limit) {
        transformed[currentPosition] = parseInt(sourceNumbers[currentPosition]) - (currentPosition + 1);
        currentPosition++;
    }
    return transformed;
};

const determineTotalDiscrepancy = (sourceNumbers, centralValue) => {
    let accumulatedDiscrepancy = 0;
    for (let currentPosition = 0; currentPosition < sourceNumbers.length; currentPosition++) {
        accumulatedDiscrepancy += Math.abs(parseInt(sourceNumbers[currentPosition]) - (centralValue + currentPosition + 1));
    }
    return accumulatedDiscrepancy;
};

const rawInputLines = require("fs").readFileSync("/dev/stdin", "utf8").split("\n");
const itemCount = parseInt(rawInputLines[0]);
const originalValues = rawInputLines[1].split(" ");

const adjustedValues = deriveAdjustedSequence(originalValues);
adjustedValues.sort((valA, valB) => valA - valB);

const centralPoint = Math.floor(itemCount / 2);
const calculatedMedian = adjustedValues[centralPoint];

const minimumDeviation = determineTotalDiscrepancy(originalValues, calculatedMedian);

console.log(minimumDeviation);
