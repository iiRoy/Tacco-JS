/*
 * This module is responsible for reading input from a predefined source,
 * processing it line by line, and then displaying each line with an
 * associated case number.
 * It demonstrates basic file I/O and iteration patterns in Node.js.
 */

// Import the Node.js File System module. It's crucial for file operations.
const fileSystemModule = require('fs');

// Define constants for configuration, promoting maintainability and readability.
const INPUT_SOURCE_PATH = '/dev/stdin'; // Standard input file descriptor on Linux/macOS
const ENCODING_FORMAT = 'utf8';         // Specify character encoding for file operations
const CASE_PREFIX_LABEL = 'Case ';      // The fixed string label for each output line

/**
 * Reads the entire content from the specified input source.
 * Catches potential errors during file reading.
 * @returns {string} The raw content of the file, or an empty string if an error occurs.
 */
function acquireSourceData() {
    try {
        // Attempt to read the file synchronously.
        const rawBufferData = fileSystemModule.readFileSync(INPUT_SOURCE_PATH, ENCODING_FORMAT);
        // Ensure the data is treated as a string.
        return rawBufferData.toString();
    } catch (readError) {
        // Log the error for debugging purposes and return an empty string to prevent crashes.
        console.error(`Error encountered while reading from ${INPUT_SOURCE_PATH}:`, readError.message);
        return ''; // Return an empty string in case of an error
    }
}

/**
 * Processes a single line of text and formats it for display.
 * This helper function encapsulates the output string generation logic.
 * @param {string} lineContent - The actual content of the line to be displayed.
 * @param {number} sequenceNumber - The 1-based sequence number for the line.
 * @returns {string} The fully formatted output string ready for console display.
 */
const formatOutputEntry = (lineContent, sequenceNumber) => {
    // Using template literals for clear and concise string concatenation.
    return `${CASE_PREFIX_LABEL}${sequenceNumber}:${lineContent}`;
};

// --- Main Execution Flow ---

// 1. Obtain the raw data from the input source using our dedicated function.
const rawInputContent = acquireSourceData();

// 2. Perform an initial check: If the input is empty or consists only of whitespace,
//    there's nothing meaningful to process. This acts as a guard clause.
if (!rawInputContent || rawInputContent.trim().length === 0) {
    // console.log('No input data found. Program will terminate.'); // Optional informational message
    process.exit(0); // Exit gracefully if no meaningful input is provided
}

// 3. Split the raw content into an array of individual lines.
//    The `split('\n')` method creates an array where each element is a line.
const structuredDataLines = rawInputContent.split('\n');

// Initialize a counter for the case numbers. This counter will be incremented
// for each line processed, providing a 1-based sequence number.
let currentLineSequence = 0;

// Iterate over each line using the `forEach` array method for a more functional
// and often cleaner loop structure compared to a traditional `for` loop with manual index management.
structuredDataLines.forEach((individualLineText) => {
    // Increment the sequence counter for the current line *before* processing,
    // ensuring it represents the 1-based index for the *current* iteration.
    currentLineSequence++;

    // Optional Type III modification: Skip processing and printing if the line
    // is entirely empty or consists only of whitespace. The original code
    // would print "Case X:" for such lines, but this refines the output
    // to only show meaningful content. Remove this 'if' block to revert
    // to original behavior for empty lines.
    if (individualLineText.trim().length === 0) {
        return; // Skip the rest of this iteration and move to the next line
    }

    // Format the current line's content along with its sequence number
    // into the desired output string using our helper function.
    const formattedEntry = formatOutputEntry(individualLineText, currentLineSequence);

    // Print the final formatted string to the standard output console.
    console.log(formattedEntry);
});

// The program concludes after all lines have been processed and displayed.