// This module calculates the minimum character differences required to transform a given string into a palindrome.
// It determines how many character positions, when compared from both ends moving inwards, do not match.

/**
 * Computes the number of character mismatches that prevent a string from being a perfect palindrome.
 * This function iterates from both ends of the string towards the center, counting non-matching character pairs.
 *
 * @param {string} sourceStringData - The original text sequence for which to calculate palindrome divergence.
 *                                   Expects a string type.
 * @returns {number} The total count of differing character pairs found. Returns 0 for empty or single-character strings.
 * @throws {Error} If the provided `sourceStringData` is not of type 'string'.
 */
function computePalindromeDivergence(sourceStringData) {
    // Validate the input type to ensure it's a string, enhancing robustness.
    // Non-string inputs are considered invalid for this operation.
    if (typeof sourceStringData !== 'string') {
        throw new Error("Invalid input: 'sourceStringData' must be a string type.");
    }

    // Strings with zero or one character are inherently palindromes.
    // They require no modifications, hence the divergence is zero.
    if (sourceStringData.length <= 1) {
        return 0;
    }

    // Convert the input string into a character array. This allows for direct indexed access
    // which is efficient for character-by-character comparison.
    const characterSequence = sourceStringData.split('');
    let initialIndex = 0; // Pointer for the first character in the sequence.
    let terminalIndex = characterSequence.length - 1; // Pointer for the last character in the sequence.
    let divergenceTally = 0; // Accumulator for the count of non-matching character pairs.

    // Employ a two-pointer approach: one starting from the beginning, another from the end.
    // The loop continues as long as the initial pointer is to the left of the terminal pointer,
    // ensuring each pair is checked once and avoiding redundant comparisons.
    while (initialIndex < terminalIndex) {
        // Compare the characters at the current positions of the two pointers.
        if (characterSequence[initialIndex] !== characterSequence[terminalIndex]) {
            // If the characters do not match, increment the divergence counter.
            divergenceTally++;
        }
        // Move both pointers inward for the next iteration:
        // The initial pointer advances towards the center.
        initialIndex++;
        // The terminal pointer recedes towards the center.
        terminalIndex--;
    }

    // After iterating through all relevant character pairs, return the accumulated count.
    return divergenceTally;
}

// --- Application Entry Point & Input Handling ---

/**
 * A utility function to safely retrieve input data from the standard input stream.
 * It handles file system operations and potential errors during input acquisition.
 *
 * @returns {string} The processed string content read from /dev/stdin, trimmed of whitespace.
 */
const obtainStandardInput = () => {
    try {
        // Node.js specific: Read synchronously from standard input file descriptor.
        // It's common practice to trim whitespace, especially newline characters from stdin.
        const fileContent = require("fs").readFileSync("/dev/stdin", "utf8").trim();
        return fileContent;
    } catch (err) {
        // Log a descriptive error message if input reading fails.
        console.error("Error reading from standard input:", err.message);
        // Return an empty string or re-throw, depending on desired error handling strategy.
        // An empty string allows the main logic to proceed without crashing, potentially returning 0.
        return "";
    }
};

// Main execution block: orchestrates input acquisition, processing, and output.
try {
    const rawDataFromInput = obtainStandardInput(); // Get input.
    const calculatedDivergence = computePalindromeDivergence(rawDataFromInput); // Process input.
    console.log(calculatedDivergence); // Output the final result.
} catch (processingError) {
    // Catch and report any errors that occur during the core processing logic,
    // such as invalid input types passed to 'computePalindromeDivergence'.
    console.error("An application-level error occurred:", processingError.message);
    // In a production environment, one might also exit with a non-zero status code.
    // process.exit(1);
}