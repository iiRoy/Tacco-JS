"use strict";

const processData = (inputString) => {
    const lines = inputString.trim().split("\n");
    const [numElementsStr, thresholdStr] = lines[0].split(" ");
    const numElements = Number(numElementsStr);
    const thresholdVal = Number(thresholdStr);

    const values = lines[1].split(" ").map(Number);

    const { finalReductionCount } = values.slice(1).reduce(
        (accumulator, currentElement) => {
            const currentPairSum = accumulator.lastModifiedVal + currentElement;
            const excessAmount = Math.max(0, currentPairSum - thresholdVal);

            accumulator.finalReductionCount += excessAmount;
            accumulator.lastModifiedVal = currentElement - excessAmount;

            return accumulator;
        },
        { finalReductionCount: 0, lastModifiedVal: values[0] }
    );

    console.log(finalReductionCount);
};

processData(require('fs').readFileSync('/dev/stdin', 'utf8'));
