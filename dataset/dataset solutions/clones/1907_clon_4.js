"use strict";

const fileContent = require("node:fs").readFileSync("/dev/stdin", "utf8");
const numericalTokens = fileContent.split(/\s+/).filter(Boolean).map(Number);

// The initial token from the input typically represents a count 'N',
// which is not directly utilized in the problem's core calculation.
// We proceed with the sequence of numbers following this initial token.
const sequenceElements = numericalTokens.slice(1);

const sumIndexAndValueFrequencies = sequenceElements.reduce((mapOfSums, currentElement, elementIndex) => {
    const keySum = elementIndex + currentElement;
    mapOfSums.set(keySum, (mapOfSums.get(keySum) || 0) + 1);
    return mapOfSums;
}, new Map());

const diffIndexAndValueFrequencies = sequenceElements.reduce((mapOfDiffs, currentElement, elementIndex) => {
    const keyDiff = elementIndex - currentElement;
    mapOfDiffs.set(keyDiff, (mapOfDiffs.get(keyDiff) || 0) + 1);
    return mapOfDiffs;
}, new Map());

let finalTally = 0;

sumIndexAndValueFrequencies.forEach((countFromSum, sharedIdentifier) => {
    if (diffIndexAndValueFrequencies.has(sharedIdentifier)) {
        finalTally += countFromSum * diffIndexAndValueFrequencies.get(sharedIdentifier);
    }
});

console.log(finalTally);