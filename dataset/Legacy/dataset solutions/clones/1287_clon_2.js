function processInputData(rawData) {
  // Split the entire input string into individual lines.
  var lineSegments = rawData.split('\n');

  // The first line contains the dimensions (height and width) as space-separated strings.
  var dimensionsStr = lineSegments[0].split(' ');
  var matrixRows = parseInt(dimensionsStr[0], 10); // Parse height as an integer.
  var matrixCols = parseInt(dimensionsStr[1], 10); // Parse width as an integer.

  // Remove the first line (dimensions) from the array of lines.
  lineSegments.shift();

  // Initialize a 2D array to store the main data matrix.
  var dataMatrix = [];
  // Populate the data matrix from the subsequent 'matrixRows' lines.
  for (var rowIndex = 0; rowIndex < matrixRows; rowIndex++) {
    // Each line is split by space, and elements are converted to numbers.
    dataMatrix[rowIndex] = lineSegments[rowIndex].split(' ').map(Number);
  }

  // Initialize an array to store the coefficient vector.
  var coefficientVector = [];
  // Populate the coefficient vector from the remaining lines.
  // The loop runs for (total lines - lines for matrix - 1 for dimensions line)
  // The index for lineSegments needs to account for the matrix rows already processed.
  for (var vectorIndex = 0; vectorIndex < (lineSegments.length - matrixRows - 1); vectorIndex++) {
    // Parse each line as an integer and add to the vector.
    coefficientVector.push(parseInt(lineSegments[(vectorIndex + matrixRows)], 10));
  }

  // Iterate through each row of the data matrix.
  for (var currentMatrixRow = 0; currentMatrixRow < dataMatrix.length; currentMatrixRow++) {
    var rowSum = 0; // Initialize sum for the current row.
    // Perform a dot product-like operation for the current matrix row and the coefficient vector.
    for (var colIndex = 0; colIndex < matrixCols; colIndex++) {
      rowSum += dataMatrix[currentMatrixRow][colIndex] * coefficientVector[colIndex];
    }
    // Output the calculated sum for the current row.
    console.log(rowSum);
  }
}

// Read the entire content of the standard input file as a UTF-8 string.
var fileContent = require('fs').readFileSync('/dev/stdin', 'utf-8');
// Call the main processing function with the file content.
processInputData(fileContent);
