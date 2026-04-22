'use strict';

// A small utility to perform the specific XOR-then-modulo calculation for pairs.
// This function clarifies the operator precedence of the original expression:
// `valA ^ valB % divisor` is interpreted as `valA ^ (valB % divisor)`.
function computeXorWithModulusOnSecondTerm(firstOperand, secondOperand, modulusValue) {
    // Ensure operands are treated as numbers, though parseInt should handle this.
    const processedSecondOperand = secondOperand % modulusValue;
    return firstOperand ^ processedSecondOperand;
}

/**
 * Orchestrates the processing of raw input data to calculate a specific sum.
 * This function handles input parsing, validation, and the core summation logic.
 * @param {string} rawInputContent - The entire input content as a single string.
 */
function processNumericalDataSeries(rawInputContent) {
    // Define the constant divisor, often a large prime in competitive programming.
    // Renamed from 'mod' and reformatted for readability.
    const specificPrimeDivisor = 1_000_000_007;

    // --- Input Validation and Pre-processing ---
    if (typeof rawInputContent !== 'string' || rawInputContent.length === 0) {
        console.error("Input data is either missing or not a valid string. Aborting calculation.");
        return; // Halt execution if input is invalid.
    }

    // Split the input string into individual lines and clean whitespace.
    let contentLines = rawInputContent.trim().split('\n');

    // Basic check for expected number of input lines.
    if (contentLines.length < 2) {
        console.error("Insufficient lines in input data. Expected at least two lines.");
        return;
    }

    // --- Parsing the Number of Elements (N) ---
    const elementCountString = contentLines.shift(); // Extract and remove the first line
    let declaredElementCount;
    try {
        declaredElementCount = parseInt(elementCountString, 10);
        // Add a guard for non-positive or non-finite N.
        if (isNaN(declaredElementCount) || declaredElementCount < 0 || !Number.isFinite(declaredElementCount)) {
            throw new Error(`Parsed element count ('${elementCountString}') is invalid.`);
        }
    } catch (parseErr) {
        console.error(`Failed to parse the number of elements (N): ${parseErr.message}`);
        return;
    }

    // --- Parsing the Numeric Sequence ---
    const dataSequenceLine = contentLines[0]; // The actual sequence is on the second line.
    let numericalSeries = [];
    try {
        numericalSeries = dataSequenceLine.split(' ').map(strVal => {
            const parsedNum = parseInt(strVal, 10);
            if (isNaN(parsedNum)) {
                throw new Error(`Found a non-numeric token: '${strVal}'`);
            }
            return parsedNum;
        });
    } catch (dataMapErr) {
        console.error(`Error processing the numeric data series: ${dataMapErr.message}`);
        return;
    }

    // --- Data Integrity Check ---
    // Compare the declared count (N) with the actual length of the parsed series.
    // If they differ, log a warning and use the actual length for robustness.
    let effectiveElementCount = numericalSeries.length;
    if (declaredElementCount !== effectiveElementCount) {
        console.warn(`Mismatch: Declared element count (${declaredElementCount}) differs from actual series length (${effectiveElementCount}). Proceeding with actual length.`);
    }

    // --- Core Calculation Loop ---
    let totalAccumulatedResult = 0; // Renamed from 'ans', initialized for summation.

    // Iterate through each possible pair (outer element, inner element) where outerIndex < innerIndex.
    for (let outerIndex = 0; outerIndex < effectiveElementCount; outerIndex++) {
        // Retrieve the current outer value using a temporary variable for clarity.
        const currentPrimaryValue = numericalSeries[outerIndex];

        for (let innerIndex = outerIndex + 1; innerIndex < effectiveElementCount; innerIndex++) {
            // Retrieve the current inner value.
            const currentSecondaryValue = numericalSeries[innerIndex];

            // Calculate the term for the current pair using our helper function.
            // This makes the specific calculation `A ^ (B % M)` explicit.
            const termForPair = computeXorWithModulusOnSecondTerm(currentPrimaryValue, currentSecondaryValue, specificPrimeDivisor);

            // Add the calculated term to the running total.
            // Note: The problem implies the sum itself is not modulo-ed at each step,
            // only the individual terms before addition.
            totalAccumulatedResult += termForPair;
        }
    }

    // --- Final Output ---
    console.log(totalAccumulatedResult);
}

// --- Script Entry Point ---
// Reads input from standard input using Node.js file system module.
// Uses 'node:fs' for explicit module access, a modern Node.js convention.
processNumericalDataSeries(require('node:fs').readFileSync('/dev/stdin', 'utf8'));