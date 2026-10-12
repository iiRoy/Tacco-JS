'use strict';
(function(inputSource){
  const processedInput = inputSource.trim().split(/\s+/).map(val => Number(val));
  processedInput.shift(); // Discard the first number (N), as it's not explicitly needed for this DP strategy
  const targetValue = processedInput.shift(); // K
  const moveOptions = processedInput; // A

  // gameStates[x] will be true if the first player can win when x stones remain, false otherwise.
  const gameStates = new Array(targetValue + 1);
  gameStates[0] = false; // Base case: 0 stones is a losing state for the current player

  // Iterate from 1 up to targetValue to determine the winning/losing status for each number of stones.
  for (let currentStones = 1; currentStones <= targetValue; currentStones++) {
    let canCurrentPlayerWin = false;
    // Check all possible moves from the current number of stones.
    for (let option of moveOptions) {
      // Ensure the move is valid (does not result in negative stones).
      if (currentStones - option >= 0) {
        // If making this move leads to a state where the opponent loses (i.e., gameStates[currentStones - option] is false),
        // then the current player can win from 'currentStones'.
        if (!gameStates[currentStones - option]) {
          canCurrentPlayerWin = true;
          break; // Found a winning move, no need to check further options for this 'currentStones' value.
        }
      }
    }
    gameStates[currentStones] = canCurrentPlayerWin;
  }

  // The result for the initial K stones is stored in gameStates[targetValue].
  if (gameStates[targetValue]) {
    console.log('First');
  } else {
    console.log('Second');
  }
})(require('fs').readFileSync('/dev/stdin','utf8'));
