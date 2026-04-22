const fsModule = require('node:fs');

const BOARD_DIMENSION = 4;

const TARGET_ARRANGEMENT = '123456789ABCDEF0';

const initialBoardState = fsModule.readFileSync('/dev/stdin', 'ascii')
  .toString()
  .trim()
  .split('\n')
  .flatMap(rowStr => rowStr.split(' ').map(Number))
  .map(val => val.toString(16).toUpperCase())
  .join('');

function determineAdjacentPositions(currentPos) {
  const row = Math.floor(currentPos / BOARD_DIMENSION);
  const col = currentPos % BOARD_DIMENSION;
  const possibleMoves = [];

  if (row > 0) {
    possibleMoves.push(currentPos - BOARD_DIMENSION);
  }
  if (row < BOARD_DIMENSION - 1) {
    possibleMoves.push(currentPos + BOARD_DIMENSION);
  }
  if (col > 0) {
    possibleMoves.push(currentPos - 1);
  }
  if (col < BOARD_DIMENSION - 1) {
    possibleMoves.push(currentPos + 1);
  }
  return possibleMoves;
}

function createNextBoardState(currentConfiguration, zeroTileIndex, targetTileIndex) {
  const configurationChars = currentConfiguration.split('');
  [configurationChars[zeroTileIndex], configurationChars[targetTileIndex]] =
    [configurationChars[targetTileIndex], configurationChars[zeroTileIndex]];
  return configurationChars.join('');
}

function exploreDepthLimited(remainingSteps, currentConfiguration) {
  if (remainingSteps === 0) {
    return currentConfiguration === TARGET_ARRANGEMENT;
  }

  const blankTileLocation = currentConfiguration.indexOf('0');
  const availableMoves = determineAdjacentPositions(blankTileLocation);

  for (const nextTileLocation of availableMoves) {
    const newConfiguration = createNextBoardState(currentConfiguration, blankTileLocation, nextTileLocation);
    if (exploreDepthLimited(remainingSteps - 1, newConfiguration)) {
      return true;
    }
  }

  return false;
}

let currentIterationDepth = 0;
const maximumAllowedDepth = 45;

while (currentIterationDepth <= maximumAllowedDepth) {
  if (exploreDepthLimited(currentIterationDepth, initialBoardState)) {
    break;
  }
  currentIterationDepth++;
}

console.log(currentIterationDepth);