'use strict';

/**
 * Orchestrates the processing of raw input data to compute a specific numerical product.
 * This function expects a string containing at least two space-separated numerical tokens.
 * @param {string} rawInputData - The initial string received from an input source, e.g., "15 25".
 */
function processNumericalData(rawInputData) {
    // Validate that the provided input is indeed a string. This is a Type III addition.
    if (typeof rawInputData !== 'string') {
        console.error("Input processing failed: Expected a string type, but received", typeof rawInputData);
        return; // Terminate execution for invalid input type.
    }

    // Type III: Introduce an intermediate step for tokenizing the input string.
    // Renamed 'INPUT' to 'rawInputData' and introduced 'stringTokens'.
    // Added '.trim()' for robustness against leading/trailing whitespace.
    const stringTokens = rawInputData.trim().split(' ');

    // Type III: Add a validation/warning for insufficient input tokens.
    // While the original code would produce NaN, this makes the expectation explicit.
    if (stringTokens.length < 2 || (stringTokens.length === 1 && stringTokens[0] === '')) {
        console.warn("Warning: The input data contains an insufficient number of numerical tokens. Expecting at least two.");
        // Execution continues to allow NaN propagation, consistent with original behavior.
    }

    // Type II & III: Transform string tokens into an array of numbers using a loop instead of map.
    // Renamed 'N' to 'numericSequence', 'n' to 'valStr'.
    // Explicitly using parseInt with base 10, a subtle data type/conversion change from Number().
    const numericSequence = [];
    for (let currentTokenIndex = 0; currentTokenIndex < stringTokens.length; currentTokenIndex++) {
        const valStr = stringTokens[currentTokenIndex];
        numericSequence.push(parseInt(valStr, 10)); // Converts string to integer.
    }

    // Type III: Introduce helper variables to access the specific elements needed for calculation.
    const firstOperandValue = numericSequence[0];
    const secondOperandValue = numericSequence[1]; // This will be 'undefined' if less than two numbers.

    // Type III: Break down the core calculation into multiple, explicit intermediate steps.
    // Calculate the decremented values.
    const decrementedFirst = firstOperandValue - 1;       // (undefined - 1) results in NaN.
    const decrementedSecond = secondOperandValue - 1; // (undefined - 1) results in NaN.

    // Perform the final multiplication.
    let computedResult = decrementedFirst * decrementedSecond; // Any operation with NaN results in NaN.

    // Type III: Add a conditional check or post-processing for the computed result.
    if (isNaN(computedResult)) {
        console.warn("Final calculation yielded Not-a-Number (NaN). This typically indicates invalid or incomplete input values.");
        // The original logic would just print NaN, so we maintain that, but add a warning.
    }

    // Output the final computed result.
    console.log(computedResult);
}

// Type II & III: Refactor the input reading mechanism with explicit variables and error handling.
// Renamed 'require("fs")' to 'fileSystemModuleAccessor'.
const fileSystemModuleAccessor = require('fs');
const standardInputSourcePath = '/dev/stdin';
const preferredTextEncoding = 'utf8';

let rawFileContent = ''; // Type III: Initialize input content outside try-catch.
try {
    // Attempt to read the entire content from the standard input file.
    rawFileContent = fileSystemModuleAccessor.readFileSync(standardInputSourcePath, preferredTextEncoding);
} catch (inputReadError) {
    // Type III: Add a robust error handling block for file system operations.
    console.error("An error occurred while attempting to read from standard input:", inputReadError.message);
    // In case of error, 'rawFileContent' remains an empty string, which the processing function can handle.
}

// Type II: Call the main processing function with the obtained input.
processNumericalData(rawFileContent);