/*
 * This module contains a utility function designed to process raw text input.
 * Its primary objective is to evaluate whether the first two non-empty,
 * whitespace-separated components of the input string are identical.
 * The outcome is printed directly to standard output.
 */

// Global constants for standardized output messages, promoting consistency.
const POSITIVE_RESULT_INDICATOR = 'Yes';
const NEGATIVE_RESULT_INDICATOR = 'No';

/**
 * Analyzes a given string of text to determine the equality of its
 * initial two significant tokens. This function handles trimming and
 * splitting of the input.
 *
 * @param {string | Buffer | any} sourceData - The raw data provided for analysis.
 *                                          It is expected to be a string or
 *                                          convertible to one. Nullish values
 *                                          will be treated as empty strings.
 * @returns {void} This routine outputs its determination directly to the console.
 */
function evaluateTokenEquivalence(sourceData) {
    // Normalize the input to a string type and remove leading/trailing whitespace.
    // Handles cases where sourceData might be null, undefined, or a Buffer.
    const processedInputString = String(sourceData || '').trim();

    // Implement an early exit condition for empty input after trimming.
    // This acts as a preliminary validation step.
    if (processedInputString.length === 0) {
        console.log(NEGATIVE_RESULT_INDICATOR); // Output 'No' if no valid input is present.
        return; // Terminate execution for empty input.
    }

    // Define the regular expression for splitting the string.
    // Using `/\s+/` handles one or more whitespace characters as delimiters,
    // making the split more robust than a simple space character.
    const whitespaceDelimiterPattern = /\s+/;
    const extractedComponents = processedInputString.split(whitespaceDelimiterPattern);

    // Specify the minimum number of components required for a valid comparison.
    const minimumComparisonUnits = 2;
    if (extractedComponents.length < minimumComparisonUnits) {
        // If insufficient components are found, the comparison cannot proceed meaningfully.
        console.log(NEGATIVE_RESULT_INDICATOR);
        return; // Exit if the input structure is incomplete.
    }

    // Assign descriptive variable names to the components for clarity in the comparison.
    const primaryToken = extractedComponents[0];
    const secondaryToken = extractedComponents[1];

    // Execute the core logic: a strict equality check between the two tokens.
    // Using `===` ensures type and value equality.
    const areTokensStrictlyIdentical = (primaryToken === secondaryToken);

    // Prepare the final message based on the comparison outcome.
    let finalResultMessage;
    if (areTokensStrictlyIdentical) {
        finalResultMessage = POSITIVE_RESULT_INDICATOR;
    } else {
        finalResultMessage = NEGATIVE_RESULT_INDICATOR;
    }

    // Deliver the determined message to the standard output stream.
    console.log(finalResultMessage);
}

// --- Program Execution Control ---
// This Immediately Invoked Function Expression (IIFE) serves as the
// application's entry point, managing environment-specific interactions,
// particularly input/output operations.
(function initializeAndExecuteApplication() {
    // Define the canonical path for reading standard input in a Unix-like environment.
    const standardInputFilePath = '/dev/stdin';
    // Specify the character encoding to use when reading the input file.
    const fileSystemEncoding = 'utf8';

    try {
        // Utilize the Node.js 'fs' module to synchronously read the content
        // from the standard input file. This blocks until the file is fully read.
        const rawInputBuffer = require('fs').readFileSync(standardInputFilePath, fileSystemEncoding);

        // Invoke the primary analysis function with the content obtained from stdin.
        // It's good practice to ensure the input is a string, even if readFileSync
        // with 'utf8' typically returns one.
        evaluateTokenEquivalence(rawInputBuffer.toString());
    } catch (ioError) {
        // Catch and report any errors that occur during the file reading process.
        // This provides robustness against I/O issues or incorrect file paths.
        console.error(`An I/O error occurred while accessing '${standardInputFilePath}':`, ioError.message);
        // As a fail-safe, output 'No' if an unrecoverable error prevents processing.
        console.log(NEGATIVE_RESULT_INDICATOR);
    }
})();