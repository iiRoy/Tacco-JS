'use strict'; // Enforce strict mode for better code quality and error handling

/**
 * Calculates the optimal score difference for the first player in a game
 * where players take turns picking numbers from the ends of an array.
 * This function uses dynamic programming to determine the best strategy.
 *
 * @param {number} countElements - The total number of elements in the game array.
 * @param {number[]} inputArray - The array of integer values representing the game elements.
 * @returns {number} The final score difference (Player 1's score - Player 2's score).
 */
function computeResult(countElements, inputArray) {
  // Initialize a 2D array (dynamic programming table) to store maximum score differences
  // for all possible sub-arrays. Dimensions are (N+1) x (N+1) for 1-based indexing.
  const memoTable = new Array(countElements + 1).fill(0).map(element => new Array(countElements + 1).fill(0));

  let startRow = 1; // Represents the 1-based starting index of the current sub-array
  let endCol = 1;   // Represents the 1-based ending index of the current sub-array

  // The outer loop iterates, effectively increasing the length of the sub-array being considered.
  // `endCol` acts as an offset from `startRow` to define the sub-array length.
  while (endCol <= countElements) {
    let currentCol = endCol; // `currentCol` will be the actual right boundary for the current sub-array.

    // The inner loop iterates through all possible starting positions (`currentRow`)
    // for sub-arrays that have `currentCol` as their right boundary.
    for (let currentRow = startRow; currentRow <= countElements; currentRow++) {
      // If the current right boundary exceeds the total number of elements,
      // it means we've processed all valid sub-arrays for this `endCol` offset.
      if (currentCol > countElements) {
        break; // Exit the inner loop and move to the next `endCol` offset.
      }

      // Case 1: Sub-array of length 1 (when `currentCol` and `currentRow` are the same index).
      // The player simply takes the single element.
      if (currentCol === currentRow) {
        memoTable[currentRow][currentCol] = inputArray[currentRow - 1];
      }
      // Case 2: Sub-array of length 2 (when `currentCol` is one greater than `currentRow`).
      // The player takes the maximum of the two available elements.
      else if (currentCol === (currentRow + 1)) {
        memoTable[currentRow][currentCol] = Math.max(inputArray[currentRow - 1], inputArray[currentCol - 1]);
      }
      // Case 3: Sub-array of length greater than 2.
      // This is the recursive step where Player 1 makes a choice.
      // Player 1 wants to maximize their score, knowing Player 2 will play optimally
      // to minimize Player 1's score (or maximize their own).
      else {
        // Option A: Player 1 picks the leftmost element (inputArray[currentRow - 1]).
        // The remaining sub-array is from (currentRow + 1) to currentCol.
        // Player 2 will then choose from this remaining sub-array.
        // Player 2's optimal play means Player 1 will get the minimum of two outcomes:
        // 1. Player 2 takes the new leftmost element (from currentRow+1 to currentCol-1).
        // 2. Player 2 takes the new rightmost element (from currentRow+2 to currentCol).
        const choiceLeftElement = inputArray[currentRow - 1] + Math.min(memoTable[currentRow + 1][currentCol - 1], memoTable[currentRow + 2][currentCol]);

        // Option B: Player 1 picks the rightmost element (inputArray[currentCol - 1]).
        // The remaining sub-array is from currentRow to (currentCol - 1).
        // Similar to Option A, Player 2's optimal play means Player 1 will get the minimum of two outcomes:
        // 1. Player 2 takes the new leftmost element (from currentRow+1 to currentCol-1).
        // 2. Player 2 takes the new rightmost element (from currentRow to currentCol-2).
        const choiceRightElement = inputArray[currentCol - 1] + Math.min(memoTable[currentRow + 1][currentCol - 1], memoTable[currentRow][currentCol - 2]);

        // Player 1 chooses the option that yields the maximum score for themselves.
        memoTable[currentRow][currentCol] = Math.max(choiceLeftElement, choiceRightElement);
      }
      currentCol++; // Move the right boundary one step to the right for the next sub-array.
    }
    endCol++; // Increment `endCol` to consider sub-arrays of the next length/offset.
  }

  // After filling the DP table, the maximum score Player 1 can achieve for the entire array
  // is stored at memoTable[1][countElements].
  const playerOneScore = memoTable[1][countElements];

  // Calculate the total sum of all elements in the original array.
  const totalSum = inputArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

  // Player 2's score will be the total sum minus Player 1's score.
  // The problem asks for Player 1's score minus Player 2's score.
  // This simplifies to: playerOneScore - (totalSum - playerOneScore).
  return playerOneScore - (totalSum - playerOneScore);
}

/**
 * Main function to handle input/output operations.
 * Reads data from stdin, parses it, calls the solver, and prints the result.
 *
 * @param {string} rawData - The raw string content read from standard input.
 */
function processInput(rawData) {
  // Split the raw input string into an array of lines.
  const inputLines = rawData.split("\n");

  // Parse the first line to get the integer value for N (number of elements).
  const countElements = parseInt(inputLines[0], 10);

  // Parse the second line: split by space, then convert each part to an integer.
  const inputArray = inputLines[1].split(' ').map(item => parseInt(item, 10));

  // Call the core logic function to compute the final answer.
  const finalAnswer = computeResult(countElements, inputArray);

  // Print the computed answer to the console.
  console.log(finalAnswer);
}

// Execute the main processing function by reading input from standard input.
// This line is common for competitive programming environments.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
