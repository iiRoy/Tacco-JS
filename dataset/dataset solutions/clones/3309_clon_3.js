'use strict'; // Enforce strict mode for cleaner code practices

/**
 * Calculates the Longest Common Subsequence (LCS) of two input strings.
 * This implementation uses a dynamic programming approach to find the LCS.
 *
 * @param {string} rawInputContent - The complete input string, typically from standard input,
 *                                   expected to contain two lines, each representing a sequence.
 * @returns {string} The computed Longest Common Subsequence string.
 */
function determineLongestCommonSubsequence(rawInputContent) {
  // Validate the presence and type of the input content.
  // This serves as a guard clause to handle invalid or missing input gracefully.
  if (!rawInputContent || typeof rawInputContent !== 'string') {
    // Log an error message for debugging purposes.
    console.error("LCS Error: Input content is invalid or missing. Expected a string.");
    return ""; // Return an empty string indicating failure or no LCS.
  }

  // Pre-process the raw input data:
  // 1. Remove any leading/trailing whitespace from the entire input block.
  // 2. Split the cleaned input into an array of strings based on newline characters.
  const processedLines = rawInputContent.trim().split('\n');

  // Another guard clause: ensure that there are at least two lines available
  // for the two sequences required for LCS calculation.
  if (processedLines.length < 2) {
    console.error("LCS Error: Insufficient input lines. Expected at least two distinct strings.");
    return ""; // Return an empty string if minimum input is not met.
  }

  // Extract the two primary sequences (strings) from the processed input array.
  // These will be the operands for our LCS algorithm.
  const primarySequence = processedLines[0]; // The first string to compare.
  const secondarySequence = processedLines[1]; // The second string to compare.

  // Determine the lengths of the primary and secondary sequences.
  // These lengths will be crucial for defining the dimensions of our
  // dynamic programming table and for loop boundaries.
  const primaryLen = primarySequence.length;
  const secondaryLen = secondarySequence.length;

  // Initialize the dynamic programming table (matrix).
  // This matrix, named 'lcsResultMatrix', will store the LCS of all
  // prefixes of the two input sequences. Its dimensions are (primaryLen + 1) x (secondaryLen + 1)
  // to account for empty string prefixes (base cases).
  const lcsResultMatrix = [];
  for (let rowIndex = 0; rowIndex <= primaryLen; rowIndex++) {
    // For each row, create a new array to represent the column data.
    const rowEntries = [];
    for (let colIndex = 0; colIndex <= secondaryLen; colIndex++) {
      // Initially, all cells are filled with an empty string.
      // This represents the LCS of empty prefixes or when no common subsequence has been found yet.
      rowEntries.push('');
    }
    lcsResultMatrix.push(rowEntries);
  }

  // Populate the 'lcsResultMatrix' using a nested loop iteration.
  // The loops iterate over the characters of the sequences.
  // Note that 'currentPrimaryIdx' and 'currentSecondaryIdx' are 0-indexed,
  // while the DP table indices 'currentPrimaryIdx + 1' and 'currentSecondaryIdx + 1' are 1-indexed
  // to align with the (length + 1) dimensions.
  for (let currentPrimaryIdx = 0; currentPrimaryIdx < primaryLen; currentPrimaryIdx++) {
    // Fetch the current character from the primary sequence for efficiency and clarity.
    const charFromPrimary = primarySequence[currentPrimaryIdx];

    for (let currentSecondaryIdx = 0; currentSecondaryIdx < secondaryLen; currentSecondaryIdx++) {
      // Fetch the current character from the secondary sequence.
      const charFromSecondary = secondarySequence[currentSecondaryIdx];

      // Core logic of the LCS algorithm:
      // Compare the characters at the current indices from both sequences.
      if (charFromSecondary === charFromPrimary) {
        // Case 1: Characters match.
        // The LCS at this position is formed by taking the LCS of the preceding
        // substrings (diagonal element) and appending the current matching character.
        lcsResultMatrix[currentPrimaryIdx + 1][currentSecondaryIdx + 1] =
          lcsResultMatrix[currentPrimaryIdx][currentSecondaryIdx] + charFromPrimary;
      } else {
        // Case 2: Characters do not match.
        // The LCS at this position is the longer of two possibilities:
        // a) LCS obtained by excluding the current character from the primary sequence.
        // b) LCS obtained by excluding the current character from the secondary sequence.

        // Retrieve the potential LCS candidates from the left and top cells in the DP table.
        const candidateOne = lcsResultMatrix[currentPrimaryIdx + 1][currentSecondaryIdx]; // From excluding primary's char
        const candidateTwo = lcsResultMatrix[currentPrimaryIdx][currentSecondaryIdx + 1]; // From excluding secondary's char

        // Compare the lengths of the two candidates to find the longer one.
        const lengthOfCandidateOne = candidateOne.length;
        const lengthOfCandidateTwo = candidateTwo.length;

        // Assign the longer LCS to the current cell in the matrix.
        if (lengthOfCandidateOne > lengthOfCandidateTwo) {
          lcsResultMatrix[currentPrimaryIdx + 1][currentSecondaryIdx + 1] = candidateOne;
        } else {
          lcsResultMatrix[currentPrimaryIdx + 1][currentSecondaryIdx + 1] = candidateTwo;
        }
      }
    }
  }

  // After the loops complete, the final Longest Common Subsequence is stored
  // in the bottom-right cell of the 'lcsResultMatrix'.
  return lcsResultMatrix[primaryLen][secondaryLen];
}

// Main execution block:
// This part handles reading input and displaying the final result.
// It uses Node.js's 'fs' module to synchronously read data from standard input ('/dev/stdin').
const standardInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Call the 'determineLongestCommonSubsequence' function with the obtained input.
// The result (the LCS string) is then printed to the console.
console.log(determineLongestCommonSubsequence(standardInputData));