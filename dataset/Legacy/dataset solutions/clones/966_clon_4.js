const puzzleConfig = { input: '/dev/stdin', newline: '\n' };

const BOARD_SIZE = 16;
const GRID_DIM = Math.sqrt(BOARD_SIZE);

const fileSystem = require('fs');

const initialBoardStateRaw = fileSystem.readFileSync(puzzleConfig.input, 'ascii')
  .trim()
  .split(puzzleConfig.newline)
  .map(function (lineContent) { return lineContent.split(' ').map(Number); });

let initialBoardState = [];
for (let row of initialBoardStateRaw) {
  initialBoardState = initialBoardState.concat(row);
}

const targetBoardState = [];
for (let val = 1; val < BOARD_SIZE; val++) {
  targetBoardState.push(val);
}
targetBoardState.push(0);

const currentPuzzleLayout = [...initialBoardState];

const adjacencyLookup = [
  [1,4], [0,2,5], [1,3,6], [2,7],
  [0,5,8], [1,4,6,9], [2,5,7,10], [3,6,11],
  [4,9,12], [5,8,10,13], [6,9,11,14], [7,10,15],
  [8,13], [9,12,14], [10,13,15], [11,14]
];

const cellManhattanDistances = [];
for (let cellIdx = 0; cellIdx < BOARD_SIZE; cellIdx++) {
  cellManhattanDistances.push(new Array(GRID_DIM));
}

for (let r1 = 0; r1 < GRID_DIM; r1++) {
  for (let c1 = 0; c1 < GRID_DIM; c1++) {
    for (let r2 = 0; r2 < GRID_DIM; r2++) {
      for (let c2 = 0; c2 < GRID_DIM; c2++) {
        const index1 = GRID_DIM * r1 + c1;
        const index2 = GRID_DIM * r2 + c2;
        cellManhattanDistances[index1][index2] = Math.abs(r1 - r2) + Math.abs(c1 - c2);
      }
    }
  }
}

function solvePuzzleIterativeDeepening(currentLayout, currentSearchDepth, maximumSearchDepth, emptyTilePosition, tileCurrentLocations) {
  if (currentSearchDepth === maximumSearchDepth) {
    for (let idx = 0; idx < BOARD_SIZE; idx++) {
      if (currentLayout[idx] !== targetBoardState[idx]) {
        return false;
      }
    }
    return true;
  }

  let totalHeuristicEstimate = 0;
  for (let tileValue = 0; tileValue < BOARD_SIZE; tileValue++) {
    totalHeuristicEstimate += cellManhattanDistances[tileCurrentLocations[tileValue]][targetBoardState.indexOf(tileValue)];
  }
  totalHeuristicEstimate = Math.floor(totalHeuristicEstimate / 2);
  if (currentSearchDepth + totalHeuristicEstimate > maximumSearchDepth) {
    return false;
  }

  for (const neighborIndex of adjacencyLookup[emptyTilePosition]) {
    const movedTileValue = currentLayout[neighborIndex];

    currentLayout[emptyTilePosition] = movedTileValue;
    currentLayout[neighborIndex] = 0;

    tileCurrentLocations[movedTileValue] = emptyTilePosition;
    tileCurrentLocations[0] = neighborIndex;

    if (solvePuzzleIterativeDeepening(currentLayout, currentSearchDepth + 1, maximumSearchDepth, neighborIndex, tileCurrentLocations)) {
      return true;
    }

    tileCurrentLocations[movedTileValue] = neighborIndex;
    tileCurrentLocations[0] = emptyTilePosition;

    currentLayout[neighborIndex] = movedTileValue;
    currentLayout[emptyTilePosition] = 0;
  }

  return false;
}

let solutionDepth = 0;
const initialEmptyTilePosition = initialBoardState.indexOf(0);

const initialTileLocations = new Array(BOARD_SIZE);
initialBoardState.forEach((value, index) => {
  initialTileLocations[value] = index;
});

for (let currentMaxDepth = 0; currentMaxDepth <= 45; currentMaxDepth++) {
  if (solvePuzzleIterativeDeepening(currentPuzzleLayout, 0, currentMaxDepth, initialEmptyTilePosition, initialTileLocations)) {
    solutionDepth = currentMaxDepth;
    break;
  }
}

console.log(solutionDepth);
