"use strict";

// Obtain raw input data from the standard input stream.
let rawData = require("fs").readFileSync("/dev/stdin", "utf8");

// Initialize a stream of tokens by splitting the raw data by spaces or newlines.
let tokenStream = rawData.split(/ |\n/);
let tokenIndex = 0; // Pointer to the current token in the stream.

/**
 * Fetches the subsequent token from the stream and converts it into a numerical value.
 * @returns {number} The next number from the input.
 */
function getNextNumber() {
  return +tokenStream[tokenIndex++];
}

/**
 * Fetches the subsequent token from the stream as a plain string.
 * @returns {string} The next string from the input.
 */
function getNextString() {
  return tokenStream[tokenIndex++];
}

/**
 * Fetches the subsequent token from the stream and converts it into a BigInt value.
 * @returns {BigInt} The next BigInt from the input.
 */
function getNextBigInt() {
  return BigInt(tokenStream[tokenIndex++]);
}

/**
 * Retrieves an array of 'count' tokens, optionally keeping them as strings or converting to numbers.
 * @param {number} count - The total number of elements to extract.
 * @param {boolean} isStringMode - If true, elements remain strings; otherwise, they are parsed as numbers.
 * @returns {Array<number|string>} An array containing the requested values.
 */
function getNumbersArray(count, isStringMode) {
  if (isStringMode) {
    return tokenStream.slice(tokenIndex, (tokenIndex += count));
  } else {
    return tokenStream.slice(tokenIndex, (tokenIndex += count)).map((val) => +val);
  }
}

/**
 * Retrieves an array of 'count' tokens, converting each into a BigInt.
 * @param {number} count - The total number of BigInt elements to extract.
 * @returns {Array<BigInt>} An array of BigInt values.
 */
function getBigIntsArray(count) {
  return tokenStream.slice(tokenIndex, (tokenIndex += count)).map((val) => BigInt(val));
}

/**
 * Constructs a two-dimensional array (matrix) with specified dimensions.
 * Elements are either strings or numbers based on the 'isStringMode' flag.
 * @param {number} rows - The number of rows for the matrix.
 * @param {number} cols - The number of columns for each row.
 * @param {boolean} isStringMode - If true, matrix elements are strings; otherwise, they are numbers.
 * @returns {Array<Array<number|string>>} The generated 2D array.
 */
function getMatrix(rows, cols, isStringMode) {
  let resultMatrix = [];
  let rowIndex = 0;
  if (isStringMode) {
    for (; rowIndex < rows; rowIndex++) {
      resultMatrix.push(tokenStream.slice(tokenIndex, (tokenIndex += cols)));
    }
  } else {
    for (; rowIndex < rows; rowIndex++) {
      resultMatrix.push(tokenStream.slice(tokenIndex, (tokenIndex += cols)).map((val) => +val));
    }
  }
  return resultMatrix;
}

/**
 * Generates a multi-dimensional array dynamically based on provided dimensions.
 * @param {*} initialValue - The default value to populate the innermost array.
 * @param {...number} dimensions - A variable number of arguments representing the array dimensions.
 * @returns {Array} The newly created multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
  let dimensions = arguments;
  let dimLength = dimensions.length;
  let arrayCreationCode = "Array(dimensions[" + --dimLength + "]).fill().map(x=>{return " + initialValue + ";})";
  while (--dimLength) {
    arrayCreationCode = "Array(dimensions[" + dimLength + "]).fill().map(x=>" + arrayCreationCode + ")";
  }
  return eval(arrayCreationCode);
}

// Execute the primary logic function and output its string representation to the console.
console.log(processInput().toString());

/**
 * The core function that processes the input according to the problem's requirements.
 * It reads a single string and returns its initial three characters.
 * @returns {string} The first three characters of the input string.
 */
function processInput() {
  let inputString = getNextString(); // Retrieve the next string from the input stream.
  return inputString.substring(0, 3); // Return the substring consisting of the first three characters.
}
