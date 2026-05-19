"use strict";

// Acquire file system module and read input from standard input.
var fileContent = require("fs").readFileSync("/dev/stdin", "utf8");

// Split input by spaces or newlines and initialize token index.
var inputTokens = fileContent.split(/ |\n/);
var tokenIndex = 0x0;

/**
 * Reads the next token from the input stream.
 * @param {boolean} asString - If true, returns as string; otherwise, as number.
 * @returns {string|number} The next token.
 */
function readNextToken(asString) {
  return asString ? inputTokens[tokenIndex++] : +inputTokens[tokenIndex++];
}

/**
 * Reads multiple tokens from the input stream.
 * @param {number} count - The number of tokens to read.
 * @param {boolean} asString - If true, returns as strings; otherwise, as numbers.
 * @returns {Array<string|number>} An array of tokens.
 */
function readMultipleTokens(count, asString) {
  return asString ? inputTokens.slice(tokenIndex, tokenIndex += count) : inputTokens.slice(tokenIndex, tokenIndex += count).map(val => +val);
}

/**
 * Reads a matrix of tokens from the input stream.
 * @param {number} height - The number of rows.
 * @param {number} width - The number of columns.
 * @param {boolean} asString - If true, returns as strings; otherwise, as numbers.
 * @returns {Array<Array<string|number>>} A 2D array (matrix) of tokens.
 */
function readMatrixTokens(height, width, asString) {
  var resultMatrix = [];
  var rowCounter = 0x0;
  if (asString) {
    for (; rowCounter < height; rowCounter++) {
      resultMatrix.push(inputTokens.slice(tokenIndex, tokenIndex += width));
    }
  } else {
    for (; rowCounter < height; rowCounter++) {
      resultMatrix.push(inputTokens.slice(tokenIndex, tokenIndex += width).map(val => +val));
    }
  }
  return resultMatrix;
}

/**
 * Creates a multi-dimensional array initialized with a specific value.
 * @param {*} initialValue - The value to initialize array elements with.
 * @param {...number} dimensions - The dimensions of the array.
 * @returns {Array} The multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
  var args = arguments;
  var argCount = args.length;
  var arrayCreationString = "Array(args[" + --argCount + "]).fill().map(element => {return " + initialValue + ";})";
  while (--argCount) {
    arrayCreationString = "Array(args[" + argCount + "]).fill().map(element => " + arrayCreationString + ")";
  }
  return eval(arrayCreationString);
}

// Execute the main processing logic.
var finalResult = processInput();

// Output the result if it's not undefined.
if (finalResult !== undefined) {
  console.log(finalResult);
}

/**
 * Main function to process the input and solve the problem.
 * This function implements a cycle detection algorithm.
 * @returns {number} The final position after K jumps.
 */
function processInput() {
  var numElements = readNextToken();
  var bigKValue = BigInt(readNextToken());
  var jumpArray = readMultipleTokens(numElements);

  // Map to store the first visit iteration for each position.
  // Initialized with -1 to indicate not visited.
  var visitedMap = createMultiDimArray(-0x1, numElements);

  var currentPosition = 0x0; // Start at position 0.
  visitedMap[0x0] = 0x0; // Mark starting position as visited at iteration 0.

  // Loop through K jumps or until a cycle is detected.
  for (var iterationCount = 0x1; iterationCount <= bigKValue; iterationCount++) {
    currentPosition = jumpArray[currentPosition] - 0x1; // Perform the jump.

    // Check if the current position has been visited before.
    if (visitedMap[currentPosition] >= 0x0) {
      // Cycle detected!
      var cycleLength = iterationCount - visitedMap[currentPosition]; // Length of the cycle.
      bigKValue -= BigInt(iterationCount); // Remaining jumps after reaching the cycle.
      bigKValue %= BigInt(cycleLength); // Jumps remaining within the cycle.

      // Perform the remaining jumps within the cycle.
      for (var cycleJumpCount = 0x1; cycleJumpCount <= bigKValue; cycleJumpCount++) {
        currentPosition = jumpArray[currentPosition] - 0x1;
      }
      break; // Exit the main loop as we've calculated the final position.
    }
    // Mark the current position with the current iteration count.
    visitedMap[currentPosition] = iterationCount;
  }

  // Return the final position (1-indexed).
  return currentPosition + 0x1;
}
