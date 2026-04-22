let rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
let lineFragments = rawData.trim().split("\n");

let gridDimension = Number(lineFragments.shift());

let matrixData = [];
let paddingRow = [];
for (let rowIdx = 0; rowIdx < gridDimension + 1; rowIdx++) {
  paddingRow.push(0);
}
matrixData.push(paddingRow);

for (let rowIdx = 0; rowIdx < gridDimension; rowIdx++) {
  matrixData.push(('0 ' + lineFragments.shift()).split(' ').map(Number));
}

gridDimension = gridDimension + 1;

let prefixSumTable = [];
for (let rowIdx = 0; rowIdx < gridDimension; rowIdx++) {
  prefixSumTable[rowIdx] = [];
  prefixSumTable[rowIdx][0] = matrixData[rowIdx][0];
}

for (let rowIdx = 0; rowIdx < gridDimension; rowIdx++) {
  for (let colIdx = 1; colIdx < gridDimension; colIdx++) {
    prefixSumTable[rowIdx][colIdx] = prefixSumTable[rowIdx][colIdx - 1] + matrixData[rowIdx][colIdx];
  }
}

for (let rowIdx = 1; rowIdx < gridDimension; rowIdx++) {
  for (let colIdx = 0; colIdx < gridDimension; colIdx++) {
    prefixSumTable[rowIdx][colIdx] = prefixSumTable[rowIdx - 1][colIdx] + prefixSumTable[rowIdx][colIdx];
  }
}

let greatestSum = Number.NEGATIVE_INFINITY;
for (let rowIdx = 0; rowIdx < gridDimension; rowIdx++) {
  for (let colIdx = 0; colIdx < gridDimension; colIdx++) {
    for (let bottomRow = rowIdx + 1; bottomRow < gridDimension; bottomRow++) {
      for (let rightCol = colIdx + 1; rightCol < gridDimension; rightCol++) {
        let currentRectangleSum = prefixSumTable[bottomRow][rightCol] - prefixSumTable[rowIdx][rightCol] - prefixSumTable[bottomRow][colIdx] + prefixSumTable[rowIdx][colIdx];
        if (greatestSum < currentRectangleSum) {
          greatestSum = currentRectangleSum;
        }
      }
    }
  }
}
console.log(greatestSum);