"use strict";
// This script reads input from standard input, processes it, and prints a result.

// Acquire the file system module to read data from the standard input stream.
var rawData = require("fs").readFileSync("/dev/stdin", "utf8");

// Divide the entire input string into individual tokens using spaces or newlines as separators.
var tokenStream = rawData.split(/ |\n/);
// Initialize an index to keep track of the current position within the token stream.
var tokenIndex = 0;

/**
 * Retrieves the next token from the stream and converts it to an integer.
 * @returns {number} The parsed integer value.
 */
function getNextInt() {
  return +tokenStream[tokenIndex++];
}

/**
 * Retrieves the next token from the stream as a string.
 * @returns {string} The string token.
 */
function getNextString() {
  return tokenStream[tokenIndex++];
}

/**
 * Retrieves the next token from the stream and converts it to a BigInt.
 * @returns {bigint} The parsed BigInt value.
 */
function getNextBigInt() {
  return BigInt(tokenStream[tokenIndex++]);
}

/**
 * Retrieves a specified number of tokens from the stream, optionally converting them to numbers.
 * @param {number} count - The number of tokens to retrieve.
 * @param {boolean} [returnStrings=false] - If true, returns tokens as strings; otherwise, converts to numbers.
 * @returns {Array<number|string>} An array of numbers or strings.
 */
function getNextInts(count, returnStrings) {
  // If 'returnStrings' is truthy, slice and return the string tokens directly.
  // Otherwise, slice and then map each token to its numeric representation.
  return returnStrings ? tokenStream.slice(tokenIndex, tokenIndex += count) : tokenStream.slice(tokenIndex, tokenIndex += count).map(value => +value);
}

/**
 * Retrieves a 2D array (matrix) of tokens from the stream, optionally converting them to numbers.
 * @param {number} height - The number of rows in the matrix.
 * @param {number} width - The number of columns per row.
 * @param {boolean} [returnStrings=false] - If true, returns tokens as strings; otherwise, converts to numbers.
 * @returns {Array<Array<number|string>>} A 2D array (matrix).
 */
function getNextMatrix(height, width, returnStrings) {
  var resultMatrix = [],
    currentRow = 0;
  if (returnStrings) {
    for (; currentRow < height; currentRow++) {
      resultMatrix.push(tokenStream.slice(tokenIndex, tokenIndex += width));
    }
  } else {
    for (; currentRow < height; currentRow++) {
      resultMatrix.push(tokenStream.slice(tokenIndex, tokenIndex += width).map(value => +value));
    }
  }
  return resultMatrix;
}

/**
 * Dynamically creates a multi-dimensional array initialized with a specific value.
 * The dimensions are passed as subsequent arguments.
 * @param {*} initialValue - The value to fill the array elements with.
 * @param {...number} dimensions - The sizes of each dimension.
 * @returns {Array} The newly created multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
  var functionArguments = arguments,
    argumentLength = functionArguments.length,
    // Construct the inner-most array creation expression.
    arrayExpression = "Array(functionArguments[" + --argumentLength + "]).fill().map(element=>{return " + initialValue + ";})";
  // Build up the nested array creation expressions for higher dimensions.
  while (--argumentLength) {
    arrayExpression = "Array(functionArguments[" + argumentLength + "]).fill().map(element=>" + arrayExpression + ")";
  }
  // Evaluate the constructed string to create the array.
  return eval(arrayExpression);
}

// Execute the primary logic of the program and store its output.
var programResult = executeProgram();

// If the program's execution yields a defined result, print it to the console.
if (programResult !== undefined) {
  console.log(String(programResult));
}

/**
 * The main function encapsulating the problem-solving algorithm.
 * @returns {number|undefined} The final calculated value or undefined if no explicit return.
 */
function executeProgram() {
  // Read the primary dimension size for the problem.
  var dimensionSize = getNextInt();

  // Initialize a 2D dynamic programming table with a default value of -1.
  var dynamicProgTable = createMultiDimArray(-1, dimensionSize + 1, dimensionSize + 1);
  // Initialize an offset value that might be incremented during processing.
  var offsetValue = 0;

  // Read the initial pair of coordinates.
  var segmentData = getNextInts(2);
  // Declare a queue that will be used to store potential DP table updates.
  var updateQueue;

  // Set initial base cases in the DP table.
  dynamicProgTable[0][0] = dynamicProgTable[0][segmentData[0]] = dynamicProgTable[0][segmentData[1]] = dynamicProgTable[segmentData[0]][segmentData[1]] = 0;

  // Iterate through the remaining segments, processing each one.
  for (var loopCounter = 1; loopCounter < dimensionSize; loopCounter++) {
    // Read three new coordinates for the current segment and sort them in ascending order.
    segmentData = getNextInts(3).sort((valA, valB) => valA - valB);
    // Invoke the segment processing function with the sorted coordinates.
    processSegment(...segmentData);
  }

  // Read the final single coordinate.
  segmentData = getNextInt();
  // Compute the final result by taking the maximum of two DP table entries and adding the accumulated offset.
  return Math.max(dynamicProgTable[0][0], dynamicProgTable[segmentData][segmentData] + 1) + offsetValue;

  /**
   * Processes a set of three coordinates (a segment) to update the DP table.
   * @param {number} coord1 - The first coordinate.
   * @param {number} coord2 - The second coordinate.
   * @param {number} coord3 - The third coordinate.
   */
  function processSegment(coord1, coord2, coord3) {
    // If the first and third coordinates are identical, increment the global offset and return.
    if (coord1 === coord3) {
      return offsetValue++;
    }

    // Reset the update queue for the current segment processing.
    updateQueue = [];

    // Handle updates related to individual coordinates.
    handleSingleCoord(coord1);
    if (coord1 < coord2) {
      handleSingleCoord(coord2);
    }
    if (coord2 < coord3) {
      handleSingleCoord(coord3);
    }

    // Handle updates related to pairs of coordinates.
    handleTwoCoords(coord1, coord2);
    if (coord2 < coord3) {
      handleTwoCoords(coord1, coord3);
    }
    if (coord1 < coord2) {
      handleTwoCoords(coord2, coord3);
    }

    // Handle updates related to all three coordinates.
    handleThreeCoords(coord1, coord2, coord3);

    // Apply all pending updates from the queue to the dynamic programming table.
    while (updateQueue.length) {
      // Pop values from the queue (pushed as: value, y-coord, x-coord).
      var coordX = updateQueue.pop(),
        coordY = updateQueue.pop(),
        newValue = updateQueue.pop();

      // If the new value is greater than the current value in the DP table, update it.
      if (dynamicProgTable[coordX][coordY] < newValue) {
        dynamicProgTable[coordX][coordY] = newValue;
      }
    }
  }

  /**
   * Performs DP table updates based on a single coordinate.
   * @param {number} currentCoord - The coordinate being processed.
   */
  function handleSingleCoord(currentCoord) {
    // Enqueue an update comparing dp[0][0] with dp[currentCoord][currentCoord] + 1.
    enqueueIfGreaterPlusOne(0, 0, currentCoord, currentCoord);

    // Iterate through indices less than currentCoord.
    for (var loopCounter = 0; loopCounter < currentCoord; loopCounter++) {
      // Enqueue an update comparing dp[loopCounter][currentCoord] with dp[0][loopCounter].
      enqueueIfGreater(loopCounter, currentCoord, 0, loopCounter);
    }

    // Iterate through indices from currentCoord up to dimensionSize.
    for (var loopCounter = currentCoord; loopCounter <= dimensionSize; loopCounter++) {
      // Enqueue an update comparing dp[currentCoord][loopCounter] with dp[0][loopCounter].
      enqueueIfGreater(currentCoord, loopCounter, 0, loopCounter);
    }
  }

  /**
   * Performs DP table updates based on two coordinates.
   * @param {number} coordA - The first coordinate.
   * @param {number} coordB - The second coordinate.
   */
  function handleTwoCoords(coordA, coordB) {
    // Enqueue an update comparing dp[coordA][coordB] with dp[0][0].
    enqueueIfGreater(coordA, coordB, 0, 0);

    // Enqueue an update comparing dp[0][coordB] with dp[coordA][coordA] + 1.
    enqueueIfGreaterPlusOne(0, coordB, coordA, coordA);

    // Conditional logic based on the relationship between coordA and coordB.
    if (coordA < coordB) {
      // If coordA is strictly less than coordB.
      // Enqueue an update comparing dp[0][coordA] with dp[coordB][coordB] + 1.
      enqueueIfGreaterPlusOne(0, coordA, coordB, coordB);
    } else { // This implies coordA === coordB, as coordinates are sorted.
      // Iterate through indices less than coordA.
      for (var loopCounter = 0; loopCounter < coordA; loopCounter++) {
        // Enqueue an update comparing dp[0][loopCounter] with dp[loopCounter][coordA] + 1.
        enqueueIfGreaterPlusOne(0, loopCounter, loopCounter, coordA);
      }
      // Iterate through indices from coordA up to dimensionSize.
      for (var loopCounter = coordA; loopCounter <= dimensionSize; loopCounter++) {
        // Enqueue an update comparing dp[0][loopCounter] with dp[coordA][loopCounter] + 1.
        enqueueIfGreaterPlusOne(0, loopCounter, coordA, loopCounter);
      }
    }
  }

  /**
   * Performs DP table updates based on three coordinates.
   * @param {number} coordA - The first coordinate.
   * @param {number} coordB - The second coordinate.
   * @param {number} coordC - The third coordinate.
   */
  function handleThreeCoords(coordA, coordB, coordC) {
    // Enqueue an update comparing dp[coordB][coordC] with dp[coordA][coordA] + 1.
    enqueueIfGreaterPlusOne(coordB, coordC, coordA, coordA);

    // Conditional logic based on the relationship between coordA and coordB.
    if (coordA < coordB) {
      // If coordA is strictly less than coordB.
      // Enqueue an update comparing dp[coordA][coordC] with dp[coordB][coordB] + 1.
      enqueueIfGreaterPlusOne(coordA, coordC, coordB, coordB);
      // Further conditional logic based on coordB and coordC.
      if (coordB < coordC) {
        // If coordB is strictly less than coordC.
        // Enqueue an update comparing dp[coordA][coordB] with dp[coordC][coordC] + 1.
        enqueueIfGreaterPlusOne(coordA, coordB, coordC, coordC);
      } else { // This implies coordB === coordC.
        // Iterate through indices less than coordA.
        for (var loopCounter = 0; loopCounter < coordA; loopCounter++) {
          // Enqueue an update comparing dp[loopCounter][coordA] with dp[loopCounter][coordC] + 1.
          enqueueIfGreaterPlusOne(loopCounter, coordA, loopCounter, coordC);
        }
        // Iterate through indices from coordA up to coordC (exclusive).
        for (var loopCounter = coordA; loopCounter < coordC; loopCounter++) {
          // Enqueue an update comparing dp[coordA][loopCounter] with dp[loopCounter][coordC] + 1.
          enqueueIfGreaterPlusOne(coordA, loopCounter, loopCounter, coordC);
        }
        // Iterate through indices from coordC up to dimensionSize.
        for (var loopCounter = coordC; loopCounter <= dimensionSize; loopCounter++) {
          // Enqueue an update comparing dp[coordA][loopCounter] with dp[coordC][loopCounter] + 1.
          enqueueIfGreaterPlusOne(coordA, loopCounter, coordC, loopCounter);
        }
      }
    } else { // This implies coordA === coordB.
      // Enqueue an update comparing dp[coordA][coordA] with dp[coordC][coordC] + 1.
      enqueueIfGreaterPlusOne(coordA, coordA, coordC, coordC);
      // Iterate through indices less than coordA.
      for (var loopCounter = 0; loopCounter < coordA; loopCounter++) {
        // Enqueue an update comparing dp[loopCounter][coordC] with dp[loopCounter][coordA] + 1.
        enqueueIfGreaterPlusOne(loopCounter, coordC, loopCounter, coordA);
      }
      // Iterate through indices from coordA up to coordC (exclusive).
      for (var loopCounter = coordA; loopCounter < coordC; loopCounter++) {
        // Enqueue an update comparing dp[loopCounter][coordC] with dp[coordA][loopCounter] + 1.
        enqueueIfGreaterPlusOne(loopCounter, coordC, coordA, loopCounter);
      }
      // Iterate through indices from coordC up to dimensionSize.
      for (var loopCounter = coordC; loopCounter <= dimensionSize; loopCounter++) {
        // Enqueue an update comparing dp[coordC][loopCounter] with dp[coordA][loopCounter] + 1.
        enqueueIfGreaterPlusOne(coordC, loopCounter, coordA, loopCounter);
      }
    }
  }

  /**
   * Adds an update to the queue if the value at the source coordinates is greater than the value at the target coordinates.
   * The value pushed is the source value.
   * @param {number} targetRow - The row index of the cell to potentially update.
   * @param {number} targetCol - The column index of the cell to potentially update.
   * @param {number} sourceRow - The row index of the source cell.
   * @param {number} sourceCol - The column index of the source cell.
   */
  function enqueueIfGreater(targetRow, targetCol, sourceRow, sourceCol) {
    if (dynamicProgTable[targetRow][targetCol] < dynamicProgTable[sourceRow][sourceCol]) {
      // Push the new value, then its column, then its row.
      updateQueue.push(dynamicProgTable[sourceRow][sourceCol], targetCol, targetRow);
    }
  }

  /**
   * Adds an update to the queue if the value at the source coordinates plus one is greater than the value at the target coordinates.
   * The value pushed is the source value plus one.
   * @param {number} targetRow - The row index of the cell to potentially update.
   * @param {number} targetCol - The column index of the cell to potentially update.
   * @param {number} sourceRow - The row index of the source cell.
   * @param {number} sourceCol - The column index of the source cell.
   */
  function enqueueIfGreaterPlusOne(targetRow, targetCol, sourceRow, sourceCol) {
    if (dynamicProgTable[targetRow][targetCol] < dynamicProgTable[sourceRow][sourceCol] + 1) {
      // Push the new value (source + 1), then its column, then its row.
      updateQueue.push(dynamicProgTable[sourceRow][sourceCol] + 1, targetCol, targetRow);
    }
  }
}
