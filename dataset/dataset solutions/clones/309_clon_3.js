const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

let inputLines = rawInputData.trim().split("\n");

const originalMatrixSize = parseInt(inputLines.shift(), 10);

const paddedDimension = originalMatrixSize + 1;

const sourceGrid = Array(paddedDimension)
  .fill(null)
  .map(() => Array(paddedDimension).fill(0));

for (let rIndex = 1; rIndex <= originalMatrixSize; rIndex++) {
  const rowContent = inputLines.shift().split(" ").map(Number);
  for (let cIndex = 1; cIndex <= originalMatrixSize; cIndex++) {
    sourceGrid[rIndex][cIndex] = rowContent[cIndex - 1];
  }
}

const prefixSumGrid = Array(paddedDimension)
  .fill(null)
  .map(() => Array(paddedDimension).fill(0));

for (let r = 1; r < paddedDimension; r++) {
  for (let c = 1; c < paddedDimension; c++) {
    prefixSumGrid[r][c] =
      sourceGrid[r][c] +
      prefixSumGrid[r - 1][c] +
      prefixSumGrid[r][c - 1] -
      prefixSumGrid[r - 1][c - 1];
  }
}

let greatestSubmatrixSum = -Infinity;

for (let startRow = 0; startRow < paddedDimension; startRow++) {
  for (let startCol = 0; startCol < paddedDimension; startCol++) {
    for (let endRow = startRow + 1; endRow < paddedDimension; endRow++) {
      for (let endCol = startCol + 1; endCol < paddedDimension; endCol++) {
        const currentSubmatrixValue =
          prefixSumGrid[endRow][endCol] -
          prefixSumGrid[startRow][endCol] -
          prefixSumGrid[endRow][startCol] +
          prefixSumGrid[startRow][startCol];

        if (currentSubmatrixValue > greatestSubmatrixSum) {
          greatestSubmatrixSum = currentSubmatrixValue;
        }
      }
    }
  }
}

console.log(greatestSubmatrixSum);