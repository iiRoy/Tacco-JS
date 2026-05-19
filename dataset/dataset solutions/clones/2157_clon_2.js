"use strict";
// Initialize input processing utilities
var rawData = require("fs").readFileSync("/dev/stdin", "utf8");
var tokenStream = rawData.split(/ |\n/);
var tokenIndex = 0;

/**
 * Retrieves the next token from the input stream.
 * @param {boolean} isString - If true, returns the token as a string; otherwise, as a number.
 * @returns {string|number} The next token.
 */
function getNextToken(isString) {
  return isString ? tokenStream[tokenIndex++] : +tokenStream[tokenIndex++];
}

/**
 * Retrieves a specified number of tokens from the input stream.
 * @param {number} count - The number of tokens to retrieve.
 * @param {function} [mapper] - An optional mapping function to apply to each token.
 * @returns {Array<string|number>} An array of tokens.
 */
function getNextTokens(count, mapper) {
  return mapper ? tokenStream.slice(tokenIndex, tokenIndex += count).map(mapper) : tokenStream.slice(tokenIndex, tokenIndex += count).map(val => +val);
}

/**
 * Retrieves a matrix of tokens from the input stream.
 * @param {number} height - The number of rows.
 * @param {number} width - The number of columns.
 * @param {boolean} [asStrings] - If true, returns tokens as strings; otherwise, as numbers.
 * @returns {Array<Array<string|number>>} The matrix.
 */
function getNextMatrix(height, width, asStrings) {
  var resultMatrix = [],
    rowCounter = 0;
  if (asStrings) {
    for (; rowCounter < height; rowCounter++) resultMatrix.push(tokenStream.slice(tokenIndex, tokenIndex += width));
  } else {
    for (; rowCounter < height; rowCounter++) resultMatrix.push(tokenStream.slice(tokenIndex, tokenIndex += width).map(val => +val));
  }
  return resultMatrix;
}

/**
 * Creates a multi-dimensional array initialized with a given value.
 * @param {*} initialValue - The value to initialize array elements with.
 * @returns {Array} The created multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
  var args = arguments,
    argLength = args.length,
    arrayCreationString = "Array(args[" + --argLength + "]).fill().map(x=>{return " + initialValue + ";})";
  while (--argLength) arrayCreationString = "Array(args[" + argLength + "]).fill().map(x=>" + arrayCreationString + ")";
  return eval(arrayCreationString);
}

// --- Custom 64-bit integer arithmetic functions (using [low_32_bits, high_32_bits] array representation) ---

/**
 * Multiplies two 32-bit integers, returning a 64-bit result.
 * @param {number} factorA - The first 32-bit integer factor.
 * @param {number} factorB - The second 32-bit integer factor.
 * @returns {Array<number>} A 64-bit integer represented as [low_32_bits, high_32_bits].
 */
function multiplyBigInt(factorA, factorB) {
  var highPartA = factorA >>> 16; // Extract high 16 bits of factorA
  var lowPartA = factorA & 0xFFFF; // Extract low 16 bits of factorA
  var highResult = highPartA * factorB;
  var lowResult = lowPartA * factorB;
  lowResult += 0x10000 * (highResult & 0xFFFF); // Add carry from low part of highResult
  highResult = Math.floor(highResult / 0x10000); // Get high part of highResult
  highResult += Math.floor(lowResult / 0x100000000); // Add carry from lowResult
  return [lowResult >>> 0, highResult]; // Return as [unsigned_low, signed_high]
}

/**
 * Adds two 64-bit integers.
 * @param {Array<number>} operandA - The first 64-bit integer [low, high].
 * @param {Array<number>} operandB - The second 64-bit integer [low, high].
 * @returns {Array<number>} The sum as a 64-bit integer [low, high].
 */
function addBigInt(operandA, operandB) {
  var sumLow = operandA[0] + operandB[0];
  var sumHigh = operandA[1] + operandB[1];
  if (sumLow > 0xFFFFFFFF) { // Check for carry from low part
    sumHigh++;
    sumLow -= 0x100000000;
  }
  return [sumLow, sumHigh >> 0]; // Ensure high part is signed 32-bit
}

/**
 * Subtracts one 64-bit integer from another.
 * @param {Array<number>} minuend - The 64-bit integer to subtract from [low, high].
 * @param {Array<number>} subtrahend - The 64-bit integer to subtract [low, high].
 * @returns {Array<number>} The difference as a 64-bit integer [low, high].
 */
function subtractBigInt(minuend, subtrahend) {
  var diffLow = minuend[0] - subtrahend[0];
  var diffHigh = minuend[1] - subtrahend[1];
  if (diffLow < 0) { // Check for borrow from high part
    diffHigh--;
    diffLow += 0x100000000;
  }
  return [diffLow, diffHigh >> 0]; // Ensure high part is signed 32-bit
}

/**
 * Divides a 64-bit integer by two.
 * @param {Array<number>} valueA - The 64-bit integer [low, high].
 * @returns {Array<number>} The result of division by two as a 64-bit integer [low, high].
 */
function divideByTwoBigInt(valueA) {
  // Shift low part right by 1. If high part is odd, carry 0x80000000 to low part.
  return [(valueA[0] >>> 1) + (valueA[1] & 1 ? 0x80000000 : 0), valueA[1] >> 1];
}

/**
 * Compares two 64-bit integers.
 * @param {Array<number>} valueA - The first 64-bit integer [low, high].
 * @param {Array<number>} valueB - The second 64-bit integer [low, high].
 * @returns {number} 1 if valueA > valueB, -1 if valueA < valueB, 0 if equal.
 */
function compareBigInt(valueA, valueB) {
  if (valueA[1] > valueB[1]) return 1;
  if (valueA[1] < valueB[1]) return -1;
  if (valueA[0] > valueB[0]) return 1;
  if (valueA[0] < valueB[0]) return -1;
  return 0;
}

/**
 * Converts a 64-bit integer to its string representation.
 * Handles negative numbers.
 * @param {Array<number>} bigNum - The 64-bit integer [low, high].
 * @returns {string} The string representation of the number.
 */
function bigIntToString(bigNum) {
  var isNegative = 0;
  // Create a mutable copy for internal calculations to avoid side effects on the original array.
  var currentBigNum = [bigNum[0], bigNum[1]];

  if (currentBigNum[1] < 0) {
    isNegative = 1;
    currentBigNum[1] = -currentBigNum[1]; // Make high part positive
    if (currentBigNum[0]) { // If low part is not zero, adjust it and high part for two's complement
      currentBigNum[0] = 0x100000000 - currentBigNum[0];
      currentBigNum[1]--;
    }
  }

  // Constants for division by 100,000 (1e5)
  // 0xFFFFFFFF / 100000 = 42949.67296
  // 0xFFFFFFFF % 100000 = 67296
  var intHighDivisor = 42949; // Math.floor(0xFFFFFFFF / 100000)
  var intLowRemainder = 67296; // 0xFFFFFFFF % 100000

  // Calculate parts for division by 100,000
  var lowPartCalc = currentBigNum[1] * intLowRemainder + currentBigNum[0];
  var highPartCalc = currentBigNum[1] * intHighDivisor + Math.floor(lowPartCalc / 100000);
  lowPartCalc %= 100000;

  var resultString = "";
  if (highPartCalc === 0) {
    resultString += lowPartCalc;
  } else {
    // Pad low part with leading zeros if necessary
    lowPartCalc = ("00000" + lowPartCalc).slice(-5);
    resultString = highPartCalc + lowPartCalc;
  }

  if (isNegative && resultString !== "0") {
    resultString = "-" + resultString;
  }
  return resultString;
}

// Global variables to store categorized numbers and their counts
var zeroCount = 0;
var negativeNumbers = [];
var positiveNumbers = [];
var negativesLength;
var positivesLength;

// Execute the main program logic and print the result if available
var programResult = executeProgram();
if (programResult !== undefined) {
  console.log(programResult);
}

/**
 * Main function to process input and determine the K-th smallest product.
 * @returns {string|number} The K-th smallest product as a string, or 0 if it's a zero product.
 */
function executeProgram() {
  var totalElements = getNextToken();
  var targetRank = getNextToken();

  // Categorize input numbers into negative, positive, or zero
  for (var idx = 0; idx < totalElements; idx++) {
    var currentValue = getNextToken();
    if (currentValue === 0) {
      zeroCount++;
    } else if (currentValue < 0) {
      negativeNumbers.push(currentValue);
    } else {
      positiveNumbers.push(currentValue);
    }
  }

  negativesLength = negativeNumbers.length;
  positivesLength = positiveNumbers.length;

  // Sort numbers for efficient processing in binary search
  negativeNumbers.sort((valA, valB) => valA - valB); // Ascending order
  positiveNumbers.sort((valA, valB) => valA - valB); // Ascending order

  // Calculate the count of negative products
  var intermediateCount = negativesLength * positivesLength;

  if (targetRank <= intermediateCount) {
    // If K falls within the range of negative products, find the K-th negative product
    return solveNegativeProducts(targetRank);
  }

  // Calculate the count of zero products
  // This formula counts pairs (a,0) where a is any non-zero number, plus pairs (0,0)
  intermediateCount += (2 * totalElements - zeroCount - 1) * zeroCount / 2;

  if (targetRank <= intermediateCount) {
    // If K falls within the range of zero products, the K-th product is 0
    return 0;
  }

  // If K is greater than negative and zero products, it must be a positive product
  // Adjust K to be relative to the start of positive products
  return solvePositiveProducts(targetRank - intermediateCount);
}

/**
 * Finds the K-th smallest negative product using binary search.
 * @param {number} targetKth - The rank of the desired negative product.
 * @returns {string} The K-th smallest negative product as a string.
 */
function solveNegativeProducts(targetKth) {
  // Binary search range for negative products.
  // upperBound: Represents -1 (largest possible negative product, closest to zero).
  // lowerBound: Represents -1 - 1e18 (smallest possible negative product, most negative).
  var upperBound = [0xFFFFFFFF, -1]; // Equivalent to -1 in 64-bit signed representation
  var lowerBound = addBigInt(upperBound, multiplyBigInt(-1000000000, 1000000000)); // Approx -1 - 1e18

  // Binary search loop: while (upperBound - lowerBound) > [1,0]
  while (compareBigInt(subtractBigInt(upperBound, lowerBound), [1, 0]) === 1) {
    var midValue = divideByTwoBigInt(addBigInt(upperBound, lowerBound));
    var currentCount = 0;
    var leftPtr = 0;

    // Count products (negativeNumbers[leftPtr] * positiveNumbers[idx]) that are <= midValue
    for (var idx = 0; idx < positivesLength && currentCount < targetKth; idx++) {
      // For a fixed positiveNumbers[idx], as negativeNumbers[leftPtr] increases (becomes less negative),
      // the product negativeNumbers[leftPtr] * positiveNumbers[idx] also increases (becomes less negative).
      // We increment leftPtr as long as the product is less than or equal to midValue.
      // After the loop, leftPtr will be the count of negative numbers whose product with positiveNumbers[idx] is <= midValue.
      while (leftPtr < negativesLength && compareBigInt(multiplyBigInt(negativeNumbers[leftPtr], positiveNumbers[idx]), midValue) <= 0) {
        leftPtr++;
      }
      currentCount += leftPtr;
    }

    if (targetKth <= currentCount) {
      upperBound = midValue; // midValue is a possible answer, try for a larger (less negative) value
    } else {
      lowerBound = midValue; // midValue is too small (too negative), try for a smaller (more negative) value
    }
  }
  return bigIntToString(upperBound);
}

/**
 * Finds the K-th smallest positive product using binary search.
 * @param {number} targetKth - The rank of the desired positive product (relative to other positive products).
 * @returns {string} The K-th smallest positive product as a string.
 */
function solvePositiveProducts(targetKth) {
  // Reverse negative numbers to sort them in descending order (e.g., -1, -2, -3...)
  // This helps in counting products of two negative numbers.
  negativeNumbers.reverse();

  // Binary search range for positive products.
  // upperBound: Represents 1e18 (largest possible positive product).
  // lowerBound: Represents 0 (smallest possible positive product).
  var upperBound = multiplyBigInt(1000000000, 1000000000); // Approx 1e18
  var lowerBound = [0, 0]; // Represents 0

  // Binary search loop: while (upperBound - lowerBound) > [1,0]
  while (compareBigInt(subtractBigInt(upperBound, lowerBound), [1, 0]) === 1) {
    var midValue = divideByTwoBigInt(addBigInt(upperBound, lowerBound));
    var currentCount = 0;

    // Count products (positiveNumbers[idx] * positiveNumbers[leftPtr]) that are <= midValue
    // positiveNumbers are sorted ascending.
    // For a fixed positiveNumbers[idx], as positiveNumbers[leftPtr] decreases, the product decreases.
    // We want to find the largest leftPtr such that product <= midValue.
    for (var idx = 0, leftPtr = positivesLength - 1; idx < positivesLength && currentCount < targetKth; idx++) {
      while (leftPtr > idx && compareBigInt(multiplyBigInt(positiveNumbers[leftPtr], positiveNumbers[idx]), midValue) > 0) {
        leftPtr--;
      }
      if (leftPtr <= idx) break; // No more unique pairs for this idx
      currentCount += leftPtr - idx;
    }

    // Count products (negativeNumbers[idx] * negativeNumbers[leftPtr]) that are <= midValue
    // negativeNumbers are now sorted descending (e.g., -1, -2, -3...).
    // For a fixed negativeNumbers[idx], as negativeNumbers[leftPtr] decreases (becomes more negative),
    // the product negativeNumbers[leftPtr] * negativeNumbers[idx] increases (becomes more positive).
    // We want to find the largest leftPtr such that product <= midValue.
    for (var idx = 0, leftPtr = negativesLength - 1; idx < negativesLength && currentCount < targetKth; idx++) {
      while (leftPtr > idx && compareBigInt(multiplyBigInt(negativeNumbers[leftPtr], negativeNumbers[idx]), midValue) > 0) {
        leftPtr--;
      }
      if (leftPtr <= idx) break; // No more unique pairs for this idx
      currentCount += leftPtr - idx;
    }

    if (targetKth <= currentCount) {
      upperBound = midValue; // midValue is a possible answer, try for a smaller value
    } else {
      lowerBound = midValue; // midValue is too small, try for a larger value
    }
  }
  return bigIntToString(upperBound);
}
