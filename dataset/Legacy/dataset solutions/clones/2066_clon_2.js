"use strict";
// This script reads an integer from standard input and uses it as an index
// to retrieve a value from a predefined array.
var fileContent = require("fs").readFileSync("/dev/stdin", "utf8");

// Global variables for tokenizing input
var tokenStream = fileContent.split(/ |\n/);
var tokenIndex = 0;

/**
 * Reads the next token from the input stream.
 * @param {boolean} asString - If true, returns the token as a string; otherwise, converts to a number.
 * @returns {string|number} The next token.
 */
function readNextToken(asString) {
  return asString ? tokenStream[tokenIndex++] : +tokenStream[tokenIndex++];
}

/**
 * Reads a specified number of tokens into an array.
 * @param {number} count - The number of tokens to read.
 * @param {boolean} asStringFlag - If true, tokens are kept as strings; otherwise, converted to numbers.
 * @returns {Array<string|number>} An array of tokens.
 */
function readTokensArray(count, asStringFlag) {
  var startIdx = tokenIndex;
  tokenIndex += count;
  if (asStringFlag) {
    return tokenStream.slice(startIdx, tokenIndex);
  } else {
    return tokenStream.slice(startIdx, tokenIndex).map(val => +val);
  }
}

/**
 * Reads a 2D matrix of tokens.
 * @param {number} height - The number of rows.
 * @param {number} width - The number of columns per row.
 * @param {boolean} asStringMatrix - If true, tokens are kept as strings; otherwise, converted to numbers.
 * @returns {Array<Array<string|number>>} The 2D matrix.
 */
function readMatrix(height, width, asStringMatrix) {
  var resultMatrix = [];
  var rowIndex = 0;
  if (asStringMatrix) {
    for (; rowIndex < height; rowIndex++) {
      resultMatrix.push(tokenStream.slice(tokenIndex, tokenIndex += width));
    }
  } else {
    for (; rowIndex < height; rowIndex++) {
      resultMatrix.push(tokenStream.slice(tokenIndex, tokenIndex += width).map(val => +val));
    }
  }
  return resultMatrix;
}

/**
 * Dynamically creates a multi-dimensional array.
 * @param {*} initialValue - The value to fill the innermost array elements with.
 * @param {...number} dimensions - The dimensions of the array (e.g., createMultiDimArray(0, 2, 3) for a 2x3 array).
 * @returns {Array} The created multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
  var argsList = arguments;
  var argLength = argsList.length;
  var arrayCreationString = "Array(argsList[" + --argLength + "]).fill().map(_=>{return " + initialValue + ";})";
  while (--argLength) {
    arrayCreationString = "Array(argsList[" + argLength + "]).fill().map(_=>" + arrayCreationString + ")";
  }
  return eval(arrayCreationString);
}

// Execute the primary logic of the program
var programOutput = executeProgram();

// Output the result if it's not undefined
if (programOutput !== undefined) {
  console.log(programOutput);
}

/**
 * Main function containing the core logic.
 * @returns {number} The value from the sequence data at the calculated index.
 */
function executeProgram() {
  // Predefined sequence of numbers
  var sequenceData = [1, 1, 1, 2, 1, 2, 1, 5, 2, 2, 1, 5, 1, 2, 1, 14, 1, 5, 1, 5, 2, 2, 1, 15, 2, 2, 5, 4, 1, 4, 1, 51];
  
  // Read an integer from input, which will be used as an index
  var inputIndex = readNextToken();
  
  // Return the element from the sequence data at the (inputIndex - 1) position
  return sequenceData[inputIndex - 1];
}
