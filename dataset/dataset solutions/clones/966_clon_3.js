const applicationConfig = {
  sourceDataPath: '/dev/stdin',
  lineBreakCharacter: '\n'
};

const TOTAL_GRID_CELLS = 16;
const GRID_SIDE_LENGTH = Math.sqrt(TOTAL_GRID_CELLS);

const tileValueWrappers = Array.from({ length: TOTAL_GRID_CELLS }, (_, index) => [index]);

const checkPuzzleSolved = (currentLayout, desiredLayout) => {
  for (let cellIndex = 0; cellIndex < TOTAL_GRID_CELLS; cellIndex++) {
    if (currentLayout[cellIndex] !== desiredLayout[cellIndex]) {
      return false;
    }
  }
  return true;
};

const positionManhattanDistances = Array.from({ length: TOTAL_GRID_CELLS }, () =>
  new Array(TOTAL_GRID_CELLS).fill(0)
);

for (let r1 = 0; r1 < GRID_SIDE_LENGTH; r1++) {
  for (let c1 = 0; c1 < GRID_SIDE_LENGTH; c1++) {
    for (let r2 = 0; r2 < GRID_SIDE_LENGTH; r2++) {
      for (let c2 = 0; c2 < GRID_SIDE_LENGTH; c2++) {
        const linearIndex1 = r1 * GRID_SIDE_LENGTH + c1;
        const linearIndex2 = r2 * GRID_SIDE_LENGTH + c2;
        positionManhattanDistances[linearIndex1][linearIndex2] = Math.abs(r1 - r2) + Math.abs(c1 - c2);
      }
    }
  }
}

const permissibleMoves = [
  [1, 4], [0, 2, 5], [1, 3, 6], [2, 7],
  [0, 5, 8], [1, 4, 6, 9], [2, 5, 7, 10], [3, 6, 11],
  [4, 9, 12], [5, 8, 10, 13], [6, 9, 11, 14], [7, 10, 15],
  [8, 13], [9, 12, 14], [10, 13, 15], [11, 14]
];

const initialRawInput = require('fs').readFileSync(applicationConfig.sourceDataPath, 'ascii')
  .trim()
  .split(applicationConfig.lineBreakCharacter);

const parsedNumericLayout = initialRawInput
  .flatMap(line => line.split(' ').map(Number));

const startingPuzzleConfiguration = parsedNumericLayout.map(num => {
  if (num < 0 || num >= TOTAL_GRID_CELLS) {
    // Basic validation for input numbers
    // console.warn(`Warning: Input number ${num} is out of expected range [0, ${TOTAL_GRID_CELLS - 1}].`);
  }
  return tileValueWrappers[num];
});

const desiredFinalConfiguration = Array.from({ length: TOTAL_GRID_CELLS - 1 }, (_, i) => tileValueWrappers[i + 1])
  .concat(tileValueWrappers[0]);

const currentPuzzleGrid = [...startingPuzzleConfiguration];

function explorePuzzleState(currentLayout, currentMoveCount, maxSearchDepth, emptyCellPosition) {
  if (maxSearchDepth < 0) {
      return false;
  }

  if (currentMoveCount === maxSearchDepth) {
    return checkPuzzleSolved(currentLayout, desiredFinalConfiguration);
  }

  let totalHeuristicDistance = 0;
  for (let tileIdx = 1; tileIdx < TOTAL_GRID_CELLS; tileIdx++) {
    const currentTileWrapper = tileValueWrappers[tileIdx];
    const currentPos = currentLayout.indexOf(currentTileWrapper);
    const targetPos = desiredFinalConfiguration.indexOf(currentTileWrapper);
    if (currentPos !== -1 && targetPos !== -1) {
      totalHeuristicDistance += positionManhattanDistances[currentPos][targetPos];
    }
  }
  const estimatedRemainingMoves = Math.floor(totalHeuristicDistance / 2);

  if (currentMoveCount + estimatedRemainingMoves > maxSearchDepth) {
    return false;
  }

  for (const nextEmptyCellCandidate of permissibleMoves[emptyCellPosition]) {
    const tileMoving = currentLayout[nextEmptyCellCandidate];
    currentLayout[emptyCellPosition] = tileMoving;
    currentLayout[nextEmptyCellCandidate] = tileValueWrappers[0];

    if (explorePuzzleState(currentLayout, currentMoveCount + 1, maxSearchDepth, nextEmptyCellCandidate)) {
      return true;
    }

    currentLayout[nextEmptyCellCandidate] = tileMoving;
    currentLayout[emptyCellPosition] = tileValueWrappers[0];
  }

  return false;
}

let solutionDepth = -1;
const MAX_POSSIBLE_SOLUTION_DEPTH = 80;

for (let currentMaxDepth = 0; currentMaxDepth <= MAX_POSSIBLE_SOLUTION_DEPTH; currentMaxDepth++) {
  const initialEmptyTileLocation = currentPuzzleGrid.indexOf(tileValueWrappers[0]);
  if (initialEmptyTileLocation === -1) {
      // console.error("Error: Empty tile (0) not found in the initial puzzle configuration.");
      break;
  }

  if (explorePuzzleState(currentPuzzleGrid, 0, currentMaxDepth, initialEmptyTileLocation)) {
    solutionDepth = currentMaxDepth;
    break;
  }
}

if (solutionDepth !== -1) {
  console.log(solutionDepth);
} else {
  // console.log("No solution found within the maximum search depth.");
}