/*
 * This module provides functionality to process a specific type of numeric input
 * and calculate a cumulative sum based on digit sum criteria.
 * It is designed to handle a single line of space-separated integers.
 */

/**
 * Computes the sum of the digits of a given non-negative integer.
 * This helper function avoids string conversion for potentially better performance
 * and demonstrates an alternative approach to digit extraction.
 * @param {number} numericValue - The integer whose digits are to be summed.
 * @returns {number} The sum of the digits of the input number.
 */
const calculateDigitSum = (numericValue) => {
    // Ensure the input is treated as a positive integer for digit summation.
    // While the problem implies positive numbers, this adds robustness.
    let temporaryNumber = Math.abs(Math.floor(numericValue));
    let currentDigitSum = 0; // Accumulator for the sum of digits.

    // Iteratively extract and sum digits until the number becomes zero.
    while (temporaryNumber > 0) {
        currentDigitSum += temporaryNumber % 10; // Add the last digit.
        temporaryNumber = Math.floor(temporaryNumber / 10); // Remove the last digit.
    }
    return currentDigitSum;
};

/**
 * Processes a raw input string containing three space-separated integers (N, A, B).
 * It calculates the sum of all integers 'k' from 1 to N (inclusive)
 * whose digit sum falls within the range [A, B] (inclusive).
 *
 * @param {string} rawInputString - The input string, e.g., "100 4 16".
 * @returns {number} The total accumulated sum based on the criteria, or 0 if input is invalid.
 */
const processInputData = (rawInputString) => {
    // --- Input Validation and Parsing ---
    // Perform initial checks on the input string to ensure it's valid.
    if (typeof rawInputString !== 'string' || rawInputString.trim() === '') {
        console.error("Error: Input string is null, undefined, or empty. Cannot process.");
        return 0; // Return a default value for invalid input.
    }

    const inputParts = rawInputString.trim().split(' ');

    // Verify the expected number of parts in the input.
    if (inputParts.length !== 3) {
        console.error(`Error: Expected 3 numeric values, but received ${inputParts.length}.`);
        return 0;
    }

    // Explicitly parse string parts to integers and validate each.
    const maximumIterationValueN = parseInt(inputParts[0], 10);
    const lowerDigitSumBoundA = parseInt(inputParts[1], 10);
    const upperDigitSumBoundB = parseInt(inputParts[2], 10);

    // Check if any parsed value resulted in NaN.
    if (isNaN(maximumIterationValueN) || isNaN(lowerDigitSumBoundA) || isNaN(upperDigitSumBoundB)) {
        console.error("Error: One or more input parts could not be converted to a valid number.");
        return 0;
    }

    // --- Logical Validation of Numeric Inputs ---
    // Ensure the input values meet the problem's constraints (e.g., N >= 1, A <= B).
    if (maximumIterationValueN < 1) {
        console.error(`Error: Maximum iteration value (N=${maximumIterationValueN}) must be at least 1.`);
        return 0;
    }
    if (lowerDigitSumBoundA < 0 || upperDigitSumBoundB < 0) {
        console.error(`Error: Digit sum bounds (A=${lowerDigitSumBoundA}, B=${upperDigitSumBoundB}) must be non-negative.`);
        return 0;
    }
    if (lowerDigitSumBoundA > upperDigitSumBoundB) {
        console.error(`Error: Lower bound (A=${lowerDigitSumBoundA}) cannot be greater than upper bound (B=${upperDigitSumBoundB}).`);
        return 0;
    }

    // --- Core Logic Execution ---
    let finalAccumulatedSum = 0; // This variable will store the result.

    // Iterate from 1 up to and including N.
    for (let currentNumber = 1; currentNumber <= maximumIterationValueN; ++currentNumber) {
        const digitSumOfCurrentNumber = calculateDigitSum(currentNumber);

        // Introduce boolean flags for readability of the conditional check.
        const meetsLowerBoundCondition = digitSumOfCurrentNumber >= lowerDigitSumBoundA;
        const meetsUpperBoundCondition = digitSumOfCurrentNumber <= upperDigitSumBoundB;

        // If both conditions are met, add the current number to the running total.
        if (meetsLowerBoundCondition && meetsUpperBoundCondition) {
            finalAccumulatedSum += currentNumber;
        }
    }

    return finalAccumulatedSum;
};

/**
 * The main entry point for the application.
 * This function handles reading input from stdin and printing the result to stdout.
 * @param {string} stdinContent - The raw content read from standard input.
 */
function ApplicationEntry(stdinContent) {
    // Call the primary processing function with the standard input content.
    const calculatedResult = processInputData(stdinContent);
    // Output the final result to the console (standard output).
    console.log(calculatedResult);
}

// --- Execution Block for Competitive Programming Environment ---
// This block handles reading input from /dev/stdin and invoking the main application logic.
// A try-catch block is added for robustness against file system errors.
try {
    const fileSystemModule = require('fs');
    const standardInputPath = '/dev/stdin';

    // Read the entire content of the standard input file, encoded as UTF-8.
    // The .trim() method is used to remove any leading/trailing whitespace,
    // including potential newline characters at the end of the input file.
    const rawInputContentFromStdin = fileSystemModule.readFileSync(standardInputPath, 'utf8').trim();

    // Initiate the application's main processing flow.
    ApplicationEntry(rawInputContentFromStdin);
} catch (ioError) {
    // If an error occurs during file reading (e.g., file not found, permission issues),
    // log the error message to standard error.
    console.error("An error occurred while attempting to read from standard input:", ioError.message);
    // In a production environment, one might also exit with a non-zero status code
    // to indicate a failure: process.exit(1);
}