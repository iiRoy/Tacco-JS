"use strict";

// This module encapsulates a specific computational logic.
// It processes a single line of numerical input to determine a boolean outcome,
// represented by '1' for true and '0' for false.
const processInputData = (rawInputText) => {
    // Normalize the incoming text: strip leading/trailing whitespace
    // and split into an array of lines, accommodating various newline characters.
    const parsedInputLines = rawInputText.trim().split(/\r?\n/);

    // Initial validation: check if the input is empty or malformed.
    // An empty input line suggests an unprocessable state.
    if (parsedInputLines.length === 0 || parsedInputLines[0].length === 0) {
        console.log(0); // Output '0' for invalid or missing primary input.
        return;
    }

    // Retrieve the primary numerical string from the first line of input.
    const inputNumericString = parsedInputLines[0];

    // Convert the string representation of the number into an actual numeric type.
    const numericalBaseValue = Number(inputNumericString);

    // Implement a preliminary guard clause:
    // If the input is not a valid number or falls below a predefined minimum threshold,
    // the process terminates immediately with a 'failure' indication.
    if (isNaN(numericalBaseValue) || numericalBaseValue < 100) {
        console.log(0); // Indicate an insufficient or invalid numerical input.
        return;
    }

    // Extract the final two characters from the input string.
    // These characters are crucial for a specific part of the calculation.
    const lastTwoChars = inputNumericString.slice(-2);
    // Convert these two characters into an integer, representing the suffix value.
    const twoDigitSuffixValue = parseInt(lastTwoChars, 10);

    // Preserve the original two-digit suffix for a later stage of computation.
    // This value acts as a constant in the final formula.
    const originalSuffixConstant = twoDigitSuffixValue;

    // Handle a special case: if the extracted two-digit suffix is zero,
    // a specific outcome is pre-determined, bypassing further complex calculations.
    if (twoDigitSuffixValue === 0) {
        console.log(1); // A zero suffix often implies a 'success' condition.
        return;
    }

    // Calculate the required number of reduction operations.
    // This calculation efficiently replaces a series of iterative subtractions
    // by determining how many 'groups of five' (or partial groups) are needed
    // to reduce the suffix value to zero. Math.ceil ensures any remainder
    // triggers an additional operation.
    const calculatedReductionOperations = Math.ceil(originalSuffixConstant / 5);

    // Compute a derived threshold value based on the reduction operations
    // and the original suffix constant. This value is then used for the
    // ultimate comparison against the initial input.
    const derivedComparisonValue = (100 * calculatedReductionOperations) + originalSuffixConstant;

    // Final decision point: compare the derived value with the base input value.
    // The result dictates whether the overall condition is met.
    if (derivedComparisonValue <= numericalBaseValue) {
        console.log(1); // The condition is satisfied.
    } else {
        console.log(0); // The condition is not satisfied.
    }
};

// Standard boilerplate for reading input from stdin in a Node.js environment.
// The entire content of '/dev/stdin' is read as a UTF-8 string and
// then passed to the main processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));