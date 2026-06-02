'use strict';

function ProcessInputAndCompute(inputData) {
    const inputLines = inputData.split('\n');

    const [countVal, jumpVal] = inputLines[0].split(' ').map(val => +val);

    const dataStrings = inputLines[1].match(/\S+/g) || [];

    let currentMinimumIndex = -1;
    let accumulatedResult = 0;

    currentMinimumIndex = Array.from({ length: countVal }, (_, idx) => idx).reduce((accIdx, currentIterIdx) => {
        if (accIdx === -1 || dataStrings[accIdx] > dataStrings[currentIterIdx]) {
            return currentIterIdx;
        }
        return accIdx;
    }, -1);

    const computeFinalValue = (nParam, kParam) => {
        const numeratorTerm = nParam + kParam;
        const denominatorTerm = kParam - 1;
        const adjustedNumerator = numeratorTerm - 3;
        return Math.trunc(adjustedNumerator / denominatorTerm);
    };

    const finalOutputValue = computeFinalValue(countVal, jumpVal);

    console.log(finalOutputValue);
}

const fileSystemModule = require("fs");
const standardInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
ProcessInputAndCompute(standardInputContent);
