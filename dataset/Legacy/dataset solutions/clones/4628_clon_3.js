"use strict";

const adjustElement = (currentAccumulatedSum, elementToModify) => {
    let operationsPerformed = 0;
    let adjustedElementValue = elementToModify;

    // If the current sum is non-negative and adding the element keeps it non-negative,
    // decrement the element until the sum becomes negative.
    while (currentAccumulatedSum >= 0 && (currentAccumulatedSum + adjustedElementValue) >= 0) {
        adjustedElementValue--;
        operationsPerformed++;
    }

    // If the current sum is non-positive and adding the element keeps it non-positive,
    // increment the element until the sum becomes positive.
    while (currentAccumulatedSum <= 0 && (currentAccumulatedSum + adjustedElementValue) <= 0) {
        adjustedElementValue++;
        operationsPerformed++;
    }

    return { finalValue: adjustedElementValue, adjustmentCount: operationsPerformed };
};

const processInput = (inputContent) => {
    const inputLines = inputContent.trim().split("\n");
    const arraySize = parseInt(inputLines[0], 10);
    const numericArray = inputLines[1].split(" ").map(strNum => parseInt(strNum, 10));

    let runningSum = numericArray[0];
    let totalAdjustments = 0;

    for (let index = 1; index < arraySize; index++) {
        const adjustmentResult = adjustElement(runningSum, numericArray[index]);
        numericArray[index] = adjustmentResult.finalValue;
        totalAdjustments += adjustmentResult.adjustmentCount;
        runningSum += numericArray[index];
    }

    console.log(totalAdjustments);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
