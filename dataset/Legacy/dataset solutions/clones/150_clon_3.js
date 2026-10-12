function parseInputGrid(inputString) {
  const trimmedInput = inputString.replace(/\n$/, '');
  const lines = trimmedInput.split('\n');
  const grid = [];
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    grid.push(lines[lineIndex].split('').map(Number));
  }
  return grid;
}

function isCellWalkable(gridData, checkX, checkY) {
  const rowCount = gridData.length;
  if (rowCount === 0) {
    return false;
  }
  const colCount = gridData[0].length;

  const isYOutOfBounds = checkY < 0 || checkY >= rowCount;
  const isXOutOfBounds = checkX < 0 || checkX >= colCount;

  if (isYOutOfBounds || isXOutOfBounds) {
    return false;
  }

  return gridData[checkY][checkX] === 1;
}

function findPathSequence(gridRef, currX, currY, currDir) {
  const DIR_RIGHT = 'R';
  const DIR_LEFT = 'L';
  const DIR_DOWN = 'D';
  const DIR_UP = 'U';

  if (currX === 0 && currY === 0 && currDir === DIR_LEFT) {
    return '';
  }

  let nextMoveChar = '';
  let recursiveResult = '';

  switch (currDir) {
    case DIR_RIGHT:
      if (isCellWalkable(gridRef, currX + 1, currY - 1)) {
        nextMoveChar = DIR_UP;
        recursiveResult = findPathSequence(gridRef, currX + 1, currY - 1, DIR_UP);
      } else if (isCellWalkable(gridRef, currX + 1, currY)) {
        nextMoveChar = DIR_RIGHT;
        recursiveResult = findPathSequence(gridRef, currX + 1, currY, DIR_RIGHT);
      } else if (isCellWalkable(gridRef, currX + 1, currY + 1)) {
        nextMoveChar = DIR_DOWN;
        recursiveResult = findPathSequence(gridRef, currX + 1, currY + 1, DIR_DOWN);
      } else {
        nextMoveChar = DIR_LEFT;
        recursiveResult = findPathSequence(gridRef, currX, currY, DIR_LEFT);
      }
      break;

    case DIR_LEFT:
      if (isCellWalkable(gridRef, currX, currY + 1)) {
        nextMoveChar = DIR_DOWN;
        recursiveResult = findPathSequence(gridRef, currX, currY + 1, DIR_DOWN);
      } else if (isCellWalkable(gridRef, currX - 1, currY)) {
        nextMoveChar = DIR_LEFT;
        recursiveResult = findPathSequence(gridRef, currX - 1, currY, DIR_LEFT);
      } else if (isCellWalkable(gridRef, currX, currY - 1)) {
        nextMoveChar = DIR_UP;
        recursiveResult = findPathSequence(gridRef, currX, currY - 1, DIR_UP);
      } else {
        nextMoveChar = DIR_RIGHT;
        recursiveResult = findPathSequence(gridRef, currX, currY, DIR_RIGHT);
      }
      break;

    case DIR_DOWN:
      if (isCellWalkable(gridRef, currX, currY + 1)) {
        nextMoveChar = DIR_RIGHT;
        recursiveResult = findPathSequence(gridRef, currX, currY + 1, DIR_RIGHT);
      } else if (isCellWalkable(gridRef, currX, currY + 2)) {
        nextMoveChar = DIR_DOWN;
        recursiveResult = findPathSequence(gridRef, currX, currY + 2, DIR_DOWN);
      } else if (isCellWalkable(gridRef, currX - 1, currY + 1)) {
        nextMoveChar = DIR_LEFT;
        recursiveResult = findPathSequence(gridRef, currX - 1, currY + 1, DIR_LEFT);
      } else {
        nextMoveChar = DIR_UP;
        recursiveResult = findPathSequence(gridRef, currX, currY, DIR_UP);
      }
      break;

    case DIR_UP:
      if (isCellWalkable(gridRef, currX - 1, currY - 1)) {
        nextMoveChar = DIR_LEFT;
        recursiveResult = findPathSequence(gridRef, currX - 1, currY - 1, DIR_LEFT);
      } else if (isCellWalkable(gridRef, currX, currY - 2)) {
        nextMoveChar = DIR_UP;
        recursiveResult = findPathSequence(gridRef, currX, currY - 2, DIR_UP);
      } else if (isCellWalkable(gridRef, currX, currY - 1)) {
        nextMoveChar = DIR_RIGHT;
        recursiveResult = findPathSequence(gridRef, currX, currY - 1, DIR_RIGHT);
      } else {
        nextMoveChar = DIR_DOWN;
        recursiveResult = findPathSequence(gridRef, currX, currY, DIR_DOWN);
      }
      break;

    default:
      return '';
  }

  return nextMoveChar + recursiveResult;
}

(function(rawData) {
  const initialXCoordinate = 0;
  const initialYCoordinate = 0;
  const startingDirection = 'R';

  const pathGrid = parseInputGrid(rawData);

  const computedPathSegment = findPathSequence(pathGrid, initialXCoordinate, initialYCoordinate, startingDirection);
  const finalOutputString = startingDirection + computedPathSegment;

  console.log(finalOutputString);
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
