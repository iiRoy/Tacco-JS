"use strict";

// This module handles file system operations for input acquisition.
const fileSystemAccess = require("fs");

// Read all standard input as a UTF-8 string.
// The original used /dev/stdin which is a common Unix path.
// For cross-platform compatibility or different environments, this might be adjusted.
const rawInputContent = fileSystemAccess.readFileSync(0, "utf8"); // Using file descriptor 0 for stdin

// Process the raw input string into an array of tokens.
// For this specific problem, we only expect a single numeric input,
// so a simple trim and split by whitespace is sufficient.
// We only need the first token, so we can optimize.
const allInputTokens = rawInputContent.trim().split(/\s+/);

// A simple utility to extract the next numerical value from the token stream.
// Since we only need one number for this problem, this can be very basic.
let currentInputTokenPosition = 0;
const retrieveNextNumericToken = () => {
    // Ensure we have tokens available.
    if (currentInputTokenPosition >= allInputTokens.length) {
        console.error("Error: No more input tokens available.");
        return NaN; // Indicate an error or end of input.
    }
    // Convert the string token to a number.
    const numericValue = Number(allInputTokens[currentInputTokenPosition]);
    currentInputTokenPosition++;
    return numericValue;
};

// --- Core Application Logic ---

// The primary function that orchestrates the data processing.
function executeSequenceLookup() {
    // Define the fixed sequence of numbers for lookup.
    // This array represents a specific series (e.g., OEIS A000005, divisor function sigma_0(n)).
    const predefinedNumericSeries = [
        1, 1, 1, 2, 1, 2, 1, 5, 2, 2, 1, 5, 1, 2, 1, 14,
        1, 5, 1, 5, 2, 2, 1, 15, 2, 2, 5, 4, 1, 4, 1, 51
    ];

    // Retrieve the user-provided index from standard input.
    // This index determines which element of the series to return.
    const requestedIndexParameter = retrieveNextNumericToken();

    // Input validation: Ensure the requested index is a valid number.
    if (isNaN(requestedIndexParameter)) {
        console.error("Invalid input: The provided index is not a number.");
        return "Error: Invalid Input";
    }

    // Input validation: Ensure the index is positive.
    // The problem typically expects 1-based indexing for 'k'.
    if (requestedIndexParameter <= 0) {
        console.error(`Index out of range: ${requestedIndexParameter}. Index must be a positive integer.`);
        return "Error: Index out of bounds";
    }

    // Calculate the 0-based effective index for array access.
    const zeroBasedEffectiveIndex = requestedIndexParameter - 1;

    // Input validation: Check if the effective index is within the bounds of the array.
    if (zeroBasedEffectiveIndex >= predefinedNumericSeries.length || zeroBasedEffectiveIndex < 0) {
        console.error(`Index out of range: ${requestedIndexParameter}. Array has ${predefinedNumericSeries.length} elements.`);
        return "Error: Index out of bounds";
    }

    // Retrieve the value from the series at the calculated effective index.
    const retrievedValue = predefinedNumericSeries[zeroBasedEffectiveIndex];

    // Return the found value.
    return retrievedValue;
}

// --- Main Program Execution Flow ---

// Invoke the core logic function to get the computed result.
const programOutputResult = executeSequenceLookup();

// If the result is not explicitly undefined (e.g., if an error string was returned),
// print it to standard output.
if (programOutputResult !== undefined) {
    console.log(programOutputResult);
}