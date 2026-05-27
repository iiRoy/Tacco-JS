const appConfig = { input: '/dev/stdin', newline: '\n' };

const assertionModule = require('assert');

const GRID_DIMENSION = 16;

const wrappedNumbers = Array.from({ length: GRID_DIMENSION }, (_, index) => [index]);

const EMPTY_TILE_WRAPPER = wrappedNumbers[0];

const fileSystem = require('fs');
const rawInputContent = fileSystem.readFileSync(appConfig.input, 'ascii');

const parseInputToBoard = (content, lineSeparator, tileWrappers) => {
  const lines = content.trim().split(lineSeparator);
  const parsedNumbers = lines.flatMap(inputLine => inputLine.split(' ').map(Number));
  return parsedNumbers.map(value => tileWrappers[value]);
};

let initialState = parseInputToBoard(rawInputContent, appConfig.newline, wrappedNumbers);

const targetState = [];
for (let tileIndex = 1; tileIndex < GRID_DIMENSION; tileIndex++) {
  targetState.push(wrappedNumbers[tileIndex]);
}
targetState.push(EMPTY_TILE_WRAPPER);

let currentBoard = [...initialState];

const adjacencyMap = [
  [1,4], [0,2,5], [1,3,6], [2,7],
  [0,5,8], [1,4,6,9], [2,5,7,10], [3,6,11],
  [4,9,12], [5,8,10,13], [6,9,11,14], [7,10,15],
  [8,13], [9,12,14], [10,13,15], [11,14]
];

const checkGoalMatch = (boardToCheck, goalState) => {
  for (let tileIdx = 0; tileIdx < boardToCheck.length; tileIdx++) {
    if (boardToCheck[tileIdx] !== goalState[tileIdx]) {
      return false;
    }
  }
  return true;
};

const calculateMisplacedTilesHeuristic = (boardToCheck, goalState) => {
  let misplacedCount = 0;
  for (let tileIdx = 0; tileIdx < boardToCheck.length; tileIdx++) {
    if (boardToCheck[tileIdx] !== goalState[tileIdx]) {
      misplacedCount++;
    }
  }
  return Math.floor(misplacedCount / 2);
};

function iterativeDeepeningDepthFirstSearch(boardState, currentDepth, maxDepthLimit, emptyTilePosition) {
  if (currentDepth === maxDepthLimit) {
    return checkGoalMatch(boardState, targetState);
  }
  
  const displacedTilesCount = calculateMisplacedTilesHeuristic(boardState, targetState);
  if (currentDepth + displacedTilesCount > maxDepthLimit) {
    return false;
  }
  
  const possibleMoves = adjacencyMap[emptyTilePosition];
  for (const nextEmptyPosition of possibleMoves) {
    const movedTileValue = boardState[nextEmptyPosition];
    boardState[emptyTilePosition] = movedTileValue;
    boardState[nextEmptyPosition] = EMPTY_TILE_WRAPPER;
    
    if (iterativeDeepeningDepthFirstSearch(boardState, currentDepth + 1, maxDepthLimit, nextEmptyPosition)) {
      return true;
    }
    
    boardState[nextEmptyPosition] = movedTileValue;
    boardState[emptyTilePosition] = EMPTY_TILE_WRAPPER;
  }
  return false;
}

let finalDepthResult;
const initialEmptyTileIndex = initialState.indexOf(EMPTY_TILE_WRAPPER);

for (let searchDepth = 0; searchDepth <= 45; searchDepth++) {
  if (iterativeDeepeningDepthFirstSearch(currentBoard, 0, searchDepth, initialEmptyTileIndex)) {
    finalDepthResult = searchDepth;
    break;
  }
}
console.log(finalDepthResult);
