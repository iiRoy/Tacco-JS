'use strict';

const parseInputNumbers = (inputString) => {
  const trimmedInput = inputString.trim();
  const parts = trimmedInput.split(/\s+/);
  return parts.map(val => Number(val));
};

const markReachableAsLosing = (currentVal, gameStates, maxSmallMove) => {
  for (let moveOffset = 1; moveOffset <= maxSmallMove; moveOffset++) {
    const previousVal = currentVal - moveOffset;
    if (previousVal >= 0 && gameStates[previousVal] === 'tbd') {
      gameStates[previousVal] = false;
    }
  }
};

const markReachableAsWinning = (currentVal, gameStates, allowedMoves) => {
  for (let moveIdx = 0; moveIdx < allowedMoves.length; moveIdx++) {
    const moveAmount = allowedMoves[moveIdx];
    const previousVal = currentVal - moveAmount;
    if (previousVal >= 0) {
      gameStates[previousVal] = true;
    }
  }
};

(function(rawData){
  const parsedData = parseInputNumbers(rawData);

  const numElements = parsedData.shift();
  const targetValue = parsedData.shift();
  const allowedMoves = parsedData;

  const gameStates = Array.from({ length: targetValue + 2 }, () => 'tbd');
  
  gameStates[targetValue + 1] = true;

  const minAllowedMove = allowedMoves[0];

  for (let currentVal = targetValue + 1; currentVal >= minAllowedMove; currentVal--) {
    if (gameStates[currentVal] === true) {
      const previousStateCheck = currentVal - 1;
      const shouldSkipLosingMarking = previousStateCheck >= 0 && gameStates[previousStateCheck] === true;
      
      if (!shouldSkipLosingMarking) {
        markReachableAsLosing(currentVal, gameStates, minAllowedMove);
      }
    } else if (gameStates[currentVal] === false) {
      markReachableAsWinning(currentVal, gameStates, allowedMoves);
    }
  }
  
  if (gameStates[0] === true) {
    console.log('First');
  } else {
    console.log('Second');
  }
})(require('fs').readFileSync('/dev/stdin','utf8'));
