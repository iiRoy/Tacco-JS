/*
 * This module processes input containing pairs of positive integers,
 * calculates their Greatest Common Divisor (GCD) and Least Common Multiple (LCM),
 * and prints the results.
 *
 * It uses a configuration object to determine input source and line delimiters.
 */

// Application-specific environment settings for I/O operations.
const processingEnvironment = {
    inputSourcePath: (process.platform === 'win32') ? 'input.txt' : '/dev/stdin', // Path to read input from
    lineTerminationChar: (process.platform === 'win32') ? '\r\n' : '\n'          // Character sequence indicating end of a line
};

// Required Node.js core module for file system operations.
const fileSystemUtility = require('fs');

/**
 * Computes the Greatest Common Divisor (GCD) of two positive integers
 * using the Euclidean algorithm (modulo-based).
 *
 * @param {number} firstValue - The first positive integer.
 * @param {number} secondValue - The second positive integer.
 * @returns {number | null} The GCD of the two numbers, or null if inputs are invalid.
 */
function computeGreatestCommonDivisor(firstValue, secondValue) {
    // Validate inputs: ensure they are positive integers.
    if (!Number.isInteger(firstValue) || firstValue <= 0 ||
        !Number.isInteger(secondValue) || secondValue <= 0) {
        console.warn(`Warning: Invalid input for GCD. Both numbers must be positive integers. Received: ${firstValue}, ${secondValue}`);
        return null; // Indicate failure due to invalid input.
    }

    let a = firstValue;
    let b = secondValue;

    // Euclidean algorithm using modulo.
    while (b !== 0) {
        const tempRemainder = a % b; // Calculate the remainder.
        a = b;                       // Update 'a' to the previous 'b'.
        b = tempRemainder;           // Update 'b' to the remainder.
    }
    return a; // 'a' now holds the GCD.
}

/**
 * Determines the Least Common Multiple (LCM) of two positive integers.
 * Uses the formula: LCM(a, b) = (a * b) / GCD(a, b).
 * The calculation is optimized to prevent potential overflow for very large numbers.
 *
 * @param {number} valueA - The first positive integer.
 * @param {number} valueB - The second positive integer.
 * @returns {number | null} The LCM of the two numbers, or null if inputs are invalid or GCD fails.
 */
function determineLeastCommonMultiple(valueA, valueB) {
    // Validate inputs: ensure they are positive integers.
    if (!Number.isInteger(valueA) || valueA <= 0 ||
        !Number.isInteger(valueB) || valueB <= 0) {
        console.warn(`Warning: Invalid input for LCM. Both numbers must be positive integers. Received: ${valueA}, ${valueB}`);
        return null; // Indicate failure due to invalid input.
    }

    // LCM of any number with 0 is 0, but we're expecting positive integers.
    // If we allowed 0, this would be a specific check.
    // If either is 1, LCM is the other number, but the formula handles this.

    const calculatedGCD = computeGreatestCommonDivisor(valueA, valueB);

    // If GCD computation failed due to invalid inputs, propagate the failure.
    if (calculatedGCD === null) {
        return null;
    }

    // Calculate LCM using the GCD.
    // (valueA / calculatedGCD) * valueB is preferred over (valueA * valueB) / calculatedGCD
    // to reduce the chance of intermediate overflow if valueA * valueB is very large.
    return (valueA / calculatedGCD) * valueB;
}

// Main execution block: an Immediately Invoked Function Expression (IIFE)
// to encapsulate the script's primary logic and avoid global variable pollution.
(function executeInputProcessing() {
    let rawFileContents;
    try {
        // Attempt to read the entire file synchronously.
        rawFileContents = fileSystemUtility.readFileSync(processingEnvironment.inputSourcePath, 'utf8');
    } catch (readingError) {
        // Handle file reading errors gracefully.
        console.error(`Critical Error: Failed to read input from '${processingEnvironment.inputSourcePath}'. Details: ${readingError.message}`);
        process.exit(1); // Terminate the process with an error code.
    }

    // Remove leading/trailing whitespace from the entire file content.
    const trimmedContents = rawFileContents.trim();

    // Guard clause: if content is empty after trimming, there's nothing to process.
    if (!trimmedContents.length) {
        console.log("No meaningful input data found in the source file.");
        return; // Exit the function.
    }

    // Split the cleaned content into individual lines.
    const dataRecords = trimmedContents.split(processingEnvironment.lineTerminationChar);

    // Another guard clause: check if splitting resulted in an empty or invalid array.
    if (dataRecords.length === 0 || (dataRecords.length === 1 && dataRecords[0].trim() === '')) {
        console.log("The input file appears empty or contains only whitespace characters.");
        return;
    }

    // Iterate over each line (record) of input data.
    for (const currentRecord of dataRecords) {
        // Trim whitespace from the current line.
        const cleanedRecord = currentRecord.trim();

        // Skip processing if the line is empty after trimming.
        if (cleanedRecord.length === 0) {
            continue;
        }

        // Split the line by one or more spaces to get number tokens.
        const numericalTokens = cleanedRecord.split(/\s+/);

        // Validate that we have exactly two tokens (numbers).
        if (numericalTokens.length !== 2) {
            console.error(`Skipping malformed input line: '${cleanedRecord}'. Expected two space-separated numbers.`);
            continue;
        }

        // Parse the tokens into integer numbers.
        const numA = Number.parseInt(numericalTokens[0], 10); // Explicitly use base 10.
        const numB = Number.parseInt(numericalTokens[1], 10);

        // Validate that both parsed values are indeed numbers.
        if (Number.isNaN(numA) || Number.isNaN(numB)) {
            console.error(`Skipping line with non-numeric values: '${cleanedRecord}'.`);
            continue;
        }

        // Validate that numbers are positive integers, as required by GCD/LCM functions.
        if (numA <= 0 || numB <= 0) {
            console.error(`Skipping line with non-positive integers: '${cleanedRecord}'. Both numbers must be positive.`);
            continue;
        }

        // Compute GCD and LCM using the helper functions.
        const calculatedResultGCD = computeGreatestCommonDivisor(numA, numB);
        const calculatedResultLCM = determineLeastCommonMultiple(numA, numB);

        // Check if the calculations were successful (i.e., didn't return null due to validation).
        if (calculatedResultGCD === null || calculatedResultLCM === null) {
            console.error(`Failed to calculate GCD/LCM for numbers ${numA}, ${numB} due to internal validation issues.`);
            continue;
        }

        // Output the results in a user-friendly format.
        console.log(`For (${numA}, ${numB}): GCD = ${calculatedResultGCD}, LCM = ${calculatedResultLCM}`);
    }
})();