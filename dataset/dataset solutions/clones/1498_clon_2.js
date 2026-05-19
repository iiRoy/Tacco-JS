"use strict"; // Enforce strict parsing and error handling

// Read all input from stdin, split by spaces or newlines
var rawData = require("fs").readFileSync("/dev/stdin", "utf8");
var tokenArray = rawData.split(/ |\n/),
  tokenIndex = 0;

/**
 * Retrieves the next number from the input token array.
 * @returns {number} The next parsed number.
 */
function getNextNum() {
  return +tokenArray[tokenIndex++];
}

/**
 * Retrieves the next string from the input token array.
 * @returns {string} The next string token.
 */
function getNextStr() {
  return tokenArray[tokenIndex++];
}

/**
 * Retrieves the next BigInt from the input token array.
 * @returns {BigInt} The next parsed BigInt.
 */
function getNextBigInt() {
  return BigInt(tokenArray[tokenIndex++]);
}

/**
 * Retrieves an array of numbers or strings from the input.
 * @param {number} count - The number of elements to retrieve.
 * @param {boolean} asStrings - If true, return strings; otherwise, return numbers.
 * @returns {Array<number|string>} An array of parsed values.
 */
function getNumsArray(count, asStrings) {
  if (asStrings) {
    return tokenArray.slice(tokenIndex, (tokenIndex += count));
  } else {
    return tokenArray.slice(tokenIndex, (tokenIndex += count)).map((val) => +val);
  }
}

/**
 * Retrieves and sorts an array of numbers from the input.
 * @param {number} count - The number of elements to retrieve.
 * @param {boolean} descending - If true, sort in descending order; otherwise, ascending.
 * @returns {Array<number>} A sorted array of numbers.
 */
function getSortedNumsArray(count, descending) {
  if (descending) {
    return tokenArray.slice(tokenIndex, (tokenIndex += count)).map((val) => +val).sort((a, b) => b - a);
  } else {
    return tokenArray.slice(tokenIndex, (tokenIndex += count)).map((val) => +val).sort((a, b) => a - b);
  }
}

/**
 * Retrieves a 2D matrix (array of arrays) from the input.
 * @param {number} height - The number of rows.
 * @param {number} width - The number of columns per row.
 * @param {boolean} asStrings - If true, matrix elements are strings; otherwise, numbers.
 * @returns {Array<Array<number|string>>} The parsed matrix.
 */
function getMatrix(height, width, asStrings) {
  var resultMatrix = [],
    rowCounter = 0;
  if (asStrings) {
    for (; rowCounter < height; rowCounter++) {
      resultMatrix.push(tokenArray.slice(tokenIndex, (tokenIndex += width)));
    }
  } else {
    for (; rowCounter < height; rowCounter++) {
      resultMatrix.push(tokenArray.slice(tokenIndex, (tokenIndex += width)).map((val) => +val));
    }
  }
  return resultMatrix;
}

/**
 * Creates a multi-dimensional array initialized with a given value.
 * Uses eval for dynamic array creation based on arguments.
 * @param {*} initialValue - The value to initialize array elements with.
 * @param {...number} dimensions - The dimensions of the array.
 * @returns {Array} The created multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
  var args = arguments,
    argLength = args.length,
    arrayCreationString = "Array(args[" + --argLength + "]).fill().map(x=>{return " + initialValue + ";})";
  while (--argLength) {
    arrayCreationString = "Array(args[" + argLength + "]).fill().map(x=>" + arrayCreationString + ")";
  }
  return eval(arrayCreationString);
}

// Buffer for collecting output lines
var outputBuffer = [];

/**
 * Adds a string to the output buffer.
 * @param {string} content - The string to add.
 */
function addToOutput(content) {
  outputBuffer.push(content);
}

// Execute the main program logic
var programResult = executeProgram();

// Output the result if it's not undefined
if (programResult !== undefined) {
  console.log(String(programResult));
}

// Output any buffered streams
if (outputBuffer.length) {
  console.log(outputBuffer.join("\n"));
}

/**
 * Main function containing the core algorithm.
 * Calculates a specific minimum value based on the input.
 * @returns {number} The calculated minimum value.
 */
function executeProgram() {
  var inputVal = getNextNum(); // Get the initial input number

  // Base case: if input is 1, result is 1
  if (inputVal === 1) {
    return 1;
  }

  // Initialize factors for decomposition
  var factorOne = inputVal;
  var factorTwo = 2;

  // Decompose inputVal by repeatedly dividing by 2
  // and multiplying factorTwo by 2 until factorOne is odd.
  while (factorOne % 2 === 0) {
    factorOne /= 2;
    factorTwo *= 2;
  }

  // Initialize doubleInput and the minimum result found so far
  var doubleInput = inputVal * 2;
  var minResult = doubleInput - 1; // Initial upper bound for the answer

  // Iterate through potential divisors of factorOne (which is now odd)
  // Only check odd divisors up to the square root of factorOne
  for (var loopVar = 1; loopVar * loopVar <= factorOne; loopVar += 2) {
    // If loopVar is not a divisor, skip to the next iteration
    if (factorOne % loopVar) {
      continue;
    }

    // Calculate the other divisor 'valU'
    var valU = factorOne / loopVar;

    // Calculate two potential results using the 'calculateF' helper function
    // These represent different pairings of the decomposed factors
    var resOne = calculateF(valU, loopVar * factorTwo);
    var resTwo = calculateF(valU * factorTwo, loopVar);

    // Update the minimum result found
    minResult = Math.min(minResult, resOne, resTwo);
  }

  return minResult;
}

/**
 * Helper function to calculate a value based on two inputs (u, v) and their extended GCD.
 * @param {number} u - First input number.
 * @param {number} v - Second input number.
 * @returns {number} A calculated value or a large number if conditions are not met.
 */
function calculateF(u, v) {
  // Perform extended Euclidean algorithm to find [a, b, gcd(u,v)]
  var [coeffA, coeffB, gcdVal] = extendedEuclidean(u, v);

  // If GCD is not 1, return a very large number (effectively infinity)
  if (gcdVal > 1) {
    return 9e15; // Represents a very large number, effectively infinity
  }

  // If 'a' coefficient is negative, return -a*u
  if (coeffA < 0) {
    return -coeffA * u;
  }

  // If 'b' coefficient is negative, return -b*v
  if (coeffB < 0) {
    return -coeffB * v;
  }

  // If both a and b are non-negative, return a very large number
  return 9e15; // Represents a very large number, effectively infinity
}

/**
 * Implements the Extended Euclidean Algorithm to find gcd(x, y) and coefficients a, b
 * such that ax + by = gcd(x, y).
 * @param {number} x - The first number.
 * @param {number} y - The second number.
 * @returns {Array<number|BigInt>} An array containing [a, b, gcd(x, y)].
 *                                  Coefficients a and b are returned as numbers, gcd as BigInt.
 */
function extendedEuclidean(x, y) {
  // Initialize coefficients for x and y
  var prevA0 = 1n,
    currA1 = 0n,
    prevB0 = 0n,
    currB1 = 1n;

  // Convert inputs to BigInt for precise calculations
  var numX = BigInt(x),
    numY = BigInt(y);

  // Loop until numY becomes zero
  while (numY) {
    // Calculate quotient and remainder
    var quotientVal = numX / numY;
    var remainderVal = numX % numY;

    // Update coefficients using the extended Euclidean algorithm steps
    var nextA2 = prevA0 - quotientVal * currA1;
    var nextB2 = prevB0 - quotientVal * currB1;

    // Shift values for the next iteration
    numX = numY;
    numY = remainderVal;

    prevA0 = currA1;
    currA1 = nextA2;

    prevB0 = currB1;
    currB1 = nextB2;
  }

  // Return the coefficients (converted back to Number) and the GCD (as BigInt)
  return [Number(prevA0), Number(prevB0), numX];
}
