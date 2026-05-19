"use strict";
// Read the entire standard input as a string
var fileContent = require("fs").readFileSync("/dev/stdin", "utf8");

// Split the input string by spaces or newlines to create an array of tokens
var tokenArray = fileContent.split(/ |\n/);
// Initialize an index to keep track of the current token
var tokenIndex = 0;

/**
 * Retrieves the next token from the input array and converts it to a number.
 * @returns {number} The next number from the input.
 */
function getNextNumber() {
  return +tokenArray[tokenIndex++];
}

/**
 * Retrieves the next token from the input array as a string.
 * @returns {string} The next string from the input.
 */
function getNextString() {
  return tokenArray[tokenIndex++];
}

/**
 * Retrieves the next token from the input array and converts it to a BigInt.
 * @returns {BigInt} The next BigInt from the input.
 */
function getNextBigInt() {
  return BigInt(tokenArray[tokenIndex++]);
}

/**
 * Retrieves a slice of numbers or strings from the input array.
 * @param {number} numElements - The number of elements to retrieve.
 * @param {boolean} asStrings - If true, return elements as strings; otherwise, convert to numbers.
 * @returns {Array<number|string>} An array containing the requested elements.
 */
function getNumbersSlice(numElements, asStrings) {
  if (asStrings) {
    return tokenArray.slice(tokenIndex, (tokenIndex += numElements));
  } else {
    return tokenArray.slice(tokenIndex, (tokenIndex += numElements)).map((val) => +val);
  }
}

/**
 * Retrieves a 2D matrix of numbers or strings from the input array.
 * @param {number} matrixHeight - The number of rows in the matrix.
 * @param {number} matrixWidth - The number of columns in the matrix.
 * @param {boolean} asStrings - If true, return elements as strings; otherwise, convert to numbers.
 * @returns {Array<Array<number|string>>} A 2D array representing the matrix.
 */
function getMatrix(matrixHeight, matrixWidth, asStrings) {
  var resultMatrix = [];
  var rowCounter = 0;
  if (asStrings) {
    for (; rowCounter < matrixHeight; rowCounter++) {
      resultMatrix.push(tokenArray.slice(tokenIndex, (tokenIndex += matrixWidth)));
    }
  } else {
    for (; rowCounter < matrixHeight; rowCounter++) {
      resultMatrix.push(tokenArray.slice(tokenIndex, (tokenIndex += matrixWidth)).map((val) => +val));
    }
  }
  return resultMatrix;
}

/**
 * Creates a multi-dimensional array initialized with a given value.
 * This function uses eval and is generally not recommended for production code due to security risks.
 * @param {*} initialValue - The value to initialize array elements with.
 * @returns {Array} The created multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
  var args = arguments,
    argLength = args.length,
    evalString = "Array(args[" + --argLength + "]).fill().map(x=>{return " + initialValue + ";})";
  while (--argLength) {
    evalString = "Array(args[" + argLength + "]).fill().map(x=>" + evalString + ")";
  }
  return eval(evalString);
}

// Execute the main algorithm and store its result
var programResult = executeAlgorithm();

// If the algorithm returned a value, print it to the console
if (programResult !== undefined) {
  console.log(String(programResult));
}

/**
 * The main algorithm function.
 * This function implements a binary search approach to find a specific value.
 * @returns {number} The result of the binary search.
 */
function executeAlgorithm() {
  var countElements = getNextNumber(); // Read the number of elements
  var dataSequence = getNumbersSlice(countElements); // Read the sequence of numbers

  var upperBound = countElements; // Initialize the upper bound for binary search
  var lowerBound = 0; // Initialize the lower bound for binary search

  // Perform binary search
  while (upperBound - lowerBound > 1) {
    var midValue = (upperBound + lowerBound) >> 1; // Calculate the midpoint
    var isValid = 1; // Flag to track if the current midValue is valid

    var stackStructure; // This array will store pairs of [value, count]

    // Initialize stackStructure based on the first element of dataSequence
    if (dataSequence[0] > 1) {
      stackStructure = [1, 1, dataSequence[0], 1];
    } else {
      stackStructure = [1, 1];
    }

    // Iterate through the dataSequence starting from the second element
    for (var idx = 1; idx < countElements && isValid; idx++) {
      // Case 1: Current element is greater than the top value on the stack
      if (stackStructure[stackStructure.length - 2] < dataSequence[idx]) {
        // Pop elements from stack until the second-to-last element is not 1
        while (stackStructure.length > 2 && stackStructure[stackStructure.length - 1] === 1) {
          stackStructure.length -= 2;
        }
        // Push the current element and a count of 1
        stackStructure.push(dataSequence[idx], 1);
      } else {
        // Case 2: Current element is not greater than the top value on the stack
        if (midValue === 1) {
          isValid = 0; // If midValue is 1, this path is invalid
          break;
        }
        // Pop elements from stack until the top value is less than or equal to the current element
        while (stackStructure[stackStructure.length - 2] > dataSequence[idx]) {
          stackStructure.length -= 2;
        }
        // If the top value is now less than the current element, push current element with count 2
        if (stackStructure[stackStructure.length - 2] < dataSequence[idx]) {
          stackStructure.push(dataSequence[idx], 2);
        } else {
          // If the top value is equal to the current element
          var tempVal = stackStructure[stackStructure.length - 2]; // Store the top value
          // Iterate backwards through the stack, checking pairs
          for (var stackIdx = stackStructure.length - 1; stackIdx > 0; stackIdx -= 2) {
            // If the value below the current pair is less than tempVal, push current element with count 2
            if (stackStructure[stackIdx - 1] < tempVal) {
              stackStructure.push(dataSequence[idx], 2);
              break;
            }
            // If the count of the current pair is less than midValue, increment count
            if (stackStructure[stackIdx] < midValue) {
              stackStructure[stackIdx]++;
              // If the value below the current pair is less than current element, push current element with count 1
              if (stackStructure[stackIdx - 1] < dataSequence[idx]) {
                stackStructure.push(dataSequence[idx], 1);
              }
              break;
            }
            // If count is not less than midValue, pop the current pair
            stackStructure.length -= 2;
            tempVal--; // Decrement tempVal
          }
          // If the loop finished without a break (stackIdx became negative), it's an invalid state
          if (stackIdx < 0) {
            isValid = 0;
          }
        }
      }
    }

    // Update binary search bounds based on the isValid flag
    if (isValid) {
      upperBound = midValue;
    } else {
      lowerBound = midValue;
    }
  }
  return upperBound; // Return the final upper bound
}
