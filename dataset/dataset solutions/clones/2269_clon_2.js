"use strict";

// This module provides a flexible utility for reading parsed input.
var INPUT_READER = (function () {

  // Factory function to instantiate a new input parsing mechanism.
  function createReader(inputString) {
    return new InputProcessor(inputString);
  }

  // InputProcessor class definition. Manages the state of input consumption.
  function InputProcessor(sourceText) {
    // Internal buffer for lines, trimmed and split by newline characters.
    this._lines = sourceText.trim().split("\n");
    // Pointer to the current line being processed.
    this._lineIndex = 0;
  }

  // Extracts the next token from the current input line.
  // If 'returnAsString' is truthy, the token is returned as a string; otherwise, it's parsed as a number.
  InputProcessor.prototype.readNextValue = function (returnAsString) {
    var allInputLines = this._lines, // Reference to the array of all input lines
        currentLinePosition = this._lineIndex, // The index of the current line
        yieldedToken; // The token retrieved from the line

    // If the current line has not yet been tokenized into an array,
    // split it by spaces and reverse the order for efficient 'pop' operations.
    if (typeof allInputLines[currentLinePosition] === "string") {
      allInputLines[currentLinePosition] = allInputLines[currentLinePosition].split(" ").reverse();
    }

    // Retrieve the last token from the current line's token array.
    yieldedToken = allInputLines[currentLinePosition].pop();

    // If the current line has no more tokens, increment the line pointer.
    if (!allInputLines[currentLinePosition].length) {
      this._lineIndex++;
    }

    // Return the token, either in its raw string form or as a numeric value.
    return returnAsString ? yieldedToken : Number(yieldedToken);
  };

  // Reads all space-separated tokens from the current line and advances the line pointer.
  // If 'stringsOnly' is true, returns tokens as strings; otherwise, converts them to numbers.
  InputProcessor.prototype.readLineTokens = function (stringsOnly) {
    var tokensOnLine = this._lines[this._lineIndex++].split(" "); // Split current line into an array of tokens

    // Return the token array, applying numeric conversion if 'stringsOnly' is false.
    return stringsOnly ? tokensOnLine : tokensOnLine.map(tokenVal => Number(tokenVal));
  };

  // Reads a specified number of lines and processes them as a two-dimensional matrix.
  // 'numRowsToRead' determines how many lines to consume.
  // 'keepAsStrings' controls whether matrix cell values are strings or numbers.
  InputProcessor.prototype.readMatrix = function (numRowsToRead, keepAsStrings) {
    // Slice 'numRowsToRead' lines and split each into an array of strings.
    var extractedMatrixRows = this._lines.slice(this._lineIndex, this._lineIndex += numRowsToRead).map(rowEntry => rowEntry.split(" "));

    // Conditionally convert all cell values to numbers if 'keepAsStrings' is false.
    return keepAsStrings ? extractedMatrixRows : extractedMatrixRows.map(rowEntry => rowEntry.map(cellValue => Number(cellValue)));
  };

  // Reads a specified number of lines, each treated as a single value.
  // 'countOfRows' specifies the number of lines to read.
  // 'outputAsString' determines if the values are returned as strings or numbers.
  InputProcessor.prototype.readRows = function (countOfRows, outputAsString) {
    // Extract 'countOfRows' lines from the input buffer.
    var singleRowContent = this._lines.slice(this._lineIndex, this._lineIndex += countOfRows);

    // If 'outputAsString' is true, return the rows as strings.
    // Otherwise, convert each row value to a numeric type.
    return outputAsString ? singleRowContent : singleRowContent.map(rowItem => Number(rowItem));
  };

  return createReader; // Export the factory function for external use.
})();


// Initialize the primary input stream reader by reading from standard input.
var dataStream = INPUT_READER(require("fs").readFileSync("/dev/stdin", "utf8"));


// Dynamically constructs and evaluates a multi-dimensional array initialization expression.
function multiDimArray(initialValue) {
  var functionArguments = arguments,
      argumentCount = functionArguments.length,
      arrayCodeSnippet = "Array(functionArguments[" + --argumentCount + "]).fill(0).map(x=>{return " + initialValue + ";})";

  // Iteratively build the nested array creation logic.
  while (--argumentCount) {
    arrayCodeSnippet = "Array(functionArguments[" + argumentCount + "]).fill(0).map(x=>" + arrayCodeSnippet + ")";
  }

  // Execute the generated JavaScript code to form the array structure.
  return eval(arrayCodeSnippet);
}


// Defines a constant for the large prime modulus used in modular arithmetic.
var PRIME_MODULUS = 1_000_000_007;


// Performs modular multiplication of an arbitrary number of arguments.
function multiplyModulo() {
  var operandList = arguments,
      runningProduct = operandList[0],
      operandIndex = operandList.length;

  // Loop through additional operands, applying modular multiplication.
  while (--operandIndex) {
    // Optimized modular multiplication to mitigate intermediate overflow.
    runningProduct = ((runningProduct >>> 16) * operandList[operandIndex] % PRIME_MODULUS * 65536 + (runningProduct & 65535) * operandList[operandIndex]) % PRIME_MODULUS;
  }
  return runningProduct;
}


// Global arrays for caching precomputed combinatorics values.
var factorialCache = [],
    invFactorialCache = [],
    modularInverseCache = [],
    powerOfTwoCache = [];


// Precomputes and caches factorials, inverse factorials, modular inverses (1/i), and powers of 2 up to a given limit.
function precomputeCombinatorics(upperLimit) {
  // Populate factorial values.
  factorialCache.length = upperLimit + 1;
  factorialCache[0] = factorialCache[1] = 1;
  for (var loopCounter = 2; loopCounter <= upperLimit;) {
    factorialCache[loopCounter] = multiplyModulo(factorialCache[loopCounter - 1], loopCounter++);
  }

  // Populate inverse factorial values.
  invFactorialCache.length = upperLimit + 1;
  invFactorialCache[0] = invFactorialCache[1] = 1;
  invFactorialCache[upperLimit] = modularInverse(factorialCache[upperLimit]);
  for (loopCounter = upperLimit; 2 < loopCounter;) {
    invFactorialCache[loopCounter - 1] = multiplyModulo(invFactorialCache[loopCounter], loopCounter--);
  }

  // Populate modular inverse values (1/i).
  modularInverseCache.length = upperLimit + 1;
  modularInverseCache[0] = modularInverseCache[1] = 1;
  for (loopCounter = 2; loopCounter <= upperLimit;) {
    // Inverse of i is (i-1)! * (1/i)! mod M.
    modularInverseCache[loopCounter] = multiplyModulo(factorialCache[loopCounter - 1], invFactorialCache[loopCounter++]);
  }

  // Populate powers of two values.
  powerOfTwoCache.length = upperLimit + 1;
  powerOfTwoCache[0] = 1;
  for (loopCounter = 1; loopCounter <= upperLimit; loopCounter++) {
    powerOfTwoCache[loopCounter] = powerOfTwoCache[loopCounter - 1] * 2 % PRIME_MODULUS;
  }
}


// Calculates the modular multiplicative inverse of 'valueToInvert' modulo PRIME_MODULUS using the extended Euclidean algorithm.
function modularInverse(valueToInvert) {
  var currentModulo = PRIME_MODULUS,
      prevCoefficientU = 0,
      prevCoefficientV = 1,
      temporaryVariable;

  while (valueToInvert) {
    temporaryVariable = currentModulo / valueToInvert | 0; // Integer division for quotient.
    currentModulo -= temporaryVariable * valueToInvert;
    prevCoefficientU -= temporaryVariable * prevCoefficientV;
    temporaryVariable = currentModulo;
    currentModulo = valueToInvert;
    valueToInvert = temporaryVariable;
    temporaryVariable = prevCoefficientU;
    prevCoefficientU = prevCoefficientV;
    prevCoefficientV = temporaryVariable;
  }

  prevCoefficientU %= PRIME_MODULUS;
  return prevCoefficientU < 0 ? prevCoefficientU + PRIME_MODULUS : prevCoefficientU;
}


// Computes modular exponentiation (base^exponent % PRIME_MODULUS) efficiently using exponentiation by squaring.
function modularExponentiation(baseValue, exponentValue) {
  var finalResult = 1; // Initialize the result to 1 (any_base^0).

  // Loop while the exponent is greater than zero.
  for (; exponentValue; baseValue = multiplyModulo(baseValue, baseValue), exponentValue >>= 1) {
    if (exponentValue & 1) { // If the current bit of the exponent is 1.
      finalResult = multiplyModulo(baseValue, finalResult);
    }
  }
  return finalResult;
}


// Computes the binomial coefficient "n choose k" modulo PRIME_MODULUS.
function nChooseK(totalElements, elementsToChoose) {
  // C(n, k) = n! / (k! * (n-k)!) = n! * (k!)^-1 * ((n-k)!)^-1 mod M.
  return multiplyModulo(factorialCache[totalElements], invFactorialCache[elementsToChoose], invFactorialCache[totalElements - elementsToChoose]);
}


// Computes the permutation "n permute k" modulo PRIME_MODULUS.
function nPermuteK(totalItems, itemsToSelect) {
  // P(n, k) = n! / (n-k)! = n! * ((n-k)!)^-1 mod M.
  return multiplyModulo(factorialCache[totalItems], invFactorialCache[totalItems - itemsToSelect]);
}


// Execute the primary solution logic and print its output.
console.log(computeSolution());
function computeSolution() {
  // Read the number of elements for the array from input.
  var arraySize = dataStream.readNextValue();
  // Read the array of coordinate values from the next input line.
  var coordinateArray = dataStream.readLineTokens();

  // Precalculate combinatorics values up to (arraySize + 1) for later use.
  precomputeCombinatorics(arraySize + 1);

  var finalAnswer = 0; // Accumulator for the final result.
  // Initialize the first coefficient as (n-1)!
  var currentCoefficient = factorialCache[arraySize - 1];

  // Iterate through the coordinate array, starting from the second element.
  for (var loopIndex = 1; loopIndex < arraySize; loopIndex++) {
    // Add the product of the difference and the current coefficient to the total answer.
    finalAnswer += multiplyModulo(coordinateArray[loopIndex] - coordinateArray[loopIndex - 1], currentCoefficient);
    // Update the coefficient for the next iteration using the formula:
    // (previous_coefficient + (n-1)! * (1/(i+1))) % PRIME_MODULUS.
    currentCoefficient = (currentCoefficient + multiplyModulo(factorialCache[arraySize - 1], modularInverseCache[loopIndex + 1])) % PRIME_MODULUS;
  }

  // Ensure the final result is within the positive range of the modulus.
  return finalAnswer % PRIME_MODULUS;
}