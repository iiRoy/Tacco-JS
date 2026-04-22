"use strict"; // Enforce strict parsing rules for better code quality

// Core utility functions for input processing
var rawData = require("fs").readFileSync("standardInput", "textEncoding");
var tokenStream = rawData.split(/\s+|\n/);
var tokenIndex = 0;

/* Retrieves the next numeric token from the stream */
function retrieveNextInt() {
  return Number(tokenStream[tokenIndex++]);
}

/* Obtains the next string token from the stream */
function obtainNextString() {
  return tokenStream[tokenIndex++];
}

/* Fetches the next BigInt token from the stream */
function fetchNextBigInt() {
  return BigInt(tokenStream[tokenIndex++]);
}

/**
 * Extracts a sequence of tokens from the global token stream.
 * @param {number} count - The number of tokens to extract.
 * @param {boolean} isStringArray - If true, returns strings; otherwise, converts tokens to numbers.
 * @returns {Array} An array of extracted tokens, either as strings or numbers.
 */
function extractSequence(count, isStringArray) {
  if (isStringArray) {
    return tokenStream.slice(tokenIndex, tokenIndex += count);
  } else {
    return tokenStream.slice(tokenIndex, tokenIndex += count).map(elem => Number(elem));
  }
}

/**
 * Reads a matrix of tokens from the global token stream.
 * @param {number} numRows - Number of rows to read for the matrix.
 * @param {number} numCols - Number of columns per row.
 * @param {boolean} returnStrings - If true, returns matrix elements as strings; otherwise, converts to numbers.
 * @returns {Array<Array>} A 2D array representing the matrix.
 */
function getMatrix(numRows, numCols, returnStrings) {
  var resultMatrix = [];
  var rowIndex = 0;
  if (returnStrings) {
    for (; rowIndex < numRows; rowIndex++) {
      resultMatrix.push(tokenStream.slice(tokenIndex, tokenIndex += numCols));
    }
  } else {
    for (; rowIndex < numRows; rowIndex++) {
      resultMatrix.push(tokenStream.slice(tokenIndex, tokenIndex += numCols).map(elem => Number(elem)));
    }
  }
  return resultMatrix;
}

/**
 * Dynamically creates a multi-dimensional array with an initial value.
 * The dimensions are provided as subsequent arguments.
 * @param {*} initialValue - The value to initialize array elements with.
 * @returns {Array} The created multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
  var dimensionSizes = arguments;
  var argLength = dimensionSizes.length;
  // Construct the string representation of array creation code
  var generatedCodeString = "Array(dimensionSizes[" + --argLength + "]).fill().map(x => { return " + initialValue + "; })";
  while (--argLength) {
    generatedCodeString = "Array(dimensionSizes[" + argLength + "]).fill().map(x => " + generatedCodeString + ")";
  }
  return eval(generatedCodeString); // Execute the generated code string
}

// Execute the main processing logic and capture its return value
var finalResult = processInputData();
if (finalResult !== undefined) {
  console.log(String(finalResult)); // Output the final result to console
}

/**
 * Main processing function for the problem.
 * This function reads grid dimensions and item data, then uses dynamic programming
 * to calculate the maximum possible value based on item placement on a grid,
 * adhering to specific picking rules (up to 3 items per column).
 * @returns {number} The maximum calculated value from the DP process.
 */
function processInputData() {
  // Read grid dimensions (rows, columns) and the total number of items
  var [rowsCount, columnsCount, itemQuantity] = extractSequence(3);

  // Initialize a grid to store item values.
  // The grid is 1-indexed, hence `rowsCount + 1`.
  // "{}" is used as a placeholder for empty cells, which will be overwritten by numeric item values.
  var dataGrid = createMultiDimArray("{}", rowsCount + 1);

  // Populate the grid with item values based on input coordinates
  for (var itemIndex = 0; itemIndex < itemQuantity; itemIndex++) {
    var [rowCoord, colCoord, itemValue] = extractSequence(3);
    dataGrid[rowCoord][colCoord] = itemValue;
  }

  // Initialize the DP table for the current row's calculations.
  // `columnsCount + 1` for 1-indexing columns, `4` for DP states (0, 1, 2, or 3 items picked in a column).
  var currentDPState = createMultiDimArray(0, columnsCount + 1, 4);

  // Iterate through each row of the grid, starting from the first actual row (index 1)
  for (var currentRow = 1; currentRow <= rowsCount; currentRow++) {
    // Initialize a new DP table for the next row's calculations.
    // This allows carrying over values from the previous row's `currentDPState`.
    var nextDPState = createMultiDimArray(0, columnsCount + 1, 4);

    // Iterate through each column in the current row, starting from the first actual column (index 1)
    for (var currentColumn = 1; currentColumn <= columnsCount; currentColumn++) {
      // Base case for the current cell: state 0 (no items picked in this cell).
      // This can be either the maximum value from the previous row's state 3 (max items picked),
      // or the maximum value from the previous column's state 0 (no items picked).
      nextDPState[currentColumn][0] = Math.max(currentDPState[currentColumn][3], nextDPState[currentColumn - 1][0]);

      // Iterate through different item pick states (1 to 3 items picked in the current column)
      for (var stateIndex = 1; stateIndex <= 3; stateIndex++) {
        // Check if there's an item at the current grid position (`dataGrid[currentRow][currentColumn]`)
        if (dataGrid[currentRow][currentColumn]) {
          // If an item exists, calculate the maximum value by considering three options:
          // 1. Pick the item here: (previous row's max 3-item state for this column) + current item value.
          // 2. Pick the item here: (previous column's (stateIndex-1) state) + current item value.
          // 3. Do not pick the item here: (previous column's current stateIndex).
          nextDPState[currentColumn][stateIndex] = Math.max(
            currentDPState[currentColumn][3] + dataGrid[currentRow][currentColumn],
            nextDPState[currentColumn - 1][stateIndex - 1] + dataGrid[currentRow][currentColumn],
            nextDPState[currentColumn - 1][stateIndex]
          );
        } else {
          // If no item at the current grid position, the maximum value is derived from two options:
          // 1. The maximum value from the previous row's 3-item state for this column.
          // 2. The maximum value from the previous column's current stateIndex.
          nextDPState[currentColumn][stateIndex] = Math.max(
            currentDPState[currentColumn][3],
            nextDPState[currentColumn - 1][stateIndex]
          );
        }
      }
    }
    // After processing all columns for the current row, update the current DP state
    // to be the newly calculated `nextDPState` for the subsequent row's calculations.
    currentDPState = nextDPState;
  }

  // The final answer is the maximum value found in the last column of the DP table,
  // across all possible item pick states (0 to 3).
  return Math.max(...currentDPState[columnsCount]);
}