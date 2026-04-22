"use strict";

const processInputData = (rawTextualInput) => {
    const recordLines = rawTextualInput.trim().split("\n");

    const initialParameters = recordLines[0].split(" ");
    // The first parameter (N) is not directly used in the logic, only for slicing input.
    const targetAccumulation = parseInt(initialParameters[1], 10);

    const dataComponents = recordLines.slice(1).map(entryLine => {
        const valueParts = entryLine.split(" ");
        return [parseInt(valueParts[0], 10), parseInt(valueParts[1], 10)]; // [identifier, quantity]
    });

    let currentRunningSum = 0;
    let finalResultIdentifier = null;

    dataComponents.some(componentTuple => {
        currentRunningSum += componentTuple[1]; // Add the quantity part
        if (currentRunningSum >= targetAccumulation) {
            finalResultIdentifier = componentTuple[0]; // Capture the identifier part
            return true; // Signal to stop iteration
        }
        return false; // Continue iterating
    });

    console.log(finalResultIdentifier);
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));