(function(rawDataInput) {
  const fileContent = rawDataInput.replace(/\n$/, '');
  const inputLines = fileContent.split('\n');

  const gridData = [];
  for (let lineIndex = 0; lineIndex < inputLines.length; lineIndex++) {
    const lineCharacters = inputLines[lineIndex].split('');
    const numericRow = lineCharacters.map(Number);
    gridData.push(numericRow);
  }

  const initialCallResult = traverseGrid(gridData, 0, 0, 'R');
  console.log('R' + initialCallResult);

})(require('fs').readFileSync('/dev/stdin', 'utf8'));

function traverseGrid(currentGrid, coordX, coordY, currentDir) {
  console.log(currentGrid, coordX, coordY, currentDir);

  if (coordX === 0 && coordY === 0 && currentDir === 'L') {
    return '';
  }

  let nextMoveChar = '';
  let nextDirection = '';
  let nextX = -1;
  let nextY = -1;

  if (currentDir === 'R') {
    const potentialNextX_Up = coordX + 1;
    const potentialNextY_Up = coordY - 1;
    const potentialNextX_Right = coordX + 1;
    const potentialNextY_Right = coordY;
    const potentialNextX_Down = coordX + 1;
    const potentialNextY_Down = coordY + 1;

    if (checkCellValidity(currentGrid, potentialNextX_Up, potentialNextY_Up)) {
      nextMoveChar = 'U';
      nextDirection = 'U';
      nextX = potentialNextX_Up;
      nextY = potentialNextY_Up;
    } else if (checkCellValidity(currentGrid, potentialNextX_Right, potentialNextY_Right)) {
      nextMoveChar = 'R';
      nextDirection = 'R';
      nextX = potentialNextX_Right;
      nextY = potentialNextY_Right;
    } else if (checkCellValidity(currentGrid, potentialNextX_Down, potentialNextY_Down)) {
      nextMoveChar = 'D';
      nextDirection = 'D';
      nextX = potentialNextX_Down;
      nextY = potentialNextY_Down;
    } else {
      nextMoveChar = 'L';
      nextDirection = 'L';
      nextX = coordX;
      nextY = coordY;
    }
  } else if (currentDir === 'L') {
    const potentialNextX_Down = coordX;
    const potentialNextY_Down = coordY + 1;
    const potentialNextX_Left = coordX - 1;
    const potentialNextY_Left = coordY;
    const potentialNextX_Up = coordX;
    const potentialNextY_Up = coordY - 1;

    if (checkCellValidity(currentGrid, potentialNextX_Down, potentialNextY_Down)) {
      nextMoveChar = 'D';
      nextDirection = 'D';
      nextX = potentialNextX_Down;
      nextY = potentialNextY_Down;
    } else if (checkCellValidity(currentGrid, potentialNextX_Left, potentialNextY_Left)) {
      nextMoveChar = 'L';
      nextDirection = 'L';
      nextX = potentialNextX_Left;
      nextY = potentialNextY_Left;
    } else if (checkCellValidity(currentGrid, potentialNextX_Up, potentialNextY_Up)) {
      nextMoveChar = 'U';
      nextDirection = 'U';
      nextX = potentialNextX_Up;
      nextY = potentialNextY_Up;
    } else {
      nextMoveChar = 'R';
      nextDirection = 'R';
      nextX = coordX;
      nextY = coordY;
    }
  } else if (currentDir === 'D') {
    const potentialNextX_Right = coordX;
    const potentialNextY_Right = coordY + 1;
    const potentialNextX_Down = coordX;
    const potentialNextY_Down = coordY + 2;
    const potentialNextX_Left = coordX - 1;
    const potentialNextY_Left = coordY + 1;

    if (checkCellValidity(currentGrid, potentialNextX_Right, potentialNextY_Right)) {
      nextMoveChar = 'R';
      nextDirection = 'R';
      nextX = potentialNextX_Right;
      nextY = potentialNextY_Right;
    } else if (checkCellValidity(currentGrid, potentialNextX_Down, potentialNextY_Down)) {
      nextMoveChar = 'D';
      nextDirection = 'D';
      nextX = potentialNextX_Down;
      nextY = potentialNextY_Down;
    } else if (checkCellValidity(currentGrid, potentialNextX_Left, potentialNextY_Left)) {
      nextMoveChar = 'L';
      nextDirection = 'L';
      nextX = potentialNextX_Left;
      nextY = potentialNextY_Left;
    } else {
      nextMoveChar = 'U';
      nextDirection = 'U';
      nextX = coordX;
      nextY = coordY;
    }
  } else if (currentDir === 'U') {
    const potentialNextX_Left = coordX - 1;
    const potentialNextY_Left = coordY - 1;
    const potentialNextX_Up = coordX;
    const potentialNextY_Up = coordY - 2;
    const potentialNextX_Right = coordX;
    const potentialNextY_Right = coordY - 1;

    if (checkCellValidity(currentGrid, potentialNextX_Left, potentialNextY_Left)) {
      nextMoveChar = 'L';
      nextDirection = 'L';
      nextX = potentialNextX_Left;
      nextY = potentialNextY_Left;
    } else if (checkCellValidity(currentGrid, potentialNextX_Up, potentialNextY_Up)) {
      nextMoveChar = 'U';
      nextDirection = 'U';
      nextX = potentialNextX_Up;
      nextY = potentialNextY_Up;
    } else if (checkCellValidity(currentGrid, potentialNextX_Right, potentialNextY_Right)) {
      nextMoveChar = 'R';
      nextDirection = 'R';
      nextX = potentialNextX_Right;
      nextY = potentialNextY_Right;
    } else {
      nextMoveChar = 'D';
      nextDirection = 'D';
      nextX = coordX;
      nextY = coordY;
    }
  }
  return nextMoveChar + traverseGrid(currentGrid, nextX, nextY, nextDirection);
}

function checkCellValidity(currentGrid, checkX, checkY) {
  const gridHeight = currentGrid.length;
  const gridWidth = currentGrid[0] ? currentGrid[0].length : 0;

  if (checkY < 0 || checkY >= gridHeight) {
    return 0;
  }
  if (checkX < 0 || checkX >= gridWidth) {
    return 0;
  }
  return currentGrid[checkY][checkX] === 1;
}
