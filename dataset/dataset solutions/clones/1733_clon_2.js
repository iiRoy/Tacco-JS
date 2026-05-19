"use strict"; // Enforce strict mode for cleaner code.

// --- Input Processing Utilities ---
// Read raw input from standard input.
var rawData = require("fs").readFileSync("/dev/stdin", "utf8");
// Split input into tokens by spaces or newlines.
var tokenStream = rawData.split(/ |\n/);
// Current index in the token stream.
var tokenIndex = 0;

/**
 * Reads the next token from the stream and converts it to a number.
 * @returns {number} The next number.
 */
function readNextNumber() {
  return +tokenStream[tokenIndex++];
}

/**
 * Reads the next token from the stream as a string.
 * @returns {string} The next string.
 */
function readNextString() {
  return tokenStream[tokenIndex++];
}

/**
 * Reads the next token from the stream and converts it to a BigInt.
 * @returns {BigInt} The next BigInt.
 */
function readNextBigInt() {
  return BigInt(tokenStream[tokenIndex++]);
}

/**
 * Reads an array of numbers or strings from the stream.
 * @param {number} numElements - The number of elements to read.
 * @param {boolean} asStrings - If true, return strings; otherwise, numbers.
 * @returns {Array<number|string>} An array of elements.
 */
function readNumbersArray(numElements, asStrings) {
  if (asStrings) {
    return tokenStream.slice(tokenIndex, (tokenIndex += numElements));
  } else {
    return tokenStream.slice(tokenIndex, (tokenIndex += numElements)).map((val) => +val);
  }
}

/**
 * Reads a 2D matrix of numbers or strings from the stream.
 * @param {number} numRows - The number of rows.
 * @param {number} numCols - The number of columns.
 * @param {boolean} asStrings - If true, return strings; otherwise, numbers.
 * @returns {Array<Array<number|string>>} A 2D array (matrix).
 */
function readMatrix(numRows, numCols, asStrings) {
  var resultMatrix = [];
  var rowIdx = 0;
  if (asStrings) {
    for (; rowIdx < numRows; rowIdx++) {
      resultMatrix.push(tokenStream.slice(tokenIndex, (tokenIndex += numCols)));
    }
  } else {
    for (; rowIdx < numRows; rowIdx++) {
      resultMatrix.push(tokenStream.slice(tokenIndex, (tokenIndex += numCols)).map((val) => +val));
    }
  }
  return resultMatrix;
}

/**
 * Creates a multi-dimensional array initialized with a value.
 * This function uses eval, which can be risky in untrusted environments.
 * @param {*} initialValue - The value to initialize array elements with.
 * @param {...number} dimensions - The dimensions of the array.
 * @returns {Array} The multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
  var args = arguments;
  var argCount = args.length;
  var evalString = "Array(args[" + --argCount + "]).fill().map(x=>{return " + initialValue + ";})";
  while (--argCount) {
    evalString = "Array(args[" + argCount + "]).fill().map(x=>" + evalString + ")";
  }
  return eval(evalString);
}

// --- Modular Arithmetic Constants and Functions ---
var primeModulus = 1000000007; // A common prime modulus (10^9 + 7)

/**
 * Multiplies multiple numbers modulo primeModulus.
 * Uses a specific optimization for multiplication with large numbers.
 * @param {...number} factors - Numbers to multiply.
 * @returns {number} The product modulo primeModulus.
 */
function multiplyMod() {
  var factors = arguments;
  var currentProduct = factors[0];
  for (var i = factors.length; --i;) {
    currentProduct = ((currentProduct >>> 16) * factors[i] % primeModulus * 65536 + (currentProduct & 65535) * factors[i]) % primeModulus;
  }
  return currentProduct;
}

// Arrays for precomputed factorials, inverse factorials, and modular inverses.
var factorials = [];
var invFactorials = [];
// var modularInverses = []; // Not used in the original code's active path.
// var powersOfTwo = [];     // Not used in the original code's active path.

/**
 * Precomputes factorials and inverse factorials up to a given number.
 * @param {number} limit - The upper limit for precomputation.
 */
function precomputeFactorials(limit) {
  factorials.length = limit + 1;
  factorials[0] = factorials[1] = 1;
  for (var i = 2; i <= limit;) {
    factorials[i] = multiplyMod(factorials[i - 1], i++);
  }

  invFactorials.length = limit + 1;
  invFactorials[0] = invFactorials[1] = 1;
  invFactorials[limit] = modularInverse(factorials[limit]);
  for (i = limit; 2 < i;) {
    invFactorials[i - 1] = multiplyMod(invFactorials[i], i--);
  }

  // The following lines were commented out in the original code.
  // modularInverses.length = limit + 1;
  // modularInverses[0] = modularInverses[1] = 1;
  // for (i = 2; i <= limit;) {
  //   modularInverses[i] = multiplyMod(factorials[i - 1], invFactorials[i++]);
  // }
  // powersOfTwo.length = limit + 1;
  // powersOfTwo[0] = 1;
  // for (i = 1; i <= limit; i++) {
  //   powersOfTwo[i] = powersOfTwo[i - 1] * 2 % primeModulus;
  // }
}

/**
 * Computes the modular multiplicative inverse of a number 'b' modulo 'primeModulus'.
 * Uses the extended Euclidean algorithm.
 * @param {number} b - The number to find the inverse of.
 * @returns {number} The modular inverse.
 */
function modularInverse(b) {
  var a = primeModulus;
  var u = 0, v = 1;
  var temp;
  while (b) {
    temp = Math.floor(a / b); // Integer division
    a -= temp * b;
    u -= temp * v;
    // Swap a, b and u, v
    temp = a; a = b; b = temp;
    temp = u; u = v; v = temp;
  }
  u %= primeModulus;
  return u < 0 ? u + primeModulus : u;
}

/**
 * Computes (base^exponent) modulo primeModulus using binary exponentiation.
 * @param {number} base - The base.
 * @param {number} exponent - The exponent.
 * @returns {number} (base^exponent) % primeModulus.
 */
function powerMod(base, exponent) {
  var result = 1;
  while (exponent) {
    if (exponent & 1) { // If exponent is odd
      result = multiplyMod(base, result);
    }
    base = multiplyMod(base, base);
    exponent >>= 1; // Divide exponent by 2
  }
  return result;
}

/**
 * Computes nCr (n choose r) modulo primeModulus.
 * Requires factorials and inverse factorials to be precomputed.
 * @param {number} n - Total items.
 * @param {number} r - Items to choose.
 * @returns {number} nCr % primeModulus.
 */
function nCrMod(n, r) {
  return multiplyMod(factorials[n], invFactorials[r], invFactorials[n - r]);
}

/**
 * Computes nPr (n permute r) modulo primeModulus.
 * Requires factorials and inverse factorials to be precomputed.
 * @param {number} n - Total items.
 * @param {number} r - Items to permute.
 * @returns {number} nPr % primeModulus.
 */
function nPrMod(n, r) {
  return multiplyMod(factorials[n], invFactorials[n - r]);
}

/**
 * Normalizes a number to be within [0, primeModulus-1].
 * @param {number} num - The number to normalize.
 * @returns {number} The normalized number.
 */
function normalizeMod(num) {
  return (num % primeModulus + primeModulus) % primeModulus;
}

// --- Main Program Execution ---
// Set a time limit for operations, potentially for debugging or specific problem constraints.
var timeLimit = +(new Date()) + 1900; // Original `tm` variable.

// Execute the main logic and store its result.
var programResult = executeProgram();

// If the main program returns a value, print it to console.
if (programResult !== undefined) {
  console.log(String(programResult));
}

/**
 * The core logic of the program.
 * Solves a problem involving BigInt XOR operations and bit manipulation.
 * @returns {BigInt|number} The final answer or -1 if a condition is met.
 */
function executeProgram() {
  var countElements = readNextNumber(); // Renamed 'n'
  var firstVal = readNextBigInt();     // Renamed 'a1'
  var secondVal = readNextBigInt();    // Renamed 'a2'

  var xorSumOthers = 0n; // Renamed 'x'
  // Calculate XOR sum of elements from index 2 to n-1
  for (var loopCounter = 2; loopCounter < countElements; loopCounter++) {
    xorSumOthers ^= readNextBigInt();
  }

  var finalAnswer = 0n; // Renamed 'ans'
  var currentXor = firstVal ^ secondVal ^ xorSumOthers; // Renamed 'a'

  // Loop until currentXor becomes 0
  while (currentXor !== 0n) {
    // Check for specific conditions that might lead to an early exit.
    // The `new Date() > timeLimit` check suggests a time-sensitive constraint.
    if (firstVal === 1n || new Date() > timeLimit) { // Changed 1 to 1n for BigInt comparison
      return -1;
    }

    // Iterate through bits from 40 down to 0
    for (var bitPosition = 40; bitPosition >= 0; bitPosition--) {
      var bitMask = 1n << BigInt(bitPosition); // Renamed 'k'

      // If the currentXor doesn't have this bit set, skip.
      if ((currentXor & bitMask) === 0n) {
        continue;
      }

      var transferAmount; // Renamed 'u'
      // Calculate potential transfer amount based on firstVal and bitMask
      transferAmount = (firstVal & (bitMask - 1n)) + 1n;
      // Adjust transfer amount based on secondVal and bitMask
      transferAmount = findMinimum(transferAmount, bitMask - (secondVal & (bitMask - 1n)));

      // If the calculated transfer amount is less than firstVal, apply it.
      if (transferAmount < firstVal) {
        finalAnswer += transferAmount;
        firstVal -= transferAmount;
        secondVal += transferAmount;
        break; // Break from inner loop, re-evaluate currentXor
      } else {
        // If transferAmount is not less than firstVal, it's an invalid state.
        return -1;
      }
    }
    // Recalculate currentXor after modifications to firstVal and secondVal.
    currentXor = firstVal ^ secondVal ^ xorSumOthers;
  }
  return finalAnswer;
}

/**
 * Helper function to find the minimum of two BigInts.
 * @param {BigInt} valA - The first BigInt.
 * @param {BigInt} valB - The second BigInt.
 * @returns {BigInt} The smaller of the two BigInts.
 */
function findMinimum(valA, valB) {
  return valA > valB ? valB : valA;
}
