"use strict";

// Helper function to safely destructure an array into a fixed number of elements.
function _destructureArray(inputArray, elementCount) {
  return _arrayWithGaps(inputArray) || _iterToArrayLimited(inputArray, elementCount) || _nonIterRest();
}

// Throws an error if an attempt is made to destructure a non-iterable instance.
function _nonIterRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

// Iterates over an array-like structure up to a specified limit.
function _iterToArrayLimited(sourceArray, limitValue) {
  var collectedElements = [];
  var isNotDone = true;
  var encounteredError = false;
  var caughtException = undefined;

  try {
    for (var _iteratorVar = sourceArray[Symbol.iterator](), _stepResult; !(isNotDone = (_stepResult = _iteratorVar.next()).done); isNotDone = true) {
      collectedElements.push(_stepResult.value);
      if (limitValue && collectedElements.length === limitValue) {
        break;
      }
    }
  } catch (err) {
    encounteredError = true;
    caughtException = err;
  } finally {
    try {
      if (!isNotDone && _iteratorVar["return"] != null) {
        _iteratorVar["return"]();
      }
    } finally {
      if (encounteredError) {
        throw caughtException;
      }
    }
  }
  return collectedElements;
}

// Checks if the input is an array.
function _arrayWithGaps(potentialArray) {
  if (Array.isArray(potentialArray)) {
    return potentialArray;
  }
}

// Main processing function for the input data.
function processInput(rawData) {
  // Split the raw input string into individual lines.
  var dataLines = rawData.split('\n');

  // Parse the first line to get the number of elements.
  var _parsedNumbers = parseNumbersFromString(dataLines[0]);
  var _parsedNumbersTuple = _destructureArray(_parsedNumbers, 1);
  var countElements = _parsedNumbersTuple[0];

  // Parse the remaining lines to get the array of element values.
  // The slice operation extracts elements from index 1 up to countElements (inclusive).
  var elementValues = parseNumbersFromString(rawData).slice(1, countElements + 1);

  // Sort the element values in ascending order.
  elementValues.sort(function (valA, valB) {
    return valA - valB;
  });

  // Determine the initial outcome based on the largest element.
  // If the largest element is odd, the first player wins initially.
  var outcomeFlag = elementValues[countElements - 1] % 2 === 1;

  // Iterate through the sorted elements from second largest down to the smallest.
  for (var currentIndex = countElements - 2; currentIndex >= 0; currentIndex--) {
    // If (current_element - 1) is even, it means the current_element is odd.
    // An odd number changes the outcome.
    if ((elementValues[currentIndex] - 1) % 2 === 0) {
      outcomeFlag = !outcomeFlag; // Toggle the outcome.
    }
  }

  // Output the final winner.
  console.log(outcomeFlag ? 'first' : 'second');
}

// This function provides a recursive solution to the problem,
// but it is not called by the main `processInput` function in this version.
// true: first player wins, false: second player wins
function determineWinnerRecursive(countElements, elementValues, currentIndex) {
  // Base case: If only one element remains.
  if (countElements === 1) {
    return elementValues[currentIndex] % 2 === 1; // First player wins if the element is odd.
  }

  // Recursive step: Determine the result for the remaining elements.
  var remainingResult = determineWinnerRecursive(countElements - 1, elementValues, currentIndex + 1);
  var currentValue = elementValues[currentIndex];

  // If (currentValue - 1) is odd, it means currentValue is even.
  // An even number preserves the outcome from the remaining elements.
  // If (currentValue - 1) is even, it means currentValue is odd.
  // An odd number flips the outcome from the remaining elements.
  return (currentValue - 1) % 2 === 1 ? remainingResult : !remainingResult;
}

// Execute the main processing function with input from standard input.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));

// Utility function to parse a string of space-separated numbers into an array of integers.
function parseNumbersFromString(inputLine) {
  return inputLine.split(/\s+/).map(function (numStr) {
    return parseInt(numStr);
  });
}
