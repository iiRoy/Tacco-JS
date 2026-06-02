"use strict"; // Enforce strict parsing and error handling for better code quality

// Read all input from the standard input stream as a UTF-8 string
let rawData = require("fs").readFileSync("/dev/stdin", "utf8");

// Split the raw input string into an array of tokens using spaces or newlines as delimiters
let tokenStream = rawData.split(/ |\n/);
let tokenIndex = 0; // Initialize an index to keep track of the current token position

/**
 * Retrieves the next token from the global token stream.
 * @param {boolean} asString - If true, the token is returned as a string; otherwise, it's converted to a number.
 * @returns {string|number} The next token from the stream.
 */
function getNextToken(asString) {
  return asString ? tokenStream[tokenIndex++] : +tokenStream[tokenIndex++];
}

/**
 * Retrieves a specified number of tokens from the stream.
 * @param {number} count - The number of tokens to retrieve.
 * @param {boolean} asString - If true, tokens are returned as strings; otherwise, they are converted to numbers.
 * @returns {Array<string|number>} An array containing the retrieved tokens.
 */
function getMultipleTokens(count, asString) {
  // Extract a slice of the token stream and then advance the global token index
  const tokens = tokenStream.slice(tokenIndex, tokenIndex + count);
  tokenIndex += count;
  return asString ? tokens : tokens.map(item => +item);
}

/**
 * Retrieves a matrix (2D array) of tokens from the stream.
 * @param {number} height - The number of rows in the matrix.
 * @param {number} width - The number of columns per row.
 * @param {boolean} asString - If true, matrix elements are strings; otherwise, they are numbers.
 * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
 */
function getMatrixTokens(height, width, asString) {
  let resultMatrix = [];
  let rowIdx = 0;
  if (asString) {
    for (; rowIdx < height; rowIdx++) {
      resultMatrix.push(tokenStream.slice(tokenIndex, tokenIndex + width));
      tokenIndex += width;
    }
  } else {
    for (; rowIdx < height; rowIdx++) {
      resultMatrix.push(tokenStream.slice(tokenIndex, tokenIndex + width).map(item => +item));
      tokenIndex += width;
    }
  }
  return resultMatrix;
}

/**
 * Dynamically creates a multi-dimensional array initialized with a given value.
 * The dimensions are passed as subsequent arguments.
 * @param {*} initialValue - The value to fill the array elements with.
 * @param {...number} dimensions - The sizes of each dimension, from outermost to innermost.
 * @returns {Array} The newly created multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
  let dimensions = arguments; // Access all arguments, including the initial value
  let dimensionCount = dimensions.length; // Total number of arguments
  // Construct a string of JavaScript code to create the array
  let arrayCreationCode = "Array(dimensions[" + --dimensionCount + "]).fill().map(x=>{return " + initialValue + ";})";
  while (--dimensionCount) {
    arrayCreationCode = "Array(dimensions[" + dimensionCount + "]).fill().map(x=>" + arrayCreationCode + ")";
  }
  // Evaluate the constructed string to execute the array creation
  return eval(arrayCreationCode);
}

// Execute the main logic function and store its return value
let programResult = executeLogic();

// If the result is not undefined, print it to the console
if (programResult !== undefined) {
  console.log(programResult);
}

/**
 * The core function containing the problem's solution logic.
 * It determines if a collection of parenthesis strings can be balanced.
 * @returns {string} "Yes" if the strings can be balanced, "No" otherwise.
 */
function executeLogic() {
  const noOutcome = "No"; // Constant string for a negative result
  const yesOutcome = "Yes"; // Constant string for a positive result

  let numStrings = getNextToken(); // Read the total count of parenthesis strings
  let unbalancedStrings = []; // Array to store strings that end with a non-positive balance
  let totalBalance = 0; // Accumulator for the sum of final balances of all strings
  let currentBalance = 0; // Represents the available positive balance from strings processed so far

  // Loop through each of the input strings
  for (let idx = 0; idx < numStrings; idx++) {
    let minBalance = 0; // Tracks the minimum balance encountered within the current string
    let currentStringBalance = 0; // Tracks the running balance for the current string
    let currentString = getNextToken(true); // Read the current parenthesis string

    // Iterate over each character in the current string
    for (let charIdx = 0; charIdx < currentString.length; charIdx++) {
      if (currentString[charIdx] === "(") {
        currentStringBalance++; // Increment balance for an opening parenthesis
      } else {
        currentStringBalance--; // Decrement balance for a closing parenthesis
        if (currentStringBalance < minBalance) {
          minBalance = currentStringBalance; // Update minBalance if a new minimum is reached
        }
      }
    }

    totalBalance += currentStringBalance; // Add the final balance of this string to the overall total
    if (currentStringBalance > 0) {
      currentBalance += currentStringBalance; // If the string ends with a positive balance, add it to the 'currentBalance' pool
    } else {
      // If the string ends with a non-positive balance, store its required minimum balance (as positive)
      // and its final balance.
      unbalancedStrings.push([-minBalance, currentStringBalance]);
    }
  }

  // If the sum of all final balances is not zero, it's impossible to balance all strings
  if (totalBalance !== 0) {
    return noOutcome;
  }

  // Sort the 'unbalancedStrings' array. The primary sorting key is the absolute value of their
  // minimum balance (requiredMin), in descending order. This ensures strings that "dip" the most
  // are attempted to be balanced first.
  unbalancedStrings.sort((strA, strB) => strB[0] - strA[0]);

  // Iterate through the sorted unbalanced strings to see if they can be balanced
  for (let idx = 0; idx < unbalancedStrings.length; idx++) {
    let [requiredMin, finalBalance] = unbalancedStrings[idx]; // Destructure the stored values

    // If the minimum balance required for this string (how much it dips below zero)
    // is greater than the currently available positive balance, it cannot be balanced.
    if (requiredMin > currentBalance) {
      return noOutcome;
    }
    // Update the 'currentBalance' pool by effectively adding the final balance of this string.
    // Since finalBalance is non-positive, this operation either reduces 'currentBalance' (if finalBalance is negative)
    // or keeps it the same (if finalBalance is zero).
    currentBalance -= finalBalance;
  }

  // If all checks pass and all strings can be potentially balanced, return "Yes"
  return yesOutcome;
}
