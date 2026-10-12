'use strict';
(function(rawInputData) {
  // Process the raw input string: trim, split by whitespace, and convert to numbers.
  let parsedNumbers = rawInputData.trim().split(/\s+/).map(val => val - 0);

  // Extract the number of elements (N) and the target value (K) from the beginning of the array.
  const numElements = parsedNumbers.shift();
  const targetValue = parsedNumbers.shift();

  // The remaining numbers in the array are the allowed moves.
  const allowedMoves = parsedNumbers;

  // Initialize a dynamic programming table (memoization table) with a size of K+2.
  // Each entry is initially marked as 'pending'.
  const memoTable = new Array(targetValue + 2).fill('pending');

  // Base case: The state K+1 is considered a winning state (true).
  memoTable[targetValue + 1] = true;

  // Iterate backwards from K+1 down to 0 to fill the memoization table.
  for (let currentIdx = targetValue + 1; currentIdx >= 0; currentIdx--) {
    // If the current state is a winning state (true)
    if (memoTable[currentIdx]) {
      // Optimization: If the previous state is also a winning state,
      // it means we can reach currentIdx from currentIdx-1, so currentIdx-1 is also a winning state.
      // We can skip checking moves from currentIdx-1 as it's already determined.
      if (memoTable[currentIdx - 1] === true) {
        currentIdx--; // Decrement currentIdx to effectively skip the next iteration for currentIdx-1
        continue;     // Continue to the next iteration of the outer loop
      }

      // If the current state is a winning state, then any state that can reach it
      // by making a move from allowedMoves[0] (which is the largest possible move)
      // will be a losing state for the player whose turn it is.
      // This loop seems to be setting states reachable from a winning state to false.
      // However, the logic here is a bit unusual. It seems to be related to a specific game.
      // Let's assume A[0] is the maximum possible move.
      for (let moveCount = 1; moveCount <= allowedMoves[0]; moveCount++) {
        if (currentIdx - moveCount >= 0) {
          if (memoTable[currentIdx - moveCount] === 'pending') {
            memoTable[currentIdx - moveCount] = false; // Mark as losing if not yet determined
          }
        }
      }
    }

    // If the current state is a losing state (false) or 'pending' (meaning it's not a winning state yet)
    // This part of the logic seems to be determining winning states.
    // If the current state is a losing state, then any state that can reach it
    // by making one of the allowed moves becomes a winning state.
    if (!memoTable[currentIdx]) {
      for (let moveIndex = 0; moveIndex < numElements; moveIndex++) {
        if (currentIdx - allowedMoves[moveIndex] >= 0) {
          memoTable[currentIdx - allowedMoves[moveIndex]] = true; // Mark as winning
        }
      }
    }
  }

  // Based on the final state of memoTable[0], determine the winner.
  // If memoTable[0] is true, the first player wins. Otherwise, the second player wins.
  if (memoTable[0]) {
    console.log('First');
  } else {
    console.log('Second');
  }
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
