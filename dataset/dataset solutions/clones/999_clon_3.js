/*
 * This module is designed to process a sequence of numerical observations
 * from standard input, identifying the maximum possible positive difference
 * between any two distinct elements within a specified processing window.
 *
 * The input is expected to be a series of numbers, one per line.
 * The first number indicates the upper bound for the outer iteration count.
 * Subsequent numbers form the dataset for difference calculations.
 */

// Importing the Node.js file system module for synchronous file operations.
const fileSystemAccess = require('fs');

// Define the path for standard input, typically '/dev/stdin' on Unix-like systems.
const standardInputPath = '/dev/stdin';

// Read the entire content of the standard input file synchronously.
// The encoding is specified to ensure proper interpretation of characters.
let rawInputContent = fileSystemAccess.readFileSync(standardInputPath, { encoding: 'utf8' });

// --- Data Preparation Phase ---

// Remove any leading or trailing whitespace from the raw input string.
let trimmedInputText = rawInputContent.trim();

// Split the cleaned text into an array of individual lines, using the newline character as a delimiter.
let inputLineStrings = trimmedInputText.split('\n');

// Validate the presence of sufficient input data.
// At least two lines are required: one for the iteration constraint and one for an observation.
if (inputLineStrings.length < 2) {
    console.error("Error: Insufficient data provided via standard input. Expected at least two lines of numerical data.");
    process.exit(1); // Terminate the process with an error code.
}

// Convert each string line into an integer.
// Using `parseInt` with a radix (base 10) for robust numerical conversion.
let numericObservationSequence = inputLineStrings.map(str => parseInt(str.trim(), 10));

// Extract the first element, which defines the upper limit for the primary loop's iteration count.
let primaryLoopLimitIndicator = numericObservationSequence[0];

// Validate the integrity and value of the primary loop limit.
if (isNaN(primaryLoopLimitIndicator) || primaryLoopLimitIndicator < 1) {
    console.error("Error: The first input value is an invalid or non-positive number, which cannot serve as an iteration constraint.");
    process.exit(1);
}

// Create a subset of the numerical sequence, excluding the first element (the limit indicator).
// This `observationDataset` contains the values upon which calculations will be performed.
let observationDataset = numericObservationSequence.slice(1);

// Initialize a variable to track the highest difference found.
// Starting with `Number.MIN_SAFE_INTEGER` ensures that any valid difference (positive or negative)
// will correctly update this value.
let peakDifferenceValue = Number.MIN_SAFE_INTEGER;

// --- Core Algorithm: Identifying Maximum Spread ---

// Determine the actual upper bound for the outer loop.
// The original logic `i + 1 === n` implies the outer loop runs for `i` from `0` up to `n - 2`.
// If `n` is 1, the loop should not run. Thus, the limit is `max(0, n - 1)`.
const effectiveOuterLoopIterations = Math.max(0, primaryLoopLimitIndicator - 1);

// Outer loop: Iterates through the `observationDataset` using `primaryIdx` as the index.
// This loop is constrained by `effectiveOuterLoopIterations`.
for (let primaryIdx = 0; primaryIdx < effectiveOuterLoopIterations; ++primaryIdx) {
    // Add a defensive check to ensure `primaryIdx` is within the bounds of the actual dataset.
    // While `effectiveOuterLoopIterations` should prevent out-of-bounds access if `n` is sensible,
    // this adds robustness against very small `observationDataset`s or large `n`.
    if (primaryIdx >= observationDataset.length) {
        break;
    }

    // Retrieve the value corresponding to the current primary index.
    let firstOperandValue = observationDataset[primaryIdx];

    // Inner loop: Iterates through the entire `observationDataset` using `secondaryIdx`.
    for (let secondaryIdx = 0; secondaryIdx < observationDataset.length; ++secondaryIdx) {
        // Skip calculation if both indices are identical, as a difference with itself is not meaningful in this context.
        if (primaryIdx === secondaryIdx) {
            continue;
        }

        // Retrieve the value corresponding to the current secondary index.
        let secondOperandValue = observationDataset[secondaryIdx];

        // Calculate the difference between the two selected values.
        let currentCalculatedSpread = firstOperandValue - secondOperandValue;

        // Update `peakDifferenceValue` if the `currentCalculatedSpread` is greater.
        if (currentCalculatedSpread > peakDifferenceValue) {
            peakDifferenceValue = currentCalculatedSpread;
        }
    }
}

// Post-processing for output: If no valid differences were found (e.g., dataset too small,
// or all possible differences were negative, and `peakDifferenceValue` remains at its initial state),
// reset the result to 0 to align with typical problem expectations for non-positive outcomes.
if (peakDifferenceValue === Number.MIN_SAFE_INTEGER) {
    peakDifferenceValue = 0;
}

// A simple utility function to output the final result to the console.
function transmitFinalResult(valueToDisplay) {
    console.log(valueToDisplay);
}

// Display the determined maximum difference.
transmitFinalResult(peakDifferenceValue);