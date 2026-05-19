"use strict";

// Reads the entire content of standard input as a UTF-8 string.
var fileContent = require("fs").readFileSync("/dev/stdin", "utf8");

// Splits the input string into an array of tokens using spaces or newlines as delimiters.
// `tokenPointer` keeps track of the current position in the token array.
var tokenStream = fileContent.split(/ |\n/);
var tokenPointer = 0;

/**
 * Retrieves the next token from the `tokenStream` and converts it to a number.
 * @returns {number} The numeric value of the next token.
 */
function readNextInteger() {
  return +tokenStream[tokenPointer++];
}

/**
 * Retrieves the next token from the `tokenStream` as a string.
 * @returns {string} The string value of the next token.
 */
function readNextString() {
  return tokenStream[tokenPointer++];
}

/**
 * Retrieves the next token from the `tokenStream` and converts it to a BigInt.
 * @returns {BigInt} The BigInt value of the next token.
 */
function readNextBigInt() {
  return BigInt(tokenStream[tokenPointer++]);
}

/**
 * Reads a specified number of tokens from the `tokenStream` and returns them as an array.
 * Optionally converts tokens to numbers.
 * @param {number} count - The number of tokens to read.
 * @param {boolean} [asStrings=false] - If true, tokens are returned as strings; otherwise, as numbers.
 * @returns {Array<number|string>} An array containing the read tokens.
 */
function readArrayOfNumbers(count, asStrings) {
  if (asStrings) {
    return tokenStream.slice(tokenPointer, tokenPointer += count);
  } else {
    return tokenStream.slice(tokenPointer, tokenPointer += count).map(item => +item);
  }
}

/**
 * Reads a 2D matrix of tokens from the `tokenStream`.
 * @param {number} rows - The number of rows in the matrix.
 * @param {number} cols - The number of columns in each row.
 * @param {boolean} [asStrings=false] - If true, matrix elements are strings; otherwise, numbers.
 * @returns {Array<Array<number|string>>} The 2D matrix.
 */
function readMatrix(rows, cols, asStrings) {
  var matrixData = [];
  var rowIndex = 0;
  if (asStrings) {
    for (; rowIndex < rows; rowIndex++) {
      matrixData.push(tokenStream.slice(tokenPointer, tokenPointer += cols));
    }
  } else {
    for (; rowIndex < rows; rowIndex++) {
      matrixData.push(tokenStream.slice(tokenPointer, tokenPointer += cols).map(element => +element));
    }
  }
  return matrixData;
}

/**
 * Dynamically creates a multi-dimensional array initialized with a given value.
 * The dimensions are provided as subsequent arguments after the initial value.
 * @param {*} initialValue - The value to fill the array elements with.
 * @param {...number} dimensions - The sizes of each dimension of the array.
 * @returns {Array} The newly created multi-dimensional array.
 */
function createNDArray(initialValue) {
  var dimensions = arguments;
  var dimCount = dimensions.length;
  // Constructs a string representation of array creation logic, starting from the innermost dimension.
  var arrayGenString = "Array(dimensions[" + --dimCount + "]).fill().map(_ => { return " + initialValue + "; })";
  // Wraps the string with outer array creation logic for remaining dimensions.
  while (--dimCount) {
    arrayGenString = "Array(dimensions[" + dimCount + "]).fill().map(_ => " + arrayGenString + ")";
  }
  // Executes the constructed string as JavaScript code to create the array.
  return eval(arrayGenString);
}

// Calls the main program logic function.
var finalResult = executeProgram();

// If the program returns a value, it is converted to a string and printed to the console.
if (finalResult !== undefined) {
  console.log(String(finalResult));
}

/**
 * Contains the core algorithm for solving the problem, which is a BFS on a grid.
 * @returns {number} The minimum number of steps required to reach the target, or -1 if unreachable.
 */
function executeProgram() {
  // A large constant representing an unreachable distance.
  const maxDistanceValue = 1e9;
  // Arrays defining movement in X and Y directions (Up, Right, Down, Left).
  const deltaX = [0, 1, 0, -1];
  const deltaY = [-1, 0, 1, 0];
  const directionCount = 4; // Number of possible directions.

  // Reads grid dimensions (height, width) and maximum movement steps per turn.
  var [gridHeight, gridWidth, maxSteps] = readArrayOfNumbers(3);
  // Reads starting and target coordinates (row, column).
  var [startRow, startCol, targetRow, targetCol] = readArrayOfNumbers(4);

  // Initializes the grid map with padding to simplify boundary checks.
  var mapLayout = Array(gridHeight + 2);
  // Creates the top border row filled with '@' characters.
  mapLayout[0] = createNDArray("'@'", gridWidth + 2).join("");
  // Fills the inner rows, adding '@' borders to the left and right.
  for (var rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
    mapLayout[rowIdx + 1] = "@" + readNextString() + "@";
  }
  // Creates the bottom border row.
  mapLayout[gridHeight + 1] = createNDArray("'@'", gridWidth + 2).join("");

  // Initializes a 2D array to store the minimum distance to each cell, filled with `maxDistanceValue`.
  var distanceMap = createNDArray(maxDistanceValue, gridHeight + 2, gridWidth + 2);
  // The distance to the starting cell is 0.
  distanceMap[startRow][startCol] = 0;

  // `currentLevelQueue` stores coordinates [row, col] for cells to visit at the current distance level.
  var currentLevelQueue = [startRow, startCol];
  // `currentLevelDist` tracks the current distance from the start.
  var currentLevelDist = 0;

  // Main BFS loop: continues as long as there are cells to process.
  while (currentLevelQueue.length) {
    var nextLevelQueue = []; // Stores cells to visit in the next distance level.

    // Processes all cells at the current distance level.
    while (currentLevelQueue.length) {
      var currentCol = currentLevelQueue.pop(); // Retrieves column (LIFO order from push).
      var currentRow = currentLevelQueue.pop(); // Retrieves row.

      // Iterates through all four possible directions.
      for (var dirIdx = 0; dirIdx < directionCount; dirIdx++) {
        var nextCol = currentCol;
        var nextRow = currentRow;

        // Attempts to move up to `maxSteps` in the current direction.
        for (var stepIdx = 0; stepIdx < maxSteps; stepIdx++) {
          nextCol += deltaX[dirIdx];
          nextRow += deltaY[dirIdx];

          // If an obstacle ('@') is encountered, movement in this direction stops.
          if (mapLayout[nextRow][nextCol] === "@") {
            break;
          }
          // If a path to this cell with an equal or shorter distance has already been found,
          // further movement in this direction from the current cell is not beneficial.
          if (distanceMap[nextRow][nextCol] <= currentLevelDist) {
            break;
          }
          // If a longer path to this cell was previously recorded, update it and add to `nextLevelQueue`.
          if (distanceMap[nextRow][nextCol] > currentLevelDist + 1) {
            nextLevelQueue.push(nextRow, nextCol);
            distanceMap[nextRow][nextCol] = currentLevelDist + 1;
          }
        }
      }
    }
    // Moves to the next level: `currentLevelQueue` becomes `nextLevelQueue`, and distance increments.
    currentLevelQueue = nextLevelQueue;
    currentLevelDist++;
  }

  // Returns the minimum distance to the target cell. If it's still `maxDistanceValue`, the target is unreachable (-1).
  return distanceMap[targetRow][targetCol] === maxDistanceValue ? -1 : distanceMap[targetRow][targetCol];
}
