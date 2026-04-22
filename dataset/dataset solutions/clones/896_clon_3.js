const fileSystemModule = require('fs');

// Define constants to improve readability and maintainability of the code.
const INPUT_FILE_PATH = '/dev/stdin';
const SEARCH_WINDOW_LENGTH = 8;
const REQUIRED_ANAGRAM_SORTED_FORM = "AADINNUY"; // The sorted character sequence we are looking for.
const REPLACEMENT_VALUE = "AIZUNYAN"; // The string to substitute when a match is found.

/**
 * Generates the canonical (sorted) form of a given string segment.
 * This helper function ensures consistency in comparing character sequences.
 * @param {string} segmentInput - The string segment to process.
 * @returns {string} The sorted string of characters. Returns an empty string for invalid input.
 */
const obtainSortedCharacterSequence = (segmentInput) => {
    // A quick check to ensure the input is a valid string.
    if (typeof segmentInput !== 'string' || segmentInput === null || segmentInput === undefined) {
        console.warn("Warning: Attempted to sort a non-string input:", typeof segmentInput, segmentInput);
        return "";
    }
    // Split the string into an array of characters, sort them, and then join them back.
    return segmentInput.split('').sort().join('');
};

let rawDataBuffer;
try {
    // Attempt to read the entire file content synchronously from the specified path.
    // The 'utf8' encoding ensures the data is treated as a string.
    rawDataBuffer = fileSystemModule.readFileSync(INPUT_FILE_PATH, 'utf8');
} catch (dataReadError) {
    // If any error occurs during file reading (e.g., file not found, permissions issue),
    // log the error message and terminate the process with an error code.
    console.error(`Error encountered while reading from ${INPUT_FILE_PATH}: ${dataReadError.message}`);
    process.exit(1);
}

// Process the raw input: remove any leading or trailing whitespace characters.
let mutableContentString = rawDataBuffer.trim();

// Implement a guard clause: If the content is too short to possibly contain the target segment,
// there's no need to proceed with the search.
if (mutableContentString.length < SEARCH_WINDOW_LENGTH) {
    // Output the original (trimmed) string as no replacement could have occurred.
    console.log(mutableContentString);
    // Optionally, exit here as no further action is possible or needed.
    // process.exit(0);
} else {
    let wasReplacementMade = false; // A flag to track if any substitution was performed.

    // Iterate through the string using a sliding window approach.
    // The loop continues as long as a full 'SEARCH_WINDOW_LENGTH' segment can be extracted.
    for (let windowStartIndex = 0; windowStartIndex <= mutableContentString.length - SEARCH_WINDOW_LENGTH; windowStartIndex++) {
        // Extract the current segment of characters based on the window length.
        const currentCharacterWindow = mutableContentString.substring(windowStartIndex, windowStartIndex + SEARCH_WINDOW_LENGTH);

        // Get the sorted form of the current segment for comparison.
        const currentWindowSortedForm = obtainSortedCharacterSequence(currentCharacterWindow);

        // Check if the sorted form of the current segment matches our target anagram pattern.
        if (currentWindowSortedForm === REQUIRED_ANAGRAM_SORTED_FORM) {
            // If a match is found, reconstruct the string with the replacement.
            // This involves three parts:
            // 1. The portion of the string before the matched segment.
            // 2. The new replacement value.
            // 3. The portion of the string after the matched segment.
            const precedingPart = mutableContentString.slice(0, windowStartIndex);
            const succeedingPart = mutableContentString.slice(windowStartIndex + SEARCH_WINDOW_LENGTH);
            mutableContentString = precedingPart + REPLACEMENT_VALUE + succeedingPart;

            wasReplacementMade = true; // Set the flag to true.
            break; // Exit the loop immediately after the first replacement, as per original logic.
        }
    }

    // Finally, print the resulting string, which may or may not have been modified.
    console.log(mutableContentString);
}