"use strict";

// Acquire file system module for input operations
var dataSource = require("fs").readFileSync("/dev/stdin", "utf8");

// Split the input into tokens using spaces or newlines as delimiters
// Initialize a token index for sequential access
var tokenStream = dataSource.split(/ |\n/),
  tokenIndex = 0;

/**
 * Retrieves the next token from the stream and converts it to a number.
 * @returns {number} The next numeric token.
 */
function readNextInt() {
  return +tokenStream[tokenIndex++];
}

/**
 * Retrieves the next token from the stream as a string.
 * @returns {string} The next string token.
 */
function readNextString() {
  return tokenStream[tokenIndex++];
}

/**
 * Retrieves the next token from the stream and converts it to a BigInt.
 * @returns {BigInt} The next BigInt token.
 */
function readNextBigInt() {
  return BigInt(tokenStream[tokenIndex++]);
}

/**
 * Reads a sequence of 'count' tokens from the stream.
 * If a 'mapperFn' is provided, it applies the function to each token.
 * Otherwise, it converts each token to a number.
 * @param {number} count - The number of tokens to read.
 * @param {Function} [mapperFn] - An optional mapping function.
 * @returns {Array<number|string>} An array of processed tokens.
 */
function readSequence(count, mapperFn) {
  return mapperFn ?
    tokenStream.slice(tokenIndex, (tokenIndex += count)) :
    tokenStream.slice(tokenIndex, (tokenIndex += count)).map((val) => +val);
}

/**
 * Reads a matrix of 'rows' by 'cols' dimensions from the stream.
 * If a 'mapperFn' is provided, it applies the function to each token.
 * Otherwise, it converts each token to a number.
 * @param {number} rows - The number of rows in the matrix.
 * @param {number} cols - The number of columns in the matrix.
 * @param {Function} [mapperFn] - An optional mapping function.
 * @returns {Array<Array<number|string>>} A 2D array representing the matrix.
 */
function readMatrix(rows, cols, mapperFn) {
  var resultArr = [],
    loopCounter = 0;
  if (mapperFn) {
    for (; loopCounter < rows; loopCounter++) {
      resultArr.push(tokenStream.slice(tokenIndex, (tokenIndex += cols)));
    }
  } else {
    for (; loopCounter < rows; loopCounter++) {
      resultArr.push(
        tokenStream.slice(tokenIndex, (tokenIndex += cols)).map((val) => +val)
      );
    }
  }
  return resultArr;
}

/**
 * Creates a multi-dimensional array initialized with a specific value.
 * The dimensions are provided as arguments after the initial value.
 * @param {*} initialValue - The value to initialize array elements with.
 * @param {...number} dimensions - The dimensions of the array.
 * @returns {Array} The multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
  var argsList = arguments,
    argLength = argsList.length,
    resultStr =
    "Array(argsList[" +
    --argLength +
    "]).fill().map(_=>{return " +
    initialValue +
    ";})";
  while (--argLength) {
    resultStr =
      "Array(argsList[" + argLength + "]).fill().map(_=>" + resultStr + ")";
  }
  return eval(resultStr);
}

// Execute the main program logic and store its return value.
var programResult = executeProgram();

// If the program returned a value, print it to the console.
if (programResult !== undefined) {
  console.log(String(programResult));
}

/**
 * Main function containing the core algorithm.
 * Calculates the minimum cost to cover a grid with given horizontal and vertical cuts.
 * @returns {BigInt} The total minimum cost.
 */
function executeProgram() {
  // Read grid dimensions
  var widthVal = readNextInt(),
    heightVal = readNextInt();

  // Initialize an array to store all cut costs and their types (0 for horizontal, 1 for vertical)
  var pointsArr = [];

  // Populate with horizontal cut costs
  for (var loopCounter = 0; loopCounter < widthVal; loopCounter++) {
    pointsArr.push([readNextInt(), 0]); // [cost, type]
  }

  // Populate with vertical cut costs
  for (var loopCounter = 0; loopCounter < heightVal; loopCounter++) {
    pointsArr.push([readNextInt(), 1]); // [cost, type]
  }

  // Sort all cuts by their cost in ascending order
  pointsArr.sort((itemA, itemB) => itemA[0] - itemB[0]);

  // Initialize total cost and counts of horizontal/vertical segments
  var totalCost = 0n;
  var horizCount = 0,
    vertCount = 0;

  // Iterate through the sorted cuts
  for (var loopCounter = 0; loopCounter < heightVal + widthVal; loopCounter++) {
    // If it's a horizontal cut (type 0)
    if (pointsArr[loopCounter][1] === 0) {
      // Add cost: current cut cost * (number of vertical segments + 1)
      totalCost += BigInt(heightVal - vertCount + 1) * BigInt(pointsArr[loopCounter][0]);
      horizCount++; // Increment horizontal segment count
    } else {
      // If it's a vertical cut (type 1)
      // Add cost: current cut cost * (number of horizontal segments + 1)
      totalCost += BigInt(widthVal - horizCount + 1) * BigInt(pointsArr[loopCounter][0]);
      vertCount++; // Increment vertical segment count
    }
  }

  // Return the calculated total minimum cost
  return totalCost;
}
