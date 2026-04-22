/**
 * This module is designed to extract a specific numerical value from a predefined
 * sequence of numbers based on an external, 1-indexed position indicator.
 * It includes robust input validation and clear processing steps.
 */

/**
 * A utility function to parse and validate a raw string input, ensuring it represents
 * a positive integer suitable for use as a 1-based index.
 *
 * @param {string} rawInputString The string content read from standard input, expected to be a number.
 * @returns {number|null} The successfully parsed and validated 1-based index, or `null` if validation fails.
 */
function parseAndVerifyInputIndex(rawInputString) {
    // Remove any leading or trailing whitespace from the input string
    const cleanedInput = rawInputString.trim();

    // Attempt to convert the cleaned string into an integer, using base 10
    const candidateIndex = parseInt(cleanedInput, 10);

    // Validate the parsed value:
    // 1. Check if it's a number (not NaN)
    // 2. Ensure it's a positive integer (greater than zero, as we expect 1-based indexing)
    if (isNaN(candidateIndex) || candidateIndex < 1) {
        console.error("Input Error: The provided index must be a positive whole number.");
        return null; // Indicate an invalid input by returning null
    }

    // If all checks pass, return the valid 1-based index
    return candidateIndex;
}

/**
 * The primary function responsible for orchestrating the data processing.
 * It takes the raw string input (expected to be an index) and uses it to
 * retrieve a value from a hardcoded numeric sequence.
 *
 * @param {string} inputIndexString The raw string received from standard input,
 *                                  representing the desired 1-based index.
 */
function executeSequenceRetrieval(inputIndexString) {
    // The core data sequence, stored as a comma-separated string.
    // This string contains a series of numerical identifiers or values.
    const preconfiguredNumericSequence = "1, 1, 1, 2, 1, 2, 1, 5, 2, 2, 1, 5, 1, 2, 1, 14, 1, 5, 1, 5, 2, 2, 1, 15, 2, 2, 5, 4, 1, 4, 1, 51";

    // Step 1: Parse the string sequence into an array of actual numbers.
    // Each segment is trimmed to handle potential whitespace, then converted to a number.
    const parsedNumericArray = preconfiguredNumericSequence
        .split(',') // Split the string by commas into an array of string segments
        .map(segment => Number(segment.trim())); // Convert each segment to a number

    // Determine the total count of elements available in our parsed array.
    const dataElementCount = parsedNumericArray.length;

    // Step 2: Validate and obtain the 1-based index from the external input.
    const oneBasedDesiredIndex = parseAndVerifyInputIndex(inputIndexString);

    // If the input index is deemed invalid during validation,
    // an error message has already been printed. We terminate the process.
    if (oneBasedDesiredIndex === null) {
        process.exit(1); // Exit with a non-zero status code to indicate an error
    }

    // Step 3: Perform bounds checking to ensure the requested index is within the array's limits.
    if (oneBasedDesiredIndex > dataElementCount) {
        console.error(`Access Error: The requested index (${oneBasedDesiredIndex}) is beyond the available data range (total elements: ${dataElementCount}).`);
        process.exit(1); // Exit due to an out-of-bounds access request
    }

    // Step 4: Convert the 1-based index to a 0-based index, which is required for JavaScript array access.
    const zeroBasedArrayIndex = oneBasedDesiredIndex - 1;

    // Step 5: Retrieve the final value using the calculated 0-based index.
    const retrievedDataValue = parsedNumericArray[zeroBasedArrayIndex];

    // Step 6: Output the successfully retrieved value to the console.
    console.log(`Successfully retrieved value at position ${oneBasedDesiredIndex}: ${retrievedDataValue}`);
}

// --- Application Entry Point ---
// This block ensures the script reads from standard input and initiates the processing.

// Utilize the Node.js 'fs' module to read file content.
// Explicitly using 'node:fs' for clarity in modern Node.js environments.
const fileSystemOperations = require('node:fs');

// Read all content from standard input ('/dev/stdin').
// Specify 'utf8' encoding for text interpretation and 'r' flag for read mode.
const standardInputContent = fileSystemOperations.readFileSync('/dev/stdin', { encoding: 'utf8', flag: 'r' });

// Invoke the main processing function with the content read from stdin.
executeSequenceRetrieval(standardInputContent);