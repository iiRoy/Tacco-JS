'use strict';

/**
 * A utility function to safely transform a string into an integer.
 * This helper ensures consistent parsing logic throughout the application.
 * @param {string} stringValue The string representation of a number.
 * @returns {number} The integer value, or NaN if parsing fails.
 */
const stringToNumericValue = (stringValue) => {
    // Use Number.parseInt with a radix for explicit base-10 conversion.
    // Trim whitespace from the string before attempting conversion for robustness.
    const numericResult = Number.parseInt(stringValue.trim(), 10);
    // In a production system, one might throw an error or return a default value
    // if `numericResult` is NaN. For typical competitive programming, inputs are valid.
    return numericResult;
};

/**
 * Orchestrates the primary data processing flow for the application.
 * It takes raw input, parses it, performs calculations, and outputs the result.
 * @param {string} wholeInputData The complete raw input string, typically from stdin.
 * @returns {void} This function prints its result directly to console.
 */
const processApplicationData = (wholeInputData) => {
    // Defensive check: Ensure input data is not empty or null.
    if (!wholeInputData || wholeInputData.trim().length === 0) {
        console.error("Error: Received empty or invalid input data.");
        // It's good practice to exit with a non-zero code on critical errors.
        process.exit(1);
    }

    // Split the raw input into an array of individual lines, removing leading/trailing whitespace
    const dataLines = wholeInputData.trim().split('\n');

    // Extract and parse the first line which contains the total count (N) and sum count (K).
    // Ensure there's at least one line of input.
    if (dataLines.length < 1) {
        console.error("Error: Input data is missing the configuration line.");
        process.exit(1);
    }
    const configTokens = dataLines[0].split(' ');

    // Validate that the config line has expected number of tokens.
    if (configTokens.length < 2) {
        console.error("Error: Configuration line malformed. Expected N and K values.");
        process.exit(1);
    }

    const totalAvailableItems = stringToNumericValue(configTokens[0]);
    const itemsToAggregateCount = stringToNumericValue(configTokens[1]);

    // Implement a guard clause for 'K' (itemsToAggregateCount).
    // K should be positive and not exceed the total available items (N).
    if (Number.isNaN(itemsToAggregateCount) || itemsToAggregateCount <= 0 || itemsToAggregateCount > totalAvailableItems) {
        console.error(`Error: Invalid value for K (${itemsToAggregateCount}). K must be positive and not exceed N (${totalAvailableItems}).`);
        process.exit(1);
    }

    // Extract and parse the second line which contains the list of numbers.
    // Ensure there's at least a second line.
    if (dataLines.length < 2) {
        console.error("Error: Input data is missing the list of numbers line.");
        process.exit(1);
    }
    const rawNumberStrings = dataLines[1].split(' ');

    // Convert all string-represented numbers to actual numerical values
    // and then sort them in descending order (largest first).
    const orderedNumericCollection = rawNumberStrings
        .map(str => stringToNumericValue(str))
        .filter(num => !Number.isNaN(num)) // Filter out any non-numeric results from parsing
        .sort((valueA, valueB) => valueB - valueA); // Sort from largest to smallest

    // Another guard: Check if we have enough numbers after parsing and filtering.
    if (orderedNumericCollection.length < itemsToAggregateCount) {
        console.warn(`Warning: Fewer numbers (${orderedNumericCollection.length}) available than requested for aggregation (${itemsToAggregateCount}). Aggregating all available.`);
        // Adjust itemsToAggregateCount to prevent errors if not enough numbers are provided.
        itemsToAggregateCount = orderedNumericCollection.length;
    }

    // Calculate the cumulative sum of the top 'itemsToAggregateCount' numbers.
    // Using a functional approach with `slice` and `reduce` for conciseness and clarity.
    const finalCalculatedSum = orderedNumericCollection
        .slice(0, itemsToAggregateCount) // Take only the largest 'K' elements
        .reduce((accumulator, currentNumber) => accumulator + currentNumber, 0); // Sum them up

    // Output the computed sum to the standard output stream.
    console.log(finalCalculatedSum);
};

// Self-invoking anonymous function to handle the application's entry point.
// This structure helps keep global scope clean and manages resource loading.
(() => {
    try {
        // Dynamically load the 'fs' (file system) module required for reading input.
        const fileSystemModule = require('fs');
        // Read all data from standard input (typically '/dev/stdin' on Linux/macOS, or a pipe).
        // Specify 'utf-8' encoding for proper character handling.
        const standardInputBuffer = fileSystemModule.readFileSync('/dev/stdin', 'utf-8');
        // Pass the read input data to our main processing function.
        processApplicationData(standardInputBuffer);
    } catch (operationError) {
        // Catch and log any errors that occur during file reading or initial setup.
        console.error("Application encountered a critical error:", operationError.message);
        // Terminate the process with an error code.
        process.exit(1);
    }
})();