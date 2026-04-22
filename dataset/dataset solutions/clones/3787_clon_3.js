// This module defines a core function to determine the largest outcome
// from a set of basic arithmetic operations on two provided integer inputs.

/**
 * Utility function to robustly parse a string of space-separated numbers into an array of integers.
 * It includes validation to ensure the input is a valid string and contains at least two numeric values.
 *
 * @param {string} inputSource - The raw string that is expected to contain numbers.
 * @returns {number[]} An array of numerical values parsed from the input string.
 * @throws {Error} If the `inputSource` is invalid, empty, or does not yield enough numbers.
 */
const parseNumericSequence = (inputSource) => {
    // Ensure the input is indeed a string and not just empty after trimming.
    if (typeof inputSource !== 'string' || inputSource.trim().length === 0) {
        throw new Error("Provided input for parsing is either not a string or is entirely whitespace.");
    }

    // Split the string by one or more spaces, and filter out any resulting empty strings
    // (e.g., from multiple spaces between numbers).
    const stringTokens = inputSource.trim().split(/\s+/).filter(Boolean);

    // Validate that we have at least two tokens to process.
    if (stringTokens.length < 2) {
        throw new Error(`Insufficient numeric tokens found: expected at least 2, but got ${stringTokens.length}.`);
    }

    // Convert each string token to an integer using Number.parseInt for explicit base 10.
    // If any conversion results in NaN, this will be caught later.
    return stringTokens.map(token => Number.parseInt(token, 10));
};

/**
 * Calculates the maximum value among the sum, difference, and product of two numbers
 * extracted from a given input string.
 *
 * @param {string} rawInputLine - The string containing two space-separated integers.
 * @returns {number} The single largest integer result from `firstNum + secondNum`,
 *                   `firstNum - secondNum`, or `firstNum * secondNum`.
 * @throws {Error} If the input string cannot be parsed into two valid numbers.
 */
function calculateMaximumOperationResult(rawInputLine) {
    // Use the helper to parse the input string into numeric operands.
    const [firstNum, secondNum] = parseNumericSequence(rawInputLine);

    // Perform a final check to ensure both extracted values are indeed numbers.
    if (isNaN(firstNum) || isNaN(secondNum)) {
        throw new Error("One or both parsed operands are not valid numbers after conversion.");
    }

    // Calculate all three possible outcomes.
    const sumOutput = firstNum + secondNum;
    const differenceOutput = firstNum - secondNum;
    const productOutput = firstNum * secondNum;

    // Store all results in an array to easily find the maximum.
    const allPossibleResults = [sumOutput, differenceOutput, productOutput];

    // Determine the overall maximum from the calculated values.
    const overallMaxValue = Math.max(...allPossibleResults);

    // Return the result as an integer. Math.trunc is used for clarity,
    // though Math.max on integers will yield an integer.
    return Math.trunc(overallMaxValue);
}

// --- Execution Environment Bootstrap Logic ---
// This immediately invoked function expression (IIFE) provides a flexible way
// to run the main logic, adapting to different JavaScript environments (e.g., Node.js or browser).
((mainProcessingFunction, executionContext, logger) => {
    // Detect if running in a Node.js environment by checking for the 'module' object and 'require' function.
    if (typeof executionContext !== 'undefined' && typeof require === 'function') {
        try {
            // In Node.js, read input from standard input (/dev/stdin) which is common in competitive programming.
            const nodeFileSystem = require("fs");
            const stdInputData = nodeFileSystem.readFileSync("/dev/stdin", "utf8");
            // Pass the trimmed input to the main processing function and log the result.
            logger.log(mainProcessingFunction(stdInputData.trim()));
        } catch (error) {
            // Log any errors encountered during Node.js execution.
            logger.error("Node.js input processing error:", error.message);
            // logger.error(error.stack); // Uncomment for detailed stack trace
        }
    } else {
        // Fallback for non-Node.js environments (e.g., a simple browser script).
        // A default test input is used as there's no standard input stream.
        const defaultTestValue = "-1000 1000"; // Example input for testing.
        try {
            const computedAnswer = mainProcessingFunction(defaultTestValue);
            logger.log("Browser/Default environment execution (test input):", computedAnswer);
            // In a browser, one might update a DOM element here instead of just logging.
        } catch (error) {
            // Log any errors if the function fails with the default input.
            logger.error("Browser/Default environment execution error:", error.message);
        }
    }
})(calculateMaximumOperationResult, typeof module, console); // Pass the main function, module object for env check, and console for output.