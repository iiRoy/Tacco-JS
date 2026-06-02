"use strict";
const fileSystem = require("fs");
const rawInputContent = fileSystem.readFileSync("/dev/stdin", "utf8");
let inputTokens = rawInputContent.split(/ |\n/);
let tokenPointer = 0;

const getNextInteger = () => {
    const tokenValue = inputTokens[tokenPointer++];
    return parseInt(tokenValue, 10);
};

const getIntegerArray = (count) => {
    const segment = inputTokens.slice(tokenPointer, tokenPointer + count);
    tokenPointer += count;
    return segment.map(val => parseInt(val, 10));
};

const computedResult = processData();
if (computedResult !== undefined) {
    console.log(String(computedResult));
}

function processData() {
    const arrayLength = getNextInteger();
    let currentArray = [0].concat(getIntegerArray(arrayLength));

    const zeroOutMultiples = (startIndex, limit, step, targetArray) => {
        for (let idx = startIndex; idx <= limit; idx += step) {
            targetArray[idx] = 0;
        }
    };

    for (let outerLoopIndex = 0; outerLoopIndex < arrayLength; outerLoopIndex++) {
        for (let innerLoopDivisor = arrayLength; innerLoopDivisor >= 1; innerLoopDivisor--) {
            let currentIterationSum = 0;
            const stepValue = innerLoopDivisor;

            for (let multipleIterator = innerLoopDivisor; multipleIterator <= arrayLength; multipleIterator += stepValue) {
                currentIterationSum += currentArray[multipleIterator];
            }

            if (currentIterationSum < 0) {
                zeroOutMultiples(innerLoopDivisor, arrayLength, stepValue, currentArray);
            }
        }
    }

    const finalSum = currentArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    return finalSum;
}
