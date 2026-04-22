/**
 * @file This script is designed to compute the Longest Common Subsequence (LCS)
 *       between two input strings. It employs a dynamic programming approach
 *       to efficiently determine the longest sequence of characters that
 *       appear in the same order in both strings, but not necessarily contiguously.
 *       The result is then printed to the standard output.
 */

/**
 * Computes the Longest Common Subsequence (LCS) string between two input sequences.
 * This implementation uses dynamic programming to build up a memoization table,
 * storing both the length and the actual subsequence string for each subproblem.
 *
 * @param {string} primaryInputSeq - The first string sequence for comparison.
 * @param {string} secondaryInputSeq - The second string sequence for comparison.
 * @returns {string} The longest common subsequence found between the two inputs.
 *                   Returns an empty string if inputs are invalid or no common subsequence exists.
 */
function determineCommonSequence(primaryInputSeq, secondaryInputSeq) {
    // --- Guard Clauses and Input Validation ---
    // Basic type checking to ensure inputs are indeed strings.
    if (typeof primaryInputSeq !== 'string' || typeof secondaryInputSeq !== 'string') {
        console.error("Input Error: Both arguments to determineCommonSequence must be strings.");
        return ""; // Return an empty string as an error indicator
    }

    const primaryLen = primaryInputSeq.length;
    const secondaryLen = secondaryInputSeq.length;

    // Handle trivial cases where one or both strings are empty.
    // The LCS of an empty string and any other string is always an empty string.
    if (primaryLen === 0 || secondaryLen === 0) {
        return "";
    }

    // --- Memoization Table Setup ---
    // The `lcsMemoTable` is a 2D array used to store intermediate results.
    // Each cell `lcsMemoTable[r][c]` will hold an array: `[length_of_LCS, LCS_string]`.
    // The dimensions are `(primaryLen + 1) x (secondaryLen + 1)` to accommodate
    // base cases for empty prefixes (row 0 and column 0).
    const lcsMemoTable = Array.from({ length: primaryLen + 1 }, () =>
        Array.from({ length: secondaryLen + 1 }, () => [0, ''])
    );

    // --- Dynamic Programming Calculation ---
    // We iterate through the table, filling it based on previous subproblem solutions.
    // `rowCursor` corresponds to an index in `primaryInputSeq` (adjusted for 1-based indexing).
    // `colCursor` corresponds to an index in `secondaryInputSeq` (adjusted for 1-based indexing).
    for (let rowCursor = 1; rowCursor <= primaryLen; ++rowCursor) {
        for (let colCursor = 1; colCursor <= secondaryLen; ++colCursor) {

            // Extract the characters being compared in the current step.
            const charFromPrimary = primaryInputSeq[rowCursor - 1];
            const charFromSecondary = secondaryInputSeq[colCursor - 1];

            if (charFromPrimary === charFromSecondary) {
                // Case 1: Characters Match!
                // If the characters at the current positions match, we extend the LCS
                // found for the subproblems excluding these characters (i.e., from the diagonal predecessor).
                const previousLCSData = lcsMemoTable[rowCursor - 1][colCursor - 1];
                const prevLCSLength = previousLCSData[0];
                const prevLCSString = previousLCSData[1];

                // The new LCS length increases by 1, and the matching character is appended.
                lcsMemoTable[rowCursor][colCursor] = [prevLCSLength + 1, prevLCSString + charFromPrimary];

            } else {
                // Case 2: Characters Do Not Match.
                // If the characters do not match, the LCS for the current cell is the maximum
                // of the LCS found by either:
                // a) Skipping the current character in `primaryInputSeq` (cell directly above).
                // b) Skipping the current character in `secondaryInputSeq` (cell directly to the left).

                const lcsFromAbove = lcsMemoTable[rowCursor - 1][colCursor]; // Data from skipping primary char
                const lcsFromLeft = lcsMemoTable[rowCursor][colCursor - 1];   // Data from skipping secondary char

                let currentMaxLCSLength;
                let currentMaxLCSString;

                // Determine which path yields a longer LCS.
                // If lengths are equal, the choice doesn't affect the length, but might affect the specific string
                // returned if multiple LCSs exist. Here, we prioritize the one from the left if equal or greater.
                if (lcsFromLeft[0] >= lcsFromAbove[0]) {
                    currentMaxLCSLength = lcsFromLeft[0];
                    currentMaxLCSString = lcsFromLeft[1];
                } else {
                    currentMaxLCSLength = lcsFromAbove[0];
                    currentMaxLCSString = lcsFromAbove[1];
                }
                // Assign the chosen LCS data to the current cell.
                lcsMemoTable[rowCursor][colCursor] = [currentMaxLCSLength, currentMaxLCSString];
            }
        }
    }

    // After filling the entire table, the final LCS string is located
    // in the bottom-right cell, which corresponds to the full `primaryInputSeq`
    // and `secondaryInputSeq`.
    const finalLCSResult = lcsMemoTable[primaryLen][secondaryLen];
    return finalLCSResult[1]; // Return only the string component of the result.
}

/**
 * Entry point function that orchestrates reading input, calling the LCS computation,
 * and displaying the final result to standard output.
 *
 * @param {string} rawInputData - The raw input string, typically read from a file,
 *                                expected to contain two lines, each a string.
 */
function processInputAndDisplay(rawInputData) {
    // --- Input Processing ---
    // Validate that the raw input data is a string.
    if (typeof rawInputData !== 'string') {
        console.error("Input Processing Error: Provided data for processing must be a string.");
        return;
    }

    // Trim whitespace and split the input into individual lines.
    const inputLines = rawInputData.trim().split("\n");

    // --- Input Validation for Expected Format ---
    // Ensure that at least two lines of input were provided.
    if (inputLines.length < 2) {
        console.error("Input Format Error: Insufficient input lines. Expected at least two strings for LCS calculation.");
        return;
    }

    // Extract the two strings from the input lines.
    const firstStringCandidate = inputLines[0];
    const secondStringCandidate = inputLines[1];

    // --- Execute LCS Computation and Handle Potential Errors ---
    try {
        // Invoke the core LCS logic.
        const computedLCS = determineCommonSequence(firstStringCandidate, secondStringCandidate);

        // --- Output Result ---
        // Display the computed LCS string.
        console.log(computedLCS);
    } catch (computationError) {
        // Catch any unexpected errors during the LCS computation.
        console.error("Runtime Error: An unexpected error occurred during LCS computation:", computationError.message);
        // As a fallback, print an empty line or a specific error indicator.
        console.log("");
    }
}

// --- Main Application Execution Block ---
// This self-invoking anonymous function serves as the application's entry point.
// It handles reading from standard input and then passes the data to the main processing logic.
(function executeApplication() {
    const fileSystemModule = require('fs'); // Node.js 'fs' module for file operations.
    const standardInputPath = '/dev/stdin'; // Standard input file path for many Unix-like systems.
    let fileContent; // Variable to hold the content read from the input file.

    try {
        // Attempt to synchronously read the entire content of the standard input file.
        // The 'utf8' encoding ensures the content is treated as a string.
        fileContent = fileSystemModule.readFileSync(standardInputPath, 'utf8');
    } catch (readError) {
        // If there's an error reading the file (e.g., file not found, permissions),
        // log the error and terminate the process gracefully.
        console.error(`File System Error: Failed to read from ${standardInputPath}:`, readError.message);
        process.exit(1); // Exit with a non-zero code to indicate an error.
    }

    // If file reading was successful, pass the content to the main processing function.
    processInputAndDisplay(fileContent);
})();