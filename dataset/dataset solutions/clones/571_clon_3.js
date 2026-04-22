// Type III Clone: This script processes lines from standard input to count occurrences of specific three-character sequences ("JOI" and "IOI").

// --- Configuration Section ---
// Define constants for input source and processing parameters.
const STANDARD_INPUT_FILE_PATH = '/dev/stdin';
const INPUT_CHARACTER_ENCODING = 'utf8';
const LINE_BREAK_DELIMITER = '\n';

// Define the specific sequences we are looking for and their common length.
const DESIRED_SEQUENCE_ONE = "JOI";
const DESIRED_SEQUENCE_TWO = "IOI";
const COMMON_SEQUENCE_LENGTH = 3; // Both "JOI" and "IOI" are 3 characters long.

// --- Core Logic ---

// Import the Node.js file system module. Using 'const' for modules is good practice.
const fileSystemUtility = require('fs');

let inputContentBuffer = ''; // Variable to hold the raw content read from the file.

try {
    // Attempt to synchronously read the entire content of the specified input file.
    inputContentBuffer = fileSystemUtility.readFileSync(STANDARD_INPUT_FILE_PATH, INPUT_CHARACTER_ENCODING);
} catch (fileReadError) {
    // If an error occurs during file reading (e.g., file not found, permission issues),
    // log the error and terminate the process gracefully.
    console.error(`ERROR: Failed to retrieve data from ${STANDARD_INPUT_FILE_PATH}. Reason: ${fileReadError.message}`);
    process.exit(1); // Exit with a non-zero code to indicate an error.
}

// Pre-process the raw input:
// 1. Remove any leading or trailing whitespace from the entire buffer.
// 2. Split the cleaned buffer into an array of individual text lines using the defined delimiter.
const individualTextLines = inputContentBuffer.trim().split(LINE_BREAK_DELIMITER);

// Iterate over each processed line to perform sequence counting.
// Using a 'for...of' loop provides a clear way to handle array elements.
for (const currentTextSegment of individualTextLines) {

    // --- Line-specific Processing ---

    // Introduce a guard clause: Skip lines that are too short to contain any of our target sequences.
    if (currentTextSegment.length < COMMON_SEQUENCE_LENGTH) {
        // Optionally, one could log a message here for debugging or analytics.
        continue; // Move to the next line without further processing.
    }

    // Initialize counters for the current line's sequence occurrences.
    let countOfJoiSequences = 0;
    let countOfIoiSequences = 0;

    // Cache the length of the current line for efficiency within the loop.
    const currentSegmentLength = currentTextSegment.length;

    // Loop through the current line, character by character, to extract potential sequences.
    // The loop runs until the starting index allows for a full 'COMMON_SEQUENCE_LENGTH' substring.
    for (let charStartIndex = 0; charStartIndex <= currentSegmentLength - COMMON_SEQUENCE_LENGTH; charStartIndex++) {

        // Extract a substring of the defined length starting from 'charStartIndex'.
        // String.prototype.slice() is used for its clarity and efficiency in substring extraction.
        const potentialMatchSequence = currentTextSegment.slice(charStartIndex, charStartIndex + COMMON_SEQUENCE_LENGTH);

        // Check if the extracted sequence matches the first desired pattern.
        if (potentialMatchSequence === DESIRED_SEQUENCE_ONE) {
            countOfJoiSequences++; // Increment the counter for "JOI".
        }
        // Use 'else if' to avoid unnecessary checks if a match for the first sequence is already found,
        // assuming the two desired sequences are distinct and cannot occupy the exact same three characters.
        else if (potentialMatchSequence === DESIRED_SEQUENCE_TWO) {
            countOfIoiSequences++; // Increment the counter for "IOI".
        }
    }

    // Output the final counts for the current line.
    // The original problem required printing each count on a new line.
    console.log(countOfJoiSequences);
    console.log(countOfIoiSequences);
}