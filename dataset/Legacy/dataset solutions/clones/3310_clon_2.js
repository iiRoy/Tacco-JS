'use strict';

/**
 * Computes the Longest Common Subsequence (LCS) string between two input strings.
 * This implementation uses dynamic programming.
 *
 * @param {string} strA The first input string.
 * @param {string} strB The second input string.
 * @returns {string} The longest common subsequence string.
 */
function computeLCS(strA, strB) {
  // Initialize a 2D array (memoTable) to store results of subproblems.
  // Each cell will store an array: [length_of_lcs, lcs_string].
  // The dimensions are (strA.length + 1) x (strB.length + 1).
  let memoTable = new Array(strA.length + 1).fill(null).map(() => new Array(strB.length + 1).fill([0, ""]));

  // Iterate through the strings to fill the memoTable.
  // rowIdx corresponds to characters in strA, colIdx to characters in strB.
  for (let rowIdx = 1; rowIdx <= strA.length; rowIdx++) {
    for (let colIdx = 1; colIdx <= strB.length; colIdx++) {
      // If the current characters match, extend the LCS from the diagonal element.
      if (strA[rowIdx - 1] === strB[colIdx - 1]) {
        memoTable[rowIdx][colIdx] = [
          1 + memoTable[rowIdx - 1][colIdx - 1][0],
          memoTable[rowIdx - 1][colIdx - 1][1] + strA[rowIdx - 1]
        ];
      } else {
        // If characters do not match, take the maximum LCS from the left or top cell.
        // This means we either skip a character from strA or strB.
        let currentLength = memoTable[rowIdx][colIdx - 1][0] > memoTable[rowIdx - 1][colIdx][0]
          ? memoTable[rowIdx][colIdx - 1][0]
          : memoTable[rowIdx - 1][colIdx][0];

        let currentSubsequence = memoTable[rowIdx][colIdx - 1][0] > memoTable[rowIdx - 1][colIdx][0]
          ? memoTable[rowIdx][colIdx - 1][1]
          : memoTable[rowIdx - 1][colIdx][1];

        memoTable[rowIdx][colIdx] = [currentLength, currentSubsequence];
      }
    }
  }

  // The final LCS string is stored in the bottom-right cell of the memoTable.
  return memoTable[strA.length][strB.length][1];
}

/**
 * Main function to read input, process it, and print the result.
 *
 * @param {string} rawData The raw input string, typically from stdin.
 */
function processInput(rawData) {
  // Split the input string into an array of lines.
  let inputLines = rawData.split("\n");

  // Extract the two strings from the first two lines.
  let strA = inputLines[0];
  let strB = inputLines[1];

  // Call the LCS computation function.
  let resultString = computeLCS(strA, strB);

  // Output the computed LCS string to the console.
  console.log(resultString);
}

// Read input from standard input and pass it to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
