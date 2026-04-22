"use strict";

// This utility module is designed for processing textual input,
// specifically for performing a standardized truncation operation.

/**
 * Executes the primary string transformation workflow.
 * It reads raw input, extracts the first relevant line,
 * performs a specific truncation, and outputs the result.
 * @param {string} rawSourceContent - The complete raw string input received.
 */
const processInputData = (rawSourceContent) => {
    // Define a configuration parameter for the truncation operation.
    // This constant specifies the fixed number of characters to be removed from the end.
    const TRAILING_CHARS_TO_STRIP = 8; // Number of characters to remove from the end of the string.

    // Step 1: Pre-process the raw input.
    // First, remove any leading or trailing whitespace from the entire input block.
    // Then, split the content into individual lines based on newline characters.
    // We are only interested in the very first line for this particular operation.
    let contentLines = rawSourceContent.trim().split('\n');
    let primaryTargetString = contentLines.length > 0 ? contentLines[0] : "";

    // Step 2: Validate the string length before attempting truncation.
    // If the string is shorter than or equal to the number of characters we intend to remove,
    // it implies that truncating it would result in an empty string or an invalid operation.
    if (primaryTargetString.length <= TRAILING_CHARS_TO_STRIP) {
        // In this edge case, the string is effectively cleared.
        console.log(""); // Output an empty string.
        return; // Terminate execution for this input.
    }

    // Step 3: Perform the truncation.
    // Instead of directly modifying an array via splice, we'll create a new string
    // by taking a substring from the beginning up to the point of truncation.
    // This is an alternative, functionally equivalent way to remove trailing characters.
    const truncatedStringResult = primaryTargetString.substring(0, primaryTargetString.length - TRAILING_CHARS_TO_STRIP);

    // Step 4: Output the final processed string to the standard console stream.
    console.log(truncatedStringResult);
};

// This block serves as the application's entry point.
// It is responsible for acquiring input data from the standard input stream
// and passing it to our core processing function.
try {
    // Dynamically import the Node.js 'fs' (file system) module.
    const fileSystemHandler = require('fs');

    // Read the entire content of '/dev/stdin' synchronously.
    // The 'utf8' encoding ensures proper character interpretation.
    const standardInputContent = fileSystemHandler.readFileSync('/dev/stdin', 'utf8');

    // Invoke the main processing function with the acquired input.
    processInputData(standardInputContent);
} catch (inputReadError) {
    // If any error occurs during the file reading process, log it to stderr.
    // This provides crucial debugging information without affecting stdout.
    console.error("An error occurred while attempting to read from standard input:", inputReadError.message);
}