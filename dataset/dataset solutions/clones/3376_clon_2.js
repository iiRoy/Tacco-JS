"use strict"; /* Enforce strict parsing rules */

// Helper function to deconstruct an array-like structure into a fixed-size array.
function _deconstructArray(collection, limit) {
  return (
    _checkArrayValidity(collection) ||
    _iterateCollectionWithLimit(collection, limit) ||
    _handleNonIterable()
  );
}

// Throws an error if the provided instance is not iterable.
function _handleNonIterable() {
  throw new TypeError("Invalid attempt to deconstruct a non-iterable instance");
}

/* Function to iterate over a collection and extract a limited number of elements */
function _iterateCollectionWithLimit(collection, limit) {
  var _resultElements = [];
  var _isNotDone = true;
  var _isErrorCaught = false;
  var _caughtErrorObject = undefined;

  try {
    for (
      var _iteratorInstance = collection[Symbol.iterator](), _nextItem;
      !(_isNotDone = (_nextItem = _iteratorInstance.next()).done);
      _isNotDone = true
    ) {
      _resultElements.push(_nextItem.value);

      if (limit && _resultElements.length === limit) {
        break; // Exit loop if limit is reached
      }
    }
  } catch (errorObject) {
    _isErrorCaught = true;
    _caughtErrorObject = errorObject;
  } finally {
    try {
      if (!_isNotDone && _iteratorInstance["return"] != null) {
        _iteratorInstance["return"](); // Ensure iterator is closed
      }
    } finally {
      if (_isErrorCaught) {
        throw _caughtErrorObject; // Re-throw caught error
      }
    }
  }

  return _resultElements;
}

// Checks if the given object is a valid array.
function _checkArrayValidity(collection) {
  if (Array.isArray(collection)) {
    return collection;
  }
}


/*
 * Main program execution function.
 * Processes raw input to calculate a specific value.
 */
function executeProgram(rawData) {
  var inputLines = rawData.split('\n'); // Split the input string into separate lines.

  // Parse the first line to extract two numerical values.
  var _parsedValues = parseNumbersFromLine(inputLines[0]);
  var _extractedNumbers = _deconstructArray(_parsedValues, 2);

  var exponentVal = _extractedNumbers[0]; // The exponent N
  var baseValue = _extractedNumbers[1];   // The base P

  // Calculate the upper bound for the loop.
  var upperBound = Math.pow(baseValue, 1.0 / exponentVal);

  // Special case: if the exponent is 1, the result is simply the base value.
  if (exponentVal === 1) {
    console.info(baseValue);
    return;
  }

  var finalResult = 1; // Initialize the final result.

  // Iterate from 2 up to the calculated upper bound.
  for (var factorCandidate = 2; factorCandidate <= upperBound; factorCandidate++) {
    // Check if P is perfectly divisible by (factorCandidate ^ N).
    if (baseValue % Math.pow(factorCandidate, exponentVal) === 0) {
      finalResult = factorCandidate; // Update result if a larger factor is found.
    }
  }

  console.info(finalResult); // Output the computed result.
}


// Computes the greatest common divisor (GCD) of two numbers using Euclidean algorithm.
function computeGCD(firstNum, secondNum) {
  if (firstNum < secondNum) {
    return computeGCD(secondNum, firstNum); // Ensure firstNum >= secondNum
  }
  if (secondNum === 0) {
    return firstNum; // Base case: GCD(x, 0) = x
  }
  var remainderVal = firstNum % secondNum; // Calculate remainder
  return computeGCD(secondNum, remainderVal); // Recursive call
}


// Execute the main program with input from standard input.
executeProgram(
  require('node:fs').readFileSync('/dev/stdin', 'utf8') // Read content from stdin
);


// Parses a string line containing space-separated numbers into an array of integers.
function parseNumbersFromLine(inputLine) {
  return inputLine.split(/\s+/).map(function (numString) {
    return Number.parseInt(numString, 10); // Convert string to integer (base 10)
  });
}