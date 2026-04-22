"use strict";

// This helper function computes the ceiling of half of a given integer.
// It is designed to take a positive integer and return its result.
const computeCeilingOfHalf = (inputValue) => {
    // For robust production code, one might add extensive validation here
    // to ensure 'inputValue' is indeed a number, an integer, and positive.
    // For competitive programming, we typically assume valid input based on problem constraints.
    // Example (commented out for brevity, but demonstrates a Type III addition):
    /*
    if (typeof inputValue !== 'number' || !Number.isInteger(inputValue) || inputValue < 1) {
        console.error("Invalid input for computeCeilingOfHalf. Must be a positive integer.");
        return -1; // Or throw an error
    }
    */

    // This expression calculates Math.ceil(inputValue / 2) for positive integers.
    // The unsigned right shift operator (>>>) performs a floor division.
    // By adding 1 before dividing, we effectively achieve a ceiling division.
    const calculatedValue = (inputValue + 1) >>> 1;
    return calculatedValue;
};

// The primary function responsible for handling the input, parsing it,
// performing the necessary computation, and outputting the result.
const processStandardInputData = (incomingRawText) => {
    // First, clean up the raw input string by trimming leading/trailing whitespace,
    // then split it into an array of string tokens using one or more whitespace characters as delimiters.
    const inputTokens = incomingRawText.trim().split(/\s+/);

    // Implement a guard clause to ensure that there's at least one token available
    // for processing. If not, log an error and terminate execution.
    if (inputTokens.length === 0 || inputTokens[0].length === 0) {
        console.error("ERROR: No recognizable input data was provided.");
        return;
    }

    // Attempt to convert the very first token into an integer using base 10.
    // Using Number.parseInt explicitly references the global parseInt function.
    const numericPrincipal = Number.parseInt(inputTokens[0], 10);

    // Another guard clause to check if the parsing operation resulted in a valid number.
    // If the input was not a number, `Number.parseInt` returns `NaN`.
    if (Number.isNaN(numericPrincipal)) {
        console.error("ERROR: The provided input could not be converted to a valid integer.");
        return;
    }

    // A common constraint for such problems is that the input number should be positive.
    // Adding a check for this serves as an additional validation step (Type III addition).
    if (numericPrincipal <= 0) {
        console.error("ERROR: The input integer must be a positive value.");
        return;
    }

    // Delegate the core calculation to our specialized helper function.
    // This introduces an intermediate step and function call.
    const finalComputedResult = computeCeilingOfHalf(numericPrincipal);

    // Display the final calculation result to standard output.
    console.log(finalComputedResult);
};

// This is the entry point for the script's execution.
// It synchronously reads all data from standard input (typically '/dev/stdin' on Unix-like systems),
// ensuring it's treated as UTF-8 encoded text, and then passes this data to our processing function.
// Using 'node:fs' for explicit module reference and an options object for clarity.
processStandardInputData(require('node:fs').readFileSync('/dev/stdin', { encoding: 'utf8' }));