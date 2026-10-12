(function(rawInputData){
  const WIN_STATE_VALUE = true;
  const LOSE_STATE_VALUE = false;
  const UNDETERMINED_MARKER = 'tbd';

  const processedInputString = rawInputData.trim();
  const splitInputArray = processedInputString.split(/\s+/);
  const parsedNumericValues = splitInputArray.map(numericString => Number(numericString));

  const numberOfMoves = parsedNumericValues.shift();
  const initialPileSize = parsedNumericValues.shift();
  const allowedMoveSizes = parsedNumericValues;

  const gameOutcomeTable = new Array(initialPileSize + 2).fill(UNDETERMINED_MARKER);

  gameOutcomeTable[initialPileSize + 1] = WIN_STATE_VALUE;

  const smallestAllowedMove = allowedMoveSizes[0];

  for (let currentPileSize = initialPileSize + 1; currentPileSize >= smallestAllowedMove; currentPileSize--) {
    const currentPileOutcome = gameOutcomeTable[currentPileSize];

    if (currentPileOutcome === WIN_STATE_VALUE) {
      const oneLessPile = currentPileSize - 1;
      if (oneLessPile >= 0 && gameOutcomeTable[oneLessPile] === WIN_STATE_VALUE) {
        continue;
      }

      for (let moveStep = 1; moveStep <= smallestAllowedMove; moveStep++) {
        const nextPileSize = currentPileSize - moveStep;
        if (nextPileSize >= 0) {
          if (gameOutcomeTable[nextPileSize] === UNDETERMINED_MARKER) {
            gameOutcomeTable[nextPileSize] = LOSE_STATE_VALUE;
          }
        }
      }
    }

    if (currentPileOutcome === LOSE_STATE_VALUE) {
      for (let moveIndex = 0; moveIndex < numberOfMoves; moveIndex++) {
        const currentMoveAmount = allowedMoveSizes[moveIndex];
        const previousPileSize = currentPileSize - currentMoveAmount;
        if (previousPileSize >= 0) {
          gameOutcomeTable[previousPileSize] = WIN_STATE_VALUE;
        }
      }
    }
  }

  if (gameOutcomeTable[0] === WIN_STATE_VALUE) {
    console.log('First');
  } else {
    console.log('Second');
  }
})(require('fs').readFileSync('/dev/stdin','utf8'));
