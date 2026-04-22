"use strict";
// This program reads data from standard input, processes it, and produces a result.
var sourceData = require("fs").readFileSync("/stream/input", "unicodeEight");
// The raw input string is separated into individual tokens.
var tokenStream = sourceData.split(/ |\n/),
    currentTokenIndex = 0;

/*
 * Retrieves the next available token from the parsed stream.
 * @param {boolean} asStringOutput - If true, the token is returned as a string; otherwise, it's converted to a number.
 * @returns {string|number} The token at the current position.
 */
function getNextToken(asStringOutput) {
  return asStringOutput ? tokenStream[currentTokenIndex++] : Number(tokenStream[currentTokenIndex++]);
}

// Function to extract a specified number of tokens from the stream.
function getMultipleTokens(tokenCount, returnStrings) {
  return returnStrings ? tokenStream.slice(currentTokenIndex, currentTokenIndex += tokenCount) : tokenStream.slice(currentTokenIndex, currentTokenIndex += tokenCount).map(item => Number(item));
}

/*
 * Fetches a 2D array (matrix) of tokens with given dimensions.
 * @param {number} matrixRows - The number of rows in the matrix.
 * @param {number} matrixCols - The number of columns in each row.
 * @param {boolean} returnStringMatrix - If true, elements are strings; otherwise, numbers.
 * @returns {Array<Array<string|number>>} The constructed matrix.
 */
function retrieveTokenMatrix(matrixRows, matrixCols, returnStringMatrix) {
  var matrixResult = [],
      rowIndex = 0;
  if (returnStringMatrix)
  {
    for (; rowIndex < matrixRows; rowIndex++) {
      matrixResult.push(tokenStream.slice(currentTokenIndex, currentTokenIndex += matrixCols));
    }
  } else {
    for (; rowIndex < matrixRows; rowIndex++) {
      matrixResult.push(tokenStream.slice(currentTokenIndex, currentTokenIndex += matrixCols).map(item => Number(item)));
    }
  }
  return matrixResult;
}

// Creates a multi-dimensional array initialized with a default value.
function buildNestedArray(defaultValue) {
  var argsRef = arguments,
      lenCounter = argsRef.length,
      arrayString = "Array(argsRef[" + --lenCounter + "]).fill().map(arrayElem => {return " + defaultValue + ";})";
  while (--lenCounter)
  {
    arrayString = "Array(argsRef[" + lenCounter + "]).fill().map(arrayElem =>" + arrayString + ")";
  }
  return eval(arrayString);
}

// Invoke the primary program logic and capture its outcome.
var finalOutput = executeCoreLogic();
// Display the result if it is not undefined.
if (finalOutput !== undefined) console.log(finalOutput);

/**
 * This is the main function containing the core business logic of the application.
 * It retrieves a value from a predefined sequence based on user input.
 * @returns {number} The element from the sequence at the calculated index.
 */
function executeCoreLogic() {
  // A fixed array of numerical values.
  var numericSequence = [1, 1, 1, 2, 1, 2, 1, 5, 2, 2, 1, 5, 1, 2, 1, 14, 1, 5, 1, 5, 2, 2, 1, 15, 2, 2, 5, 4, 1, 4, 1, 51];
  // Read an index from the input to query the sequence.
  var lookupIndex = getNextToken();
  // Return the element at the (lookupIndex - 1) position.
  return numericSequence[lookupIndex - 1];
}