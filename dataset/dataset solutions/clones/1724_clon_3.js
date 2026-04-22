'use strict';

/**
 * Compares two input strings character by character to determine the number of differing positions.
 * This function processes raw string input, parses it into two lines, and then performs the comparison.
 * @param {string} inputBuffer - The raw string content received from standard input.
 */
function compareStringsForDifferences(inputBuffer) {
    // Step 1: Pre-process the raw input buffer.
    const trimmedInput = inputBuffer.trim();

    // Guard clause for empty input string.
    if (trimmedInput.length === 0) {
        console.log(0); // No strings to compare, so zero differences.
        return;
    }

    const parsedLines = trimmedInput.split(/\r?\n/g);

    // Validation for expected number of input lines.
    if (parsedLines.length < 2) {
        console.error("Input error: Expected at least two lines for comparison, but received fewer.");
        console.log(0); // Default to 0 differences in case of insufficient input.
        return;
    }

    const primaryString = parsedLines[0];
    const comparisonString = parsedLines[1];

    // Introduce helper variables for string lengths to improve readability and clarity.
    const primaryLength = primaryString.length;
    const comparisonLength = comparisonString.length;

    // Determine the effective length for comparison, handling cases where string lengths might differ.
    const effectiveComparisonLength = Math.min(primaryLength, comparisonLength);

    let mismatchCount = 0;

    // Add an early exit if the effective comparison length is zero.
    if (effectiveComparisonLength === 0) {
        console.log(0);
        return;
    }

    // Step 2: Iterate and compare characters.
    for (let indexPos = 0; indexPos < effectiveComparisonLength; indexPos++) {
        // Introduce intermediate variables for character access to enhance clarity.
        const charFromPrimary = primaryString[indexPos]; // Using bracket notation for character access.
        const charFromComparison = comparisonString[indexPos];

        // Increment mismatch counter if characters at the current position are different.
        if (charFromPrimary !== charFromComparison) {
            mismatchCount++;
        }
    }

    // Step 3: Output the final result.
    console.log(mismatchCount);
}

// Encapsulate the main execution logic within an Immediately Invoked Function Expression (IIFE).
// This provides a clearer scope for application setup and robust error handling.
(function initializeAndExecuteComparison() {
    // This section handles the reading of data from standard input and delegates to the main processing function.
    try {
        const fileSystemModule = require("fs");
        const systemInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
        compareStringsForDifferences(systemInputContent);
    } catch (ioError) {
        // Add robust error handling for file I/O operations, informing the user of the issue.
        console.error("An error occurred while attempting to read from standard input:", ioError.message);
        // In a production environment, one might also choose to exit the process with an error code:
        // process.exit(1);
    }
})();