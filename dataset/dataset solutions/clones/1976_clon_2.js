"use strict"; // Enforce strict parsing and error handling

// Obtain raw input data from standard input
var rawData = require("fs").readFileSync("/dev/stdin", "utf8");

// Split the raw data into tokens using space or newline as delimiters
var tokenStream = rawData.split(/\s+|[\r\n]+/),
  tokenIndex = 0;

/**
 * Retrieves the next token from the stream.
 * @param {boolean} isString - If true, returns the token as a string; otherwise, attempts to convert to a number.
 * @returns {string|number} The next token.
 */
function getNextToken(isString) {
  // If `isString` is truthy, return the token as is.
  // Otherwise, convert it to a number.
  return isString ? tokenStream[tokenIndex++] : Number(tokenStream[tokenIndex++]);
}

/**
 * Retrieves a specified number of tokens from the stream.
 * @param {number} count - The number of tokens to retrieve.
 * @param {boolean} asStrings - If true, returns tokens as strings; otherwise, converts to numbers.
 * @returns {Array<string|number>} An array of tokens.
 */
function getMultipleTokens(count, asStrings) {
  // Extract a slice of the token stream.
  const extractedSlice = tokenStream.slice(tokenIndex, tokenIndex += count);
  // If `asStrings` is truthy, return the slice directly.
  // Otherwise, map each item to a number.
  return asStrings ? extractedSlice : extractedSlice.map(val => Number(val));
}

/**
 * Reads a 2D matrix from the token stream.
 * @param {number} rows - The number of rows in the matrix.
 * @param {number} cols - The number of columns in the matrix.
 * @param {boolean} stringsOnly - If true, matrix elements are strings; otherwise, numbers.
 * @returns {Array<Array<string|number>>} The parsed matrix.
 */
function getMatrix(rows, cols, stringsOnly) {
  var resultArray = [],
    rowIndex = 0;
  if (stringsOnly) {
    for (; rowIndex < rows; rowIndex++) {
      resultArray.push(tokenStream.slice(tokenIndex, tokenIndex += cols));
    }
  } else {
    for (; rowIndex < rows; rowIndex++) {
      resultArray.push(tokenStream.slice(tokenIndex, tokenIndex += cols).map(item => Number(item)));
    }
  }
  return resultArray;
}

/**
 * Creates a multi-dimensional array initialized with a specific value.
 * This function uses `eval` and is generally discouraged for dynamic code execution.
 * @param {*} initialValue - The value to initialize array elements with.
 * @returns {Array} The multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
  var argValues = arguments,
    argLength = argValues.length,
    expressionString = "Array(argValues[" + --argLength + "]).fill().map(_=>{return " + initialValue + ";})";
  while (--argLength) {
    expressionString = "Array(argValues[" + argLength + "]).fill().map(_=>" + expressionString + ")";
  }
  return eval(expressionString);
}

// A large prime number used for modulo operations, if any.
var moduloConstant = 1_000_000_007;

// Execute the primary data processing logic
var finalResult = processData();

// If the processing function returned a non-undefined value, log it to console
if (finalResult !== void 0) console.log(finalResult);

/**
 * Main function to process the input data and calculate the result.
 * This algorithm involves partitioning an array and calculating sums based on sorted partitions.
 * @returns {number} The calculated maximum score.
 */
function processData() {
  // Read the total number of elements
  var totalElements = getNextToken();

  // Create an array to store pairs [value, originalIndex]
  var elementPairs = [];
  for (var idx = 0; idx < totalElements; idx++) {
    elementPairs.push([getNextToken(), idx]);
  }

  // Initialize the maximum score found so far
  var maximumScore = 0;

  // Iterate through all possible partition points
  for (var idx = 1; idx < totalElements; idx++) {
    // Initialize two partitions for the current split point
    var leftPartition = [],
      rightPartition = [];

    // Distribute elements into left and right partitions based on `idx`
    for (var innerIdx = 0; innerIdx < totalElements; innerIdx++) {
      if (innerIdx < idx) {
        leftPartition.push(elementPairs[innerIdx]);
      } else {
        rightPartition.push(elementPairs[innerIdx]);
      }
    }

    // Sort the left partition by the first element (ascending)
    leftPartition.sort((pairA, pairB) => pairA[0] - pairB[0]);
    // Sort the right partition by the first element (descending)
    rightPartition.sort((pairX, pairY) => pairY[0] - pairX[0]);

    // Calculate the current sum for this partition and a flag for validity
    var currentPartitionSum = 0,
      isValidPartition = 1; // Use 1 for true, 0 for false

    // Process the right partition
    for (var innerIdx = 0; innerIdx < rightPartition.length && isValidPartition; innerIdx++) {
      var tempValue = rightPartition[innerIdx][1] - innerIdx;
      if (tempValue < 0) {
        isValidPartition = 0; // Mark as invalid if condition is met
      } else {
        currentPartitionSum += tempValue * rightPartition[innerIdx][0];
      }
    }

    // Process the left partition, only if the partition is still valid
    for (var innerIdx = 0; innerIdx < leftPartition.length && isValidPartition; innerIdx++) {
      var tempValue = innerIdx + rightPartition.length - leftPartition[innerIdx][1];
      if (tempValue < 0) {
        isValidPartition = 0; // Mark as invalid if condition is met
      } else {
        currentPartitionSum += tempValue * leftPartition[innerIdx][0];
      }
    }

    // Update the maximum score if the current partition is valid and yields a higher sum
    if (isValidPartition && maximumScore < currentPartitionSum) {
      maximumScore = currentPartitionSum;
    }
  }
  return maximumScore; // Return the final maximum score
}