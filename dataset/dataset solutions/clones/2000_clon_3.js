/*
 * This module is designed to ingest a string containing space-separated
 * numerical values, perform a specific rearrangement of the first three,
 * and then output the permuted sequence to the console. It includes
 * robust parsing and error handling for common input scenarios.
 */

/**
 * Safely parses a string token into an integer.
 * If parsing fails (NaN), it returns a specified default value.
 * @param {string} token - The string to parse.
 * @param {number} [fallbackValue=0] - The value to return if parsing fails.
 * @returns {number} The parsed integer or the fallback value.
 */
const convertToInteger = (token, fallbackValue = 0) => {
    const numericValue = parseInt(token, 10);
    return isNaN(numericValue) ? fallbackValue : numericValue;
};

/**
 * Processes an input string, extracts numerical values,
 * applies a specific permutation, and prints the result.
 * @param {string} rawInputString - The raw string input containing numbers.
 */
function processValuePermutation(rawInputString) {
    // Validate the initial input string for existence and type.
    if (typeof rawInputString !== 'string' || rawInputString.length === 0) {
        console.error("Error: Provided input data is either not a string or is empty.");
        // In a real application, you might throw an error or handle it more gracefully.
        return;
    }

    // Clean up the input string by trimming whitespace and splitting by one or more spaces.
    const normalizedInput = rawInputString.trim();
    const valueSegments = normalizedInput.split(/\s+/);

    // Ensure there are enough segments to perform the operation.
    const EXPECTED_SEGMENTS = 3;
    if (valueSegments.length < EXPECTED_SEGMENTS) {
        console.error(`Error: Insufficient numerical values. Expected at least ${EXPECTED_SEGMENTS}, but received ${valueSegments.length}.`);
        return;
    }

    // Parse the first three segments into distinct numerical variables.
    let itemAlpha = convertToInteger(valueSegments[0]);
    let itemBeta = convertToInteger(valueSegments[1]);
    let itemGamma = convertToInteger(valueSegments[2]);

    // --- Perform the first rearrangement step ---
    // Exchange the values of itemAlpha and itemBeta using a temporary placeholder.
    let temporaryStorage = itemAlpha;
    itemAlpha = itemBeta;
    itemBeta = temporaryStorage;

    // --- Perform the second rearrangement step ---
    // Exchange the current value of itemAlpha (which now holds original itemBeta)
    // with itemGamma, again using the temporary placeholder.
    temporaryStorage = itemAlpha; // Re-use the temporary variable
    itemAlpha = itemGamma;
    itemGamma = temporaryStorage;

    // Construct the final output string using string interpolation.
    // The sequence after permutations will be original_gamma, original_alpha, original_beta.
    const resultString = `${itemAlpha} ${itemBeta} ${itemGamma}`;

    // Display the rearranged sequence to the standard output.
    console.log(resultString);
}

/**
 * Handles the application's entry point, including file I/O.
 * This function is responsible for reading input and invoking the main processing logic.
 */
const executeApplicationLogic = () => {
    try {
        // Read the entire content of standard input as a UTF-8 string.
        const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
        // Pass the read content to the core processing function.
        processValuePermutation(fileContent);
    } catch (fileReadError) {
        // Log an error if reading from /dev/stdin fails.
        console.error(`Application encountered an I/O error while reading from /dev/stdin: ${fileReadError.message}`);
        // Depending on requirements, you might exit with a non-zero code or try a default input.
        // For instance, for testing, you might call: processValuePermutation("10 20 30");
    }
};

// Initiate the application's execution flow.
executeApplicationLogic();