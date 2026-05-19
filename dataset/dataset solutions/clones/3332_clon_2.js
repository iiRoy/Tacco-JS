'use strict';

// This immediately invoked function expression processes game input and determines the winner.
(function(initialInputString) {
  // Parse the raw input string into an array of numbers.
  // First, remove leading/trailing whitespace.
  // Then, split the string by any sequence of whitespace characters.
  // Finally, map each resulting string part to a number (using x - 0 for type coercion).
  let parsedNumbersArray = initialInputString.trim().split(/\s+/).map(numericVal => numericVal - 0);

  // Extract the total number of available moves from the beginning of the array.
  const numMovesAvailable = parsedNumbersArray.shift();
  // Extract the target sum (or K value) from the beginning of the array.
  const targetSum = parsedNumbersArray.shift();
  // The remaining elements in the array are the allowed move values for the game.
  const moveValues = parsedNumbersArray;

  // Initialize a dynamic programming table (memoization table) for game states.
  // The size is targetSum + 2 to accommodate indices up to targetSum + 1.
  // Each state is initially marked with the string 'tbd' (to be determined).
  const gameStates = new Array(targetSum + 2).fill('tbd');

  // Base case for the game's DP: The state targetSum + 1 is considered a winning state
  // for the player whose turn it is to make a move.
  gameStates[targetSum + 1] = true;

  // Iterate backwards from targetSum + 1 down to the smallest possible move value (moveValues[0]).
  // This loop calculates the winning/losing status for each possible sum, working from larger sums downwards.
  for (let currentSum = targetSum + 1; currentSum >= moveValues[0]; currentSum--) {
    // If the current sum is a winning state for the player whose turn it is (gameStates[currentSum] is true)...
    if (gameStates[currentSum]) {
      // Check a specific game rule: if subtracting 1 from the current sum also leads to a winning state.
      if (gameStates[currentSum - 1] === true) {
        // If both currentSum and currentSum-1 are winning states,
        // then the current player can force a win by moving to currentSum-1.
        // In this specific game logic, we then skip further processing for the currentSum.
        continue;
      }
      // If currentSum is a winning state, but currentSum-1 is not (or 'tbd'),
      // then any state reachable by subtracting a step from 1 up to moveValues[0] from currentSum
      // becomes a losing state if it was previously 'tbd'.
      for (let subtractionStep = 1; subtractionStep <= moveValues[0]; subtractionStep++) {
        if (currentSum - subtractionStep >= 0) { // Ensure the index is valid (non-negative)
          if (gameStates[currentSum - subtractionStep] === 'tbd') {
            gameStates[currentSum - subtractionStep] = false; // Mark as a losing state
          }
        }
      }
    }

    // If the current sum is a losing state for the player whose turn it is (gameStates[currentSum] is false)...
    if (!gameStates[currentSum]) {
      // Then any state reachable by subtracting one of the allowed move values from currentSum
      // becomes a winning state for the current player. This is because the current player can move
      // to a losing state for the opponent, thus making the current state a winning one for themselves.
      for (let moveIndex = 0; moveIndex < numMovesAvailable; moveIndex++) {
        if (currentSum - moveValues[moveIndex] >= 0) { // Ensure the index is valid
          gameStates[currentSum - moveValues[moveIndex]] = true; // Mark as a winning state
        }
      }
    }
  }

  // After filling the DP table, the final result is determined by the state of sum 0.
  // If gameStates[0] is true, it means the first player can force a win.
  // Otherwise, the second player wins.
  if (gameStates[0] === true) {
    console.log('First'); // Output for the first player winning
  } else {
    console.log('Second'); // Output for the second player winning
  }

})(require('fs').readFileSync('/dev/stdin', 'utf8')); // Read input from standard input synchronously as a UTF-8 string
