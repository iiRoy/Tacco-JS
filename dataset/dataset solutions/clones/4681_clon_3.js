// This module provides a utility to determine the smallest integer 'k'
// such that the sum of natural numbers from 1 to 'k' is greater than or
// equal to a specified target value.

/**
 * Validates if a given value can be interpreted as a positive integer threshold.
 * @param {string} valueToCheck - The string value to validate.
 * @returns {number | null} The validated positive integer, or null if invalid.
 */
const validatePositiveInteger = (valueToCheck) => {
    // Attempt to convert the string into a base-10 integer.
    const parsedValue = Number.parseInt(valueToCheck, 10);

    // Check if the parsing resulted in a valid number, and if it's positive.
    if (Number.isNaN(parsedValue) || parsedValue <= 0) {
        // Log a warning for invalid input.
        console.error(`Warning: Invalid or non-positive input detected: "${valueToCheck}". Must be a positive integer.`);
        return null; // Indicate failure to validate.
    }
    return parsedValue; // Return the successfully validated integer.
};

/**
 * Reads content from a specified file path, processes it, and returns an array of lines.
 * @param {string} filePath - The path to the file to be read.
 * @returns {string[]} An array where each element is a line from the file, trimmed of whitespace.
 */
const readInputFileContents = (filePath) => {
    try {
        // Use Node.js 'fs' module to synchronously read the file.
        const fileBuffer = require('fs').readFileSync(filePath, 'utf8');
        // Trim leading/trailing whitespace from the entire content and split into lines.
        const linesArray = fileBuffer.trim().split("\n");
        return linesArray;
    } catch (ioError) {
        // Handle potential file system errors, such as file not found.
        console.error(`Error during file read operation from ${filePath}:`, ioError.message);
        // Return an empty array or re-throw, depending on desired error handling strategy.
        return [];
    }
};

/**
 * Computes the smallest positive integer 'k' such that the sum of 1 to 'k'
 * is greater than or equal to a given numerical threshold.
 * This effectively solves for 'k' in the inequality: k * (k + 1) / 2 >= N.
 * @param {string[]} sourceDataLines - An array of strings, where the first element
 *                                   is expected to be the numerical threshold.
 * @returns {void} The function prints the computed 'k' value to the console.
 */
function determineMinimumSequenceSumTerm(sourceDataLines) {
    // Ensure that sourceDataLines is an array and not empty.
    if (!Array.isArray(sourceDataLines) || sourceDataLines.length === 0) {
        console.error("Error: No data lines provided for processing.");
        return; // Exit if no data is available.
    }

    // Extract the primary threshold value from the first line of input.
    const numericThresholdString = sourceDataLines[0];

    // Validate the extracted string to ensure it's a positive integer.
    const requiredSumThreshold = validatePositiveInteger(numericThresholdString);

    // If validation fails, terminate execution of this function.
    if (requiredSumThreshold === null) {
        console.error("Cannot proceed: Invalid threshold value detected.");
        return;
    }

    // Initialize variables for the cumulative sum and the current term in the sequence.
    let currentSequenceTerm = 0;       // Represents 'k' in 1 + 2 + ... + k
    let accumulatedValue = 0;          // Represents the sum 1 + 2 + ... + currentSequenceTerm

    // Loop until the accumulated sum meets or exceeds the required threshold.
    // This is an iterative approach to find 'k'.
    while (accumulatedValue < requiredSumThreshold) {
        currentSequenceTerm++; // Increment the term number.
        accumulatedValue += currentSequenceTerm; // Add the new term to the running total.
    }

    // Store the final computed term before logging for potential further processing.
    const finalResultTerm = currentSequenceTerm;

    // Output the result to the standard console.
    console.log(finalResultTerm);
}

// --- Execution Block ---
// Define a constant for the standard input file path.
const STANDARD_INPUT_PATH = '/dev/stdin';

// Read the raw input data from the specified path.
const rawInputContent = readInputFileContents(STANDARD_INPUT_PATH);

// Process the acquired raw data to determine and print the result.
determineMinimumSequenceSumTerm(rawInputContent);