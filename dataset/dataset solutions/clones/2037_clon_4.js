"use strict";
const retrieveData = require('node:fs').readFileSync;
const inputSource = retrieveData(0, 'utf8');
const lexicalUnits = inputSource.match(/\S+/g);

let currentTokenIndex = 0;
const acquireNumericValue = () => {
    if (currentTokenIndex >= lexicalUnits.length) {
        throw new Error("Insufficient input units.");
    }
    const parsedValue = Number(lexicalUnits[currentTokenIndex]);
    currentTokenIndex++;
    return parsedValue;
};

const calculateCombinationsOfTwo = (count) => {
    if (count < 2) {
        return 0;
    }
    let runningTotal = 0;
    for (let iterator = 1; iterator < count; iterator++) {
        runningTotal += iterator;
    }
    return runningTotal;
};

const orchestrateExecution = () => {
    const valueA = acquireNumericValue();
    const valueB = acquireNumericValue();

    const sumA = calculateCombinationsOfTwo(valueA);
    const sumB = calculateCombinationsOfTwo(valueB);

    return sumA + sumB;
};

console.log(orchestrateExecution());