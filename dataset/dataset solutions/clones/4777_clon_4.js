'use strict';

const calculateCombinations = (topNumber, bottomNumber) => {
    if (bottomNumber < 0 || bottomNumber > topNumber) {
        return 0;
    }
    if (bottomNumber === 0 || bottomNumber === topNumber) {
        return 1;
    }
    if (bottomNumber > topNumber / 2) {
        bottomNumber = topNumber - bottomNumber;
    }
    let currentResult = 1;
    for (let currentFactor = 1; currentFactor <= bottomNumber; currentFactor++) {
        currentResult = currentResult * (topNumber - currentFactor + 1) / currentFactor;
    }
    return currentResult;
};

const determineSolutionCount = (maximumConstraint, targetSummation) => {
    const variableCount = 3;
    const individualMaxExceeded = maximumConstraint + 1;

    const termGroupOne = calculateCombinations(targetSummation + variableCount - 1, variableCount - 1);

    const termGroupTwo = calculateCombinations(variableCount, 1) *
                        calculateCombinations(targetSummation - individualMaxExceeded + variableCount - 1, variableCount - 1);

    const termGroupThree = calculateCombinations(variableCount, 2) *
                          calculateCombinations(targetSummation - 2 * individualMaxExceeded + variableCount - 1, variableCount - 1);

    const termGroupFour = calculateCombinations(variableCount, 3) *
                         calculateCombinations(targetSummation - 3 * individualMaxExceeded + variableCount - 1, variableCount - 1);

    const finalAccumulation = termGroupOne - termGroupTwo + termGroupThree - termGroupFour;
    return finalAccumulation;
};

const orchestrateComputation = (receivedData) => {
    const numericalComponents = receivedData.split(' ').map(Number);
    const upperLimit = numericalComponents[0];
    const objectiveValue = numericalComponents[1];

    const computedResult = determineSolutionCount(upperLimit, objectiveValue);
    console.log(computedResult);
};

orchestrateComputation(require('fs').readFileSync('/dev/stdin', 'utf-8'));