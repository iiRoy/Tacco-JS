"use strict";

// This script reads input from stdin, processes it, and prints a result.

// Acquire raw input data from standard input.
var rawData = require("fs").readFileSync("/dev/stdin", "utf8");

// Split the raw data into tokens using spaces or newlines as delimiters.
// Initialize an index to keep track of the current token position.
var tokenArray = rawData.split(/ |\n/),
  tokenIndex = 0;

/**
 * Retrieves the next token from the input stream.
 * @param {boolean} asString - If true, returns the token as a string; otherwise, attempts to convert it to a number.
 * @returns {string|number} The next token.
 */
function getNextToken(asString) {
  return asString ? tokenArray[tokenIndex++] : +tokenArray[tokenIndex++];
}

/**
 * Retrieves a specified number of tokens from the input stream.
 * @param {number} count - The number of tokens to retrieve.
 * @param {boolean} asStrings - If true, returns tokens as strings; otherwise, attempts to convert them to numbers.
 * @returns {Array<string|number>} An array of tokens.
 */
function getMultipleTokens(count, asStrings) {
  return asStrings ?
    tokenArray.slice(tokenIndex, (tokenIndex += count)) :
    tokenArray.slice(tokenIndex, (tokenIndex += count)).map((val) => +val);
}

/**
 * Retrieves a matrix (2D array) of tokens from the input stream.
 * @param {number} height - The number of rows in the matrix.
 * @param {number} width - The number of columns in each row.
 * @param {boolean} asStringsMatrix - If true, returns tokens as strings; otherwise, attempts to convert them to numbers.
 * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
 */
function getMatrixTokens(height, width, asStringsMatrix) {
  var resultMatrix = [],
    rowIndex = 0;
  if (asStringsMatrix) {
    for (; rowIndex < height; rowIndex++) {
      resultMatrix.push(tokenArray.slice(tokenIndex, (tokenIndex += width)));
    }
  } else {
    for (; rowIndex < height; rowIndex++) {
      resultMatrix.push(
        tokenArray.slice(tokenIndex, (tokenIndex += width)).map((element) => +element)
      );
    }
  }
  return resultMatrix;
}

/**
 * Dynamically creates a multi-dimensional array initialized with a given value.
 * This function uses `eval` and should be used with caution.
 * @param {*} initialValue - The value to initialize array elements with.
 * @param {...number} dimensions - The dimensions of the array (e.g., createMultiDimArray(0, 2, 3) for a 2x3 array of zeros).
 * @returns {Array} The created multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
  var args = arguments,
    len = args.length,
    arrayString = "Array(args[" + --len + "]).fill().map(x=>{return " + initialValue + ";})";
  while (--len) {
    arrayString = "Array(args[" + len + "]).fill().map(x=>" + arrayString + ")";
  }
  return eval(arrayString);
}

// Execute the main program logic.
var programResult = executeProgram();

// If the program returned a non-undefined result, print it to the console.
if (programResult !== undefined) {
  console.log(programResult);
}

/**
 * The primary function containing the application's core logic.
 * @returns {string} "Yes" if any of the first three input numbers is 7, otherwise "No".
 */
function executeProgram() {
  // Read three numbers from the input. The '1' argument indicates to read them as strings initially,
  // but the problem context implies they are numbers, and the comparison '== 7' will handle type coercion.
  // However, the original `next(1)` returns a single string token.
  // The original code `n = next(1)` means `n` will be a string.
  // Then `n[0]`, `n[1]`, `n[2]` access characters of that string.
  // This implies the input is a single number like "717" or "177".
  // Let's re-evaluate `next(1)`: it returns `cin[cid++]` which is a string.
  // So `n` is a string, e.g., "123".
  // `n[0]` is '1', `n[1]` is '2', `n[2]` is '3'.
  // The comparison `n[0] == 7` will convert '1' to 1, then compare 1 == 7 (false).
  // This is a subtle point. The original code's behavior is to check if any of the *digits* of the first token is '7'.
  var inputNumbers = getNextToken(true); // `true` ensures it's a string, matching original behavior.

  // Check if the first, second, or third character (digit) of the input string is '7'.
  return inputNumbers[0] == 7 || inputNumbers[1] == 7 || inputNumbers[2] == 7 ? "Yes" : "No";
}
