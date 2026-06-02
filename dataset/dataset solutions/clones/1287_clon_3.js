function main(rawInputString) {
  var lineSegments = rawInputString.split('\n');

  var dimensionLine = lineSegments[0];
  var dimensionParts = dimensionLine.split(' ');

  var matrixHeight = parseInt(dimensionParts[0], 10);
  var matrixWidth = parseInt(dimensionParts[1], 10);

  var dataMatrix = [];
  var matrixDataStartIndex = 1;
  var matrixDataEndIndex = matrixDataStartIndex + matrixHeight;

  for (var rowIdx = matrixDataStartIndex; rowIdx < matrixDataEndIndex; rowIdx++) {
    var currentMatrixLine = lineSegments[rowIdx];
    dataMatrix.push(currentMatrixLine.split(' ').map(Number));
  }

  var coefficientVector = [];
  var coeffDataStartIndex = matrixDataEndIndex;
  var totalInputLines = lineSegments.length;
  var numberOfCoefficients = totalInputLines - coeffDataStartIndex;

  for (var coeffIdx = 0; coeffIdx < numberOfCoefficients; coeffIdx++) {
    var currentCoeffLine = lineSegments[coeffDataStartIndex + coeffIdx];
    coefficientVector.push(parseInt(currentCoeffLine, 10));
  }

  function computeWeightedSum(rowArray, weightsArray, elementCount) {
    var currentSum = 0;
    for (var col = 0; col < elementCount; col++) {
      currentSum += rowArray[col] * weightsArray[col];
    }
    return currentSum;
  }

  for (var currentMatrixRowIdx = 0; currentMatrixRowIdx < dataMatrix.length; currentMatrixRowIdx++) {
    var currentRowData = dataMatrix[currentMatrixRowIdx];
    var computedRowResult = computeWeightedSum(currentRowData, coefficientVector, matrixWidth);
    console.log(computedRowResult);
  }
}

var fileContent = require('fs').readFileSync('/dev/stdin', 'utf-8');
main(fileContent);
