"use strict";

// Read all input from stdin.
let rawData = require("fs").readFileSync("/dev/stdin", "utf8");

// Split input into tokens and initialize a token index.
let tokenStream = rawData.split(/ |\n/);
let tokenIndex = 0;

/**
 * Retrieves the next token from the stream and converts it to a number.
 * @returns {number} The next numeric token.
 */
function getNextNum() {
  return +tokenStream[tokenIndex++];
}

/**
 * Retrieves the next token from the stream as a string.
 * @returns {string} The next string token.
 */
function getNextStr() {
  return tokenStream[tokenIndex++];
}

/**
 * Retrieves the next token from the stream and converts it to a BigInt.
 * @returns {BigInt} The next BigInt token.
 */
function getNextBigInt() {
  return BigInt(tokenStream[tokenIndex++]);
}

/**
 * Retrieves a specified number of tokens, either as numbers or strings.
 * @param {number} count The number of tokens to retrieve.
 * @param {boolean} isString If true, tokens are returned as strings; otherwise, as numbers.
 * @returns {Array<number|string>} An array of tokens.
 */
function getNumsOrStrs(count, isString) {
  return isString
    ? tokenStream.slice(tokenIndex, (tokenIndex += count))
    : tokenStream.slice(tokenIndex, (tokenIndex += count)).map((val) => +val);
}

/**
 * Retrieves a matrix of tokens, either as numbers or strings.
 * @param {number} height The number of rows.
 * @param {number} width The number of columns per row.
 * @param {boolean} isString If true, tokens are returned as strings; otherwise, as numbers.
 * @returns {Array<Array<number|string>>} A 2D array (matrix) of tokens.
 */
function getMatrix(height, width, isString) {
  let matrixRows = [];
  let rowIdx = 0;
  if (isString) {
    for (; rowIdx < height; rowIdx++) {
      matrixRows.push(tokenStream.slice(tokenIndex, (tokenIndex += width)));
    }
  } else {
    for (; rowIdx < height; rowIdx++) {
      matrixRows.push(
        tokenStream.slice(tokenIndex, (tokenIndex += width)).map((val) => +val)
      );
    }
  }
  return matrixRows;
}

/**
 * Creates a multi-dimensional array initialized with a given value.
 * The dimensions are passed as subsequent arguments.
 * @param {*} initialValue The value to initialize array elements with.
 * @param {...number} dimensions The sizes of each dimension.
 * @returns {Array} A multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
  let dimensionsArgs = arguments;
  let dimCount = dimensionsArgs.length;
  let arrayCreationString =
    "Array(dimensionsArgs[" +
    --dimCount +
    "]).fill().map(_ => {return " +
    initialValue +
    ";})";
  while (--dimCount) {
    arrayCreationString =
      "Array(dimensionsArgs[" + dimCount + "]).fill().map(_ => " +
      arrayCreationString +
      ")";
  }
  return eval(arrayCreationString);
}

// Execute the main program logic.
let programOutput = executeProgram();

// If the program produced output, print it to console.
if (programOutput !== undefined) {
  console.log(programOutput);
}

/**
 * The main function containing the core algorithm.
 * @returns {string} The final computed result as a string.
 */
function executeProgram() {
  let count = getNextNum(); // Read the number of elements.
  let resultsArray = createMultiDimArray(0, count); // Initialize an array of size 'count' with zeros.
  let configMatrix = getMatrix(count - 1, 3); // Read a (count-1)x3 matrix.

  // Process the configuration matrix to update the results array.
  for (let outerLoopIdx = 0; outerLoopIdx < count - 1; outerLoopIdx++) {
    for (let innerLoopIdx = 0; innerLoopIdx <= outerLoopIdx; innerLoopIdx++) {
      // Ensure the current result is at least the second value from the config row.
      if (resultsArray[innerLoopIdx] < configMatrix[outerLoopIdx][1]) {
        resultsArray[innerLoopIdx] = configMatrix[outerLoopIdx][1];
      }
      // Apply a ceiling division and addition based on config values.
      resultsArray[innerLoopIdx] =
        Math.ceil(resultsArray[innerLoopIdx] / configMatrix[outerLoopIdx][2]) *
          configMatrix[outerLoopIdx][2] +
        configMatrix[outerLoopIdx][0];
    }
  }
  // Join the final results with newlines and return.
  return resultsArray.join("\n");
}
