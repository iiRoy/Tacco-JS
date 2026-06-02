"use strict";

// Acquire raw input data from the standard input stream
let rawData = require("fs").readFileSync("/dev/stdin", "utf8");

// Divide the entire input string into individual tokens, using spaces or newlines as separators
let tokenArray = rawData.split(/ |\n/);
let tokenIndex = 0; // Pointer to the current token being processed

/**
 * Extracts the subsequent token from the input sequence and converts it to a numeric type.
 * @returns {number} The parsed numeric value.
 */
function getNextNumber() {
  return +tokenArray[tokenIndex++];
}

/**
 * Retrieves the next token from the input sequence as a string.
 * @returns {string} The string value of the token.
 */
function getNextString() {
  return tokenArray[tokenIndex++];
}

/**
 * Obtains the next token from the input sequence and transforms it into a BigInt.
 * @returns {BigInt} The BigInt representation of the token.
 */
function getNextBigInt() {
  return BigInt(tokenArray[tokenIndex++]);
}

/**
 * Fetches a specified quantity of tokens from the input, returning them as an array.
 * Elements can be returned either as numbers or as their original string form.
 * @param {number} count - The total number of tokens to retrieve.
 * @param {boolean} asStrings - If true, tokens are kept as strings; otherwise, they are converted to numbers.
 * @returns {Array<number|string>} An array containing the retrieved values.
 */
function getNumbersArray(count, asStrings) {
  if (asStrings) {
    return tokenArray.slice(tokenIndex, (tokenIndex += count));
  } else {
    return tokenArray.slice(tokenIndex, (tokenIndex += count)).map((val) => +val);
  }
}

/**
 * Constructs a two-dimensional matrix by reading tokens from the input.
 * The matrix dimensions (height and width) are specified, and elements can be numbers or strings.
 * @param {number} height - The number of rows in the matrix.
 * @param {number} width - The number of columns in each row.
 * @param {boolean} asStrings - If true, matrix elements are strings; otherwise, they are numbers.
 * @returns {Array<Array<number|string>>} The generated 2D array (matrix).
 */
function getMatrix(height, width, asStrings) {
  let resultMatrix = [];
  let rowIndex = 0;
  if (asStrings) {
    for (; rowIndex < height; rowIndex++) {
      resultMatrix.push(tokenArray.slice(tokenIndex, (tokenIndex += width)));
    }
  } else {
    for (; rowIndex < height; rowIndex++) {
      resultMatrix.push(tokenArray.slice(tokenIndex, (tokenIndex += width)).map((element) => +element));
    }
  }
  return resultMatrix;
}

/**
 * Dynamically creates a multi-dimensional array based on provided dimensions and an initial value.
 * This utility function is not directly utilized in the primary algorithm of this script.
 * @param {*} initialValue - The value to populate the array elements with.
 * @returns {Array} A newly created multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
  let args = arguments;
  let argCount = args.length;
  let arrayCreationString = "Array(args[" + --argCount + "]).fill().map(_ => { return " + initialValue + "; })";
  while (--argCount) {
    arrayCreationString = "Array(args[" + argCount + "]).fill().map(_ => " + arrayCreationString + ")";
  }
  return eval(arrayCreationString);
}

// Invoke the main processing function and store its result
let programOutput = executePrimaryLogic();

// Display the result to the console if a value was returned
if (programOutput !== void 0) {
  console.log(String(programOutput));
}

/**
 * Contains the core business logic of the application.
 * This function processes an array based on specific rules involving sums of multiples.
 * @returns {number} The final aggregated sum of the modified array elements.
 */
function executePrimaryLogic() {
  // Read the total number of elements for the primary array
  let inputCount = getNextNumber();

  // Initialize the data array, prepending a zero to facilitate 1-based indexing
  let dataValues = [0].concat(getNumbersArray(inputCount));

  // Outer iteration loop, running 'inputCount' times
  for (let outerLoopIndex = 0; outerLoopIndex < inputCount; outerLoopIndex++) {
    // Inner iteration loop, decrementing from 'inputCount' down to 1
    for (let currentDivisor = inputCount; currentDivisor >= 1; currentDivisor--) {
      let currentSum = 0; // Accumulator for the sum of multiples

      // Calculate the sum of elements at indices that are multiples of 'currentDivisor'
      for (let multipleIndex = currentDivisor; multipleIndex <= inputCount; multipleIndex += currentDivisor) {
        currentSum += dataValues[multipleIndex];
      }

      // If the calculated sum is negative, reset all corresponding elements to zero
      if (currentSum < 0) {
        for (let multipleIndex = currentDivisor; multipleIndex <= inputCount; multipleIndex += currentDivisor) {
          dataValues[multipleIndex] = 0;
        }
      }
    }
  }

  // Compute and return the total sum of all elements in the final modified array
  return dataValues.reduce((accumulator, currentValue) => accumulator + currentValue);
}
