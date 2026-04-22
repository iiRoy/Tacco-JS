"use strict";

// This segment manages the initial acquisition of raw input data from the operating system's standard input.
let fileContent = require("fs").readFileSync("/dev/fd/0", "unicodeEncoding");

// The entirety of the input content is then segmented into individual tokens, utilizing either spaces or newlines as delimiters.
let tokensArray = fileContent.split(/ |\n/);
let tokenIndex = 0;

/**
 * Procures the subsequent token available within the global `tokensArray`.
 * @param {boolean} asString - A flag indicating whether the token should be returned in its string form (true) or converted to a numerical value (false).
 * @returns {string|number} The token, either as a string or a number based on the `asString` parameter.
 */
function acquireNextToken(asString) {
  return asString
    ? tokensArray[tokenIndex++]
    : +tokensArray[tokenIndex++];
}

/**
 * Extracts a specified quantity of tokens from the global array of tokens.
 * @param {number} count - The precise number of tokens intended for retrieval.
 * @param {boolean} keepAsStrings - A control flag; if set to true, tokens retain their string data type, otherwise they are coerced into numbers.
 * @returns {Array<string|number>} An array containing the requested subset of tokens.
 */
function acquireMultipleTokens(count, keepAsStrings) {
  return keepAsStrings
    ? tokensArray.slice(tokenIndex, tokenIndex += count)
    : tokensArray.slice(tokenIndex, tokenIndex += count).map(item => +item);
}

/**
 * Facilitates the reading of data structured as a matrix, based on predefined dimensions.
 * @param {number} rows - The total number of rows expected in the matrix.
 * @param {number} cols - The total number of columns expected per row in the matrix.
 * @param {boolean} preserveStringFormat - Determines if matrix elements should remain as strings (true) or be parsed as numbers (false).
 * @returns {Array<Array<string|number>>} A two-dimensional array representing the parsed matrix.
 */
function acquireMatrixData(rows, cols, preserveStringFormat) {
  let resultMatrix = [];
  let rowIndex = 0;
  if (preserveStringFormat) {
    for (; rowIndex < rows; rowIndex++) {
      resultMatrix.push(tokensArray.slice(tokenIndex, tokenIndex += cols));
    }
  } else {
    for (; rowIndex < rows; rowIndex++) {
      resultMatrix.push(tokensArray.slice(tokenIndex, tokenIndex += cols).map(element => +element));
    }
  }
  return resultMatrix;
}

/**
 * Constructs and then executes a string of JavaScript code to generate a multi-dimensional array.
 * @param {*} initialValue - The default value to populate the innermost elements of the array structure.
 * @returns {Array} A newly created array, potentially nested, initialized according to the provided dimensions and value.
 */
function buildMultiDimArray(initialValue) {
  let args = arguments;
  let lengthCounter = args.length;
  let arrayCreationString = "Array(args[" + --lengthCounter + "]).fill().map( _ => { return " + initialValue + "; } )";
  while (--lengthCounter) {
    arrayCreationString = "Array(args[" + lengthCounter + "]).fill().map( _ => " + arrayCreationString + " )";
  }
  return eval(arrayCreationString);
}


// Invokes the primary operational function of this script and stores its computed outcome.
let programResult = executeProgram();

// Checks if the outcome from the main execution is defined, and if so, prints it to the standard output.
if (programResult !== undefined) {
  console.log(programResult);
}


/**
 * Encapsulates the core computational logic of the entire application.
 * It reads two distinct numerical values from the input stream and performs a specific arithmetic calculation.
 * @returns {number} The final calculated numerical result derived from the input values.
 */
function executeProgram() {
  let firstValue = acquireNextToken();
  let secondValue = acquireNextToken();
  return (firstValue * (firstValue - 1) / 2) + (secondValue * (secondValue - 1) / 2);
}