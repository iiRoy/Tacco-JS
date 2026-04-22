'use strict';

/**
 * Calculates the longest common subsequence (LCS) string between two input character sequences.
 * This method employs dynamic programming to construct the solution iteratively.
 *
 * @param {string} primaryString The initial character sequence for comparison.
 * @param {string} secondaryString The second character sequence for comparison.
 * @returns {string} The computed longest common subsequence string.
 */
function computeSequence(primaryString, secondaryString) {
  // Initialize a 2D array (often called a memoization table or DP table).
  // Each cell [rowIdx][colIdx] will store an array containing two items:
  // [0]: The length of the LCS found so far for substrings ending at primaryString[rowIdx-1] and secondaryString[colIdx-1].
  // [1]: The actual LCS string itself for those substrings.
  const memoTable = Array(primaryString.length + 1)
    .fill(null) // Initialize outer array elements with null before mapping
    .map(outerElement => Array(secondaryString.length + 1)
      .fill([0, ''])); // Initialize inner arrays with base LCS state (length 0, empty string)

  // Iterate through the primary string (rows of the memoTable).
  for (let rowIdx = 1; rowIdx <= primaryString.length; ++rowIdx) {
    // Iterate through the secondary string (columns of the memoTable).
    for (let colIdx = 1; colIdx <= secondaryString.length; ++colIdx) {
      // Check if the characters at the current positions in both sequences are identical.
      // Note: We use rowIdx-1 and colIdx-1 to access string characters because the memoTable
      // has an extra row/column for base cases (empty string comparisons).
      if (primaryString[rowIdx - 1] === secondaryString[colIdx - 1]) {
        // If characters match, the LCS is extended from the diagonal predecessor cell.
        // We increment the length by 1 and append the matching character to the LCS string.
        memoTable[rowIdx][colIdx] = [
          1 + memoTable[rowIdx - 1][colIdx - 1][0], // New LCS length
          memoTable[rowIdx - 1][colIdx - 1][1] + primaryString[rowIdx - 1] // New LCS string
        ];
      } else {
        // If characters do not match, the LCS is the maximum of the LCS from
        // the cell directly to the left (excluding current char from primary)
        // or the cell directly above (excluding current char from secondary).
        const lengthFromLeft = memoTable[rowIdx][colIdx - 1][0]; // LCS length from cell (rowIdx, colIdx-1)
        const lengthFromAbove = memoTable[rowIdx - 1][colIdx][0]; // LCS length from cell (rowIdx-1, colIdx)

        // Determine which path yields the greater LCS length.
        const currentLcsLength = lengthFromLeft > lengthFromAbove ? lengthFromLeft : lengthFromAbove;
        // Also retrieve the corresponding LCS string from that path.
        const currentLcsString = lengthFromLeft > lengthFromAbove ? memoTable[rowIdx][colIdx - 1][1] : memoTable[rowIdx - 1][colIdx][1];

        // Store the chosen LCS length and string in the current cell.
        memoTable[rowIdx][colIdx] = [currentLcsLength, currentLcsString];
      }
    }
  }

  // After filling the entire memoTable, the final LCS string for the complete primaryString and secondaryString
  // is located at the bottom-rightmost cell of the table.
  return memoTable[primaryString.length][secondaryString.length][1];
}

/**
 * This function serves as the primary entry point for the program.
 * It handles input parsing, calls the core logic, and manages output.
 *
 * @param {string} rawData The raw input string, typically read from standard input,
 *                         expected to contain two lines, each a sequence of characters.
 */
function executeProgram(rawData) {
  // Split the raw input string into an array of individual lines.
  const inputLines = rawData.split('\n');

  // Extract the first sequence from the first line of input.
  const primarySequence = inputLines[0];
  // Extract the second sequence from the second line of input.
  const secondarySequence = inputLines[1];

  // Invoke the sequence comparison function to compute the longest common subsequence.
  const finalResult = computeSequence(primarySequence, secondarySequence);

  // Output the determined longest common subsequence to the console.
  console.log(finalResult);
}

// The program starts by reading input from standard input (/dev/stdin),
// encoding it as UTF-8, and then passing it to the main execution function.
executeProgram(require('fs').readFileSync('/dev/stdin', 'utf8'));