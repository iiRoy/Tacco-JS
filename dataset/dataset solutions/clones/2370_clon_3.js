"use strict";

// This module is designed to process a single numerical input, typically received as a string,
// and evaluate a specific mathematical relationship derived from its components.
// The objective is to determine if a condition based on the number's hundreds-part
// and its remainder-part holds true, outputting '1' for true and '0' for false.

/**
 * Performs a specialized numerical comparison on a string-based input value.
 * The process involves parsing, validating, decomposing the number into major and minor units,
 * and then applying a threshold comparison.
 *
 * @param {string} rawInputContent - The raw string content read from the input source.
 *                                   It is expected to represent a non-negative integer.
 * @returns {void} Outputs '1' or '0' to the console, or an error message if input is invalid.
 */
function performNumericalEvaluation(rawInputContent) {
    // Stage 1: Input Sanitization and Parsing
    // First, remove any leading/trailing whitespace (like newlines) from the input string.
    const trimmedInput = rawInputContent.trim();
    // Then, attempt to convert the cleaned string into an integer.
    const parsedNumericalValue = parseInt(trimmedInput, 10);

    // Stage 2: Input Validation - Guard Clauses
    // Verify if the parsing was successful and if the number is a valid non-negative integer.
    if (isNaN(parsedNumericalValue) || parsedNumericalValue < 0) {
        console.error("Input Error: The provided value must be a non-negative integer.");
        console.error(`Received problematic input: '${trimmedInput}'`);
        // Exit early if input is invalid to prevent further processing with bad data.
        return;
    }

    // Stage 3: Number Decomposition
    // We break down the numerical value into two principal components:
    // 1. The count of full hundreds (major units).
    // 2. The remaining value after removing all hundreds (minor units).
    const divisorForMajorUnits = 100; // Define the base for major unit calculation.

    // Calculate the number of full hundreds. Math.trunc ensures integer part.
    const hundredsCount = Math.trunc(parsedNumericalValue / divisorForMajorUnits);

    // Calculate the remainder using subtraction, which is an alternative to the modulo operator.
    const remainingUnits = parsedNumericalValue - (hundredsCount * divisorForMajorUnits);

    // Stage 4: Condition Threshold Calculation
    // A specific multiplier is applied to the 'hundredsCount' to establish a dynamic threshold.
    const comparisonFactor = 5; // This constant dictates the scaling of the hundreds component.

    // Compute the threshold against which the 'remainingUnits' will be compared.
    const calculatedThreshold = hundredsCount * comparisonFactor;

    // Stage 5: Core Logical Comparison
    // Determine if the 'remainingUnits' satisfy the established condition relative to the 'calculatedThreshold'.
    const isConditionMet = remainingUnits <= calculatedThreshold;

    // Stage 6: Result Formatting and Output
    // Convert the boolean outcome of the comparison into an integer (1 for true, 0 for false).
    const finalDecisionIndicator = isConditionMet ? 1 : 0;

    // Display the final indicator to standard output.
    console.log(finalDecisionIndicator);
}

// --- Application Entry Point ---
// This block handles reading input from the standard input stream and initiating the evaluation.
try {
    // Use Node.js 'fs' module to synchronously read the entire content of standard input.
    // "/dev/stdin" is the conventional path for standard input in Unix-like systems.
    const fileContents = require("fs").readFileSync("/dev/stdin", "utf8");

    // Invoke our primary processing function with the obtained input.
    performNumericalEvaluation(fileContents);

} catch (executionError) {
    // Catch and report any errors that occur during file reading or initial execution.
    console.error("An unhandled error occurred during script execution:");
    console.error(`Error details: ${executionError.message}`);
    // Optionally, exit with a non-zero status code to indicate failure.
    // process.exit(1);
}