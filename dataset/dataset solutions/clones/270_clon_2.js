function populateGrid (rowCoord, colCoord) {

  if (cellValue === limitValue) {
    return;
  }

  if (colCoord < 0) {
    colCoord = gridDim - 1;
  }

  if (rowCoord < 0) {
    rowCoord = gridDim - 1;
  }

  if (colCoord >= gridDim) {
    colCoord = 0;
  }

  if (rowCoord >= gridDim) {
    rowCoord = 0;
  }

  if (outputMatrix[rowCoord][colCoord] !== -1) {
    populateGrid(rowCoord + 1, colCoord - 1);
  } else {
    outputMatrix[rowCoord][colCoord] = ("   " + cellValue).slice(-4);
    cellValue++;
    populateGrid(rowCoord + 1, colCoord + 1);
  }

}


var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

var dimensionArray = (fileContent.trim()).split("\n").map(Number);

for (var arrayIndex = 0; arrayIndex < dimensionArray.length; arrayIndex++) {

  var gridDim = dimensionArray[arrayIndex];

  var limitValue = gridDim * gridDim + 1;

  if (gridDim === 0) {
    break;
  }

  var outputMatrix = [];

  for (var rowIndex = 0; rowIndex < gridDim; rowIndex++) {
    outputMatrix[rowIndex] = [];
    for (var colIndex = 0; colIndex < gridDim; colIndex++) {
      outputMatrix[rowIndex][colIndex] = -1;
    }
  }

  var cellValue = 1;

  populateGrid(Math.floor(gridDim / 2) + 1, Math.floor(gridDim / 2));

  console.log(outputMatrix.join("\n").replace(/\,/g, ""));

}