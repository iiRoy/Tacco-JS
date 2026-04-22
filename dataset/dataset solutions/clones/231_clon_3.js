// This module provides necessary utilities for interacting with the file system.
const fileSystemOperations = require("fs");

// Define the standard path from which input data will be read.
const standardInputEndpoint = "/dev/stdin";

/**
 * Computes a specific mathematical sequence value based on the input number.
 * The formula applied is (x^2 + x + 2) / 2.
 * This function encapsulates the core calculation logic for reusability and clarity.
 *
 * @param {number} inputNumberValue - The numerical value to be processed.
 * @returns {number} The calculated result of the sequence.
 */
function calculateSequenceTerm(inputNumberValue) {
    // Step 1: Compute the square of the input number.
    const squaredComponent = inputNumberValue * inputNumberValue;

    // Step 2: Add the original input number to its squared value.
    const sumWithOriginal = squaredComponent + inputNumberValue;

    // Step 3: Add a constant value to the sum.
    const numeratorWithOffset = sumWithOriginal + 2;

    // Step 4: Divide the final numerator by two to get the sequence term.
    const finalSequenceResult = numeratorWithOffset / 2;

    return finalSequenceResult;
}

try {
    // Synchronously read the entire content from the specified input endpoint.
    // The content is expected to be UTF-8 encoded text.
    const rawInputBuffer = fileSystemOperations.readFileSync(standardInputEndpoint, { encoding: "utf8" });

    // Process the raw input buffer:
    // 1. Split the string into an array of tokens using one or more whitespace characters as separators.
    // 2. Filter out any tokens that are empty strings or consist only of whitespace,
    //    which can occur if there are multiple delimiters or leading/trailing spaces.
    const numericStringTokens = rawInputBuffer
        .split(/\s+/) // Splits by one or more whitespace characters
        .filter(token => token.trim() !== ''); // Ensures no empty or whitespace-only tokens are processed

    // Iterate over each valid string token extracted from the input.
    numericStringTokens.forEach(currentStringItem => {
        // Attempt to convert the current string token into a floating-point number.
        const parsedNumericValue = Number(currentStringItem);

        // Implement a robust check to ensure the parsed value is indeed a valid number.
        // This acts as a guard clause to prevent errors from non-numeric input.
        if (isNaN(parsedNumericValue)) {
            // Log a warning message to standard error if an invalid input is encountered,
            // then skip to the next item without processing.
            console.error(`Data integrity warning: Skipped non-numeric input element -> '${currentStringItem}'.`);
            return; // Continues to the next iteration in the forEach loop
        }

        // Invoke the dedicated function to compute the sequence term for the valid numeric input.
        const calculatedTerm = calculateSequenceTerm(parsedNumericValue);

        // Output the final computed result to the standard console output.
        console.log(calculatedTerm);
    });

} catch (errorDetails) {
    // Catch and report any potential errors that might occur during file system operations,
    // such as the input file not being found or permissions issues.
    console.error(`An unexpected error occurred during input processing: ${errorDetails.message}`);
    // Optionally, exit the process with an error code to indicate failure.
    process.exitCode = 1;
}