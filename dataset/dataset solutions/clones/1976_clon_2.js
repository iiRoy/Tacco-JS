"use strict"; // Enforce strict parsing and error handling

// Read all standard input at once
let rawData = require("fs").readFileSync("/dev/stdin", "utf8");

// Split input into tokens by spaces or newlines, and initialize a token pointer
let tokenStream = rawData.split(/ |\n/);
let tokenIndex = 0;

/**
 * Reads the next token from the input stream.
 * @param {boolean} asString - If true, returns the token as a string; otherwise, as a number.
 * @returns {string|number} The next token.
 */
function readNextToken(asString) {
  return asString ? tokenStream[tokenIndex++] : +tokenStream[tokenIndex++];
}

/**
 * Reads an array of tokens from the input stream.
 * @param {number} count - The number of tokens to read.
 * @param {boolean} asStrings - If true, returns tokens as strings; otherwise, as numbers.
 * @returns {Array<string|number>} An array of tokens.
 */
function readTokensArray(count, asStrings) {
  if (asStrings) {
    return tokenStream.slice(tokenIndex, (tokenIndex += count));
  } else {
    return tokenStream.slice(tokenIndex, (tokenIndex += count)).map((valStr) => +valStr);
  }
}

/**
 * Reads a 2D matrix of tokens from the input stream.
 * @param {number} rows - The number of rows.
 * @param {number} cols - The number of columns.
 * @param {boolean} asStringsMatrix - If true, returns elements as strings; otherwise, as numbers.
 * @returns {Array<Array<string|number>>} A 2D array (matrix) of tokens.
 */
function readMatrix(rows, cols, asStringsMatrix) {
  let resultMatrix = [];
  let rowIndex = 0;
  if (asStringsMatrix) {
    for (; rowIndex < rows; rowIndex++) {
      resultMatrix.push(tokenStream.slice(tokenIndex, (tokenIndex += cols)));
    }
  } else {
    for (; rowIndex < rows; rowIndex++) {
      resultMatrix.push(tokenStream.slice(tokenIndex, (tokenIndex += cols)).map((elementStr) => +elementStr));
    }
  }
  return resultMatrix;
}

/**
 * Creates a multi-dimensional array initialized with a given value.
 * @param {*} initialValue - The value to initialize array elements with.
 * @param {...number} dimensions - The dimensions of the array.
 * @returns {Array} The created multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
  let argsList = arguments;
  let dimCount = argsList.length;
  let arrayCreationCode = "Array(argsList[" + --dimCount + "]).fill().map(_ => { return " + initialValue + "; })";
  while (--dimCount) {
    arrayCreationCode = "Array(argsList[" + dimCount + "]).fill().map(_ => " + arrayCreationCode + ")";
  }
  return eval(arrayCreationCode);
}

// A common modulo value, often used in competitive programming
const primeModulo = 1000000007;

// Execute the main logic and capture its return value
let programOutput = executeProgram();

// If the program returned a value, print it to console
if (programOutput !== undefined) {
  console.log(programOutput);
}

/**
 * Main function containing the problem's core logic.
 * This function calculates the maximum possible score based on item arrangements.
 * @returns {number} The maximum score.
 */
function executeProgram() {
  // Read the number of items
  let itemCount = readNextToken();

  // Store items along with their original indices
  let itemsWithOriginalIndex = [];
  for (let idx = 0; idx < itemCount; idx++) {
    itemsWithOriginalIndex.push([readNextToken(), idx]);
  }

  // Initialize the maximum score found so far
  let maxScore = 0;

  // Iterate through all possible split points for the array
  // The split point 'splitPoint' determines how many elements are in the 'leftPartition'
  for (let splitPoint = 1; splitPoint < itemCount; splitPoint++) {
    let leftPartition = []; // Elements before the split point
    let rightPartition = []; // Elements from the split point onwards

    // Distribute elements into left and right partitions
    for (let currentIdx = 0; currentIdx < itemCount; currentIdx++) {
      if (currentIdx < splitPoint) {
        leftPartition.push(itemsWithOriginalIndex[currentIdx]);
      } else {
        rightPartition.push(itemsWithOriginalIndex[currentIdx]);
      }
    }

    // Sort the left partition in ascending order based on item value
    leftPartition.sort((elemA, elemB) => elemA[0] - elemB[0]);

    // Sort the right partition in descending order based on item value
    rightPartition.sort((elemA, elemB) => elemB[0] - elemA[0]);

    let currentScore = 0; // Score for the current partition
    let isValidPartition = 1; // Flag to check if the partition is valid (1 for true, 0 for false)

    // Calculate score for the right partition
    for (let rightPartIdx = 0; rightPartIdx < rightPartition.length && isValidPartition; rightPartIdx++) {
      // Calculate the required position difference for the current item
      let positionDiff = rightPartition[rightPartIdx][1] - rightPartIdx;
      if (positionDiff < 0) {
        isValidPartition = 0; // Invalid partition if difference is negative
      } else {
        currentScore += positionDiff * rightPartition[rightPartIdx][0];
      }
    }

    // Calculate score for the left partition, only if the partition is still valid
    for (let leftPartIdx = 0; leftPartIdx < leftPartition.length && isValidPartition; leftPartIdx++) {
      // Calculate the required position difference for the current item
      let positionDiff = leftPartIdx + rightPartition.length - leftPartition[leftPartIdx][1];
      if (positionDiff < 0) {
        isValidPartition = 0; // Invalid partition if difference is negative
      } else {
        currentScore += positionDiff * leftPartition[leftPartIdx][0];
      }
    }

    // If the partition is valid and its score is greater than the maxScore, update maxScore
    if (isValidPartition && maxScore < currentScore) {
      maxScore = currentScore;
    }
  }

  return maxScore; // Return the overall maximum score
}
