'use strict'; // Enforce strict JavaScript practices for better code quality and fewer errors.

/**
 * @constant {string} TARGET_SEQUENCE - Defines the specific two-character sequence that the program aims to detect within the input string.
 */
const TARGET_SEQUENCE = 'AC';

/**
 * Orchestrates the entire process of analyzing the input data.
 * It handles input validation, delegates the core pattern search, and manages the final output.
 *
 * @param {string} rawTextContent - The complete input received, typically from standard input.
 */
const analyzeInputString = (rawTextContent) => {
    // --- Input Processing and Initial Validation (Type III: Guard clauses, simplified parsing) ---

    // First, ensure that the raw input content is not empty or merely whitespace.
    if (!rawTextContent || rawTextContent.trim().length === 0) {
        displayOutcome(false); // If no meaningful input, the pattern cannot be found.
        return;
    }

    // Extract the very first line from the input. This is where the string to be searched is expected.
    // Type III: Simplified parsing - directly accessing the first line's first token.
    const firstMeaningfulLine = rawTextContent.split('\n')[0];

    // Validate the extracted first line itself. It should not be empty.
    if (!firstMeaningfulLine || firstMeaningfulLine.trim().length === 0) {
        displayOutcome(false); // An empty first line means no search string.
        return;
    }

    // From the first line, extract the first space-separated token. This is the primary string for our search.
    // Type II: Renamed identifier from 'S' to 'sourceString' for clarity.
    const sourceString = firstMeaningfulLine.split(' ')[0];

    // Perform a crucial guard check: The source string must be long enough to contain the target pattern.
    // Type III: Guard clause - if the string is shorter than the pattern, a match is impossible.
    if (typeof sourceString !== 'string' || sourceString.length < TARGET_SEQUENCE.length) {
        displayOutcome(false); // String is too short to possibly contain 'AC'.
        return;
    }

    // --- Core Pattern Detection (Type III: Encapsulated logic, rewritten loop structure) ---

    // Delegate the actual pattern scanning to a specialized helper function.
    const patternFound = scanForTargetSequence(sourceString, TARGET_SEQUENCE);

    // --- Final Output Generation (Type III: Helper function for consistent display) ---
    displayOutcome(patternFound);
};

/**
 * Performs the actual scan of a given string to determine if a specific two-character pattern exists within it.
 *
 * @param {string} searchSpace - The string within which the pattern is to be searched.
 * @param {string} soughtPattern - The specific two-character pattern (e.g., 'AC') to locate.
 * @returns {boolean} Returns `true` if the `soughtPattern` is found in `searchSpace`, otherwise `false`.
 */
const scanForTargetSequence = (searchSpace, soughtPattern) => {
    // Type II: Renamed variables for better readability.
    const searchSpaceLength = searchSpace.length;
    const patternLength = soughtPattern.length; // For 'AC', this will be 2.

    // Type II: Renamed the boolean flag from 'ans' to 'isPatternIdentified'.
    let isPatternIdentified = false;

    // Type III: Structural change - replaced the 'for' loop with a 'while' loop.
    // Type II: Renamed loop counter from 'i' to 'currentPosition'.
    let currentPosition = 0;

    // The loop iterates as long as there are enough characters remaining in the search space
    // to form a complete pattern match.
    while (currentPosition <= searchSpaceLength - patternLength) {
        // Type III: Rewritten comparison logic. Instead of creating a substring ('slice' or 'substring'),
        // we directly compare individual characters. This can be slightly more efficient.
        if (searchSpace[currentPosition] === soughtPattern[0] &&
            searchSpace[currentPosition + 1] === soughtPattern[1]) {
            isPatternIdentified = true;
            // Type III: Added an early exit (break) to optimize performance once the pattern is found,
            // as further searching is unnecessary.
            break;
        }
        currentPosition++; // Move to the next character in the search space.
    }

    return isPatternIdentified;
};

/**
 * Handles the final output to the console based on whether the pattern was successfully found.
 *
 * @param {boolean} successFlag - A boolean indicating if the pattern was found (`true`) or not (`false`).
 */
const displayOutcome = (successFlag) => {
    // Type III: Introduced constants for output messages for consistency and easy modification.
    const SUCCESS_MESSAGE = 'Yes';
    const FAILURE_MESSAGE = 'No';

    // Type II: Reformatted the conditional output.
    const finalOutput = successFlag ? SUCCESS_MESSAGE : FAILURE_MESSAGE;
    console.log(finalOutput);
};

// --- Main Program Execution Block (Type III: Robust error handling for I/O operations) ---

// Type II: Enhanced comments and reformatting for the file system interaction.
// This block is responsible for reading input from the standard input stream.
try {
    // Dynamically require the 'fs' (file system) module from Node.js.
    const fileSystemUtility = require('fs');
    // Define the standard input device path, common in Unix-like systems.
    const standardInputDevice = '/dev/stdin';
    // Specify the character encoding for reading the file content.
    const fileEncoding = 'utf8';

    // Read the entire content from the standard input device synchronously.
    const allInputContent = fileSystemUtility.readFileSync(standardInputDevice, fileEncoding);

    // Once the content is successfully read, pass it to the main analysis function.
    analyzeInputString(allInputContent);

} catch (ioError) {
    // Type III: Comprehensive error handling for potential issues during file reading.
    // This catches errors like file not found (though less likely for /dev/stdin), permission issues, etc.
    console.error(`An unexpected error occurred during input file processing: ${ioError.message}`);
    // In case of an error, we still provide a clear outcome, indicating failure.
    displayOutcome(false);
    // Optionally, exit the process with a non-zero status code to signal an abnormal termination.
    // process.exit(1);
}