"use strict";
// This module provides a utility for parsing input from a string, typically read from stdin.
var INPUT_PARSER = (function() {
  /**
   * Creates a new input reader instance.
   * @param {string} rawInputString - The raw input string, possibly multi-line.
   * @returns {InputReader} A new InputReader object.
   */
  function createParser(rawInputString) {
    return new InputReader(rawInputString);
  }

  /**
   * InputReader class to handle parsing lines and tokens.
   * @class
   * @param {string} initialString - The string content to parse.
   */
  function InputReader(initialString) {
    // Split the input string into lines and trim whitespace from each.
    this._sourceLines = initialString.trim().split("\n");
    // Initialize the current line index.
    this._currentLineIndex = 0;
  }

  /**
   * Reads a single token (number or string) from the current line.
   * Tokens are read from right to left on a line.
   * @param {boolean} [asString=false] - If true, returns the token as a string; otherwise, as a number.
   * @returns {string|number} The parsed token.
   */
  InputReader.prototype.readAtom = function(asString) {
    let lineContent = this._sourceLines;
    let lineIdx = this._currentLineIndex;
    let resultVal;

    // If the current line hasn't been processed into an array of tokens yet, do so.
    if (typeof lineContent[lineIdx] === "string") {
      lineContent[lineIdx] = lineContent[lineIdx].split(" ").reverse();
    }

    // Pop the last token (which was originally the first due to reverse).
    resultVal = lineContent[lineIdx].pop();

    // If the current line is now empty, advance to the next line.
    if (!lineContent[lineIdx].length) {
      this._currentLineIndex++;
    }

    // Return as string or convert to number.
    return asString ? resultVal : +resultVal;
  };

  /**
   * Reads an entire line of space-separated tokens.
   * @param {boolean} [asStrings=false] - If true, returns tokens as strings; otherwise, as numbers.
   * @returns {Array<string|number>} An array of parsed tokens.
   */
  InputReader.prototype.readLine = function(asStrings) {
    // Get the current line, split by space, and advance the line index.
    let tokens = this._sourceLines[this._currentLineIndex++].split(" ");
    // Return as strings or map to numbers.
    return asStrings ? tokens : tokens.map(item => +item);
  };

  /**
   * Reads a block of 'numRows' lines, where each line is a row of space-separated tokens.
   * @param {number} numRows - The number of rows to read.
   * @param {boolean} [asStrings=false] - If true, returns tokens as strings; otherwise, as numbers.
   * @returns {Array<Array<string|number>>} A 2D array (matrix) of parsed tokens.
   */
  InputReader.prototype.readMatrix = function(numRows, asStrings) {
    // Slice the relevant lines and split each into tokens.
    let matrixRows = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numRows).map(item => item.split(" "));
    // Return as strings or map all tokens to numbers.
    return asStrings ? matrixRows : matrixRows.map(row => row.map(item => +item));
  };

  /**
   * Reads a block of 'numRows' lines, where each line is a single token.
   * @param {number} numRows - The number of rows to read.
   * @param {boolean} [asStrings=false] - If true, returns tokens as strings; otherwise, as numbers.
   * @returns {Array<string|number>} An array of parsed tokens.
   */
  InputReader.prototype.readRows = function(numRows, asStrings) {
    // Slice the relevant lines.
    let singleTokens = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numRows);
    // Return as strings or map to numbers.
    return asStrings ? singleTokens : singleTokens.map(item => +item);
  };

  return createParser;
})();

// Initialize the input parser with content from standard input.
var inputData = INPUT_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Creates a multi-dimensional array initialized with a specific value.
 * The dimensions are passed as arguments after the initial value.
 * Example: multiDimArray(0, 2, 3) creates a 2x3 array filled with 0s.
 * @param {*} initialValue - The value to initialize array elements with.
 * @param {...number} dimensions - The dimensions of the array.
 * @returns {Array} The multi-dimensional array.
 */
function multiDimArray(initialValue) {
  let argsList = arguments;
  let argCount = argsList.length;
  // Build the array creation string dynamically.
  let arrayCreationString = "Array(argsList[" + --argCount + "]).fill(0).map(x=>{return " + initialValue + ";})";
  while (--argCount) {
    arrayCreationString = "Array(argsList[" + argCount + "]).fill(0).map(x=>" + arrayCreationString + ")";
  }
  // Evaluate the string to create the array.
  return eval(arrayCreationString);
}

// A prime modulus used for all modular arithmetic operations.
var primeModulus = 998244353;

/**
 * Performs modular multiplication of multiple numbers.
 * @param {...number} factors - Numbers to multiply.
 * @returns {number} The product modulo primeModulus.
 */
function multiplyMod() {
  let factors = arguments;
  let productResult = factors[0];
  // Iterate through factors, applying modular multiplication.
  for (let loopCounter = factors.length; --loopCounter;) {
    // This specific multiplication method is optimized for large numbers to prevent overflow before modulo.
    // It splits numbers into 16-bit parts.
    productResult = ((productResult >> 16) * factors[loopCounter] % primeModulus * 65536 + (productResult & 65535) * factors[loopCounter]) % primeModulus;
  }
  return productResult;
}

// Global variables for precomputed factorials and inverse factorials.
var factorialN = 1;
var inverseFactorials = [];

/**
 * Precomputes factorials and their modular inverses up to a given upper bound.
 * This function uses a specific optimization for very large bounds.
 * @param {number} upperBound - The maximum number for which to compute factorials.
 */
function precomputeFactorials(upperBound) {
  // Optimization for smaller bounds.
  if (upperBound < 8500000) {
    for (let idx = 2; idx <= upperBound; idx++) {
      factorialN = factorialN * idx % primeModulus;
    }
    inverseFactorials.length = upperBound + 1;
    inverseFactorials[0] = inverseFactorials[1] = 1;
    inverseFactorials[upperBound] = modularInverse(factorialN);
    for (idx = upperBound; 2 < idx; idx--) {
      inverseFactorials[idx - 1] = inverseFactorials[idx] * idx % primeModulus;
    }
  } else { // Handling for very large bounds, using precomputed value and optimized multiplication.
    factorialN = 488985182; // A specific precomputed value for 8500000! % primeModulus
    for (let idx = 8500001; idx <= upperBound; idx++) {
      factorialN = multiplyMod(factorialN, idx);
    }
    inverseFactorials.length = upperBound + 1;
    inverseFactorials[0] = inverseFactorials[1] = 1;
    inverseFactorials[upperBound] = modularInverse(factorialN);
    for (idx = upperBound; 2 < idx; idx--) {
      inverseFactorials[idx - 1] = multiplyMod(inverseFactorials[idx], idx);
    }
  }
}

/**
 * Computes the modular multiplicative inverse of 'a' modulo 'primeModulus' using the extended Euclidean algorithm.
 * @param {number} valA - The number for which to find the inverse.
 * @returns {number} The modular inverse.
 */
function modularInverse(valA) {
  let valB = primeModulus;
  let coeffU = 1;
  let coeffV = 0;
  let tempVar;

  while (valB) {
    tempVar = Math.floor(valA / valB); // Integer division
    valA -= tempVar * valB;
    coeffU -= tempVar * coeffV;
    tempVar = valA;
    valA = valB;
    valB = tempVar;
    tempVar = coeffU;
    coeffU = coeffV;
    coeffV = tempVar;
  }
  coeffU %= primeModulus;
  return coeffU < 0 ? coeffU + primeModulus : coeffU;
}

/**
 * Computes (baseVal ^ exponentVal) % primeModulus using binary exponentiation (exponentiation by squaring).
 * @param {number} baseVal - The base.
 * @param {number} exponentVal - The exponent.
 * @returns {number} The result of the modular exponentiation.
 */
function modularPower(baseVal, exponentVal) {
  let powerResult = 1;
  while (exponentVal) {
    if (exponentVal & 1) { // If exponentVal is odd
      powerResult = multiplyMod(baseVal, powerResult);
    }
    baseVal = multiplyMod(baseVal, baseVal); // Square the base
    exponentVal >>= 1; // Divide exponentVal by 2
  }
  return powerResult;
}

/**
 * Computes "n choose r" (combinations) modulo primeModulus.
 * Requires precomputed factorials and inverse factorials.
 * @param {number} totalItems - The total number of items.
 * @param {number} chosenItems - The number of items to choose.
 * @returns {number} The number of combinations modulo primeModulus.
 */
function combinations(totalItems, chosenItems) {
  // C(n, r) = n! / (r! * (n-r)!) = n! * (r!)^-1 * ((n-r)!)^-1
  return multiplyMod(factorialN, inverseFactorials[chosenItems], inverseFactorials[totalItems - chosenItems]);
}

// Output the result of the main problem-solving function.
console.log(solveProblem());

/**
 * Main function to solve the problem.
 * Reads input 'n', calculates an initial answer, then adjusts it based on combinations and powers of 2.
 * @returns {number} The final calculated answer modulo primeModulus.
 */
function solveProblem() {
  var inputN = inputData.readAtom(); // Read the single integer 'n' from input.
  var finalAnswer = modularPower(3, inputN); // Calculate 3^n mod primeModulus.

  precomputeFactorials(inputN); // Precompute factorials up to 'n'.

  var powerOfTwo = 1; // Initialize a variable to track powers of 2.

  // Loop from n down to n/2 (exclusive of n/2 for 'i', inclusive for 'm').
  // The loop condition `m < i` means `i` goes from `n` down to `m+1`.
  for (var loopIndex = inputN, midpointN = inputN >> 1; midpointN < loopIndex; loopIndex--) {
    powerOfTwo += powerOfTwo; // Equivalent to powerOfTwo *= 2.
    if (primeModulus <= powerOfTwo) {
      powerOfTwo -= primeModulus; // Apply modulo if it exceeds or equals primeModulus.
    }
    // Subtract (nCr(n, i) * 2^k) from the answer.
    finalAnswer -= multiplyMod(combinations(inputN, loopIndex), powerOfTwo);
  }

  finalAnswer %= primeModulus; // Ensure the final answer is within the modulus range.
  // Adjust negative results to be positive within the modulus.
  return finalAnswer < 0 ? finalAnswer + primeModulus : finalAnswer;
}
