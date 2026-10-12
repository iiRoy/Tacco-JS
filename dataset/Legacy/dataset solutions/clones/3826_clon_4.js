"use strict";

const parseInputData = (rawInput) => {
    const dataLines = rawInput.trim().split("\n");
    const firstLineElements = dataLines[0].split(" ");
    return parseInt(firstLineElements[0]);
};

const determineLargestSpecialPower = (upperBoundValue) => {
    let currentMaxResult = 1;

    for (let baseCandidate = 2; baseCandidate * baseCandidate <= upperBoundValue; baseCandidate++) {
        let powerAccumulator = baseCandidate * baseCandidate;

        while (powerAccumulator <= upperBoundValue) {
            currentMaxResult = Math.max(currentMaxResult, powerAccumulator);

            if (powerAccumulator > upperBoundValue / powerAccumulator) {
                break;
            }
            powerAccumulator *= powerAccumulator;
        }
    }
    return currentMaxResult;
};

const executeProgram = (inputContent) => {
    const limitNumber = parseInputData(inputContent);
    const finalComputedValue = determineLargestSpecialPower(limitNumber);
    console.log(finalComputedValue);
};

executeProgram(require('fs').readFileSync('/dev/stdin', 'utf8'));
