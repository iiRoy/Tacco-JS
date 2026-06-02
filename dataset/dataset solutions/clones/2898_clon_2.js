// This module provides utilities for parsing input data from standard input.
var INPUT_PARSER = (function() {
  /**
   * Creates a new input parser instance.
   * @param {string} rawInputString - The complete input string.
   * @returns {InputHandler} A new input handler object.
   */
  function createParser(rawInputString) {
    return new InputHandler(rawInputString);
  }

  /**
   * Handles parsing of input lines.
   * @class
   * @param {string} initialString - The string containing all input lines.
   */
  function InputHandler(initialString) {
    // Store input lines, trimmed and split by newline.
    this._sourceLines = initialString.trim().split("\n");
    // Current line index for reading.
    this._currentLineIndex = 0x0;
  }

  /**
   * Reads the next value from the current line. If the current line is exhausted,
   * it moves to the next line. Values are read from right to left on a line.
   * @param {boolean} [returnAsString=false] - If true, returns the value as a string; otherwise, as a number.
   * @returns {string|number} The extracted value.
   */
  InputHandler.prototype.extractNumber = function(returnAsString) {
    var lineArray = this._sourceLines;
    var lineIdx = this._currentLineIndex;
    var extractedVal;

    // If the current line hasn't been processed into a reversed array yet, do it.
    if (typeof lineArray[lineIdx] === "string") {
      lineArray[lineIdx] = lineArray[lineIdx].split(" ").reverse();
    }

    // Pop the last element (which is the first in original order after reverse).
    extractedVal = lineArray[lineIdx].pop();

    // If the current line is now empty, advance to the next line.
    if (!lineArray[lineIdx].length) {
      this._currentLineIndex++;
    }

    // Return as string or convert to number.
    return returnAsString ? extractedVal : +extractedVal;
  };

  /**
   * Reads an entire line and returns its space-separated values.
   * Advances the line pointer.
   * @param {boolean} [returnAsString=false] - If true, returns values as strings; otherwise, as numbers.
   * @returns {string[]|number[]} An array of values from the line.
   */
  InputHandler.prototype.getLineAsArray = function(returnAsString) {
    var currentLineValues = this._sourceLines[this._currentLineIndex++].split(" ");
    return returnAsString ? currentLineValues : currentLineValues.map(item => +item);
  };

  /**
   * Reads 'count' number of lines and parses them as a 2D array of numbers.
   * Advances the line pointer by 'count'.
   * @param {number} count - The number of lines to read.
   * @param {boolean} [returnAsString=false] - If true, returns values as strings; otherwise, as numbers.
   * @returns {string[][]|number[][]} A 2D array of values.
   */
  InputHandler.prototype.getMultiLineArray = function(count, returnAsString) {
    var resultMatrix = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += count).map(line => line.split(" "));
    return returnAsString ? resultMatrix : resultMatrix.map(row => row.map(val => +val));
  };

  /**
   * Reads 'count' number of lines and returns them as a 1D array of strings or numbers.
   * Advances the line pointer by 'count'.
   * @param {number} count - The number of lines to read.
   * @param {boolean} [returnAsString=false] - If true, returns values as strings; otherwise, as numbers.
   * @returns {string[]|number[]} An array of values.
   */
  InputHandler.prototype.getLinesAsStrings = function(count, returnAsString) {
    var rawLines = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += count);
    return returnAsString ? rawLines : rawLines.map(val => +val);
  };

  return createParser;
})();

// Initialize the input reader by reading from standard input.
var inputReader = INPUT_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Creates a multi-dimensional array initialized with a specific value.
 * @param {*} initialValue - The value to fill the array with.
 * @param {...number} dimensions - The dimensions of the array (e.g., `createMultiDimArray(0, 2, 3)` for a 2x3 array).
 * @returns {Array} The multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
  var dimensions = arguments;
  var dimCount = dimensions.length;
  var arrayCreationString = "Array(dimensions[" + --dimCount + "]).fill(0x0).map(element => {return " + initialValue + ";})";
  while (--dimCount) {
    arrayCreationString = "Array(dimensions[" + dimCount + "]).fill(0x0).map(element => " + arrayCreationString + ")";
  }
  return eval(arrayCreationString);
}

// A prime modulus used for modular arithmetic operations.
var primeModulus = 1_000_003;

/**
 * Computes the product of multiple numbers modulo `primeModulus`.
 * @param {...number} operands - Numbers to multiply.
 * @returns {number} The modular product.
 */
function multiplyModulo() {
  var operands = arguments;
  var currentProduct = operands[0x0];
  var factorIndex = 0x1;
  while (factorIndex < operands.length) {
    // This specific multiplication method is often used in competitive programming
    // to prevent intermediate overflows when numbers are large, even if JS handles large numbers.
    currentProduct = ((currentProduct >> 0x10) * operands[factorIndex] % primeModulus * 0x10000 + (currentProduct & 0xFFFF) * operands[factorIndex++]) % primeModulus;
  }
  return currentProduct;
}

// Cache for precomputed factorials.
var factorialCache = [0x1, 0x1];

/**
 * Precomputes factorials up to a given limit and stores them in `factorialCache`.
 * @param {number} limit - The upper bound for factorial computation.
 */
function buildFactorialCache(limit) {
  for (var counter = 0x2; counter <= limit;) {
    factorialCache[counter] = multiplyModulo(factorialCache[counter - 0x1], counter++);
  }
}

/**
 * Computes the modular multiplicative inverse of 'valA' modulo `primeModulus` using the extended Euclidean algorithm.
 * Assumes `primeModulus` is prime.
 * @param {number} valA - The number for which to find the inverse.
 * @returns {number} The modular inverse.
 */
function modularInverse(valA) {
  var valB = primeModulus;
  var xCoeff = 0x1,
    yCoeff = 0x0,
    tempVar;

  while (valB) {
    tempVar = Math.floor(valA / valB);
    valA -= tempVar * valB;
    xCoeff -= tempVar * yCoeff;

    // Swap (valA, valB) and (xCoeff, yCoeff)
    tempVar = valA;
    valA = valB;
    valB = tempVar;

    tempVar = xCoeff;
    xCoeff = yCoeff;
    yCoeff = tempVar;
  }
  xCoeff %= primeModulus;
  return xCoeff < 0x0 ? xCoeff + primeModulus : xCoeff;
}

/**
 * Computes nPr (permutations) modulo `primeModulus`.
 * nPr = n! / (n-r)!
 * @param {number} nVal - Total number of items.
 * @param {number} rVal - Number of items to choose.
 * @returns {number} nPr modulo `primeModulus`.
 */
function nPermutationsModulo(nVal, rVal) {
  // nPr = n! * ( (n-r)! )^-1 mod M
  // The (nVal - rVal + primeModulus) % primeModulus ensures the index is non-negative
  // before taking modulo, though for nPr, nVal >= rVal, so (nVal - rVal) is already >= 0.
  return multiplyModulo(factorialCache[nVal], modularInverse(factorialCache[(nVal - rVal + primeModulus) % primeModulus]));
}

/**
 * Computes (base^exponent) modulo `primeModulus` using binary exponentiation (exponentiation by squaring).
 * @param {number} base - The base.
 * @param {number} exponent - The exponent.
 * @returns {number} (base^exponent) modulo `primeModulus`.
 */
function powerModulo(base, exponent) {
  var resultVal = 0x1;
  while (exponent) {
    if (exponent & 0x1) { // If exponent is odd
      resultVal = multiplyModulo(base, resultVal);
    }
    base = multiplyModulo(base, base); // Square the base
    exponent >>= 0x1; // Divide exponent by 2
  }
  return resultVal;
}

// Log the result of the main execution function.
console.log(executeSolution());

/**
 * The main function to solve the problem.
 * Reads queries, performs calculations, and returns formatted results.
 * @returns {string} The final answer string, with each result on a new line.
 */
function executeSolution() {
  var queryCount = inputReader.extractNumber(); // Read the number of queries.
  var finalAnswers = Array(queryCount).fill(0x0); // Initialize an array to store results.

  // Precompute factorials up to the modulus value.
  // This is because nPr and modular inverse calculations might need factorials up to `primeModulus - 1`.
  buildFactorialCache(primeModulus);

  // Process each query.
  for (var queryIndex = 0x0; queryIndex < queryCount; queryIndex++) {
    var inputTuple = inputReader.getLineAsArray(); // Read x, d, n for the current query.
    var xValue = inputTuple[0x0];
    var dValue = inputTuple[0x1];
    var nValue = inputTuple[0x2];

    // If n is greater than or equal to the modulus, the result is 0.
    // This is because if n >= primeModulus, then n! contains primeModulus as a factor,
    // making n! % primeModulus = 0. This applies to nPr as well.
    if (nValue >= primeModulus) {
      finalAnswers[queryIndex] = 0x0; // Result is 0.
      continue; // Move to the next query.
    }

    if (dValue === 0x0) {
      // Special case: d = 0. The expression becomes x^n.
      finalAnswers[queryIndex] = powerModulo(xValue, nValue);
    } else {
      // General case: d != 0.
      // Calculate 'adjustedA' = (x * d^-1) mod M.
      // The (primeModulus - multiplyModulo(...) % primeModulus + primeModulus) % primeModulus
      // ensures a positive result for modulo operation.
      var adjustedA = ((primeModulus - multiplyModulo(xValue, modularInverse(dValue))) % primeModulus + primeModulus) % primeModulus;

      // Calculate P(adjustedA, n) = adjustedA! / (adjustedA-n)! mod M.
      var permutations = nPermutationsModulo(adjustedA, nValue);

      // Calculate (M-d)^n mod M.
      var multiplier = powerModulo(primeModulus - dValue, nValue);

      // Final result is P(adjustedA, n) * (M-d)^n mod M.
      finalAnswers[queryIndex] = multiplyModulo(permutations, multiplier);
    }
  }
  // Join all answers with newline characters for output.
  return finalAnswers.join("\n");
}
