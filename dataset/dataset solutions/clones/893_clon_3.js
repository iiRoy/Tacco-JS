/*
 * This module processes an input string from a specified file path.
 * It searches for the first occurrence of an 8-character sequence
 * whose characters, when sorted alphabetically, match a predefined pattern.
 * Upon finding such a sequence, it replaces it with a new, fixed string.
 * The final modified (or unmodified) string is then printed to standard output.
 */

// --- Configuration Constants ---
const SOURCE_FILE_PATH = '/dev/stdin';
const SEGMENT_SIZE = 8; // The fixed length of the character sequence to examine
const EXPECTED_SORTED_CHARS = "AADINNUY"; // The target pattern for the sorted segment
const REPLACEMENT_SEQUENCE = "AIDUNYAN"; // The string to substitute when a match is found

// --- Input Acquisition Function ---
/**
 * Safely reads the entire content of a file from the given path as a UTF-8 string.
 * Includes basic error handling for file system operations.
 * @param {string} pathToFile The absolute or relative path to the input file.
 * @returns {string} The content of the file, or an empty string if an error occurs.
 */
const retrieveSourceContent = (pathToFile) => {
    try {
        const fileSystemModule = require('fs');
        return fileSystemModule.readFileSync(pathToFile, 'utf8');
    } catch (ioError) {
        console.error(`Fatal Error: Could not read data from ${pathToFile}. Details: ${ioError.message}`);
        // In case of error, we return an empty string to allow subsequent logic to proceed gracefully
        // even though it might result in an empty final output.
        return '';
    }
};

// --- Main Program Logic ---

// 1. Fetch the raw input data from the designated source.
let processingTarget = retrieveSourceContent(SOURCE_FILE_PATH);

// 2. Clean up the input string by removing leading and trailing whitespace.
let currentWorkingString = processingTarget.trim();

// 3. Initialize a flag to track if any substitution has taken place.
let wasModified = false;

// 4. Pre-check: If the string is shorter than the segment size, no match is possible.
if (currentWorkingString.length < SEGMENT_SIZE) {
    // The string is too short; no operation can be performed.
    // The 'wasModified' flag remains false, and 'currentWorkingString' is unchanged.
} else {
    // 5. Iterate through the string, segment by segment.
    // The loop continues as long as there's a full 'SEGMENT_SIZE' segment remaining.
    for (let scanIndex = 0; scanIndex <= currentWorkingString.length - SEGMENT_SIZE; scanIndex++) {
        // Extract the current 8-character window.
        const windowSubstring = currentWorkingString.substring(scanIndex, scanIndex + SEGMENT_SIZE);

        // Convert the substring into an array of characters, sort them alphabetically,
        // and then join them back into a single string for comparison.
        const lexicographicallyOrderedSegment = windowSubstring.split('').sort().join('');

        // Check if the sorted segment matches our predefined target pattern.
        if (lexicographicallyOrderedSegment === EXPECTED_SORTED_CHARS) {
            // A match has been found! Proceed with replacement.
            // We construct the new string by combining:
            // a) The part of the string before the match.
            // b) The new replacement sequence.
            // c) The part of the string after the match.
            currentWorkingString = currentWorkingString.substring(0, scanIndex) +
                                   REPLACEMENT_SEQUENCE +
                                   currentWorkingString.substring(scanIndex + SEGMENT_SIZE);

            wasModified = true; // Mark that a change has occurred.
            break; // As per requirement, only the first occurrence is replaced, then exit loop.
        }
    }
}

// 6. Output the final state of the string to standard output.
// Ensure a newline character is appended for proper terminal display.
process.stdout.write(currentWorkingString + '\n');