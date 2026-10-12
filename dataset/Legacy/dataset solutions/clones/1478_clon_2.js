"use strict";

// This module handles file system operations for input.
const rawData = require("fs").readFileSync("/dev/stdin", "utf8");

// Tokenize the input data and initialize an index for consumption.
let tokenizedInput = rawData.split(/ |\n/);
let tokenIndex = 0;

/**
 * Retrieves the next token from the input stream as a number.
 * @returns {number} The next numeric token.
 */
function getNextNumber() {
  return +tokenizedInput[tokenIndex++];
}

/**
 * Retrieves the next token from the input stream as a string.
 * @returns {string} The next string token.
 */
function getNextString() {
  return tokenizedInput[tokenIndex++];
}

/**
 * Retrieves the next token from the input stream as a BigInt.
 * @returns {BigInt} The next BigInt token.
 */
function getNextBigInt() {
  return BigInt(tokenizedInput[tokenIndex++]);
}

/**
 * Reads a specified number of tokens and returns them as an array.
 * Optionally converts them to strings if 'asStrings' is true.
 * @param {number} count - The number of elements to read.
 * @param {boolean} [asStrings] - If true, elements are returned as strings; otherwise, as numbers.
 * @returns {Array<number|string>} An array of numbers or strings.
 */
function getNumbersArray(count, asStrings) {
  if (asStrings) {
    return tokenizedInput.slice(tokenIndex, (tokenIndex += count));
  } else {
    return tokenizedInput.slice(tokenIndex, (tokenIndex += count)).map((val) => +val);
  }
}

/**
 * Reads a specified number of tokens, converts them to numbers, sorts them, and returns the array.
 * Sorts in descending order if 'descending' is true, otherwise ascending.
 * @param {number} numElements - The number of elements to read.
 * @param {boolean} [descending] - If true, sorts in descending order.
 * @returns {Array<number>} A sorted array of numbers.
 */
function getSortedNumbersArray(numElements, descending) {
  const parsedElements = tokenizedInput.slice(tokenIndex, (tokenIndex += numElements)).map((val) => +val);
  if (descending) {
    return parsedElements.sort((valA, valB) => valB - valA);
  } else {
    return parsedElements.sort((valA, valB) => valA - valB);
  }
}

/**
 * Reads tokens to form a 2D matrix.
 * @param {number} height - The number of rows.
 * @param {number} width - The number of columns per row.
 * @param {boolean} [asStringsMatrix] - If true, matrix elements are strings; otherwise, numbers.
 * @returns {Array<Array<number|string>>} The 2D matrix.
 */
function getMatrix(height, width, asStringsMatrix) {
  const resultMatrix = [];
  let rowIndex = 0;
  if (asStringsMatrix) {
    for (; rowIndex < height; rowIndex++) {
      resultMatrix.push(tokenizedInput.slice(tokenIndex, (tokenIndex += width)));
    }
  } else {
    for (; rowIndex < height; rowIndex++) {
      resultMatrix.push(tokenizedInput.slice(tokenIndex, (tokenIndex += width)).map((val) => +val));
    }
  }
  return resultMatrix;
}

/**
 * Dynamically creates a multi-dimensional array initialized with a given value.
 * The dimensions are passed as arguments after the initial value.
 * @param {*} initialValue - The value to initialize array elements with.
 * @returns {Array} The created multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
  const argsList = arguments;
  let argLength = argsList.length;
  let arrayExpression = "Array(argsList[" + --argLength + "]).fill().map(elementPlaceholder => {return " + initialValue + ";})";
  while (--argLength) {
    arrayExpression = "Array(argsList[" + argLength + "]).fill().map(elementPlaceholder => " + arrayExpression + ")";
  }
  return eval(arrayExpression);
}

// Buffer for collecting output lines.
const outputBuffer = [];

/**
 * Adds a string to the output buffer.
 * @param {string} content - The string to add.
 */
function appendToOutput(content) {
  outputBuffer.push(content);
}

// Execute the main processing function.
const finalResult = processInput();

// Output the result if it's not undefined.
if (finalResult !== undefined) {
  console.log(String(finalResult));
}

// Output any buffered streams.
if (outputBuffer.length) {
  console.log(outputBuffer.join("\n"));
}

/**
 * The primary function containing the problem's logic.
 * Reads an integer 'k' and generates a specific string based on it.
 * @returns {string} The generated string.
 */
function processInput() {
  // Read the integer 'k' from the input.
  const inputVal = getNextNumber();

  // The problem requires repeating "ACL" 'k' times.
  // The string "ACLACLACLACLACL" is long enough for k up to 5.
  // We slice it to get exactly k*3 characters.
  return "ACLACLACLACLACL".slice(0, inputVal * 3);
}
