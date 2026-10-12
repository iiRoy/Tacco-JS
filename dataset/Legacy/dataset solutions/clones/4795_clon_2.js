"use strict"; // Enforce strict mode for cleaner code execution

// Import the file system module to read input from standard input
var sourceData = require("fs").readFileSync("/dev/stdin", "utf8");

// Split the input data into tokens using spaces or newlines as delimiters
var tokenStream = sourceData.split(/ |\n/);
// Initialize an index to keep track of the current token position
var tokenIndex = 0;

/**
 * Retrieves the next token from the input stream.
 * @param {boolean} isString - If true, returns the token as a string; otherwise, attempts to convert it to a number.
 * @returns {string|number} The next token.
 */
function retrieveNext(isString) {
  return isString ? tokenStream[tokenIndex++] : +tokenStream[tokenIndex++];
}

/**
 * Retrieves a specified number of tokens from the input stream.
 * @param {number} count - The number of tokens to retrieve.
 * @param {boolean} asStrings - If true, returns tokens as strings; otherwise, attempts to convert them to numbers.
 * @returns {Array<string|number>} An array containing the retrieved tokens.
 */
function retrieveMultiple(count, asStrings) {
  if (asStrings) {
    return tokenStream.slice(tokenIndex, tokenIndex += count);
  } else {
    return tokenStream.slice(tokenIndex, tokenIndex += count).map(item => +item);
  }
}

/**
 * Retrieves a matrix (2D array) of tokens from the input stream.
 * @param {number} height - The number of rows in the matrix.
 * @param {number} width - The number of columns in the matrix.
 * @param {boolean} asStrings - If true, returns tokens as strings; otherwise, attempts to convert them to numbers.
 * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
 */
function retrieveMatrix(height, width, asStrings) {
  var resultMatrix = [];
  var rowIndex = 0;
  if (asStrings) {
    for (; rowIndex < height; rowIndex++) {
      resultMatrix.push(tokenStream.slice(tokenIndex, tokenIndex += width));
    }
  } else {
    for (; rowIndex < height; rowIndex++) {
      resultMatrix.push(tokenStream.slice(tokenIndex, tokenIndex += width).map(element => +element));
    }
  }
  return resultMatrix;
}

/**
 * Dynamically creates a multi-dimensional array initialized with a given value.
 * @param {*} initialValue - The value to initialize the innermost elements with.
 * @param {...number} dimensions - The dimensions of the array (e.g., createMultiDimArray(0, 2, 3) for a 2x3 array of zeros).
 * @returns {Array} The created multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
  var args = arguments;
  var lengthCounter = args.length;
  // Build the array creation string from inside out
  var arrayCreationString = "Array(args[" + --lengthCounter + "]).fill().map(_=>{return " + initialValue + ";})";
  while (--lengthCounter) {
    arrayCreationString = "Array(args[" + lengthCounter + "]).fill().map(_=>" + arrayCreationString + ")";
  }
  // Evaluate the string to create the array
  return eval(arrayCreationString);
}

// Execute the main program logic and store its return value
var programResult = executeProgram();

// If the program returned a value, print it to the console
if (programResult !== undefined) {
  console.log(programResult);
}

/**
 * The primary function containing the core logic of the program.
 * @returns {number} The calculated result.
 */
function executeProgram() {
  // Read 7 numbers from the input stream
  var inputValues = retrieveMultiple(7);

  // Calculate an initial answer based on specific input values
  // (a[0]/2|0) performs integer division for a[0] / 2
  var finalAnswer = inputValues[1] + ((inputValues[0] / 2 | 0) + (inputValues[3] / 2 | 0) + (inputValues[4] / 2 | 0)) * 2;

  // Determine additional value to add based on the parity of inputValues[0], inputValues[3], and inputValues[4]
  switch (inputValues[0] % 2 + inputValues[3] % 2 + inputValues[4] % 2) {
    case 3: // If all three are odd
      finalAnswer += 3;
      break;
    case 2: // If two of them are odd
      // Add 1 only if none of the three values are zero (to avoid 0*0*X = 0)
      if (inputValues[0] * inputValues[3] * inputValues[4]) {
        finalAnswer += 1;
      }
      break;
  }

  // Return the final calculated answer
  return finalAnswer;
}
