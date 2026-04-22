"use strict";

// Define a constant representing the minimum acceptable numeric value for the primary condition.
const REQUIRED_NUMERIC_BENCHMARK = 3200;

// Define a constant for the default string output when the primary condition is not met.
const DEFAULT_FAILURE_INDICATOR = "red";

/**
 * Core processing function that evaluates input data and produces a specific output.
 * This routine handles parsing, validation, and conditional logic.
 *
 * @param {string} incomingDataPayload - The complete string input received from an external source.
 * @returns {void} This function prints the result directly to the console.
 */
const executeConditionalDataProcessing = (incomingDataPayload) => {
    // Initial validation: Ensure the payload is a non-empty string.
    if (typeof incomingDataPayload !== 'string' || incomingDataPayload.length === 0) {
        console.error("Input data payload is either not a string or is empty. Cannot proceed.");
        return; // Abort execution for invalid input.
    }

    // Normalize and segment the input string into an array of lines.
    // Using a regular expression for split handles both Windows (\r\n) and Unix (\n) newlines.
    const segmentedInputLines = incomingDataPayload.trim().split(/\r?\n/);

    // Validate that the input contains at least two distinct lines as expected.
    if (segmentedInputLines.length < 2) {
        console.error("Insufficient lines detected in the input payload. Expected at least two.");
        // In case of insufficient data, we can output the default failure indicator.
        console.log(DEFAULT_FAILURE_INDICATOR);
        return;
    }

    // Attempt to extract and parse the first line as a numeric value.
    // Using Number() for type conversion, which gracefully handles various numeric formats.
    const primaryNumericValue = Number(segmentedInputLines[0]);

    // Check if the numeric parsing was successful. If not, handle the error.
    if (isNaN(primaryNumericValue)) {
        console.error(`Failed to parse a valid number from the first input line: "${segmentedInputLines[0]}".`);
        // If the numeric value is invalid, the condition cannot be met, so output the failure indicator.
        console.log(DEFAULT_FAILURE_INDICATOR);
        return;
    }

    // Retrieve the string from the second line, which serves as the successful output label.
    const successfulOutcomeLabel = segmentedInputLines[1];

    let finalComputedOutcome; // Declare a variable to store the result of our logic.

    // Apply the main business rule: compare the parsed numeric value against the predefined benchmark.
    if (primaryNumericValue >= REQUIRED_NUMERIC_BENCHMARK) {
        finalComputedOutcome = successfulOutcomeLabel; // Condition met: use the provided label.
    } else {
        finalComputedOutcome = DEFAULT_FAILURE_INDICATOR; // Condition not met: use the fallback label.
    }

    // Output the determined result to the standard console stream.
    console.log(finalComputedOutcome);
};

// --- Execution Entry Point ---
// This block is responsible for acquiring input from the standard input stream
// and initiating the data processing routine.
try {
    // Dynamically import the Node.js File System module.
    const fileSystemUtilities = require('fs');

    // Define the path to standard input and the expected character encoding.
    const standardInputSource = '/dev/stdin';
    const inputCharacterEncoding = 'utf8';

    // Synchronously read the entire content of the standard input.
    // It's crucial to handle potential errors during this file operation.
    const rawInputBuffer = fileSystemUtilities.readFileSync(standardInputSource, inputCharacterEncoding);

    // Convert the buffer content to a string and pass it to our processing function.
    executeConditionalDataProcessing(rawInputBuffer.toString());

} catch (inputReadError) {
    // Catch and report any errors that occur during the reading of standard input.
    console.error(`An exception occurred while attempting to read from stdin: ${inputReadError.message}`);
    // Depending on application requirements, further error handling or graceful exit might be needed here.
}