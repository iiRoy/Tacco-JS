'use strict'

/**
 * Helper function to efficiently extract unique characters from a given array of characters.
 * It converts the array into a Set, which inherently stores only unique elements.
 * @param {Array<string>} charSegment - An array representing a segment of the main string.
 * @returns {Set<string>} A Set containing all unique characters from the input segment.
 */
const obtainDistinctCharacters = (charSegment) => {
    return new Set(charSegment);
};

/**
 * Processes raw input data to find the maximum number of unique characters
 * that are common between any two non-empty substrings formed by splitting the main string.
 *
 * @param {string} rawInputData - The raw input string, expected to contain N on the first line
 *                                and the string S on the second line, separated by a newline.
 */
function ProcessInputData(rawInputData) {
    // The 'use strict' directive ensures stricter parsing and error handling.

    // Split the incoming raw data into individual lines to parse N and the character string.
    const inputLines = rawInputData.split('\n');

    // Parse the length of the string from the first line.
    const stringLength = Number(inputLines[0]);

    // Implement a basic guard clause for invalid or insufficient string length.
    // A string must have at least 2 characters to have any valid split point (e.g., 'a' | 'b').
    if (isNaN(stringLength) || stringLength < 2) {
        // If no meaningful splits can be performed, the result is 0 common characters.
        console.log(0);
        return;
    }

    // Convert the second line of input into an array of individual characters for easier manipulation.
    const characterSequence = inputLines[1].split('');

    // Initialize a variable to keep track of the highest count of common unique characters found
    // across all possible split configurations.
    let greatestCommonCharCount = 0;

    // Iterate through all possible split points for the character sequence.
    // 'partitionIndex' represents the end of the left segment (exclusive) and start of the right segment (inclusive).
    // It ranges from 1 (first char in left, rest in right) up to stringLength - 1 (all but last in left, last in right).
    for (let partitionIndex = 1; partitionIndex < stringLength; ++partitionIndex) {

        // Extract the left segment of the character sequence.
        // This segment includes characters from the beginning up to 'partitionIndex - 1'.
        const leftSegment = characterSequence.slice(0, partitionIndex);

        // Extract the right segment of the character sequence.
        // This segment includes characters from 'partitionIndex' to the end.
        const rightSegment = characterSequence.slice(partitionIndex);

        // Obtain sets of unique characters for both the left and right segments using the helper function.
        // Using Sets provides efficient lookups (average O(1)) for checking character presence.
        const distinctLeftSet = obtainDistinctCharacters(leftSegment);
        const distinctRightSet = obtainDistinctCharacters(rightSegment);

        // Initialize a temporary counter for common unique characters for the current split.
        let currentSplitIntersectionSize = 0;

        // Iterate over each distinct character found in the left segment.
        // For each character, check if it also exists in the set of distinct characters from the right segment.
        for (const charItem of distinctLeftSet) {
            if (distinctRightSet.has(charItem)) {
                // If the character is present in both sets, increment the intersection counter.
                currentSplitIntersectionSize++;
            }
        }

        // After processing the current split, compare its common character count
        // with the greatest count found so far and update if necessary.
        if (currentSplitIntersectionSize > greatestCommonCharCount) {
            greatestCommonCharCount = currentSplitIntersectionSize;
        }
    }

    // Output the final maximum count of unique characters that were common
    // to both halves of any split of the input string.
    console.log(greatestCommonCharCount);
}

// Standard entry point for competitive programming in Node.js:
// Read all input from standard input, decode it as UTF-8, and trim any whitespace.
// Then, pass the cleaned input string to our main processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());