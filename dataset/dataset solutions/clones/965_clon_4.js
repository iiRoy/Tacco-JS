const appSettings = { input: '/dev/stdin', newline: '\n' };

const GRID_SIZE_SQUARED = 16;
const targetState = '123456789ABCDEF0';

const fileContent = require('fs').readFileSync(appSettings.input, 'ascii');
const startingArrangementString = fileContent
  .trim()
  .split(appSettings.newline)
  .reduce((accumulator, currentLine) => {
    const hexSegment = currentLine.split(' ').reduce((lineAccumulator, numberString) => {
      return lineAccumulator + Number(numberString).toString(16);
    }, '');
    return accumulator + hexSegment;
  }, '')
  .toUpperCase();

const startingArrangement = startingArrangementString.split('');

function getAdjacentIndices(zeroPosition) {
  const possibleMoves = [];
  const row = Math.floor(zeroPosition / 4);
  const col = zeroPosition % 4;

  if (row > 0) possibleMoves.push(zeroPosition - 4);
  if (row < 3) possibleMoves.push(zeroPosition + 4);
  if (col > 0) possibleMoves.push(zeroPosition - 1);
  if (col < 3) possibleMoves.push(zeroPosition + 1);

  return possibleMoves;
}

function swapElements(sourceArray, indexA, indexB) {
  const newArray = [...sourceArray];
  [newArray[indexA], newArray[indexB]] = [newArray[indexB], newArray[indexA]];
  return newArray;
}

function findSolutionPath(currentDepthLimit, currentArrangement) {
  if (currentDepthLimit === 0) {
    return currentArrangement.join('') === targetState;
  }

  const zeroTilePosition = currentArrangement.indexOf('0');
  const validSwapTargets = getAdjacentIndices(zeroTilePosition);

  for (const targetIndex of validSwapTargets) {
    const nextArrangement = swapElements(currentArrangement, zeroTilePosition, targetIndex);
    if (findSolutionPath(currentDepthLimit - 1, nextArrangement)) {
      return true;
    }
  }

  return false;
}

let finalSolutionDepth = 0;
for (let depthIterator = 0; depthIterator <= 45; depthIterator++) {
  if (findSolutionPath(depthIterator, startingArrangement)) {
    finalSolutionDepth = depthIterator;
    break;
  }
}
console.log(finalSolutionDepth);
