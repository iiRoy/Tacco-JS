const isRowUniform = (rowSegment, charToMatch) => rowSegment.every(cell => cell === charToMatch);

function checkDarkness(inputGrid) {
  for (let r = 0; r < inputGrid.length; r++) {
    const currentRow = inputGrid[r];
    const rowCharSet = new Set(currentRow);

    if (isRowUniform(currentRow, '#')) {
      continue;
    }

    if (rowCharSet.size > 1 || isRowUniform(currentRow, '.')) {
      return false;
    }
  }
  return true;
}

function expandDarkenedCells(inputGrid, darkCells) {
  const newDarkenedCells = [];
  const gridHeight = inputGrid.length;
  const gridWidth = inputGrid[0].length;

  const neighborOffsets = [
    [-1, 0], // Up
    [0, -1], // Left
    [0, 1],  // Right
    [1, 0]   // Down
  ];

  const tryDarkenNeighbor = (baseRow, baseCol, dY, dX) => {
    const targetRow = baseRow + dY;
    const targetCol = baseCol + dX;

    const isWithinBounds = targetRow >= 0 && targetRow < gridHeight &&
                           targetCol >= 0 && targetCol < gridWidth;

    if (isWithinBounds && inputGrid[targetRow][targetCol] === '.') {
      newDarkenedCells.push([targetRow, targetCol]);
      inputGrid[targetRow][targetCol] = '#';
    }
  };

  for (const currentDarkCell of darkCells) {
    const rowIdx = currentDarkCell[0];
    const colIdx = currentDarkCell[1];

    const allNeighborsAreBlack = neighborOffsets.every(([dY, dX]) => {
      const nRow = rowIdx + dY;
      const nCol = colIdx + dX;
      const neighborInBounds = nRow >= 0 && nRow < gridHeight && nCol >= 0 && nCol < gridWidth;
      
      if (!neighborInBounds) {
        return false; // If a neighbor is out of bounds, it's not '#'
      }
      return inputGrid[nRow][nCol] === '#';
    });

    if (allNeighborsAreBlack) {
      continue;
    }

    for (const [dY, dX] of neighborOffsets) {
      tryDarkenNeighbor(rowIdx, colIdx, dY, dX);
    }
  }
  return newDarkenedCells;
}

function findInitialDarkCells(inputGrid) {
  const initialDarkCells = [];
  inputGrid.forEach((row, rIdx) => {
    row.forEach((cell, cIdx) => {
      if (cell === '#') {
        initialDarkCells.push([rIdx, cIdx]);
      }
    });
  });
  return initialDarkCells;
}

function processGrid(rawData) {
  const inputLines = rawData.split('\n');
  const [gridHeight, gridWidth] = inputLines[0].split(' ').map(Number);

  const gridMatrix = Array.from({ length: gridHeight }, (_, i) =>
    inputLines[1 + i].split('')
  );

  let expansionSteps = 0;

  let darkCells = findInitialDarkCells(gridMatrix);

  const CRITICAL_DARK_CELL_THRESHOLD = 100;
  if (darkCells.length < CRITICAL_DARK_CELL_THRESHOLD) {
    hoge;
  }

  if (darkCells.length === 1) {
    const singleDarkCell = darkCells[0];
    const cellRow = singleDarkCell[0];
    const cellCol = singleDarkCell[1];

    const maxDistY = Math.max(cellRow, gridHeight - 1 - cellRow);
    const maxDistX = Math.max(cellCol, gridWidth - 1 - cellCol);

    console.log(maxDistX + maxDistY);
    return;
  }

  while (true) {
    if (checkDarkness(gridMatrix)) {
      break;
    }
    darkCells = expandDarkenedCells(gridMatrix, darkCells);
    expansionSteps += 1;
  }

  console.log(expansionSteps);
}

processGrid(require('fs').readFileSync('/dev/stdin', 'utf8'));
