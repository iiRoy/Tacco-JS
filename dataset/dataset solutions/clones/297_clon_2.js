const fileSystemModule = require('fs');
const standardInputPath = '/dev/stdin';
const textEncoding = 'utf8';
let sourceContent = fileSystemModule.readFileSync(standardInputPath, textEncoding);
let inputLines = sourceContent.trim().split("\n");
let matrixDimension;
let gridDataPlane;
const calculateCellMetric = (currentRowIndex, currentColumnIndex) => {
  const specialMarker = "*";
  if (gridDataPlane[currentRowIndex][currentColumnIndex] === specialMarker) {
    gridDataPlane[currentRowIndex][currentColumnIndex] = 0;
    return;
  }
  const verticalOffsets = [-1, -1, 0];
  const horizontalOffsets = [-1, 0, -1];
  let minimumNeighborValue = matrixDimension;
  for (let iterationIndex = 0; iterationIndex < 3; iterationIndex++) {
    const adjacentRow = currentRowIndex + verticalOffsets[iterationIndex];
    const adjacentColumn = currentColumnIndex + horizontalOffsets[iterationIndex];
    if (adjacentRow < 0 || adjacentRow >= matrixDimension || adjacentColumn < 0 || adjacentColumn >= matrixDimension) {
      gridDataPlane[currentRowIndex][currentColumnIndex] = 1;
      return;
    }
    minimumNeighborValue = Math.min(minimumNeighborValue, gridDataPlane[adjacentRow][adjacentColumn]);
  }
  gridDataPlane[currentRowIndex][currentColumnIndex] = minimumNeighborValue + 1;
};
while (true) {
  matrixDimension = Number(inputLines.shift());
  if (matrixDimension === 0) break;
  let overallMaximum = 0;
  gridDataPlane = [];
  for (let rowPopulateIndex = 0; rowPopulateIndex < matrixDimension; rowPopulateIndex++) {
    const currentRowString = inputLines.shift();
    gridDataPlane.push(currentRowString.split(""));
  }
  for (let rowIndex = 0; rowIndex < matrixDimension; rowIndex++) {
    for (let colIndex = 0; colIndex < matrixDimension; colIndex++) {
      calculateCellMetric(rowIndex, colIndex);
      overallMaximum = Math.max(overallMaximum, gridDataPlane[rowIndex][colIndex]);
    }
  }
  console.log(overallMaximum);
}