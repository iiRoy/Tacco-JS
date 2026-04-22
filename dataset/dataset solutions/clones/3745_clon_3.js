'use strict'; // Enforce strict parsing and error handling for cleaner code.

/**
 * Helper function to safely parse a string into an integer.
 * This function attempts to convert a given string token into a base-10 integer.
 * It returns the parsed number or NaN if the string cannot be converted.
 *
 * @param {string} tokenString - The string representation of a number to parse.
 * @returns {number} The parsed integer, or NaN if the string is not a valid number.
 */
const retrieveNumericValue = (tokenString) => {
    const parsedIntegral = parseInt(tokenString, 10); // Use radix 10 for decimal parsing.
    return parsedIntegral; // Returns NaN if parsing fails.
};

/**
 * Executes the primary logic of the application. This involves processing raw text input,
 * extracting numeric components, validating them against a predefined threshold, and
 * then printing a success or failure message to the console.
 *
 * @param {string} sourceTextContent - The raw text input received, expected to contain
 *                                     numeric values separated by spaces and newlines.
 */
const processInputValues = (sourceTextContent) => {
    // --- Configuration Constants ---
    const MAXIMUM_ALLOWED_VALUE = 8;     // The upper limit for both numeric components to be considered "Yay!".
    const FAILURE_INDICATION = ':(';     // The message to display when any constraint is violated.
    const SUCCESS_INDICATION = 'Yay!';   // The message to display when all constraints are met.

    // 1. Initial Input Transformation: Convert raw text into structured segments.
    // The input is first split by newline characters to separate lines.
    // Each resulting line string is then further split by space characters to get individual tokens.
    const lineSegments = sourceTextContent
        .split('\n') // Breaks the input into an array of lines.
        .map(currentLineString => currentLineString.split(' ')); // Splits each line into tokens.

    // 2. Robust Input Structure Validation (Guard Clause):
    // Checks if there's at least one line and if that first line contains at least two tokens.
    // This prevents errors from trying to access non-existent array elements.
    if (!lineSegments || lineSegments.length === 0 || lineSegments[0].length < 2) {
        console.log(FAILURE_INDICATION); // Log failure if input structure is insufficient.
        return; // Terminate execution early as valid data cannot be extracted.
    }

    // 3. Extract and Parse Numeric Components:
    // Attempts to convert the first two tokens from the first line into integers using the helper.
    const firstNumericComponent = retrieveNumericValue(lineSegments[0][0]);
    const secondNumericComponent = retrieveNumericValue(lineSegments[0][1]);

    // 4. Numeric Value Validation (Guard Clause):
    // Verifies that both parsed components are indeed valid numbers (not NaN).
    // If either conversion failed, the input was not correctly formatted.
    if (isNaN(firstNumericComponent) || isNaN(secondNumericComponent)) {
        console.log(FAILURE_INDICATION); // Log failure if numeric parsing was unsuccessful.
        return; // Terminate early as invalid numbers were provided.
    }

    // 5. Constraint Evaluation: Determine if either component exceeds the maximum allowed value.
    // An alternative approach to 'a > 8 || b > 8' is to find the greater of the two values
    // and compare that single value against the threshold.
    const highestComponentValue = Math.max(firstNumericComponent, secondNumericComponent);

    // Based on the comparison, output the appropriate message.
    if (highestComponentValue > MAXIMUM_ALLOWED_VALUE) {
        console.log(FAILURE_INDICATION); // One or both components exceeded the acceptable limit.
    } else {
        console.log(SUCCESS_INDICATION); // Both components were within or equal to the limit.
    }
};

// --- Application Entry Point & Input Acquisition ---

/**
 * A dedicated function to abstract the mechanism of acquiring system input.
 * This makes the `processInputValues` function more portable and testable.
 * In a real-world scenario, this might read from a file, a network stream, or a UI.
 *
 * @returns {string} The content read from the standard input stream.
 */
const acquireSystemInput = () => {
    // Node.js specific: Synchronously read the entire content from standard input.
    // '/dev/stdin' is a common path for standard input on Unix-like systems.
    // 'utf8' specifies the character encoding.
    return require('fs').readFileSync('/dev/stdin', 'utf8');
};

// Initiate the application's core processing by calling `processInputValues`
// with the data obtained from the system's standard input.
processInputValues(acquireSystemInput());