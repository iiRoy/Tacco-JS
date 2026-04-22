/*
 * This JavaScript module serves as an entry point for processing
 * textual input from standard input (/dev/stdin).
 * Its primary function is to search for a specific sequence of characters
 * and provide a simple 'Yes' or 'No' response based on the discovery.
 *
 * It incorporates robust file reading, basic data validation,
 * and clear conditional logic for determining the output.
 */
(function analyzeStandardInput() {
    // --- Configuration Parameters ---
    // The predefined string representing a positive match outcome.
    const POSITIVE_RESULT_TOKEN = 'Yes';
    // The predefined string representing a negative match outcome.
    const NEGATIVE_RESULT_TOKEN = 'No';
    // The specific substring pattern to search for within the input.
    const TARGET_SEARCH_PATTERN = 'hi';

    let rawInputContent; // Variable to hold the data read from the input stream.

    try {
        // --- Input Acquisition Phase ---
        // Dynamically load the Node.js 'fs' (File System) module.
        const fileSystemHandler = require("fs");

        // Synchronously read the entire content of standard input.
        // The 'utf8' encoding ensures proper interpretation of text characters.
        rawInputContent = fileSystemHandler.readFileSync("/dev/stdin", "utf8");

    } catch (inputReadingError) {
        // --- Error Handling for Input ---
        // If an error occurs during file reading (e.g., file not found, permissions),
        // log the error and default to a negative outcome, as the target cannot be found.
        console.error(`Error encountered while attempting to read standard input: ${inputReadingError.message}`);
        return NEGATIVE_RESULT_TOKEN;
    }

    // --- Data Pre-processing and Validation ---

    // Ensure the input content is treated as a string for consistent operations.
    // This acts as a guard against unexpected data types from readFileSync.
    if (typeof rawInputContent !== 'string') {
        console.warn('Warning: Input content type is not a string; attempting coercion.');
        rawInputContent = String(rawInputContent);
    }

    // Trim whitespace from both ends of the input string.
    // This helps in standardizing the content before the search operation.
    const processedTextForAnalysis = rawInputContent.trim();

    // Check if the cleaned input string is empty.
    // An empty string cannot possibly contain the target pattern.
    if (processedTextForAnalysis.length === 0) {
        // Log an informational message for empty input.
        console.info('Info: Input content is empty after trimming. No search performed.');
        return NEGATIVE_RESULT_TOKEN;
    }

    // --- Core Logic: Pattern Matching ---
    // Utilize the modern String.prototype.includes() method for checking
    // the presence of the target substring within the processed text.
    const isPatternFound = processedTextForAnalysis.includes(TARGET_SEARCH_PATTERN);

    // --- Output Determination ---
    // Based on the result of the pattern search, return the appropriate token.
    if (isPatternFound) {
        return POSITIVE_RESULT_TOKEN;
    } else {
        return NEGATIVE_RESULT_TOKEN;
    }

})(); // The IIFE is immediately invoked without any external arguments.