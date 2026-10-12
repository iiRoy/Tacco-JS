function evaluateSequence(rowCoord, colCoord) {
  const rowOffsets = [0, 1, 1, 1];
  const colOffsets = [1, -1, 0, 1];
  let maximumLength = 0;

  for (let directionIndex = 0; directionIndex < 4; directionIndex++) {
    let currentCount = 0;
    for (let step = 0; step <= gridSize; step++) {
      let currentRow = rowCoord + (rowOffsets[directionIndex] * step);
      let currentCol = colCoord + (colOffsets[directionIndex] * step);

      if (currentRow < 0 || currentCol < 0 || currentRow >= gridSize || currentCol >= gridSize) {
        break;
      }
      if (binaryGrid[currentRow][currentCol] !== 1) {
        break;
      }
      currentCount++;
    }
    maximumLength = Math.max(maximumLength, currentCount);
    currentCount = 0;
  }
  return maximumLength;
}

const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
const lineData = (rawData.trim()).split("\n");

let gridSize;
let binaryGrid;
let overallMax;

while (true) {
  gridSize = lineData.shift() - 0;
  if (gridSize === 0) {
    break;
  }

  binaryGrid = [];
  for (let rowIndex = 0; rowIndex < gridSize; rowIndex++) {
    binaryGrid[rowIndex] = (lineData.shift()).split("").map(Number);
  }

  overallMax = 0;
  for (let rowIndex = 0; rowIndex < gridSize; rowIndex++) {
    for (let colIndex = 0; colIndex < gridSize; colIndex++) {
      if (binaryGrid[rowIndex][colIndex] === 1) {
        overallMax = Math.max(overallMax, evaluateSequence(rowIndex, colIndex));
      }
    }
  }
  console.log(overallMax);
}
