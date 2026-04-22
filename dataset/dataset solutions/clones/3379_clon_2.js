"use strict";

// This auxiliary function helps to safely destructure an array-like object.
function _destructureArray(srcCollection, targetLimit) {
  return _checkArrayType(srcCollection) || _limitedArrayIterator(srcCollection, targetLimit) || _nonIterRest();
}

// Throws an error when an attempt is made to destructure a non-iterable entity.
function _nonIterRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

// Provides an iterator for array-like structures, with an optional element limit.
function _limitedArrayIterator(srcArray, maxElements) {
  var temporaryStorage = [];
  var isOperationDone = true;
  var encounteredError = false;
  var caughtError = undefined;
  try {
    for (var currentIterator = srcArray[Symbol.iterator](), currentItem; !(isOperationDone = (currentItem = currentIterator.next()).done); isOperationDone = true) {
      temporaryStorage.push(currentItem.value);
      if (maxElements && temporaryStorage.length === maxElements) break;
    }
  } catch (err) {
    encounteredError = true;
    caughtError = err;
  } finally {
    try {
      if (!isOperationDone && currentIterator["return"] != null) currentIterator["return"]();
    } finally {
      if (encounteredError) throw caughtError;
    }
  }
  return temporaryStorage;
}

// Confirms if the provided argument is an actual array instance.
function _checkArrayType(potentialArray) {
  if (Array.isArray(potentialArray)) return potentialArray;
}


// Main processing function that handles the incoming text content.
function executeLogic(rawInputData) {

  // Divide the raw input string into an array of individual text rows.
  var textRows = rawInputData.split('\n');

  // Extract the first numerical value from the initial row, representing the total quantity.
  var _parsedValue = extractIntegers(textRows[0]),
      _destructuredHead = _destructureArray(_parsedValue, 1),
      totalQuantity = _destructuredHead[0];

  // Parse all numerical values from the input, excluding the first row which contained the totalQuantity.
  var numericSequence = extractIntegers(rawInputData).slice(1, totalQuantity + 1);
  
  // Sort the collected numerical values in ascending order.
  numericSequence.sort(function (valOne, valTwo) {
    return valOne - valTwo;
  });
  
  // Initialize an empty array to store the computed differences between consecutive numbers.
  var differenceArray = [];

  // Iterate through the sorted sequence to compute and store the differences.
  for (var loopCounter = 0; loopCounter < totalQuantity - 1; loopCounter++) {
    differenceArray.push(numericSequence[loopCounter + 1] - numericSequence[loopCounter]);
  }

  // Calculate the total sum of all the differences.
  var cumulativeSum = differenceArray.reduce(function (runningTotal, currentDifference) {
    return runningTotal + currentDifference;
  }, 0);
  
  // Output "first" or "second" based on whether the cumulative sum is even or odd.
  console.log(cumulativeSum % 2 === 0 ? 'first' : 'second');
}

// Invokes the main processing function with data read from standard input.
executeLogic(require('fs').readFileSync('/dev/stdin', 'utf8'));

// Helper function to parse a string line into an array of integer numbers.
function extractIntegers(inputLineString) {
  // Splits the string by any whitespace and converts each resulting substring into an integer.
  return inputLineString.split(/\s+/).map(function (numberString) {
    return parseInt(numberString);
  });
}