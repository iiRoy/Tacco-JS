"use strict"; // Enforce strict mode for cleaner code execution

// Read the entire standard input synchronously as a string
let fileContent = require("fs").readFileSync("/dev/stdin", "utf8");

// Split the input string by spaces or newlines to create a stream of tokens
// Initialize a pointer for the current token
let tokenStream = fileContent.split(/ |\n/);
let tokenIndex = 0;

/**
 * Reads the next token from the global token stream.
 * If 'asString' is true, returns the token as a string.
 * Otherwise, attempts to convert the token to a number.
 * @param {boolean} asString - If true, return as string; otherwise, as number.
 * @returns {string|number} The next token.
 */
function readNextToken(asString) {
  return asString ? tokenStream[tokenIndex++] : +tokenStream[tokenIndex++];
}

/**
 * Reads a specified number of tokens from the stream.
 * @param {number} count - The number of tokens to read.
 * @param {boolean} asStrings - If true, return tokens as strings; otherwise, as numbers.
 * @returns {Array<string|number>} An array of tokens.
 */
function readMultipleTokens(count, asStrings) {
  // Slice the array and advance the index
  if (asStrings) {
    return tokenStream.slice(tokenIndex, (tokenIndex += count));
  } else {
    return tokenStream.slice(tokenIndex, (tokenIndex += count)).map((item) => +item);
  }
}

/**
 * Reads a matrix of tokens from the stream.
 * @param {number} height - The number of rows.
 * @param {number} width - The number of columns per row.
 * @param {boolean} asStrings - If true, return tokens as strings; otherwise, as numbers.
 * @returns {Array<Array<string|number>>} A 2D array (matrix) of tokens.
 */
function readMatrixTokens(height, width, asStrings) {
  let resultMatrix = [];
  let rowCounter = 0; // Use a different loop variable name
  if (asStrings) {
    for (; rowCounter < height; rowCounter++) {
      resultMatrix.push(tokenStream.slice(tokenIndex, (tokenIndex += width)));
    }
  } else {
    for (; rowCounter < height; rowCounter++) {
      resultMatrix.push(tokenStream.slice(tokenIndex, (tokenIndex += width)).map((item) => +item));
    }
  }
  return resultMatrix;
}

/**
 * Creates a multi-dimensional array initialized with a given value.
 * The dimensions are passed as arguments after the initial value.
 * Example: createMultiDimArray(0, 2, 3) creates [[0,0,0],[0,0,0]]
 * @param {*} initialValue - The value to initialize array elements with.
 * @param {...number} dimensions - The sizes of each dimension.
 * @returns {Array} The multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
  let dimensionArgs = arguments;
  let currentDimIndex = dimensionArgs.length; // Start from the last dimension
  let arrayCreationString = "Array(dimensionArgs[" + --currentDimIndex + "]).fill().map(_=>{return " + initialValue + ";})";

  // Build the string for nested array creation
  while (--currentDimIndex) {
    arrayCreationString = "Array(dimensionArgs[" + currentDimIndex + "]).fill().map(_=>" + arrayCreationString + ")";
  }
  // Evaluate the constructed string to create the array
  return eval(arrayCreationString);
}

// Execute the main logic of the program
let programResult = executeLogic();

// If the main logic returned a value, print it to console
if (programResult !== undefined) {
  console.log(programResult);
}

/**
 * The primary function containing the problem's core logic.
 * Reads three numbers and checks a specific mathematical condition.
 * @returns {string} "Yes" if the condition is met, "No" otherwise.
 */
function executeLogic() {
  // Read three numerical inputs
  let valA = readNextToken();
  let valB = readNextToken();
  let valC = readNextToken();

  // Check if the sum of square roots of valA and valB is less than the square root of valC
  return Math.sqrt(valA) + Math.sqrt(valB) < Math.sqrt(valC) ? "Yes" : "No";
}
