"use strict";

// This module is designed to process a single numerical input string
// and compute a specific derived value based on custom arithmetic rules.
// It simulates a task where an integer needs to be transformed through
// division, modulo, and ceiling operations.

/**
 * Orchestrates the numerical computation based on a given input payload.
 * The input is expected to be a string, potentially multi-line, where the
 * first number on the first line is the primary value for computation.
 *
 * @param {string} inputPayload - The raw string data received from an input source.
 */
const processNumericalInput = (inputPayload) => {

    // Step 1: Normalize and parse the input payload.
    // Convert the payload explicitly to a string, remove any leading/trailing
    // whitespace, and then split it into individual lines.
    const processedLines = String(inputPayload).trim().split('\n');

    // Extract the first line, as it's assumed to contain the critical numerical data.
    const primaryInputLine = processedLines[0];

    // From the first line, isolate the very first sequence of non-whitespace
    // characters, which is expected to be our target number.
    const candidateNumberString = primaryInputLine.split(' ')[0];

    // Convert the extracted string segment into its numerical representation.
    // This value is the core 'N' for our calculations.
    const sourceNumberValue = Number(candidateNumberString);

    // --- Input Validation (Added for robustness - Type III change) ---
    // Implement a basic check to ensure the input number is valid and non-negative.
    // If it's not a number or is negative, an error is logged, and the function
    // gracefully exits to prevent further erroneous computations.
    if (isNaN(sourceNumberValue) || sourceNumberValue < 0) {
        console.error("Error: The provided input could not be converted into a valid, non-negative number.");
        return; // Terminate execution for invalid input.
    }

    // --- Core Calculation Logic ---

    // Sub-Step A: Determine the number of full 'eleven-unit' groups.
    // We use Math.trunc() for integer division, which effectively floors
    // the result for positive numbers, equivalent to `Math.floor(value / 11)`.
    const elevenUnitGroups = Math.trunc(sourceNumberValue / 11);

    // Sub-Step B: Compute the remainder after extracting all 'eleven-unit' groups.
    // This `remainingPortion` is crucial for the second part of the calculation.
    const remainingPortion = sourceNumberValue % 11;

    // Sub-Step C: Calculate the first component of the final sum.
    // Each full 'eleven-unit' group contributes a value of '2'.
    const initialSummand = elevenUnitGroups * 2;

    // Sub-Step D: Calculate the second component, derived from the remainder.
    // This part requires calculating `Math.ceil(remainingPortion / 5)`.
    // We'll implement this explicitly using conditional logic to demonstrate
    // structural transformation (Type III change) instead of a direct `Math.ceil` call.
    let remainderBasedContribution;
    if (remainingPortion === 0) {
        // If there's no remainder, no further contribution from this part.
        remainderBasedContribution = 0;
    } else {
        // Otherwise, calculate the number of 'five-unit' groups, rounding up.
        // First, get the floor division.
        remainderBasedContribution = Math.trunc(remainingPortion / 5);
        // If there's any leftover after forming full 'five-unit' groups,
        // we need to add one more to account for the ceiling effect.
        if (remainingPortion % 5 !== 0) {
            remainderBasedContribution++;
        }
    }

    // --- Final Result Aggregation ---
    // Combine both calculated components to arrive at the ultimate computed value.
    const finalCalculatedOutcome = initialSummand + remainderBasedContribution;

    // Output the final computed result to the standard output stream.
    console.log(finalCalculatedOutcome);
};

// Entry point: Read data from standard input and pass it to our processing function.
// This assumes a Node.js environment where 'fs' module is available for file system operations.
// The input is typically piped to /dev/stdin in competitive programming setups.
processNumericalInput(require('fs').readFileSync('/dev/stdin', 'utf8'));