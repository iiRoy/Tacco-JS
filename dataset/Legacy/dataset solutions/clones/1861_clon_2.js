"use strict";

/*
 * This script processes coordinate pairs from standard input.
 * It counts specific zero coordinates and calculates a result based on
 * normalized coordinate frequencies using modular arithmetic.
 */

// Acquire the file system module and read input data
const dataStream = require("fs")
  .readFileSync("/dev/stdin", "utf8");

// Split input into tokens using spaces or newlines as delimiters,
// and initialize a pointer to the current token position.
let tokenStream = dataStream.split(/ |\n/),
  tokenPosition = 0;

/*
 * Helper functions to parse input tokens from the tokenStream.
 */

// Retrieves the next token from the stream and converts it to a number.
function getNextNumericValue() {
  return +tokenStream[tokenPosition++];
}

// Retrieves the next token from the stream as a raw string.
function getNextStringValue() {
  return tokenStream[tokenPosition++];
}

// Retrieves the next token from the stream and converts it to a BigInt.
function getNextBigIntValue() {
  return BigInt(tokenStream[tokenPosition++]);
}

// Retrieves a sequence of 'countElements' tokens from the stream.
// If 'isRaw' is true, tokens are returned as strings; otherwise, they are converted to numbers.
function getSequence(countElements, isRaw) {
  return isRaw ? tokenStream.slice(tokenPosition, (tokenPosition += countElements)) :
    tokenStream.slice(tokenPosition, (tokenPosition += countElements)).map(val => +val);
}

// Retrieves a matrix of 'rowsNum' rows and 'colsNum' columns from the stream.
// If 'isTextMatrix' is true, matrix elements are strings; otherwise, they are numbers.
function getMatrix(rowsNum, colsNum, isTextMatrix) {
  let matrixRows = [],
    rowIter = 0;
  if (isTextMatrix) {
    for (; rowIter < rowsNum; rowIter++)
      matrixRows.push(tokenStream.slice(tokenPosition, (tokenPosition += colsNum)));
  } else {
    for (; rowIter < rowsNum; rowIter++)
      matrixRows.push(tokenStream.slice(tokenPosition, (tokenPosition += colsNum)).map(item => +item));
  }
  return matrixRows;
}

// Dynamically creates a multi-dimensional array with specified dimensions and an initial value.
// The first argument is the 'initialItemValue', followed by dimension sizes.
function generateMultidimArray(initialItemValue) {
  let dimensionArguments = arguments,
    argLength = dimensionArguments.length,
    // Constructs a string expression to create the array
    arrayCreationExpression = "Array(dimensionArguments[" + --argLength + "]).fill().map(placeholderItem => { return " + initialItemValue + "; })";
  while (--argLength)
    arrayCreationExpression = "Array(dimensionArguments[" + argLength + "]).fill().map(placeholderItem => " + arrayCreationExpression + ")";
  // Evaluates the constructed expression to create and return the array.
  return eval(arrayCreationExpression);
}

/*
 * Mathematical utility functions for number theory and modular arithmetic.
 */

// Computes the greatest common divisor (GCD) of two BigInts using the Euclidean algorithm.
function findGreatestCommonDivisor(valOne, valTwo) {
  return valTwo ? findGreatestCommonDivisor(valTwo, valOne % valTwo) : valOne;
}

// Defines a large prime number to be used as a modulus for all modular arithmetic operations.
const primeModulo = 1_000_000_007;

// Performs modular multiplication (operandX * operandY) % primeModulo efficiently.
// This uses bit manipulation to avoid potential overflow for large intermediate products.
function modularMultiply(operandX, operandY) {
  return ((operandX >> 16) * operandY % primeModulo * 65536 + (operandX & 65535) * operandY) % primeModulo;
}

// Computes modular exponentiation (baseValue ^ exponentValue % primeModulo) using binary exponentiation.
function modularPower(baseValue, exponentValue) {
  let powerResult = 1; // Initialize result to 1
  for (; exponentValue; baseValue = modularMultiply(baseValue, baseValue), exponentValue >>= 1)
    if (exponentValue & 1) powerResult = modularMultiply(baseValue, powerResult); // If exponent is odd, multiply result
  return powerResult;
}

// Normalizes an input number to be within the positive range [0, primeModulo - 1].
function normalizeToModulo(inputNumber) {
  return (inputNumber % primeModulo + primeModulo) % primeModulo;
}

/*
 * Main program execution flow.
 */

// Executes the primary logic function and stores its computed result.
let calculatedResult = processMainLogic();

// If the main logic returns a value (i.e., not undefined), print it to the console.
if (calculatedResult !== undefined)
  console.log(calculatedResult);

/*
 * The core logic of the program, processing coordinate pairs and calculating a final answer.
 */
function processMainLogic() {
  const inputCount = getNextNumericValue(); // Read the total number of coordinate pairs to process.

  let countZeroA = 0, // Counter for pairs where the first coordinate (X) is zero.
    countZeroB = 0, // Counter for pairs where the second coordinate (Y) is zero.
    countBothZero = 0; // Counter for pairs where both coordinates (X and Y) are zero.

  // An object to store frequencies of normalized coordinate pairs.
  // Keys will be BigInts (converted to strings when used as object keys), values will be nested objects.
  let coordinateFrequency = {};

  // Loop through each input coordinate pair.
  for (let idxLoop = 0; idxLoop < inputCount; idxLoop++) {
    let coordX = getNextBigIntValue(), // Read the first coordinate.
      coordY = getNextBigIntValue(); // Read the second coordinate.

    // Handle special cases where one or both coordinates are zero.
    if (coordX === 0n && coordY === 0n) {
      countBothZero++; // Increment count for (0,0) pairs.
      continue; // Move to the next pair.
    }
    if (coordX === 0n) {
      countZeroA++; // Increment count for (0, Y) pairs where Y is not zero.
      continue; // Move to the next pair.
    }
    if (coordY === 0n) {
      countZeroB++; // Increment count for (X, 0) pairs where X is not zero.
      continue; // Move to the next pair.
    }

    // For non-zero coordinates, normalize them by dividing by their greatest common divisor.
    let divisorVal = findGreatestCommonDivisor(coordX, coordY);
    coordX /= divisorVal;
    coordY /= divisorVal;

    // Ensure the first coordinate is positive for consistent mapping in the frequency object.
    // If coordX is negative, negate both coordinates.
    if (coordX < 0n) {
      coordX = -coordX;
      coordY = -coordY;
    }

    // Update the frequency map for the normalized coordinate pair.
    // The value stored is '2' or 'frequency * 2', potentially adjusted by modulo.
    if (coordinateFrequency[coordX]) { // Check if an entry for coordX exists.
      if (coordinateFrequency[coordX][coordY]) { // Check if an entry for coordY under coordX exists.
        coordinateFrequency[coordX][coordY] = (coordinateFrequency[coordX][coordY] * 2);
        // Apply modulo if the value exceeds it.
        if (coordinateFrequency[coordX][coordY] >= primeModulo)
          coordinateFrequency[coordX][coordY] -= primeModulo;
      } else {
        coordinateFrequency[coordX][coordY] = 2; // Initialize with 2 if not present.
      }
    } else { // If no entry for coordX exists, create it and initialize the nested entry.
      coordinateFrequency[coordX] = {};
      coordinateFrequency[coordX][coordY] = 2;
    }
  }

  // Calculate an initial part of the final answer based on the counts of zero coordinates.
  // This uses modular exponentiation.
  let finalResult = modularPower(2, countZeroA) + modularPower(2, countZeroB) - 1;

  // Iterate through the `coordinateFrequency` map to incorporate contributions from non-zero pairs.
  for (let idxLoop in coordinateFrequency) { // Iterates over keys (string representation of coordX).
    for (let innerIdxLoop in coordinateFrequency[idxLoop]) { // Iterates over keys (string representation of coordY).
      let tempSum = 0; // Temporary variable to accumulate contributions for the current pair.

      // Check for complementary pairs (e.g., (X, Y) vs (-X, -Y) or (X, -Y) vs (-X, Y)).
      // `innerIdxLoop` is a string. Comparing it to "0" numerically converts it.
      if (innerIdxLoop < "0") {
        // If innerIdxLoop represents a negative number (e.g., "-1"), check if its positive counterpart
        // has already been processed as a main key. This prevents double-counting pairs like (1,-1) and (-1,1).
        if (coordinateFrequency[innerIdxLoop.slice(1)] && coordinateFrequency[innerIdxLoop.slice(1)][idxLoop])
          continue; // Skip if already handled.
      } else {
        // If innerIdxLoop represents a positive number, check if a complementary pair exists.
        // For a pair (idxLoop, innerIdxLoop), we look for (innerIdxLoop, -idxLoop).
        if (coordinateFrequency[innerIdxLoop] && coordinateFrequency[innerIdxLoop]["-" + idxLoop])
          tempSum = coordinateFrequency[innerIdxLoop]["-" + idxLoop] - 1;
      }

      // Add the frequency of the current pair to the temporary sum.
      tempSum += coordinateFrequency[idxLoop][innerIdxLoop];

      // Multiply the running final result by the calculated temporary sum, applying modulo.
      finalResult = modularMultiply(finalResult, tempSum);
    }
  }

  // Return the final result, normalized to the modulo,
  // and adjusted by subtracting 1 and adding the count of (0,0) pairs.
  return normalizeToModulo(finalResult - 1 + countBothZero);
}