"use strict";
// This module provides utilities for parsing input data from a string.
var INPUT_PARSER = (function () {
  /**
   * Creates a new input parser instance.
   * @param {string} inputString - The raw input string to parse.
   * @returns {InputHandler} A new InputHandler object.
   */
  function createParser(inputString) {
    return new InputHandler(inputString);
  }

  /**
   * Handles parsing of input lines.
   * @class
   * @param {string} rawInput - The complete input string.
   */
  function InputHandler(rawInput) {
    // Store input lines, trimmed and split by newline.
    this._lines = rawInput.trim().split("\n");
    // Current line index for sequential reading.
    this._currentLineIndex = 0x0;
  }

  /**
   * Reads the next value from the current line, treating it as a stack (LIFO).
   * If the current line is exhausted, it moves to the next line.
   * @param {boolean} asString - If true, returns the value as a string; otherwise, as a number.
   * @returns {string|number} The extracted value.
   */
  InputHandler.prototype.readNextValue = function (asString) {
    var lineData = this._lines,
      currentIndex = this._currentLineIndex,
      extractedValue;

    // If the current line hasn't been split into parts yet, do so and reverse for LIFO.
    if (typeof lineData[currentIndex] === "string") {
      lineData[currentIndex] = lineData[currentIndex].split(" ").reverse();
    }

    // Pop the last element (which was the first in the original order).
    extractedValue = lineData[currentIndex].pop();

    // If the current line is now empty, advance to the next line.
    if (!lineData[currentIndex].length) {
      this._currentLineIndex++;
    }

    // Return as string or convert to number.
    return asString ? extractedValue : +extractedValue;
  };

  /**
   * Reads all values from the current line and advances to the next line.
   * @param {boolean} returnStrings - If true, returns values as strings; otherwise, as numbers.
   * @returns {Array<string|number>} An array of values from the line.
   */
  InputHandler.prototype.readLineValues = function (returnStrings) {
    // Split the current line by space and advance the line index.
    var lineParts = this._lines[this._currentLineIndex++].split(" ");
    // Return as strings or map to numbers.
    return returnStrings ? lineParts : lineParts.map((item) => +item);
  };

  /**
   * Reads a specified number of lines as a matrix.
   * Each line is split by space.
   * @param {number} numRows - The number of rows to read.
   * @param {boolean} stringMode - If true, returns values as strings; otherwise, as numbers.
   * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
   */
  InputHandler.prototype.readMatrix = function (numRows, stringMode) {
    // Slice the relevant lines and advance the line index.
    var matrixRows = this._lines
      .slice(this._currentLineIndex, (this._currentLineIndex += numRows))
      .map((row) => row.split(" "));
    // Return as strings or map inner arrays to numbers.
    return stringMode
      ? matrixRows
      : matrixRows.map((row) => row.map((item) => +item));
  };

  /**
   * Reads a specified number of lines as an array of values.
   * Each line is treated as a single value.
   * @param {number} count - The number of lines to read.
   * @param {boolean} keepStrings - If true, returns values as strings; otherwise, as numbers.
   * @returns {Array<string|number>} An array of values.
   */
  InputHandler.prototype.readRows = function (count, keepStrings) {
    // Slice the relevant lines and advance the line index.
    var selectedRows = this._lines.slice(
      this._currentLineIndex,
      (this._currentLineIndex += count)
    );
    // Return as strings or map to numbers.
    return keepStrings ? selectedRows : selectedRows.map((rowContent) => +rowContent);
  };

  return createParser;
})();

// Initialize the input reader by reading from standard input.
var inputReader = INPUT_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Creates a multi-dimensional array initialized with a given value.
 * The dimensions are provided as arguments after the initial value.
 * @param {*} initialValue - The value to initialize array elements with.
 * @param {...number} dimensions - The dimensions of the array (e.g., `initializeMultiDimArray(0, 2, 3)` for a 2x3 array).
 * @returns {Array} The initialized multi-dimensional array.
 */
function initializeMultiDimArray(initialValue) {
  var args = arguments,
    argLength = args.length,
    arrayCreationString =
      "Array(args[" +
      --argLength +
      "]).fill(0).map(x=>{return " +
      initialValue +
      ";})";
  while (--argLength) {
    arrayCreationString =
      "Array(args[" + argLength + "]).fill(0).map(x=>" + arrayCreationString + ")";
  }
  // Using eval is generally discouraged but is part of the original algorithm's structure.
  return eval(arrayCreationString);
}

// Define a prime modulus for arithmetic operations.
var primeModulo = 0x3B800001; // 998244353

/**
 * Performs modular multiplication (operandA * operandB) % primeModulo.
 * Uses bitwise operations for potentially faster multiplication of large numbers.
 * @param {number} operandA - The first operand.
 * @param {number} operandB - The second operand.
 * @returns {number} The result of (operandA * operandB) % primeModulo.
 */
function multiplyModulo(operandA, operandB) {
  // Split operandA into two parts (high 16 bits and low 16 bits)
  // to prevent overflow before modulo, then combine results.
  return (
    ((operandA >>> 0x10) * operandB % primeModulo * 0x10000 +
      (operandA & 0xFFFF) * operandB) %
    primeModulo
  );
}

/**
 * Calculates (baseVal ^ exponentVal) % primeModulo using binary exponentiation (exponentiation by squaring).
 * @param {number} baseVal - The base number.
 * @param {number} exponentVal - The exponent.
 * @returns {number} The result of (baseVal ^ exponentVal) % primeModulo.
 */
function powerModulo(baseVal, exponentVal) {
  for (
    var resultVal = 0x1;
    exponentVal;
    baseVal = multiplyModulo(baseVal, baseVal), exponentVal >>= 0x1
  ) {
    if (exponentVal & 0x1) {
      resultVal = multiplyModulo(baseVal, resultVal);
    }
  }
  return resultVal;
}

// Output the result of the main calculation function.
console.log(calculateResult());

/**
 * Main function to perform the calculation based on input.
 * This function implements the core logic of the problem.
 * @returns {number} The final calculated answer modulo primeModulo.
 */
function calculateResult() {
  // Read the single integer input 'n'.
  var inputN = inputReader.readNextValue();
  // Calculate 3^n modulo primeModulo.
  var finalAnswer = powerModulo(0x3, inputN);
  // Initialize factorial term and half of n.
  var factorialTerm = 0x2,
    halfN = inputN / 0x2;
  // Array to store modular inverses.
  var modularInverses = [];
  // Pre-allocate space for modular inverses.
  modularInverses.length = halfN + 0x2;
  // Base cases for modular inverses.
  modularInverses[0x0] = modularInverses[0x1] = 0x1;

  // Loop to adjust the answer based on a series.
  for (var loopCounter = 0x0; loopCounter < halfN; ) {
    // Subtract the current factorial term from the answer.
    finalAnswer -= factorialTerm;
    // Calculate the next factorial term.
    // This involves (n-i)*2 and the modular inverse of (i+1).
    factorialTerm = multiplyModulo(
      multiplyModulo(factorialTerm, (inputN - loopCounter) * 0x2),
      modularInverses[++loopCounter]
    );
    // Calculate the modular inverse for the next iteration using Fermat's Little Theorem or extended Euclidean algorithm.
    // Here, it uses the property inv[i+1] = mod - (mod / (i+1)) * inv[mod % (i+1)]
    modularInverses[loopCounter + 0x1] =
      primeModulo -
      multiplyModulo(
        modularInverses[primeModulo % (loopCounter + 0x1) | 0x0],
        (primeModulo / (loopCounter + 0x1)) | 0x0
      );
  }

  // Ensure the final answer is positive and within the modulo range.
  finalAnswer %= primeModulo;
  return finalAnswer < 0x0 ? finalAnswer + primeModulo : finalAnswer;
}
