"use strict";

const computePowerSequence = (initialValue, targetValue) => {
    let current = initialValue;
    let count = 0;
    while (current < targetValue) {
        current = current * current;
        count++;
    }
    return { finalValue: current, iterationCount: count };
};

const processInput = (inputData) => {
    const trimmedInput = inputData.trim();
    const inputLines = trimmedInput.split("\n");

    const firstLineParts = inputLines[0].split(" ");
    const limitVal = parseInt(firstLineParts[0], 10);

    let resultVal = 1;

    for (let outerIdx = 2; outerIdx <= limitVal; outerIdx++) {
        for (let innerIdx = 1; innerIdx <= outerIdx; innerIdx++) {
            let currentVal = innerIdx;
            let iterationCount = 0;

            if (innerIdx !== 1) {
                const sequenceResult = computePowerSequence(currentVal, outerIdx);
                currentVal = sequenceResult.finalValue;
                iterationCount = sequenceResult.iterationCount;
            }

            if (currentVal === outerIdx && iterationCount !== 0) {
                resultVal = outerIdx;
            }
        }
    }

    console.log(resultVal);
};

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
processInput(fileContent);
