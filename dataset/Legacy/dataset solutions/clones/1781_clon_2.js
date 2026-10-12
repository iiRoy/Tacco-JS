"use strict";
// This script processes input from standard input to solve a pathfinding problem.

// Read all input data from stdin as a UTF-8 string.
var rawData = require("fs").readFileSync("/dev/stdin", "utf8");

// Split the raw input into tokens using spaces or newlines as delimiters.
// Initialize a pointer to the current token.
var tokenStream = rawData.split(/ |\n/),
  tokenIndex = 0;

/**
 * Reads the next token from the stream and converts it to a number.
 * @returns {number} The next numeric token.
 */
function readNum() {
  return +tokenStream[tokenIndex++];
}

/**
 * Reads the next token from the stream as a string.
 * @returns {string} The next string token.
 */
function readStr() {
  return tokenStream[tokenIndex++];
}

/**
 * Reads the next token from the stream and converts it to a BigInt.
 * @returns {BigInt} The next BigInt token.
 */
function readBigInt() {
  return BigInt(tokenStream[tokenIndex++]);
}

/**
 * Reads 'numElements' numeric tokens from the stream.
 * If 'asStrings' is true, returns them as strings; otherwise, as numbers.
 * @param {number} numElements - The number of elements to read.
 * @param {boolean} [asStrings] - If true, return strings; otherwise, numbers.
 * @returns {Array<number|string>} An array of the read elements.
 */
function readNums(numElements, asStrings) {
  if (asStrings) {
    return tokenStream.slice(tokenIndex, (tokenIndex += numElements));
  } else {
    return tokenStream.slice(tokenIndex, (tokenIndex += numElements)).map((val) => +val);
  }
}

/**
 * Reads a 2D matrix of dimensions 'rows' x 'cols' from the stream.
 * If 'asStrings' is true, returns elements as strings; otherwise, as numbers.
 * @param {number} rows - The number of rows in the matrix.
 * @param {number} cols - The number of columns in the matrix.
 * @param {boolean} [asStrings] - If true, return strings; otherwise, numbers.
 * @returns {Array<Array<number|string>>} The 2D matrix.
 */
function readMatrix(rows, cols, asStrings) {
  var resultMatrix = [],
    current_row = 0;
  if (asStrings) {
    for (; current_row < rows; current_row++) {
      resultMatrix.push(tokenStream.slice(tokenIndex, (tokenIndex += cols)));
    }
  } else {
    for (; current_row < rows; current_row++) {
      resultMatrix.push(tokenStream.slice(tokenIndex, (tokenIndex += cols)).map((val) => +val));
    }
  }
  return resultMatrix;
}

/**
 * Creates a multi-dimensional array initialized with a given value.
 * The dimensions are passed as subsequent arguments.
 * @param {*} initialValue - The value to initialize array elements with.
 * @param {...number} dimensions - The dimensions of the array (e.g., dim1, dim2, dim3).
 * @returns {Array} The created multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
  var args = arguments,
    argCount = args.length,
    arrayCreationString = "Array(args[" + --argCount + "]).fill().map(element => {return " + initialValue + ";})";
  while (--argCount) {
    arrayCreationString = "Array(args[" + argCount + "]).fill().map(element =>" + arrayCreationString + ")";
  }
  return eval(arrayCreationString);
}

// Execute the main logic and store its return value.
var finalResult = solvePuzzle();

// If the main logic returned a value, print it to the console.
if (finalResult !== undefined) {
  console.log(String(finalResult));
}

/**
 * The main function containing the problem-solving logic.
 * Implements a Breadth-First Search (BFS) variant for pathfinding.
 * @returns {number} The minimum number of moves or -1 if the goal is unreachable.
 */
function solvePuzzle() {
  // Define a large number to represent infinity for distances.
  const infinityVal = 1_000_000_000;

  // Define movement vectors for 4 directions (Up, Right, Down, Left).
  const deltaX = [0, 1, 0, -1],
    deltaY = [-1, 0, 1, 0],
    directionCount = 4;

  // Read grid dimensions (height, width) and max steps per move.
  var [heightDim, widthDim, maxSteps] = readNums(3);

  // Read start and goal coordinates (startY, startX, goalY, goalX).
  var [startY, startX, goalY, goalX] = readNums(4);

  // Create the grid map, adding a border of '@' characters for boundary checks.
  var gridMap = Array(heightDim + 2);
  gridMap[0] = createMultiDimArray("'@'", widthDim + 2).join(""); // Top border
  for (var rowIdx = 0; rowIdx < heightDim; rowIdx++) {
    gridMap[rowIdx + 1] = "@" + readStr() + "@"; // Actual row with side borders
  }
  gridMap[heightDim + 1] = createMultiDimArray("'@'", widthDim + 2).join(""); // Bottom border

  // Initialize a 2D distance grid with infinity values.
  var distanceGrid = createMultiDimArray(infinityVal, heightDim + 2, widthDim + 2);

  // Set the distance at the starting position to 0.
  distanceGrid[startY][startX] = 0;

  // Initialize the BFS queue with the starting coordinates.
  var currentQueue = [startY, startX],
    currentDistance = 0;

  // Perform BFS.
  while (currentQueue.length > 0) {
    var nextQueue = []; // Queue for the next distance level.

    // Process all nodes at the current distance level.
    while (currentQueue.length > 0) {
      // Pop coordinates from the queue (LIFO for efficiency, but conceptually FIFO for BFS levels).
      var currY = currentQueue.pop(),
        currX = currentQueue.pop();

      // Explore all four possible directions.
      for (var dirIdx = 0; dirIdx < directionCount; dirIdx++) {
        var nextY = currY,
          nextX = currX;

        // Move up to 'maxSteps' in the current direction.
        for (var stepCount = 0; stepCount < maxSteps; stepCount++) {
          nextY += deltaY[dirIdx];
          nextX += deltaX[dirIdx];

          // If the next cell is an obstacle ('@'), stop moving in this direction.
          if (gridMap[nextY][nextX] === "@") {
            break;
          }

          // If we've already found a path to this cell with an equal or shorter distance,
          // or if it's already processed for the current or previous level, skip.
          if (distanceGrid[nextY][nextX] <= currentDistance) {
            break;
          }

          // If this is a new shortest path to (nextY, nextX), update distance and add to next queue.
          if (distanceGrid[nextY][nextX] > currentDistance + 1) {
            distanceGrid[nextY][nextX] = currentDistance + 1;
            nextQueue.push(nextY, nextX);
          }
        }
      }
    }
    // Move to the next level of the BFS.
    currentQueue = nextQueue;
    currentDistance++;
  }

  // After BFS, return the distance to the goal, or -1 if unreachable.
  return distanceGrid[goalY][goalX] === infinityVal ? -1 : distanceGrid[goalY][goalX];
}
