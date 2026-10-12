const appConfig = { input: '/dev/stdin', newline: '\n' };

const assert = require('assert');

const PUZZLE_SIZE = 16;
const GRID_SIDE_LENGTH = Math.sqrt(PUZZLE_SIZE);

function createTileReferences(count) {
  const references = [];
  for (let tileValue = 0; tileValue < count; tileValue++) {
    references.push([tileValue]);
  }
  return references;
}

const tileObjects = createTileReferences(PUZZLE_SIZE);
const EMPTY_TILE_REF = tileObjects[0];

function parseInitialBoardState(inputPath, lineDelimiter, tileRefs, gridSide) {
  const fileContent = require('fs').readFileSync(inputPath, 'ascii');
  const rawLines = fileContent.trim().split(lineDelimiter);

  const parsedNumbers = rawLines.slice(0, gridSide).reduce((accumulator, line) => {
    return accumulator.concat(line.split(' ').map(Number));
  }, []);

  return parsedNumbers.map(num => tileRefs[num]);
}

const initialBoardState = parseInitialBoardState(appConfig.input, appConfig.newline, tileObjects, GRID_SIDE_LENGTH);

function createTargetBoardState(tileRefs, puzzleSize) {
  const target = [];
  for (let tileValue = 1; tileValue < puzzleSize; tileValue++) {
    target.push(tileRefs[tileValue]);
  }
  target.push(tileRefs[0]);
  return target;
}

const targetBoardState = createTargetBoardState(tileObjects, PUZZLE_SIZE);

const currentPuzzleState = [...initialBoardState];

const adjacencyMap = [
  [1,4], [0,2,5], [1,3,6], [2,7],
  [0,5,8], [1,4,6,9], [2,5,7,10], [3,6,11],
  [4,9,12], [5,8,10,13], [6,9,11,14], [7,10,15],
  [8,13], [9,12,14], [10,13,15], [11,14]
];

const manhattanDistances = Array.from({ length: PUZZLE_SIZE }, () => Array(PUZZLE_SIZE).fill(0));

for (let rowA = 0; rowA < GRID_SIDE_LENGTH; rowA++) {
  for (let colA = 0; colA < GRID_SIDE_LENGTH; colA++) {
    for (let rowB = 0; rowB < GRID_SIDE_LENGTH; rowB++) {
      for (let colB = 0; colB < GRID_SIDE_LENGTH; colB++) {
        const indexA = GRID_SIDE_LENGTH * rowA + colA;
        const indexB = GRID_SIDE_LENGTH * rowB + colB;
        manhattanDistances[indexA][indexB] = Math.abs(rowA - rowB) + Math.abs(colA - colB);
      }
    }
  }
}

function calculateHeuristicEstimate(boardState, targetState, tileRefs, distMap, puzzleSize) {
  let totalDistance = 0;
  for (let tileValue = 0; tileValue < puzzleSize; tileValue++) {
    const currentTileRef = tileRefs[tileValue];
    const currentPos = boardState.indexOf(currentTileRef);
    const targetPos = targetState.indexOf(currentTileRef);
    totalDistance += distMap[currentPos][targetPos];
  }
  return Math.floor(totalDistance / 2);
}

function solvePuzzleIDDFS(boardState, currentDepth, maxDepthLimit, emptyTileIndex) {
  if (currentDepth === maxDepthLimit) {
    for (let tileIdx = 0; tileIdx < PUZZLE_SIZE; tileIdx++) {
      if (boardState[tileIdx] !== targetBoardState[tileIdx]) {
        return false;
      }
    }
    return true;
  }

  const heuristicEstimate = calculateHeuristicEstimate(boardState, targetBoardState, tileObjects, manhattanDistances, PUZZLE_SIZE);
  if (currentDepth + heuristicEstimate > maxDepthLimit) {
    return false;
  }

  const possibleMoves = adjacencyMap[emptyTileIndex];
  for (const neighborIndex of possibleMoves) {
    const tileToMoveRef = boardState[neighborIndex];
    boardState[emptyTileIndex] = tileToMoveRef;
    boardState[neighborIndex] = EMPTY_TILE_REF;

    if (solvePuzzleIDDFS(boardState, currentDepth + 1, maxDepthLimit, neighborIndex)) {
      return true;
    }

    boardState[neighborIndex] = tileToMoveRef;
    boardState[emptyTileIndex] = EMPTY_TILE_REF;
  }

  return false;
}

const MAX_ITERATION_DEPTH = 45;
let finalSolutionDepth = -1;

const initialEmptyTilePosition = initialBoardState.indexOf(EMPTY_TILE_REF);

for (let currentMaxDepth = 0; currentMaxDepth <= MAX_ITERATION_DEPTH; currentMaxDepth++) {
  if (solvePuzzleIDDFS(currentPuzzleState, 0, currentMaxDepth, initialEmptyTilePosition)) {
    finalSolutionDepth = currentMaxDepth;
    break;
  }
}

console.log(finalSolutionDepth);
