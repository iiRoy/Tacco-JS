var inputBuffer = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function (chunk) {
  inputBuffer += chunk;
});
process.stdin.on('end', function () {
  processInput(inputBuffer.split('\n'));
});

const GRID_DIMENSION = 21;
const GRID_AREA_SIZE = GRID_DIMENSION * GRID_DIMENSION;

function createEmptyGrid() {
  return new Array(GRID_AREA_SIZE).fill(0);
}

function markGemsOnGrid(targetGrid, gemInputLines, gemCount) {
  for (let k = 0; k < gemCount; k++) {
    const coordinateStrings = gemInputLines.shift().split(' ');
    const xCoordinate = parseInt(coordinateStrings[0], 10);
    const yCoordinate = parseInt(coordinateStrings[1], 10);
    targetGrid[xCoordinate + GRID_DIMENSION * yCoordinate] = 1;
  }
}

function parseMovementInstructions(moveInputLines, moveCount) {
  const parsedMovementSequence = [];
  for (let k = 0; k < moveCount; k++) {
    const moveDetailStrings = moveInputLines.shift().split(' ');
    parsedMovementSequence.push({ directionChar: moveDetailStrings[0], stepLength: parseInt(moveDetailStrings[1], 10) });
  }
  return parsedMovementSequence;
}

function getDirectionalStepIncrement(directionIdentifier) {
  switch (directionIdentifier) {
    case 'N': return GRID_DIMENSION;
    case 'W': return -1;
    case 'E': return 1;
    case 'S': return -GRID_DIMENSION;
    default: return 0;
  }
}

function checkGemCollection(gridMapState, movementSteps) {
  let currentRobotPositionIndex = 10 + 10 * GRID_DIMENSION;

  for (const currentMove of movementSteps) {
    const stepIncrementValue = getDirectionalStepIncrement(currentMove.directionChar);
    for (let k = 0; k < currentMove.stepLength; k++) {
      currentRobotPositionIndex += stepIncrementValue;
      gridMapState[currentRobotPositionIndex] = 0;
    }
  }

  const anyGemsRemaining = gridMapState.some(cellValue => cellValue === 1);
  return !anyGemsRemaining;
}

function processInput(inputLines) {
  let numberOfGems;

  while ((numberOfGems = parseInt(inputLines.shift(), 10)) !== 0) {
    const currentGridState = createEmptyGrid();
    markGemsOnGrid(currentGridState, inputLines, numberOfGems);

    const numberOfMoves = parseInt(inputLines.shift(), 10);
    const movementSequence = parseMovementInstructions(inputLines, numberOfMoves);

    checkGemCollection(currentGridState, movementSequence) ? console.log('Yes') : console.log('No');
  }
}
