'use strict';

/**
 * Processes a given text input to determine the number of distinct character blocks.
 * For instance, the sequence "AAABBC" contains 3 unique character runs (A, B, C).
 *
 * @param {string} rawInputData - The complete input string, typically from standard input.
 *                                It is expected to contain at least two lines:
 *                                1. An integer value (which is not directly utilized in this version).
 *                                2. The character sequence string that needs to be analyzed.
 */
const analyzeCharRuns = (rawInputData) => {
    // Perform initial validation to ensure the input data is a valid non-empty string.
    if (typeof rawInputData !== 'string' || rawInputData.trim().length === 0) {
        console.error("Execution Aborted: Input data must be a non-empty string.");
        return; // Terminate processing if input is invalid.
    }

    // Divide the received input into an array of lines based on newline characters.
    const inputLines = rawInputData.split('\n');

    // Verify that the input contains the minimum expected number of lines.
    if (inputLines.length < 2) {
        console.error("Execution Aborted: Insufficient input lines provided. Expected at least two distinct lines.");
        return;
    }

    // Extract the significant character sequence from the second line of the input.
    // Any leading or trailing whitespace on this line is removed to ensure clean data.
    const characterSequence = inputLines[1].trim();

    // If the extracted sequence is empty after trimming, there are no blocks to count.
    if (characterSequence.length === 0) {
        console.log(0); // Output zero blocks for an empty sequence.
        return;
    }

    // Initialize variables required for the character run analysis.
    let segmentCounter = 0;       // This will accumulate the total count of distinct character segments.
    let lastProcessedChar = null; // Stores the character from the immediately preceding iteration.
                                  // Initialized to 'null' to ensure the very first character is always counted.

    // Determine the total number of characters in the sequence for loop iteration.
    const totalSequenceLength = characterSequence.length;

    // Iterate through each character of the sequence from start to end.
    for (let charPosition = 0; charPosition < totalSequenceLength; ++charPosition) {
        const currentCharacter = characterSequence[charPosition]; // Retrieve the character at the current index.

        // Compare the current character with the last one processed.
        // If they are different, it signifies the beginning of a new character segment.
        if (currentCharacter !== lastProcessedChar) {
            segmentCounter++; // Increment the count for a new distinct segment.
        }

        // Update 'lastProcessedChar' to the current character for the subsequent iteration.
        lastProcessedChar = currentCharacter;
    }

    // Display the final calculated number of distinct character segments.
    console.log(segmentCounter);
};

/**
 * Helper function to securely obtain input data from the standard input stream.
 * Includes error handling for file system operations.
 *
 * @returns {string} The content read from /dev/stdin, or an empty string on failure.
 */
const retrieveStandardInputContent = () => {
    try {
        // Attempt to read the entire content of /dev/stdin as a UTF-8 encoded string.
        return require('node:fs').readFileSync('/dev/stdin', { encoding: 'utf8', flag: 'r' });
    } catch (ioError) {
        // Log any errors encountered during the file reading process.
        console.error("Failed to acquire data from standard input stream:", ioError.message);
        // Return an empty string to allow the main processing function to handle the absence of data.
        return '';
    }
};

// Execute the primary analysis function using data obtained from standard input.
analyzeCharRuns(retrieveStandardInputContent());