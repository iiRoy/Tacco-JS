"use strict";

// This function serves as the primary entry point for processing input data.
const processInput = (inputData) => {
    // First, clean the input string by removing leading/trailing whitespace,
    // then split it into an array of strings based on newline characters.
    inputData = inputData.trim().split("\n");

    // Extract the first number from the first line of the processed input.
    // This number defines the upper limit for subsequent calculations.
    const limitVal = parseInt(inputData[0].split(" ")[0]);

    // Initialize a variable to store the final computed result.
    // It starts with a default value of 1.
    let resultValue = 1;

    // Begin the outer iteration, starting from 2 and continuing up to 'limitVal' (inclusive).
    for (let outerIndex = 2; outerIndex <= limitVal; outerIndex++) {
        // Start the inner iteration, from 1 up to the current value of 'outerIndex' (inclusive).
        for (let innerIndex = 1; innerIndex <= outerIndex; innerIndex++) {
            // A temporary variable to hold the value being manipulated in the inner loop.
            let currentVal = innerIndex;
            // A counter to track how many times the squaring operation is performed.
            let iterationCount = 0;

            // This loop repeatedly squares 'currentVal' as long as two conditions are met:
            // 1. 'currentVal' is strictly less than 'outerIndex'.
            // 2. 'innerIndex' is not equal to 1 (to prevent an infinite loop when starting with 1).
            while (currentVal < outerIndex && innerIndex !== 1) {
                currentVal = Math.pow(currentVal, 2); // Square the current temporary value.
                iterationCount++; // Increment the counter for each squaring operation.
            }

            // After the while loop, check if 'currentVal' has become equal to 'outerIndex'
            // AND if at least one squaring operation was performed (i.e., 'iterationCount' is not zero).
            if (currentVal === outerIndex && iterationCount !== 0) {
                // If both conditions are true, update 'resultValue' with the current 'outerIndex'.
                resultValue = outerIndex;
            }
        }
    }

    // Output the final determined 'resultValue' to the standard console.
    console.log(resultValue);
};

// Read the entire content of standard input as a UTF-8 string,
// then pass this string to the 'processInput' function for execution.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
