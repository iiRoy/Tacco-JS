'use strict';
(function(rawData){
  // --- Constants for clarity and Type III modification ---
  const TBD_STATE_KEY = 'tbd';
  const WIN_STATE_VALUE = true;
  const LOSE_STATE_VALUE = false;
  const FIRST_PLAYER_OUTPUT = 'First';
  const SECOND_PLAYER_OUTPUT = 'Second';

  // --- Input processing: Split into distinct steps for clarity ---
  const trimmedInputString = rawData.trim();
  const inputTokens = trimmedInputString.split(/\s+/);
  const parsedNumericData = inputTokens.map(tokenString => Number(tokenString)); // Using Number() for explicit conversion

  // --- Extract game parameters using descriptive variable names ---
  const totalMoveOptions = parsedNumericData.shift(); // Corresponds to N in original
  const gameTargetValue = parsedNumericData.shift();  // Corresponds to K in original
  const availableMoves = parsedNumericData;           // Corresponds to A in original

  // --- Initialize dynamic programming array (gameStates) ---
  // Array size is gameTargetValue + 2 to handle indices up to K+1
  const gameStates = new Array(gameTargetValue + 2).fill(TBD_STATE_KEY);

  // --- Helper functions for updating game states ---
  // These functions encapsulate the logic for setting states, improving readability.
  const setLosingStateIfUndetermined = (index) => {
    // Only set to losing if it hasn't been determined yet.
    if (gameStates[index] === TBD_STATE_KEY) {
      gameStates[index] = LOSE_STATE_VALUE;
    }
  };

  const setWinningState = (index) => {
    // A winning move always makes a state a winning state, regardless of its previous status.
    gameStates[index] = WIN_STATE_VALUE;
  };

  // --- Base case: The state beyond the target is a winning state for the current player ---
  // In this game, reaching gameTargetValue + 1 is considered a winning state.
  gameStates[gameTargetValue + 1] = WIN_STATE_VALUE;

  // --- Main DP loop: Iterate backwards from gameTargetValue + 1 down to 0 ---
  // `currentPileSize` represents the number of stones currently in the pile.
  for(let currentPileSize = gameTargetValue + 1; currentPileSize >= 0; currentPileSize--){

    // --- Optimization: Skip processing if currentPileSize and currentPileSize-1 are both winning states ---
    // This is a specific optimization from the original code.
    // If the current state is a winning state, and the immediately preceding state is also a winning state,
    // then the propagation logic for the preceding state (setting states to LOSE_STATE_VALUE) is skipped.
    const isCurrentStateWinning = gameStates[currentPileSize] === WIN_STATE_VALUE;
    const isPreviousStateWinning = currentPileSize > 0 && gameStates[currentPileSize - 1] === WIN_STATE_VALUE;

    if (isCurrentStateWinning && isPreviousStateWinning) {
      currentPileSize--; // Decrement to effectively skip the next iteration for currentPileSize-1
      continue;          // Move to the next loop iteration (which will now be currentPileSize-2)
    }

    // --- Logic for propagating winning states (setting previous states to LOSE_STATE_VALUE) ---
    // If `currentPileSize` is a winning state for the current player,
    // then any state `P` from which a player can move to `currentPileSize`
    // makes `P` a losing state for the player at `P` (because they move to a state where the *next* player wins).
    if (isCurrentStateWinning) {
      // The original code uses `availableMoves[0]` as the upper bound for `j`.
      // This implies a specific game rule where only moves up to `availableMoves[0]`
      // are considered for making previous states losing.
      const maxLosingPropagationMove = availableMoves[0];
      for(let moveOption = 1; moveOption <= maxLosingPropagationMove; moveOption++) {
        const previousPileSize = currentPileSize - moveOption;
        if (previousPileSize >= 0) { // Ensure the previous state is valid (non-negative)
          setLosingStateIfUndetermined(previousPileSize);
        }
      }
    }
    // --- Logic for propagating losing/undetermined states (setting previous states to WIN_STATE_VALUE) ---
    // If `currentPileSize` is a losing state (or undetermined, which implies it could become losing),
    // then any state `P` from which a player can move to `currentPileSize`
    // makes `P` a winning state for the player at `P` (because they move to a state where the *next* player loses).
    else { // This covers `LOSE_STATE_VALUE` and `TBD_STATE_KEY`
      for(let moveIndex = 0; moveIndex < totalMoveOptions; moveIndex++) {
        const moveAmount = availableMoves[moveIndex];
        const previousPileSize = currentPileSize - moveAmount;
        if (previousPileSize >= 0) { // Ensure the previous state is valid (non-negative)
          setWinningState(previousPileSize);
        }
      }
    }
  }

  // --- Determine the winner based on the state of 0 stones ---
  // If `gameStates[0]` is a winning state, the first player wins. Otherwise, the second player wins.
  if(gameStates[0] === WIN_STATE_VALUE) {
    console.log(FIRST_PLAYER_OUTPUT);
  } else {
    console.log(SECOND_PLAYER_OUTPUT);
  }
})(require('fs').readFileSync('/dev/stdin','utf8'));
