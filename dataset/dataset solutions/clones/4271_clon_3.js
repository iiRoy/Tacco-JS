'use strict'; // Enforce strict parsing and error handling for robust code.

/**
 * Parses a numeric value from the beginning of a given string line.
 * It expects the number to be the first space-separated token.
 *
 * @param {string} inputLine - The string line to parse.
 * @returns {number | null} The parsed numeric value, or null if parsing fails.
 */
const parseLeadingNumericValue = (inputLine) => {
    // Remove leading/trailing whitespace and split the line by spaces.
    const tokens = inputLine.trim().split(' ');

    // Ensure there's at least one token to attempt conversion.
    if (tokens.length === 0 || tokens[0] === '') {
        return null; // No valid token found.
    }

    // Attempt to convert the first token to a number.
    const numericForm = Number(tokens[0]);

    // Check if the conversion resulted in a valid, finite number.
    if (isNaN(numericForm) || !isFinite(numericForm)) {
        return null; // Conversion failed or resulted in non-finite number.
    }

    return numericForm;
};


/**
 * Processes a multi-line input string to extract two numbers,
 * performs a specific arithmetic operation, and logs the result.
 *
 * @param {string} sourceDataString - The raw string data received from input.
 */
const processInputValues = (sourceDataString) => {
    // Define a constant for the multiplication factor, improving clarity.
    const CALCULATION_MULTIPLIER = 2;

    // Split the entire input string into individual lines.
    const separateLines = sourceDataString.split('\n');

    // --- Input Validation: Minimum lines ---
    // Ensure that there are enough lines to extract both required numbers.
    if (separateLines.length < CALCULATION_MULTIPLIER) { // We need at least 2 lines.
        console.error("Input Error: Not enough lines provided. Expected at least two numeric lines.");
        return; // Terminate execution if input is malformed.
    }

    // Extract and parse the first number from the very first line.
    const firstValue = parseLeadingNumericValue(separateLines[0]);
    // Extract and parse the second number from the second line.
    const secondValue = parseLeadingNumericValue(separateLines[1]);

    // --- Input Validation: Numeric values ---
    // Check if both extracted values are valid numbers.
    if (firstValue === null || secondValue === null) {
        console.error("Input Error: Could not parse valid numbers from the first two lines.");
        return; // Terminate if parsing failed for either number.
    }

    // --- Core Calculation Logic ---
    // Step 1: Multiply the second value by the defined constant.
    const intermediateProduct = secondValue * CALCULATION_MULTIPLIER;
    // Step 2: Subtract the first value from the intermediate product.
    const finalCalculatedResult = intermediateProduct - firstValue;

    // Output the final computed result to the console.
    console.log(finalCalculatedResult);
};

// --- Application Entry Point ---
// This block is responsible for reading data from standard input
// and initiating the primary processing function.
try {
    // Read the entire content of standard input as a UTF-8 encoded string.
    const stdinContentBuffer = require('node:fs').readFileSync('/dev/stdin', 'utf8');
    // Pass the acquired content to our processing function.
    processInputValues(stdinContentBuffer);
} catch (executionIssue) {
    // If any error occurs during input reading or initial setup, log it.
    console.error("An unexpected issue occurred during program execution:", executionIssue.message);
    // Optionally, exit with a non-zero status code to indicate failure.
    // process.exit(1);
}