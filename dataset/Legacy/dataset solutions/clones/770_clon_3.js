var rawData = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function (chunk) {
  rawData += chunk;
});
process.stdin.on('end', function () {
  processInputData(rawData.split('\n'));
});

const GRID_DIMENSION_CONSTANT = 21;
const TOTAL_GRID_CELLS_CONSTANT = GRID_DIMENSION_CONSTANT * GRID_DIMENSION_CONSTANT;

function calculateGridIndex(xCoord, yCoord) {
  const parsedX = parseInt(xCoord, 10);
  const parsedY = parseInt(yCoord, 10);
  return parsedX + GRID_DIMENSION_CONSTANT * parsedY;
}

function getMovementDelta(directionChar) {
  const deltaMap = {
    'N': GRID_DIMENSION_CONSTANT,
    'W': -1,
    'E': 1,
    'S': -GRID_DIMENSION_CONSTANT
  };
  return deltaMap[directionChar] || 0;
}

function processInputData(lineSegments) {
  let numGemsToCollect;
  let currentLineParts;
  let gridState;
  let numMovementInstructions;
  const movementSequence = [];

  while ((numGemsToCollect = parseInt(lineSegments.shift(), 10)) !== 0) {
    gridState = new Array(TOTAL_GRID_CELLS_CONSTANT).fill(0);

    for (let gemIndex = 0; gemIndex < numGemsToCollect; gemIndex++) {
      currentLineParts = lineSegments.shift().split(' ');
      gridState[calculateGridIndex(currentLineParts[0], currentLineParts[1])] = 1;
    }

    numMovementInstructions = parseInt(lineSegments.shift(), 10);
    for (let moveIndex = 0; moveIndex < numMovementInstructions; moveIndex++) {
      currentLineParts = lineSegments.shift().split(' ');
      movementSequence.push({
        direction: currentLineParts[0],
        length: parseInt(currentLineParts[1], 10)
      });
    }

    const result = checkAllGemsCollected(gridState, movementSequence);
    console.log(result ? 'Yes' : 'No');
  }
}

function checkAllGemsCollected(gridState, movementSequence) {
  const INITIAL_ROBOT_X_POS = 10;
  const INITIAL_ROBOT_Y_POS = 10;
  let currentRobotPosition = calculateGridIndex(INITIAL_ROBOT_X_POS, INITIAL_ROBOT_Y_POS);

  for (const moveInstruction of movementSequence) {
    const positionDelta = getMovementDelta(moveInstruction.direction);
    for (let step = 0; step < moveInstruction.length; step++) {
      currentRobotPosition += positionDelta;
      gridState[currentRobotPosition] = 0;
    }
  }

  for (let cellIndex = 0; cellIndex < TOTAL_GRID_CELLS_CONSTANT; cellIndex++) {
     if (gridState[cellIndex] === 1) {
       return false;
     }
  }
  return true;
}
