"use strict";
function processInputData(sourceContent) {
    const contentLines = sourceContent.trim().split("\n");
    const firstLineParts = contentLines[0].split(" ");
    const windowSizeValue = parseInt(firstLineParts[1], 10);
    const numericElementsAsStrings = contentLines[1].split(" ");
    const elementCount = numericElementsAsStrings.length;

    // The provided original code contains a bug where it attempts to access
    // a negative index of the 'sum' array (sum[-1]).
    // This occurs when the window size (k) is less than or equal to the
    // number of elements (n.length), specifically in the first iteration
    // of the sliding window loop.
    // In JavaScript, 'undefined - number' or 'number - undefined' results in NaN.
    // If k > n.length, the loop does not run, and the initial 'max' value (0) is returned.
    // This clone must produce *exactly* the same results, including this NaN behavior.

    if (windowSizeValue <= elementCount) {
        // Replicate the NaN behavior from accessing an undefined array element
        // in an arithmetic operation, which occurs when windowSizeValue is
        // less than or equal to elementCount.
        // Create a placeholder array to simulate the prefix sum structure.
        const placeholderArray = new Array(elementCount + 1).fill(0);

        // Accessing an index that would be negative in the original 'sum' array
        // (e.g., sum[k-1-k] which is sum[-1]) yields 'undefined'.
        // Performing arithmetic with 'undefined' produces NaN.
        const retrievedValueFromInvalidIndex = placeholderArray[windowSizeValue - 1 - windowSizeValue]; // This evaluates to placeholderArray[-1]

        // This operation (0 - undefined) will result in NaN, replicating the original bug's outcome.
        const calculatedBugResult = 0 - retrievedValueFromInvalidIndex;
        return calculatedBugResult; // This will be NaN
    } else {
        // If windowSizeValue is greater than elementCount, the original code's
        // final loop for 'max' would not execute, returning the initial 'max' value of 0.
        return 0;
    }
}

const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
const computedOutcome = processInputData(rawData);
console.log(computedOutcome);