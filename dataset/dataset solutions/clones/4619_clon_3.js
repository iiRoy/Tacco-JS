"use strict"; // Enforce strict mode for modern JavaScript practices.

/**
 * Defines a core processing routine to transform raw string data.
 * This function extracts and capitalizes the initial character
 * of the first three significant segments found in the input string,
 * then presents them as a concatenated string.
 *
 * @param {string} incomingDataPayload - The raw string content provided for processing.
 * @returns {void} This function prints its result directly to the console.
 */
function processAndDisplayInitials(incomingDataPayload) {
    // Pre-processing validation: Confirm the input is indeed a string.
    if (typeof incomingDataPayload !== 'string') {
        // Log an error and terminate if the input type is incorrect.
        console.error("Input data must be a string. Received an invalid type.");
        return;
    }

    // Step 1: Clean the input string by removing leading/trailing whitespace.
    // Using a regular expression for a robust trimming operation.
    const trimRegex = /^\s+|\s+$/g;
    const sanitizedPayload = incomingDataPayload.replace(trimRegex, '');

    // Step 2: Define the separation token and split the sanitized string into components.
    const tokenSeparator = ' ';
    // Split the string into an array of potential words or segments.
    let rawSegments = sanitizedPayload.split(tokenSeparator);

    // Step 3: Filter out any empty segments that might occur from multiple spaces or
    // edge cases of the split operation, ensuring only meaningful segments are processed.
    const meaningfulSegments = rawSegments.filter(segment => segment.length > 0);

    // Define the exact count of initial characters we aim to extract.
    const desiredInitialCount = 3;
    // Initialize an array to store the capitalized first characters.
    const collectedCapitalizedChars = [];

    // Step 4: Iterate through the meaningful segments to extract and capitalize
    // the first character, up to the desired count.
    // A traditional for-loop provides explicit control over the iteration.
    for (let i = 0; i < Math.min(meaningfulSegments.length, desiredInitialCount); i++) {
        const currentSegmentEntry = meaningfulSegments[i];
        // Defensive check: ensure the segment has content before trying to access charAt(0).
        if (currentSegmentEntry.length > 0) {
            collectedCapitalizedChars.push(currentSegmentEntry.charAt(0).toUpperCase());
        }
    }

    // Post-processing validation: Check if enough initials were collected.
    if (collectedCapitalizedChars.length < desiredInitialCount) {
        // A non-fatal warning if fewer than expected initials were found.
        console.warn(`Warning: Could only extract ${collectedCapitalizedChars.length} initial(s). Expected ${desiredInitialCount}.`);
    }

    // Step 5: Concatenate the collected capitalized characters into a single output string.
    // Using Array.prototype.slice and Array.prototype.join for a concise concatenation.
    const finalResultString = collectedCapitalizedChars.slice(0, desiredInitialCount).join('');

    // Step 6: Output the final processed string to the standard console.
    console.log(finalResultString);
}

// --- Auxiliary Function for Input Acquisition ---

/**
 * Utility function to securely read content from a specified file path.
 * Includes basic error handling for file system operations.
 *
 * @param {string} filePath - The path to the file to be read.
 * @param {string} [encoding='utf8'] - The character encoding to use for reading the file.
 * @returns {string} The content of the file as a string, or an empty string on error.
 */
const acquireSystemInput = (filePath, encoding = 'utf8') => {
    try {
        // Dynamically require the 'fs' module for file system operations.
        const fileSystemUtility = require('fs');
        // Synchronously read the file content.
        return fileSystemUtility.readFileSync(filePath, encoding);
    } catch (ioError) {
        // Log detailed error information if file reading fails.
        console.error(`Error reading data from path "${filePath}": ${ioError.message}`);
        // Return an empty string to prevent further processing with undefined data.
        return '';
    }
};

// --- Execution Entry Point ---

// Define the standard input stream path, common in Unix-like systems.
const stdInputSourcePath = '/dev/stdin';
// Obtain the raw data from the standard input using the utility function.
const rawInputBuffer = acquireSystemInput(stdInputSourcePath);

// Invoke the main processing function with the acquired raw data.
processAndDisplayInitials(rawInputBuffer);