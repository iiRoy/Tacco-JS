/**
 * This script processes pairs of strings from standard input. For each pair,
 * it identifies the length of the longest common substring that satisfies a
 * specific condition: the substring must be found in the *longer* string
 * at an index greater than zero (i.e., not at the very beginning).
 * This is a Type III clone, incorporating extensive structural and stylistic
 * modifications while preserving the original functional behavior.
 */

// Define the file path for standard input as a constant.
const STANDARD_INPUT_SOURCE = "/dev/stdin";

/**
 * Prepares raw input data by normalizing line endings and splitting into an array of lines.
 * This function handles potential inconsistencies in line termination characters.
 * @param {string} rawContent - The raw string data read from the input source.
 * @returns {string[]} An array where each element is a processed line from the input.
 */
const cleanseAndSplitInput = (rawContent) => {
    // Replace all carriage returns to ensure consistent newline splitting across platforms.
    // Then, split the cleaned string into an array of lines.
    return rawContent.replace(/\r/g, '').split("\n");
};

/**
 * Determines the shorter and longer of two given strings.
 * This is an optimization strategy for the core algorithm, where iterating
 * through the shorter string for substrings is more efficient.
 * @param {string} firstCandidate - The first string for comparison.
 * @param {string} secondCandidate - The second string for comparison.
 * @returns {{shorter: string, longer: string}} An object containing the two strings,
 *                                            labeled as 'shorter' and 'longer'.
 */
const identifyStringOrder = (firstCandidate, secondCandidate) => {
    if (firstCandidate.length < secondCandidate.length) {
        return { shorter: firstCandidate, longer: secondCandidate };
    } else {
        return { shorter: secondCandidate, longer: firstCandidate };
    }
};

// Synchronously read the entire content of the standard input file.
// 'utf8' encoding ensures correct interpretation of characters.
const completeInputData = require("fs").readFileSync(STANDARD_INPUT_SOURCE, "utf8");

// Process the raw input data into an iterable buffer of lines.
let processedInputLines = cleanseAndSplitInput(completeInputData);

// Control flag for the main processing loop. Set to true initially to start.
let shouldContinueProcessingPairs = true;

// The main loop iterates as long as there are input pairs to process
// and no termination condition (empty line) has been met.
while (shouldContinueProcessingPairs) {
    // Initialize the maximum common substring length for the current pair.
    let currentPairLongestMatch = 0;

    // Extract the first string for the current pair from the buffer.
    // `shift()` removes the first element and returns it, advancing the buffer.
    const firstStringOfPair = processedInputLines.shift();

    // Check for the termination condition: an empty string indicates the end of input data.
    // Also handles cases where `shift()` might return `undefined` if the buffer is exhausted.
    if (firstStringOfPair === '' || firstStringOfPair === undefined) {
        shouldContinueProcessingPairs = false; // Set flag to exit the loop gracefully.
        continue; // Skip the rest of the current iteration.
    }

    // Extract the second string for the current pair.
    const secondStringOfPair = processedInputLines.shift();

    // Determine the shorter and longer strings from the current pair.
    const { shorter: sourceForSubstrings, longer: targetForSearch } =
        identifyStringOrder(firstStringOfPair, secondStringOfPair);

    // Iterate through all possible starting positions in the shorter string.
    for (let currentStartIndex = 0; currentStartIndex < sourceForSubstrings.length; currentStartIndex++) {
        // Initialize the length of the potential common substring starting at `currentStartIndex`.
        let potentialMatchLength = 1;

        // Inner loop to progressively extend the substring and check its presence.
        // This loop continues until a specific search condition is no longer met.
        while (true) {
            // Construct the substring to be tested based on current start index and length.
            const testSubstring = sourceForSubstrings.slice(currentStartIndex, currentStartIndex + potentialMatchLength);

            // Guard against creating substrings that extend beyond the source string's bounds.
            // This ensures `testSubstring` is always valid.
            if (currentStartIndex + potentialMatchLength > sourceForSubstrings.length) {
                break; // Cannot form a longer substring from this starting position.
            }

            // Perform the search for the `testSubstring` within the `targetForSearch` string.
            // CRITICAL BEHAVIOR: The original code specifically checks for `> 0`.
            // This means substrings found at the *very beginning* (index 0) of the target
            // string are *ignored* for extension purposes. This exact quirky behavior is preserved.
            const searchIndexResult = targetForSearch.indexOf(testSubstring);

            if (searchIndexResult > 0) {
                // If found at an index greater than 0, increment length and re-check with longer substring.
                potentialMatchLength++;
            } else {
                // If not found, or found at index 0, or `indexOf` returns -1, stop extending.
                break;
            }
        }

        // After the inner loop, `potentialMatchLength` will be one greater than the
        // length of the last successfully matched substring (due to post-increment).
        // Adjust and update the overall maximum length for the current pair if applicable.
        const actualMatchLength = potentialMatchLength - 1;
        if (actualMatchLength > currentPairLongestMatch) {
            currentPairLongestMatch = actualMatchLength;
        }
    }

    // Output the final calculated longest match length for the current string pair.
    console.log(currentPairLongestMatch);
}