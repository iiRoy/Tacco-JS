'use strict';

/**
 * Computes the optimal score difference for the first player in a stone-picking game.
 * The game involves two players taking turns to pick elements from either end of an array.
 * Each player aims to maximize their own score. The function returns the first player's
 * score minus the second player's score.
 *
 * @param {number} itemCount - The total number of elements in the value array.
 * @param {number[]} valueArray - An array of numerical values representing the stones.
 * @returns {number} The difference between the first player's optimal score and the second player's optimal score.
 */
function computeOptimalScoreDiff(itemCount, valueArray) {
  // Handle edge case for an empty game.
  if (itemCount === 0) {
    return 0;
  }

  // Initialize a memoization table (DP table) for storing optimal scores for sub-arrays.
  // scoreMemo[i][j] will store the maximum score the current player can get from the sub-array valueArray[i...j].
  // Using 0-based indexing for both dimensions.
  const scoreMemo = Array.from({ length: itemCount }, () => new Array(itemCount).fill(0));

  // Iterate through sub-array lengths (currentLen) from 1 to itemCount.
  // This ensures that smaller subproblems are solved before larger ones that depend on them.
  for (let currentLen = 1; currentLen <= itemCount; currentLen++) {
    // Iterate through all possible starting indices (currentStart) for the given currentLen.
    for (let currentStart = 0; currentStart <= itemCount - currentLen; currentStart++) {
      // Calculate the corresponding ending index (currentEnd) for the current sub-array.
      const currentEnd = currentStart + currentLen - 1;

      // Base case: Sub-array contains only one element.
      // The current player simply takes that element.
      if (currentLen === 1) {
        scoreMemo[currentStart][currentEnd] = valueArray[currentStart];
      }
      // Base case: Sub-array contains two elements.
      // The current player takes the larger of the two.
      else if (currentLen === 2) {
        scoreMemo[currentStart][currentEnd] = Math.max(valueArray[currentStart], valueArray[currentEnd]);
      }
      // Recursive step: Sub-array contains three or more elements.
      // The current player has two choices: pick the leftmost or the rightmost element.
      // In each case, the opponent will play optimally to minimize the score the current player gets from the remaining elements.
      else {
        // Option 1: Current player picks the leftmost element (valueArray[currentStart]).
        // After this, the opponent plays on the sub-array valueArray[currentStart+1...currentEnd].
        // The opponent will pick either valueArray[currentStart+1] or valueArray[currentEnd].
        //   - If opponent picks valueArray[currentStart+1], current player gets scoreMemo[currentStart+2][currentEnd] from remaining.
        //   - If opponent picks valueArray[currentEnd], current player gets scoreMemo[currentStart+1][currentEnd-1] from remaining.
        // The opponent chooses the move that yields the minimum score for the current player.
        const scoreIfPickingLeft = valueArray[currentStart] + Math.min(
          scoreMemo[currentStart + 2][currentEnd],      // Opponent picks left, next turn for player is [start+2...end]
          scoreMemo[currentStart + 1][currentEnd - 1]   // Opponent picks right, next turn for player is [start+1...end-1]
        );

        // Option 2: Current player picks the rightmost element (valueArray[currentEnd]).
        // After this, the opponent plays on the sub-array valueArray[currentStart...currentEnd-1].
        // The opponent will pick either valueArray[currentStart] or valueArray[currentEnd-1].
        //   - If opponent picks valueArray[currentStart], current player gets scoreMemo[currentStart+1][currentEnd-1] from remaining.
        //   - If opponent picks valueArray[currentEnd-1], current player gets scoreMemo[currentStart][currentEnd-2] from remaining.
        // The opponent chooses the move that yields the minimum score for the current player.
        const scoreIfPickingRight = valueArray[currentEnd] + Math.min(
          scoreMemo[currentStart + 1][currentEnd - 1], // Opponent picks left, next turn for player is [start+1...end-1]
          scoreMemo[currentStart][currentEnd - 2]      // Opponent picks right, next turn for player is [start...end-2]
        );

        // The current player chooses the option that maximizes their own score.
        scoreMemo[currentStart][currentEnd] = Math.max(scoreIfPickingLeft, scoreIfPickingRight);
      }
    }
  }

  // The first player's total score from the entire array (valueArray[0...itemCount-1])
  const firstPlayerScore = scoreMemo[0][itemCount - 1];

  // Calculate the total sum of all elements in the array.
  // This can be done efficiently using reduce.
  const totalGameSum = valueArray.reduce((accumulator, currentVal) => accumulator + currentVal, 0);

  // The second player's score is the total sum minus the first player's score.
  const secondPlayerScore = totalGameSum - firstPlayerScore;

  // The final result is the difference between the first player's score and the second player's score.
  // This simplifies to (firstPlayerScore - (totalGameSum - firstPlayerScore))
  // which is equivalent to (2 * firstPlayerScore - totalGameSum).
  return 2 * firstPlayerScore - totalGameSum;
}

/**
 * Main execution function to read input, process it, and print the result.
 * @param {string} rawInputString - The raw input string from stdin.
 */
function processInputAndExecute(rawInputString) {
  // Split the input string into individual lines.
  const inputLines = rawInputString.trim().split('\n');

  // Parse the number of elements from the first line.
  const totalElements = Number(inputLines[0]);

  // Parse the array of element values from the second line.
  // Each element is converted to a number.
  const elementValues = inputLines[1].split(' ').map(Number);

  // Compute the final result using the core game logic.
  const finalResult = computeOptimalScoreDiff(totalElements, elementValues);

  // Output the computed result to the console.
  console.log(finalResult);
}

// Execute the main function by reading input from standard input.
processInputAndExecute(require('fs').readFileSync('/dev/stdin', 'utf8'));