'use strict';

// This module is designed to process text-based input,
// specifically to compare two string components found on the first line
// of the provided data source. It performs a lexicographical comparison.

/**
 * Processes the raw input string to extract two primary components
 * and then determines their relative order. The result is printed
 * to the standard output.
 *
 * @param {string} incomingDataPayload - The complete string content received,
 *                                       typically from a file or stream.
 */
const initiateLexicographicalComparison = (incomingDataPayload) => {
    // Declare variables to hold the extracted string segments.
    let primarySegment;
    let secondarySegment;
    let comparisonOutcomeIndicator = ''; // Will store the final result ('=', '>', '<').

    // --- Input Data Validation ---
    // Ensure the payload is a valid non-empty string before proceeding.
    if (typeof incomingDataPayload !== 'string' || incomingDataPayload.trim().length === 0) {
        console.error("Operational Error: The provided input data payload is either invalid or empty.");
        return; // Terminate execution if input is unusable.
    }

    // --- Data Extraction Phase ---
    // Isolate the very first line of the input.
    // We assume the relevant data for comparison is always on this line.
    const initialLineContent = incomingDataPayload.split('\n')[0];

    // Further validation: check if the extracted line itself is empty.
    if (initialLineContent.trim().length === 0) {
        console.log("Warning: The first line of input is empty. No comparison can be performed.");
        return;
    }

    // Split the significant line into individual tokens using a space as a delimiter.
    const parsedTokens = initialLineContent.split(' ');

    // --- Token Count Validation ---
    // Verify that we have at least two tokens available for comparison.
    if (parsedTokens.length < 2) {
        console.log("Information: Insufficient data tokens on the first line for a valid comparison. Expected at least two.");
        // In a more complex scenario, a default value or error code might be returned.
        return;
    }

    // Assign the first two parsed tokens to our designated segment variables.
    primarySegment = parsedTokens[0];
    secondarySegment = parsedTokens[1];

    // --- Comparison Logic ---
    // Execute the core logic to compare `primarySegment` and `secondarySegment`
    // lexicographically and set the `comparisonOutcomeIndicator`.
    if (primarySegment === secondarySegment) {
        comparisonOutcomeIndicator = '='; // Both segments are identical.
    } else if (primarySegment > secondarySegment) {
        comparisonOutcomeIndicator = '>'; // Primary segment is lexicographically greater.
    } else {
        comparisonOutcomeIndicator = '<'; // Primary segment is lexicographically smaller.
    }

    // --- Output Phase ---
    // Display the final determined comparison result to the console.
    console.log(comparisonOutcomeIndicator);
};

// Define a constant for the well-known standard input file path.
// This improves readability and maintainability for the source of input.
const SYSTEM_INPUT_DEVICE_PATH = '/dev/stdin';

// --- Application Entry Point ---
// This block handles reading the input file and invoking the main processing function.
try {
    // Utilize the Node.js 'fs' module to synchronously read the content
    // of the standard input device, assuming UTF-8 encoding.
    const fileDataBuffer = require('fs').readFileSync(SYSTEM_INPUT_DEVICE_PATH, 'utf-8');

    // Pass the entire content of the file to our primary processing function.
    initiateLexicographicalComparison(fileDataBuffer);
} catch (fileReadingError) {
    // Catch and report any exceptions that occur during the file reading process.
    // This could include file not found errors, permission issues, etc.
    console.error(`Critical Error: Unable to access or read from the specified input device (${SYSTEM_INPUT_DEVICE_PATH}). Details: ${fileReadingError.message}`);
}