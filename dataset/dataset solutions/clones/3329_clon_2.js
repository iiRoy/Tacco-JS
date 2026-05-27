'use strict';
(function(rawData) {
  // Process the raw input string: trim, split by whitespace, and convert to numbers.
  let parsedData = rawData.trim().split(/\s+/).map(valStr => valStr - 0);

  // Extract the number of elements and the target value from the beginning of the array.
  const countOfElements = parsedData.shift();
  const targetValue = parsedData.shift();

  // The remaining elements in the array are the allowed moves.
  const allowedMoves = parsedData;

  // Initialize a dynamic programming table.
  // The size is targetValue + 2 to handle indices up to targetValue + 1.
  // Fill with a placeholder string 'tbd' (to be determined).
  const memoTable = new Array(targetValue + 2).fill('tbd');

  // Base case: The state targetValue + 1 is considered a winning state (true).
  memoTable[targetValue + 1] = true;

  // Iterate backwards from targetValue + 1 down to the first allowed move.
  for (let currentIdx = targetValue + 1; currentIdx >= allowedMoves[0]; currentIdx--) {
    // If the current index is a winning state (true)
    if (memoTable[currentIdx]) {
      // Check if the previous state (currentIdx - 1) is also a winning state.
      // If it is, we can skip the inner loop for this currentIdx, as it implies
      // a sequence of winning states.
      if (memoTable[currentIdx - 1] === true) {
        continue; // Move to the next currentIdx
      }
      // If currentIdx is a winning state, but currentIdx-1 is not,
      // then all states reachable by a single step (from 1 to allowedMoves[0])
      // from currentIdx must be losing states (false) if they are 'tbd'.
      for (let stepSize = 1; stepSize <= allowedMoves[0]; stepSize++) {
        if (currentIdx - stepSize >= 0) {
          if (memoTable[currentIdx - stepSize] === 'tbd') {
            memoTable[currentIdx - stepSize] = false; // Mark as losing
          }
        }
      }
    }

    // If the current index is a losing state (false)
    if (!memoTable[currentIdx]) {
      // Then all states reachable by any allowed move from currentIdx
      // must be winning states (true) if they are 'tbd'.
      for (let moveIdx = 0; moveIdx < countOfElements; moveIdx++) {
        if (currentIdx - allowedMoves[moveIdx] >= 0) {
          memoTable[currentIdx - allowedMoves[moveIdx]] = true; // Mark as winning
        }
      }
    }
  }

  // The result for the initial state (index 0) determines the winner.
  if (memoTable[0] === true) {
    console.log('First'); // If memoTable[0] is true, the first player wins.
  } else {
    console.log('Second'); // Otherwise, the second player wins.
  }
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
