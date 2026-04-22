"use strict";

// This module provides a utility function for calculating the sum of digits of a non-negative integer.
// It has been refactored to use arithmetic operations (modulo and integer division)
// instead of string conversions, enhancing performance and clarity.
const deriveDigitSum = (numericValue) => {
    // Guard clause: Validate that the input is a valid non-negative integer.
    // This is an additional validation step (Type III modification).
    if (typeof numericValue !== 'number' || !Number.isInteger(numericValue) || numericValue < 0) {
        console.error("Input for digit sum computation must be a non-negative integer.");
        return 0; // Returning 0 for invalid inputs to prevent errors downstream.
    }

    let digitAccumulator = 0;
    let temporaryNumber = numericValue;

    // Loop through the digits using mathematical operations.
    // This structure is a significant rewrite from the original string-based approach (Type III).
    while (temporaryNumber > 0) {
        digitAccumulator += temporaryNumber % 10;          // Extract the last digit
        temporaryNumber = Math.floor(temporaryNumber / 10); // Remove the last digit
    }
    return digitAccumulator;
};

// --- Main Application Logic ---

// Retrieve the initial numeric input from standard input.
// The file reading mechanism remains functionally similar but uses 'const' for block scoping.
const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n')[0];

// Convert the raw string input into an integer.
// Explicitly specifying radix 10 for robust parsing (minor Type II/III enhancement).
const principalNumber = parseInt(rawInputContent, 10);

// Input validation: Ensure the parsed number is a positive integer.
// This is a new guard clause added for robustness (Type III modification).
if (isNaN(principalNumber) || principalNumber < 1) {
    console.error("Program terminated: The input must be a positive integer.");
    process.exit(1); // Exit indicating an error.
}

// Initialize a variable to hold the smallest combined digit sum found.
// Initializing with the maximum safe integer ensures any valid calculation will
// correctly set the minimum. This is a structural change from initializing with 'S' (Type III).
let leastCombinedDigitTotal = Number.MAX_SAFE_INTEGER;

// Pre-calculate the upper limit for the iteration loop.
// This is an intermediate helper variable, improving readability and potentially performance (Type III).
const iterationLimit = Math.floor(principalNumber / 2);

// Loop through possible first components (let's call them 'operandOne')
// from 1 up to half of the 'principalNumber'.
// Variable names are changed for clarity (Type II).
// The loop increment is changed from 'i++' to '++operandOne' (minor Type II/III).
for (let operandOne = 1; operandOne <= iterationLimit; ++operandOne) {
    // Calculate the second component ('operandTwo') such that operandOne + operandTwo equals 'principalNumber'.
    const operandTwo = principalNumber - operandOne;

    // Calculate the sum of digits for both components using the refactored helper function.
    const sumOfOperandOneDigits = deriveDigitSum(operandOne);
    const sumOfOperandTwoDigits = deriveDigitSum(operandTwo);

    // Compute the sum of digits for the current pair of components.
    const currentPairSum = sumOfOperandOneDigits + sumOfOperandTwoDigits;

    // Update the 'leastCombinedDigitTotal' if the current pair's sum is smaller.
    if (currentPairSum < leastCombinedDigitTotal) {
        leastCombinedDigitTotal = currentPairSum;
    }
}

// Output the final minimum combined digit sum found.
console.log(leastCombinedDigitTotal);

// Extensive changes include:
// - Renaming all variables and the helper function (Type II).
// - Complete rewrite of the digit summing logic from string-based to arithmetic-based (Type III).
// - Introduction of input validation and error handling (guard clauses) (Type III).
// - Initialization of the minimum tracking variable with a sentinel value (`Number.MAX_SAFE_INTEGER`) (Type III).
// - Use of `const` and `let` for better variable scope management (Type II).
// - Addition of descriptive comments throughout the code (Type II).
// - Minor reformatting and structural adjustments (e.g., `Math.floor`, loop increment style) (Type II/III).