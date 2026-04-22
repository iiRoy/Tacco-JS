// This module is designed to process raw textual input, specifically focusing on a pattern
// within the second line of the input. It aims to identify the presence or absence
// of a particular character token to determine a binary outcome.

/**
 * Configuration constants for string delimiters and target values.
 * Using named constants enhances readability and simplifies future modifications.
 */
const LINE_BREAK_CHARACTER_DELIMITER = '\n'; // Character used to separate lines within the input string.
const TOKEN_SEGMENT_DELIMITER = ' ';      // Character used to separate individual tokens within a line.
const KEY_SEARCH_ELEMENT = 'Y';           // The specific string element to search for within the tokens.

/**
 * Standardized output messages for the two possible outcomes of the analysis.
 */
const POSITIVE_ANALYSIS_RESULT = 'Four';
const NEGATIVE_ANALYSIS_RESULT = 'Three';

/**
 * Executes the primary logic of the application: parsing input,
 * analyzing a specific part of it, and printing a result.
 *
 * @param {string} entireInputString - The complete raw string content provided as input.
 *                                     It is expected to be a multi-line string.
 * @returns {void} This function does not return a value; it directly outputs
 *                 its findings to the console.
 */
function processInputTextData(entireInputString) {
    // Preliminary validation: Ensure the input is indeed a string.
    // This adds robustness by preventing unexpected behavior with non-string inputs.
    if (typeof entireInputString !== 'string') {
        console.error("ERROR: The provided input must be a string type.");
        // We can choose to exit or provide a default negative result in such cases.
        console.log(NEGATIVE_ANALYSIS_RESULT);
        return;
    }

    // Step 1: Divide the monolithic input string into an array of individual lines.
    // The original code used `slice('¥n')` which is syntactically incorrect for splitting
    // by a delimiter. This has been updated to use `split('\n')` to achieve the likely
    // intended functionality of line separation.
    const contentLinesArray = entireInputString.split(LINE_BREAK_CHARACTER_DELIMITER);

    // Step 2: Verify that a second line (index 1) exists before attempting to access it.
    // This guard clause prevents potential runtime errors (e.g., `TypeError` if `contentLinesArray[1]` is undefined).
    if (contentLinesArray.length < 2) {
        // If there's no second line, the specific condition cannot be met.
        console.log("INFO: Not enough lines in input to perform detailed analysis. Defaulting to negative outcome.");
        console.log(NEGATIVE_ANALYSIS_RESULT);
        return;
    }

    // Retrieve the second line of the input for further processing.
    const targetLineForAnalysis = contentLinesArray[1];

    // Step 3: Break down the target line into an array of individual tokens (words or segments).
    // Similar to line splitting, the original `slice(' ')` was functionally incorrect.
    // This has been corrected to `split(' ')` to properly tokenized the line.
    const tokenizedSegments = targetLineForAnalysis.split(TOKEN_SEGMENT_DELIMITER);

    // Step 4: Determine if the `KEY_SEARCH_ELEMENT` is present within the `tokenizedSegments`.
    // Using `Array.prototype.includes()` provides a more direct and readable way
    // to check for element existence compared to `indexOf() !== -1`.
    const isKeyElementPresent = tokenizedSegments.includes(KEY_SEARCH_ELEMENT);

    // Step 5: Based on the search result, construct the final output message.
    let determinedOutcomeMessage;
    if (isKeyElementPresent) {
        determinedOutcomeMessage = POSITIVE_ANALYSIS_RESULT;
    } else {
        determinedOutcomeMessage = NEGATIVE_ANALYSIS_RESULT;
    }

    // Step 6: Output the final message to the standard console.
    console.log(determinedOutcomeMessage);
}

// The following immediately-invoked function expression (IIFE) serves as the
// application's entry point, handling file reading and error management.
(function initializeApplication() {
    try {
        // Dynamically load the 'fs' module for file system operations.
        const fileSystemModule = require("fs");

        // Read the entire content from standard input synchronously.
        // Ensure UTF-8 encoding for proper character interpretation.
        const stdinContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");

        // Pass the read content to our main processing function.
        processInputTextData(stdinContent);

    } catch (runtimeError) {
        // Catch and log any errors that occur during file reading or processing.
        console.error(`A critical error occurred during application execution: ${runtimeError.message}`);
        // In case of error, a default output could be provided or the process could exit.
        console.log(NEGATIVE_ANALYSIS_RESULT); // Fallback output
        // process.exit(1); // Optionally exit with an error code.
    }
})();