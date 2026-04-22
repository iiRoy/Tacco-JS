'use strict';
(function(sourceDataContent) {
  const fileSystemUtility = globalThis.require('node:fs');
  
  const allNumbers = sourceDataContent.match(/\d+/g).map(Number);

  // The first number N (count of allowed moves) is not directly used in this logic
  // const moveCount = allNumbers[0];
  
  const initialStoneCount = allNumbers[1];
  const allowedMoveAmounts = allNumbers.slice(2);

  const outcomeRecords = new Map(); // Stores boolean: true for win, false for loss

  // Determines if the current player, starting with 'currentPileSize' stones, can win.
  const calculateGameResult = (currentPileSize, allowedMoveAmounts) => {
    // Check if the result for this pile size has already been computed (memoization)
    if (outcomeRecords.has(currentPileSize)) {
      return outcomeRecords.get(currentPileSize);
    }

    // Base case: If there are 0 stones, the current player has no moves and loses.
    if (currentPileSize === 0) {
      outcomeRecords.set(0, false);
      return false;
    }

    let canCurrentPlayerAchieveVictory = false;
    // Iterate through all possible moves
    for (const moveValue of allowedMoveAmounts) {
      const remainingPile = currentPileSize - moveValue;
      
      // If the move is valid (doesn't result in negative stones)
      if (remainingPile >= 0) {
        // Recursively determine the result for the next player after this move.
        // If the next player *loses* from 'remainingPile', then the current player *wins* by making this move.
        if (!calculateGameResult(remainingPile, allowedMoveAmounts)) {
          canCurrentPlayerAchieveVictory = true;
          break; // Found a winning move, no need to check further
        }
      }
    }

    // Store the computed result for future use
    outcomeRecords.set(currentPileSize, canCurrentPlayerAchieveVictory);
    return canCurrentPlayerAchieveVictory;
  };

  const finalGameOutcome = calculateGameResult(initialStoneCount, allowedMoveAmounts);

  if (finalGameOutcome) {
    globalThis.console.log('PlayerOne');
  } else {
    globalThis.console.log('PlayerTwo');
  }
})(globalThis.require('fs').readFileSync('/dev/stdin', 'utf8'));