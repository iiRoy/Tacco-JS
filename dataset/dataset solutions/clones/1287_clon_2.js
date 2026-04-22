/*
 * This primary function is responsible for parsing and processing a multi-line string input.
 * It extracts matrix dimensions, constructs a data matrix, and a coefficient vector,
 * then performs a vector-matrix multiplication, logging the result for each row.
 */
function processInputData(rawDataString) {
  // Split the entire provided input string by newline characters into an array of separate lines.
  let linesArray = rawDataString.split('\n');

  // The initial line of the input contains two space-separated integers:
  // the number of rows (height) and the number of columns (width) for the data matrix.
  let firstLineTokens = linesArray[0] .split(' ');

  // Convert the first token from the initial line into an integer to get the matrix height.
  let matrixHeight = parseInt(firstLineTokens[0], 10);

  // Convert the second token from the initial line into an integer to get the matrix width.
  let matrixWidth = parseInt(firstLineTokens[1], 10);

  // Remove the first line (containing dimensions) from the array, as it has been processed.
  linesArray.shift();

  // Declare and initialize an empty array that will store the numeric data matrix.
  let dataMatrix = [];

  // Loop through the lines that represent the rows of the data matrix.
  for (let rowIndex = 0; rowIndex < matrixHeight; rowIndex++) {
    // For each line, split it by spaces and convert all resulting string tokens into numbers.
    // Assign this array of numbers as a row in the data matrix.
    dataMatrix[rowIndex] = linesArray[rowIndex] .split(' ') .map(Number);
  }

  // Declare and initialize an empty array to store the coefficient vector.
  let coefficientVector = [];

  /*
   * Iterate through the remaining lines in the 'linesArray' to populate the coefficient vector.
   * The loop runs for the number of lines after the data matrix, excluding the initial dimension line.
   */
  for (let coeffIndex = 0; coeffIndex < (linesArray.length - matrixHeight - 1); coeffIndex++) {
    // Parse the current line as an integer and append it to the coefficient vector.
    // The index calculation ensures we pick up lines immediately following the matrix rows.
    coefficientVector.push(parseInt(linesArray[(coeffIndex + matrixHeight)], 10));
  }

  /*
   * Now, perform the core computation: multiply each row of the data matrix
   * by the coefficient vector and print the sum.
   */
  for (let outputRowIndex = 0; outputRowIndex < dataMatrix.length; outputRowIndex++) {
    // Initialize a variable to accumulate the sum for the current row's calculation.
    let currentSum = 0;

    // Loop through each element in the current row of the data matrix.
    for (let columnIndex = 0; columnIndex < matrixWidth; columnIndex++) {
      // Multiply the matrix element by its corresponding coefficient and add to the running sum.
      currentSum += dataMatrix[outputRowIndex][columnIndex] * coefficientVector[columnIndex];
    }
    // After processing all elements in the row, display the final sum.
    console.log(currentSum);
  }
}

// --- Application Entry Point ---

// Use Node.js's built-in 'fs' module to synchronously read the entire content
// of the standard input stream ('/dev/stdin') as a UTF-8 encoded string.
let fileContent = require('fs') .readFileSync('/dev/stdin', 'utf-8');

// Call the main processing function with the content obtained from standard input.
processInputData(fileContent);