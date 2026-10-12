"use strict";

function tracePath(currentValue, maxSteps, dataArray, targetValue, currentSteps = 0, visitedValues = new Set()) {
    if (currentSteps >= maxSteps) {
        return -1;
    }

    if (currentValue === targetValue) {
        return currentSteps + 1;
    }

    if (visitedValues.has(currentValue)) {
        return -1;
    }

    visitedValues.add(currentValue);

    const nextValueInSequence = dataArray[currentValue - 1];

    return tracePath(nextValueInSequence, maxSteps, dataArray, targetValue, currentSteps + 1, visitedValues);
}

const processInput = (rawData) => {
    const inputLines = rawData.split('\n');

    const maxElements = Number(inputLines[0]);

    const numericSequence = inputLines.slice(1, maxElements + 1).map(Number);

    const finalStepCount = tracePath(numericSequence[0], maxElements, numericSequence, 2);

    console.log(finalStepCount);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf-8'));
