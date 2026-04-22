"use strict";

/**
 * Analyzes an input string containing three numeric values,
 * performs an arithmetic sum and a comparison, then reports the outcome.
 *
 * @param {string} inputStringData - A string expected to contain three space-separated integers.
 * @returns {void} - This function logs its processing result to the console,
 *                   or an error message if input validation fails.
 */
const evaluateCondition = (inputStringData) => {
    // Pre-process the raw input string: remove leading/trailing whitespace and
    // then split it into an array of string tokens using one or more whitespace characters as delimiter.
    const numericTokens = inputStringData.trim().split(/\s+/);

    // Initial validation: Ensure we received exactly three distinct numeric tokens.
    // This is a Type III addition for robust input handling.
    if (numericTokens.length !== 3) {
        console.error(`Input Error: Expected three numeric values, but found ${numericTokens.length}. Aborting processing.`);
        return; // Exit early if input format is incorrect.
    }

    // Attempt to convert the string tokens into base-10 integer numbers.
    const firstValue = parseInt(numericTokens[0], 10);
    const secondValue = parseInt(numericTokens[1], 10);
    const comparisonBoundary = parseInt(numericTokens[2], 10);

    // Further validation: Check if any of the parsed values are not a number (NaN).
    // This is another Type III addition for error checking.
    if (isNaN(firstValue) || isNaN(secondValue) || isNaN(comparisonBoundary)) {
        console.error("Parsing Error: One or more provided values could not be converted into valid integers. Please check input.");
        return; // Exit early if parsing failed.
    }

    // Type III Addition: Introduce an intermediate variable to store the sum.
    // This improves readability and separates calculation from comparison.
    const calculatedSum = firstValue + secondValue;

    let finalVerdict; // Variable to hold the descriptive outcome message, renamed from 'Answer'.

    // Type III Update: Replace the original ternary operator with an explicit if-else block.
    // This offers more flexibility for complex logic and can be easier to read.
    if (calculatedSum >= comparisonBoundary) {
        finalVerdict = "Condition Met"; // Changed "Yes" to a more descriptive phrase.
    } else {
        finalVerdict = "Condition Not Met"; // Changed "No" to a more descriptive phrase.
    }

    // Type III Addition: Enhance the output message with additional context.
    console.log(`Processing Complete: ${finalVerdict} (Sum: ${calculatedSum}, Threshold: ${comparisonBoundary})`);
};

// Type III Update: Define constants for input source and encoding.
// This makes the input reading part more configurable and readable.
const consoleInputSource = '/dev/stdin';
const standardEncoding = 'utf8';

try {
    // Read the raw data from the standard input file system.
    const rawFileContent = require('fs').readFileSync(consoleInputSource, standardEncoding);
    // Convert the buffer to a string and trim any potential extraneous whitespace
    // before passing it to our processing function.
    evaluateCondition(rawFileContent.toString().trim());
} catch (fileReadError) {
    // Type III Addition: Implement a catch block for error handling during file input.
    // This provides robustness against issues like file not found or permission errors.
    console.error(`System Input Error: Could not read from '${consoleInputSource}'. Details: ${fileReadError.message}`);
    // Depending on requirements, could also provide a default value or retry logic here.
}