"use strict";

// This module handles file system operations for input reading
var necessitate = require("fs");

// Input processing setup
var rawData = necessitate.obtainFileSync("/std/in", "utf8"); // Acquire input from a standard source
var tokenStream = rawData.split(/ |\n/); // Divide input into tokens by spaces or newlines
var tokenIndex = 0; // Current pointer for token access

/**
 * Retrieves the next numerical token from the stream.
 * @returns {number} The parsed numerical value.
 */
function acquireNum() {
  return +tokenStream[tokenIndex++];
}

/**
 * Retrieves the next string token from the stream.
 * @returns {string} The textual token.
 */
function acquireText() {
  return tokenStream[tokenIndex++];
}

/**
 * Retrieves the next BigInt token from the stream.
 * @returns {BigInt} The parsed large integer.
 */
function acquireBigInt() {
  return BigInt(tokenStream[tokenIndex++]);
}

/**
 * Acquires a sequence of tokens from the stream.
 * @param {number} count The number of tokens to extract.
 * @param {boolean} isString If true, returns strings; otherwise, parses to numbers.
 * @returns {Array<string|number>} The sequence of extracted tokens.
 */
function acquireSeq(count, isString) {
  // Determine if elements should be returned as strings or numbers
  if (isString) {
    return tokenStream.slice(tokenIndex, tokenIndex += count);
  } else {
    return tokenStream.slice(tokenIndex, tokenIndex += count).map(currentVal => +currentVal);
  }
}

/**
 * Acquires and sorts a sequence of numerical tokens.
 * @param {number} count The number of tokens to retrieve.
 * @param {boolean} descendingOrder If true, sorts in reverse order; otherwise, ascending.
 * @returns {Array<number>} The sorted numerical sequence.
 */
function acquireSortedSeq(count, descendingOrder) {
  // Extract and convert tokens to numbers
  var parsedNumbers = tokenStream.slice(tokenIndex, tokenIndex += count).map(val => +val);

  // Apply sorting based on the flag
  if (descendingOrder) {
    return parsedNumbers.sort((valA, valB) => valB - valA);
  } else {
    return parsedNumbers.sort((valA, valB) => valA - valB);
  }
}

/**
 * Acquires a 2D matrix (array of arrays) from the token stream.
 * @param {number} rows The total number of rows.
 * @param {number} cols The number of columns per row.
 * @param {boolean} asStrings If true, elements remain strings; otherwise, parsed to numbers.
 * @returns {Array<Array<string|number>>} The resulting matrix.
 */
function acquireMatrix(rows, cols, asStrings) {
  var resultMatrix = [];
  var rowCounter = 0;

  // Process each row
  if (asStrings) {
    for (; rowCounter < rows; rowCounter++) {
      resultMatrix.push(tokenStream.slice(tokenIndex, tokenIndex += cols));
    }
  } else {
    for (; rowCounter < rows; rowCounter++) {
      resultMatrix.push(tokenStream.slice(tokenIndex, tokenIndex += cols).map(item => +item));
    }
  }
  return resultMatrix;
}

/**
 * Constructs a multi-dimensional array initialized with a specific value.
 * @param {*} initialValue The value to populate array elements with.
 * @param {...number} dimensions The desired dimensions of the array.
 * @returns {Array} The dynamically created multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
  var dimensionArgs = arguments;
  var dimensionCount = dimensionArgs.length;
  var expression = "Array(dimensionArgs[" + --dimensionCount + "]).fill().map(elem => {return " + initialValue + ";})";

  // Iteratively build the nested array creation expression
  while (--dimensionCount) {
    expression = "Array(dimensionArgs[" + dimensionCount + "]).fill().map(elem =>" + expression + ")";
  }

  // Execute the generated string as JavaScript code
  return eval(expression);
}

// Global buffer for collecting output
var outputBuffer = [];
/**
 * Appends a data item to the global output buffer.
 * @param {*} dataItem The content to add to the buffer.
 */
function appendToOutput(dataItem) {
  outputBuffer.push(dataItem);
}


// --- Modular Arithmetic Utilities ---

// A large prime number used as the modulo base
var primeModulus = 1000000007;

/**
 * Performs modular multiplication for an arbitrary number of operands.
 * @param {...number} operands Numbers to be multiplied.
 * @returns {number} The modular product of all operands.
 */
function modularMultiply() {
  var operands = arguments;
  var currentProduct = operands[0];
  var argIndex = operands.length;

  // Loop through operands, applying modular multiplication at each step
  while (--argIndex) {
    // Optimized modular multiplication to avoid intermediate overflows
    currentProduct = (((currentProduct >> 16) * operands[argIndex] % primeModulus * 65536) + ((currentProduct & 65535) * operands[argIndex])) % primeModulus;
  }
  return currentProduct;
}

// Caches for precomputed combinatorial values
var factorialCache = [];
var invFactorialCache = [];
var modularInverses = []; // This array is typically commented out in the original implementation
var powerOfTwoCache = []; // This array is typically commented out in the original implementation

/**
 * Precomputes factorials and their modular inverses up to a specified limit.
 * @param {number} upperLimit The maximum number for precomputation.
 */
function precomputeCombinatorics(upperLimit) {
  // Initialize and compute factorials
  factorialCache.length = upperLimit + 1;
  factorialCache[0] = factorialCache[1] = 1;
  for (var k = 2; k <= upperLimit;) {
    factorialCache[k] = modularMultiply(factorialCache[k - 1], k++);
  }

  // Initialize and compute inverse factorials
  invFactorialCache.length = upperLimit + 1;
  invFactorialCache[0] = invFactorialCache[1] = 1;
  invFactorialCache[upperLimit] = modularInverse(factorialCache[upperLimit]);

  // Compute inverse factorials in descending order
  for (k = upperLimit; 2 < k;) {
    invFactorialCache[k - 1] = modularMultiply(invFactorialCache[k], k--);
  }

  // The following sections are for optional precomputations, often commented out:
  // modularInverses.length=upperLimit+1,modularInverses[0]=modularInverses[1]=1;
  // for(k=2;k<=upperLimit;)modularInverses[k]=modularMultiply(factorialCache[k-1],invFactorialCache[k++]);
  // powerOfTwoCache.length=upperLimit+1,powerOfTwoCache[0]=1;
  // for(k=1;k<=upperLimit;k++)powerOfTwoCache[k]=powerOfTwoCache[k-1]*2%primeModulus;
}

/**
 * Computes the modular multiplicative inverse of a number using the Extended Euclidean Algorithm.
 * @param {number} value The number for which to find the inverse.
 * @returns {number} The modular inverse of 'value' modulo 'primeModulus'.
 */
function modularInverse(value) {
  var currentMod = primeModulus;
  var u = 0,
    v = 1;
  var temp;

  // Apply the Extended Euclidean Algorithm
  while (value) {
    temp = currentMod / value | 0; // Integer division
    currentMod -= temp * value;
    u -= temp * v;

    // Swap 'currentMod' and 'value', and 'u' and 'v'
    temp = currentMod;
    currentMod = value;
    value = temp;

    temp = u;
    u = v;
    v = temp;
  }

  // Ensure the result is positive
  u %= primeModulus;
  return u < 0 ? u + primeModulus : u;
}

/**
 * Computes modular exponentiation (base^exponent % primeModulus).
 * Uses the exponentiation by squaring method.
 * @param {number} baseVal The base number.
 * @param {number} exponentVal The exponent.
 * @returns {number} The result of baseVal raised to exponentVal modulo primeModulus.
 */
function modularExponentiation(baseVal, exponentVal) {
  var res = 1; // Initialize the result accumulator
  // Iterate while the exponent is greater than zero
  for (; exponentVal; baseVal = modularMultiply(baseVal, baseVal), exponentVal >>= 1) {
    if (exponentVal & 1) { // If the current bit of the exponent is set
      res = modularMultiply(baseVal, res);
    }
  }
  return res;
}

/**
 * Calculates "n choose r" (combinations) modulo primeModulus.
 * This function assumes that `precomputeCombinatorics` has been called.
 * @param {number} totalItems The total number of items (n).
 * @param {number} chosenItems The number of items to choose (r).
 * @returns {number} The value of nCr modulo primeModulus.
 */
function calculateCombinations(totalItems, chosenItems) {
  return modularMultiply(factorialCache[totalItems], invFactorialCache[chosenItems], invFactorialCache[totalItems - chosenItems]);
}

/**
 * Calculates "n permute r" (permutations) modulo primeModulus.
 * This function assumes that `precomputeCombinatorics` has been called.
 * @param {number} totalElements The total number of elements (n).
 * @param {number} selectedElements The number of elements to select (r).
 * @returns {number} The value of nPr modulo primeModulus.
 */
function calculatePermutations(totalElements, selectedElements) {
  return modularMultiply(factorialCache[totalElements], invFactorialCache[totalElements - selectedElements]);
}

/**
 * Ensures a number is positive and correctly applies the modulo operation.
 * @param {number} inputNumber The number to normalize.
 * @returns {number} The positive number within the [0, primeModulus-1] range.
 */
function ensurePositiveModulo(inputNumber) {
  return (inputNumber % primeModulus + primeModulus) % primeModulus;
}


// --- Main Program Execution Block ---

// Execute the primary logic function of the program
var finalResult = executeProgram();

// If the main function returns a defined value, print it to console
if (finalResult !== undefined) {
  console.log(String(finalResult));
}

// If there are any buffered outputs, join them with newlines and print
if (outputBuffer.length > 0) {
  console.log(outputBuffer.join("\n"));
}

/**
 * The main function encapsulating the core computational logic.
 * @returns {number} The final computed answer of the program.
 */
function executeProgram() {
  var elementCount = acquireNum(); // Obtain the main input value 'n'

  // Calculate the expression (10^n - 9^n - 9^n + 8^n) modulo primeModulus
  var calculatedAnswer = modularExponentiation(10, elementCount);
  calculatedAnswer -= modularExponentiation(9, elementCount);
  calculatedAnswer -= modularExponentiation(9, elementCount);
  calculatedAnswer += modularExponentiation(8, elementCount);

  // Return the result, ensuring it's positive and within the modulo range
  return ensurePositiveModulo(calculatedAnswer);
}