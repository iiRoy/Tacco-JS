"use strict"; // Enforce strict mode for the entire script

// Obtain raw input data from the standard input stream
let rawData = require("fs").readFileSync("/dev/stdin", "utf8");

// Process the raw input: split into tokens by spaces or newlines, and initialize a pointer
let tokenStream = rawData.split(/ |\n/);
let tokenIndex = 0;

/**
 * Fetches the subsequent token from the stream and casts it to a numerical type.
 * @returns {number} The next token as a number.
 */
function getNextNumber() {
  return +tokenStream[tokenIndex++];
}

/**
 * Fetches the subsequent token from the stream as a string.
 * @returns {string} The next token as a string.
 */
function getNextString() {
  return tokenStream[tokenIndex++];
}

/**
 * Fetches the subsequent token from the stream and converts it into a BigInt.
 * @returns {BigInt} The next token as a BigInt.
 */
function getNextBigInt() {
  return BigInt(tokenStream[tokenIndex++]);
}

/**
 * Retrieves an array of tokens, either as raw strings or parsed numbers.
 * @param {number} count - The total number of elements to extract.
 * @param {boolean} isRaw - If true, elements are returned as strings; otherwise, they are converted to numbers.
 * @returns {Array<number|string>} An array containing the requested tokens.
 */
function getNumbersArray(count, isRaw) {
  if (isRaw) {
    return tokenStream.slice(tokenIndex, (tokenIndex += count));
  } else {
    return tokenStream.slice(tokenIndex, (tokenIndex += count)).map((val) => +val);
  }
}

/**
 * Extracts a two-dimensional matrix (array of arrays) from the token stream.
 * @param {number} rows - The number of rows for the matrix.
 * @param {number} cols - The number of columns for each row.
 * @param {boolean} isRaw - If true, matrix elements are strings; otherwise, they are numbers.
 * @returns {Array<Array<number|string>>} The constructed matrix.
 */
function getMatrix(rows, cols, isRaw) {
  let matrixData = []; // Container for the matrix rows
  let rowIndex = 0; // Iterator for rows

  if (isRaw) {
    for (; rowIndex < rows; rowIndex++) {
      matrixData.push(tokenStream.slice(tokenIndex, (tokenIndex += cols)));
    }
  } else {
    for (; rowIndex < rows; rowIndex++) {
      matrixData.push(tokenStream.slice(tokenIndex, (tokenIndex += cols)).map((element) => +element));
    }
  }
  return matrixData;
}

/**
 * Generates a multi-dimensional array with specified dimensions, initialized with a given value.
 * @param {*} initialValue - The value to populate the array elements with.
 * @param {...number} dimensions - Variable number of arguments representing array dimensions.
 * @returns {Array} The newly created multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
  let dimensionArgs = arguments; // Access all arguments, including the initial value and dimensions
  let argLength = dimensionArgs.length; // Total count of arguments
  let arrayCreationString = "Array(dimensionArgs[" + --argLength + "]).fill().map(_ => { return " + initialValue + "; })";

  // Iteratively build the string for nested array creation
  while (--argLength) {
    arrayCreationString = "Array(dimensionArgs[" + argLength + "]).fill().map(_ => " + arrayCreationString + ")";
  }

  // Execute the dynamically generated string to construct the array
  return eval(arrayCreationString);
}

// Invoke the primary execution function and store its outcome
let programResult = executeProgram();

// Display the result to the console if it holds a defined value
if (programResult !== undefined) {
  console.log(programResult);
}

/**
 * The central function encapsulating the problem's logic.
 * @returns {number} The computed numerical outcome.
 */
function executeProgram() {
  // Read the single input number required for the calculation
  let inputNum = getNextNumber();

  // Determine the smallest multiple of 111 that is greater than or equal to the input number.
  // This is achieved by dividing by 111, rounding up, and then multiplying by 111.
  return Math.ceil(inputNum / 111) * 111;
}
