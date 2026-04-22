"use strict";

// Constant to define the newline character, enhancing readability and maintainability.
const LINE_BREAK_CHAR = '\n';

/**
 * Computes the aggregate sum of numerical values within an array of digits.
 * This function is designed to be robust, handling an array of numbers.
 *
 * @param {Array<number>} numericDigitArray - An array containing individual digits as numbers.
 * @returns {number} The total sum of all digits in the provided array.
 */
const aggregateDigitValues = (numericDigitArray) => {
    // Leveraging the Array.prototype.reduce method for efficient and concise summation.
    // The initial sum is explicitly set to 0.
    return numericDigitArray.reduce((currentSumAccumulator, digitElement) => currentSumAccumulator + digitElement, 0);
};

/**
 * Orchestrates the primary logic: reading raw input, parsing number strings into digit arrays,
 * summing their respective digits, and then comparing these sums to determine an outcome.
 *
 * @param {string} incomingTextPayload - The complete input string, typically originating from a file or standard input.
 */
const initiateDataProcessingAndComparison = (incomingTextPayload) => {
    // First, cleanse the entire input by trimming extraneous whitespace,
    // then segment it into distinct lines based on the defined line break character.
    const segmentedInputLines = incomingTextPayload.trim().split(LINE_BREAK_CHAR);

    // Implement a basic validation step: ensure that at least two lines of input
    // (representing the two numbers) are present. If not, log an error and halt execution.
    if (segmentedInputLines.length < 2) {
        console.error("Input Error: Required two lines of data but received fewer.");
        return; // Exit the function gracefully to prevent further errors.
    }

    // Process the initial input line: trim it, then convert each character into its numeric equivalent.
    // Array.from is used for creating a new array from an array-like or iterable object,
    // with an optional mapping function. The unary plus operator (`+`) efficiently casts string characters to numbers.
    const firstNumberComponentDigits = Array.from(segmentedInputLines[0].trim(), charUnit => +charUnit);

    // Perform the same processing for the subsequent input line to obtain its digit components.
    const secondNumberComponentDigits = Array.from(segmentedInputLines[1].trim(), charUnit => +charUnit);

    // Calculate the total sum for the digits of the first number using the dedicated helper function.
    const totalSumForFirstNumber = aggregateDigitValues(firstNumberComponentDigits);

    // Calculate the total sum for the digits of the second number.
    const totalSumForSecondNumber = aggregateDigitValues(secondNumberComponentDigits);

    // Determine the final comparison verdict.
    // The original problem's logic states 'LESS' if not 'GREATER', which includes the equality case.
    const finalComparisonVerdict = (totalSumForFirstNumber > totalSumForSecondNumber) ? 'GREATER' : 'LESS';

    // Output the result of the comparison to the standard console.
    console.log(finalComparisonVerdict);
};

// This block serves as the application's entry point, handling file system interactions.
// It reads data from standard input and passes it to the main processing function.
try {
    // Dynamically import the 'fs' (file system) module for input operations.
    const fileSystemHandler = require('fs');
    // Specify the standard input file path, common in Unix-like environments.
    const inputSourcePath = '/dev/stdin';
    // Define the character encoding for reading the file content.
    const contentEncoding = 'utf8';

    // Synchronously read the entire content of the standard input file.
    const standardInputContent = fileSystemHandler.readFileSync(inputSourcePath, contentEncoding);

    // Execute the core processing and comparison logic with the retrieved input.
    initiateDataProcessingAndComparison(standardInputContent);
} catch (executionError) {
    // Implement error handling for any issues encountered during file reading or subsequent processing.
    // This provides a more robust user experience by reporting failures.
    console.error("An operational error occurred:", executionError.message);
}