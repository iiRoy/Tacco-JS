"use strict";

function processInputData(rawData) {
    const lineSegments = rawData.split("\n");
    const elementCount = Number(lineSegments[0]);

    const numericalEntries = lineSegments.slice(1, elementCount + 1).map(Number);

    if (numericalEntries.length === 0) {
        // Based on problem constraints (elementCount >= 1), this path should not be taken.
        // If it were, the original code would not enter the main loop, so no output.
        return;
    }

    if (numericalEntries.length === 1) {
        // If only one number exists, removing it results in an empty array.
        // Math.max on an empty array returns -Infinity.
        numericalEntries.forEach(() => {
            console.log(-Infinity);
        });
        return;
    }

    const sortedNumericalEntries = [...numericalEntries].sort((valA, valB) => valB - valA);
    const greatestValue = sortedNumericalEntries[0];
    const nextGreatestValue = sortedNumericalEntries[1];

    numericalEntries.forEach((currentEntry) => {
        if (currentEntry === greatestValue) {
            // If the current number is the overall greatest,
            // the maximum of the remaining numbers is the second greatest.
            console.log(nextGreatestValue);
        } else {
            // If the current number is not the overall greatest,
            // the overall greatest number is still the maximum of the remaining.
            console.log(greatestValue);
        }
    });
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
