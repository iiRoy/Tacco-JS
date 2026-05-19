'use strict';

function parseDimensions(dimensionLine) {
  const parts = dimensionLine.split(' ');
  const sizeValue = Number(parts[0]);
  // The original code uses the first number for both height and width.
  return { gridHeight: sizeValue, gridWidth: sizeValue };
}

const cardinalDirectionOffsets = [
  [-1, 0], // North
  [1, 0],  // South
  [0, 1],  // East
  [0, -1]  // West
];

function countAdjacentHashCells(currentRow, currentCol, gridMatrix, totalRows, totalCols) {
  let hashNeighborCount = 0;
  for (const [deltaRow, deltaCol] of cardinalDirectionOffsets) {
    const neighborRow = currentRow + deltaRow;
    const neighborCol = currentCol + deltaCol;

    const isWithinGridBounds = neighborRow >= 0 && neighborRow < totalRows && neighborCol >= 0 && neighborCol < totalCols;

    if (isWithinGridBounds) {
      if (gridMatrix[neighborRow][neighborCol] === '#') {
        hashNeighborCount++;
      }
    }
  }
  return hashNeighborCount;
}

function processGrid(inputString) {
  const inputLines = inputString.split('\n');

  const { gridHeight, gridWidth } = parseDimensions(inputLines[0]);

  const gridData = inputLines.slice(1, -1).map(lineContent => lineContent.split(''));

  let finalResult = 'Yes';

  for (let rowIndex = 0; rowIndex < gridHeight; rowIndex++) {
    for (let colIndex = 0; colIndex < gridWidth; colIndex++) {
      const currentCellContent = gridData[rowIndex][colIndex];

      if (currentCellContent === '.') {
        continue;
      }

      const adjacentHashCount = countAdjacentHashCells(rowIndex, colIndex, gridData, gridHeight, gridWidth);

      if (adjacentHashCount === 0) {
        finalResult = 'No';
      }
    }
  }

  console.log(finalResult);
}

processGrid(require("fs").readFileSync("/dev/stdin", "utf8"));
