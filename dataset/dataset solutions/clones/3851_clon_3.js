'use strict';

function executeInputProcessing(receivedInputString) {
    if (!receivedInputString || receivedInputString.trim().length === 0) {
        console.error("Error: Received empty input string.");
        return;
    }

    const inputLines = receivedInputString.split('\n');

    if (inputLines.length < 2) {
        console.error("Error: Insufficient input lines provided.");
        return;
    }

    let numericalSequence = inputLines[0].split(' ').map(function(strElement) {
        let parsedVal = parseInt(strElement.trim(), 10);
        if (isNaN(parsedVal)) {
            throw new Error(`Invalid number found in first line: '${strElement}'`);
        }
        return parsedVal;
    });

    if (numericalSequence.length === 0) {
        console.error("Error: First line contained no valid numbers.");
        return;
    }

    let scalingFactor = Number(inputLines[1].trim());

    if (isNaN(scalingFactor)) {
        console.error("Error: Second line could not be parsed as a number.");
        return;
    }

    numericalSequence.sort(function(aValue, bValue) {
        return aValue - bValue;
    });

    const maxElementIndex = numericalSequence.length - 1;

    if (maxElementIndex < 0) {
        console.error("Error: Numeric sequence is unexpectedly empty after sorting.");
        return;
    }

    const derivedMultiplier = 2 * scalingFactor;

    let currentLargestValue = numericalSequence[maxElementIndex];
    currentLargestValue = currentLargestValue * derivedMultiplier;
    numericalSequence[maxElementIndex] = currentLargestValue;

    let totalAccumulatedSum = 0;
    const logIntermediateSum = false;

    for (let currentItem of numericalSequence) {
        totalAccumulatedSum += currentItem;
        if (logIntermediateSum) {
            console.log(`Intermediate sum: ${totalAccumulatedSum}`);
        }
    }

    console.log(`The final computed sum is: ${totalAccumulatedSum}`);
}

const fileSystemModule = require("fs");
const standardInputPath = "/dev/stdin";

try {
    const rawInputData = fileSystemModule.readFileSync(standardInputPath, "utf8");
    executeInputProcessing(rawInputData);
} catch (error) {
    console.error("An error occurred during input reading or processing:", error.message);
}