"use strict";
// This module provides utilities for parsing input data from standard input.
var DATA_PARSER = (function () {
  /**
   * Creates a new input parser instance.
   * @param {string} sourceContent - The raw string content to parse.
   * @returns {InputProcessor} A new input processor object.
   */
  function createParser(sourceContent) {
    return new InputProcessor(sourceContent);
  }

  /**
   * Represents an input processor that reads tokens and lines from a source string.
   * @class
   */
  function InputProcessor(sourceContent) {
    // Stores the input lines as an array of strings.
    this._sourceLines = sourceContent.trim().split("\n");
    // Current line index being processed.
    this._currentLineIndex = 0;
  }

  /**
   * Reads the next token from the current line. If the current line is exhausted,
   * it moves to the next line. Tokens are read from right to left.
   * @param {boolean} [asString=false] - If true, returns the token as a string; otherwise, as a number.
   * @returns {string|number} The next token.
   */
  InputProcessor.prototype.readNextToken = function (asString) {
    let lineArray = this._sourceLines;
    let lineIdx = this._currentLineIndex;
    let resultToken;

    // If the current line hasn't been split into tokens yet, do it.
    // Tokens are reversed so that `pop()` reads from the "left" of the original line.
    if (typeof lineArray[lineIdx] === "string") {
      lineArray[lineIdx] = lineArray[lineIdx].split(" ").reverse();
    }

    // Get the next token.
    resultToken = lineArray[lineIdx].pop();

    // If the current line is now empty, advance to the next line.
    if (!lineArray[lineIdx].length) {
      this._currentLineIndex++;
    }

    // Return as string or number based on the flag.
    return asString ? resultToken : +resultToken;
  };

  /**
   * Reads all tokens from the current line and advances to the next line.
   * @param {boolean} [asString=false] - If true, returns tokens as strings; otherwise, as numbers.
   * @returns {Array<string|number>} An array of tokens from the line.
   */
  InputProcessor.prototype.readLineTokens = function (asString) {
    // Get the current line, split it by space, and advance the line index.
    let tokens = this._sourceLines[this._currentLineIndex++].split(" ");
    // Return as strings or numbers.
    return asString ? tokens : tokens.map((item) => +item);
  };

  /**
   * Reads a specified number of lines, splitting each into tokens.
   * @param {number} count - The number of lines to read.
   * @param {boolean} [asString=false] - If true, returns tokens as strings; otherwise, as numbers.
   * @returns {Array<Array<string|number>>} A 2D array of tokens.
   */
  InputProcessor.prototype.readMatrix = function (count, asString) {
    // Slice the relevant lines, split each into tokens.
    let matrixRows = this._sourceLines
      .slice(this._currentLineIndex, (this._currentLineIndex += count))
      .map((line) => line.split(" "));
    // Return as strings or numbers.
    return asString
      ? matrixRows
      : matrixRows.map((row) => row.map((item) => +item));
  };

  /**
   * Reads a specified number of raw lines.
   * @param {number} count - The number of lines to read.
   * @param {boolean} [asString=false] - If true, returns lines as strings; otherwise, attempts to convert to numbers.
   * @returns {Array<string|number>} An array of lines.
   */
  InputProcessor.prototype.readLines = function (count, asString) {
    // Slice the relevant lines.
    let rawLines = this._sourceLines.slice(
      this._currentLineIndex,
      (this._currentLineIndex += count)
    );
    // Return as strings or numbers.
    return asString ? rawLines : rawLines.map((item) => +item);
  };

  return createParser;
})();

// Initialize the input reader by reading from standard input.
var inputReader = DATA_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Creates a multi-dimensional array initialized with a given value.
 * @param {*} initialValue - The value to initialize array elements with.
 * @param {...number} dimensions - The dimensions of the array (e.g., createMultiDimArray(0, 2, 3) for a 2x3 array).
 * @returns {Array} The created multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
  let args = arguments;
  let argLength = args.length;
  // Build the array creation string from innermost to outermost dimension.
  let arrayCreationString =
    "Array(args[" +
    --argLength +
    "]).fill(0).map(x=>{return " +
    initialValue +
    ";})";
  while (--argLength) {
    arrayCreationString =
      "Array(args[" + argLength + "]).fill(0).map(x=>" + arrayCreationString + ")";
  }
  // Evaluate the string to create the array.
  return eval(arrayCreationString);
}

// Define a prime modulus for arithmetic operations.
var primeModulus = 998244353;

/**
 * Multiplies multiple numbers modulo `primeModulus`.
 * @param {...number} operands - Numbers to multiply.
 * @returns {number} The product modulo `primeModulus`.
 */
function multiplyMod() {
  let operands = arguments;
  let productResult = operands[0];
  // Iterate from the second operand.
  for (let loopCounter = operands.length; --loopCounter; ) {
    // Optimized modular multiplication for numbers up to 2^32.
    // This avoids intermediate results exceeding standard 53-bit integer precision
    // by splitting numbers into high and low 16-bit parts.
    productResult =
      ((productResult >> 16) * operands[loopCounter] % primeModulus * 65536 +
        (productResult & 65535) * operands[loopCounter]) %
      primeModulus;
  }
  return productResult;
}

// Global variables for precomputed factorials and their modular inverses.
var factorialN = 1;
var factorialInverse = [];

/**
 * Precomputes factorials up to a given limit `n` and their modular inverses.
 * Stores results in `factorialN` (for n!) and `factorialInverse` (for (k!)^-1).
 * @param {number} limit - The upper limit for factorial precomputation.
 */
function precomputeFactorials(limit) {
  // Handle large limits efficiently.
  if (limit < 8000000) {
    for (let idx = 2; idx <= limit; idx++) {
      factorialN = (factorialN * idx) % primeModulus;
    }
  } else {
    // If limit is very large, start from a precomputed value (8000000!)
    // and continue multiplication.
    factorialN = 833655840; // This is (8000000!) % primeModulus
    for (let idx = 8000001; idx <= limit; idx++) {
      factorialN = multiplyMod(factorialN, idx);
    }
  }

  // Initialize factorialInverse array.
  factorialInverse.length = limit + 1;
  factorialInverse[0] = factorialInverse[1] = 1;
  // Compute (n!)^-1 using modular inverse.
  factorialInverse[limit] = modularInverse(factorialN);

  // Compute (k!)^-1 for k < n using the relation (k!)^-1 = ((k+1)!)^-1 * (k+1).
  for (let idx = limit; idx > 2; ) {
    factorialInverse[idx - 1] = multiplyMod(factorialInverse[idx], idx--);
  }
}

/**
 * Computes the modular multiplicative inverse of 'a' modulo `primeModulus`
 * using the extended Euclidean algorithm.
 * @param {number} a - The number to find the inverse of.
 * @returns {number} The modular inverse of 'a'.
 */
function modularInverse(a) {
  let modulusB = primeModulus;
  let coeffU = 1,
    coeffV = 0,
    tempVar;

  while (modulusB) {
    tempVar = Math.floor(a / modulusB); // Integer division
    a -= tempVar * modulusB;
    coeffU -= tempVar * coeffV;

    // Swap a, b and u, v
    tempVar = a;
    a = modulusB;
    modulusB = tempVar;

    tempVar = coeffU;
    coeffU = coeffV;
    coeffV = tempVar;
  }

  // Ensure the result is positive.
  coeffU %= primeModulus;
  return coeffU < 0 ? coeffU + primeModulus : coeffU;
}

/**
 * Computes 'base' raised to the power 'exponent' modulo `primeModulus` using
 * binary exponentiation (exponentiation by squaring).
 * @param {number} base - The base number.
 * @param {number} exponent - The exponent.
 * @returns {number} (base^exponent) % primeModulus.
 */
function powerMod(base, exponent) {
  let resultPower = 1;
  while (exponent) {
    // If exponent is odd, multiply result by base.
    if (exponent & 1) {
      resultPower = multiplyMod(base, resultPower);
    }
    // Square the base and halve the exponent.
    base = multiplyMod(base, base);
    exponent >>= 1; // Equivalent to exponent = Math.floor(exponent / 2)
  }
  return resultPower;
}

/**
 * Computes "n choose k" (combinations) modulo `primeModulus`.
 * Requires `precomputeFactorials(n)` to have been called beforehand.
 * @param {number} n - The total number of items.
 * @param {number} k - The number of items to choose.
 * @returns {number} (nCk) % primeModulus.
 */
function combinationsMod(n, k) {
  // nCk = n! / (k! * (n-k)!) = n! * (k!)^-1 * ((n-k)!)^-1
  return multiplyMod(factorialN, factorialInverse[k], factorialInverse[n - k]);
}

// Execute the main logic and print the result.
console.log(calculateSolution());

/**
 * Main function to solve the problem.
 * Reads input N, calculates the required value based on combinations and powers of 3 and 2.
 * @returns {number} The final computed answer modulo `primeModulus`.
 */
function calculateSolution() {
  // Read the input integer N.
  let inputN = inputReader.readNextToken();

  // Initial answer is 3^N.
  let finalAnswer = powerMod(3, inputN);

  // Precompute factorials up to N.
  precomputeFactorials(inputN);

  // Initialize power of 2 for the loop.
  let powerOfTwo = 1;

  // Loop from N down to N/2 (exclusive of N/2 for i, inclusive for m).
  // The original loop condition `m < i` means `i` goes from `n` down to `m+1`.
  // `m = n >> 1` is `floor(n/2)`.
  // So, `i` goes from `n` down to `floor(n/2) + 1`.
  for (let loopIndex = inputN, halfN = inputN >> 1; halfN < loopIndex; loopIndex--) {
    // Double powerOfTwo, ensuring it stays within modulus.
    powerOfTwo += powerOfTwo;
    if (primeModulus <= powerOfTwo) {
      powerOfTwo -= primeModulus;
    }
    // Subtract nCr(N, i) * 2^k from the answer.
    finalAnswer -= multiplyMod(combinationsMod(inputN, loopIndex), powerOfTwo);
  }

  // Ensure the final answer is positive and within modulus.
  finalAnswer %= primeModulus;
  return finalAnswer < 0 ? finalAnswer + primeModulus : finalAnswer;
}
