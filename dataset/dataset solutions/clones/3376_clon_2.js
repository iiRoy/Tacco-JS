"use strict";

// Helper function to safely destructure arrays, similar to Babel's _slicedToArray
function _arrayDestructure(inputArray, limitCount) {
  return _arrWithHoles(inputArray) || _iterToArrayLimited(inputArray, limitCount) || _nonIterRest();
}

// Helper function for non-iterable destructuring attempts
function _nonIterRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

// Helper function to convert iterable to array with a limit, similar to Babel's _iterableToArrayLimit
function _iterToArrayLimited(inputArray, limitCount) {
  var tempArray = [];
  var notDone = true;
  var hadError = false;
  var errorObj = undefined;
  try {
    for (var iteratorObj = inputArray[Symbol.iterator](), iteratorResult; !(notDone = (iteratorResult = iteratorObj.next()).done); notDone = true) {
      tempArray.push(iteratorResult.value);
      if (limitCount && tempArray.length === limitCount) break;
    }
  } catch (caughtError) {
    hadError = true;
    errorObj = caughtError;
  } finally {
    try {
      if (!notDone && iteratorObj["return"] != null) iteratorObj["return"]();
    } finally {
      if (hadError) throw errorObj;
    }
  }
  return tempArray;
}

// Helper function to check if an array has holes, similar to Babel's _arrayWithHoles
function _arrWithHoles(inputArray) {
  if (Array.isArray(inputArray)) return inputArray;
}

// Main processing function for the problem
function processInput(rawData) {
  // Split the entire input string into individual lines
  var dataLines = rawData.split('\n');

  // Parse the first line to extract the two integer values, N and P
  var _parsedNums = parseNumbers(dataLines[0]),
      _destructuredNums = _arrayDestructure(_parsedNums, 2),
      numElements = _destructuredNums[0], // Represents N
      productValue = _destructuredNums[1]; // Represents P

  // Calculate the maximum possible base 'idx' such that idx^N <= P
  var upperBound = Math.pow(productValue, 1 / numElements);

  // Handle the special case where N is 1
  if (numElements === 1) {
    console.log(productValue);
    return; // Terminate execution for this case
  }

  // Initialize the result variable to 1
  var resultVal = 1;

  // Iterate from 2 up to the calculated upper bound
  for (var idx = 2; idx <= upperBound; idx++) {
    // Check if P is perfectly divisible by idx raised to the power of N
    if (productValue % Math.pow(idx, numElements) === 0) {
      resultVal = idx; // Update the result if a valid base is found
    }
  }

  // Output the final computed result
  console.log(resultVal);
}

// Function to compute the greatest common divisor (GCD) using the Euclidean algorithm
function greatestCommonDivisor(valA, valB) {
  // Ensure valA is always greater than or equal to valB for consistent recursion
  if (valA < valB) return greatestCommonDivisor(valB, valA);
  // Base case: if valB is 0, then valA is the GCD
  if (valB === 0) return valA;
  // Calculate the remainder
  var remainderVal = valA % valB;
  // Recursive call with valB and the remainder
  return greatestCommonDivisor(valB, remainderVal);
}

// Read input from standard input and pass it to the main processing function
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));

// Helper function to parse a string line containing space-separated numbers into an array of integers
function parseNumbers(inputLine) {
  return inputLine.split(/\s+/).map(function (numStr) {
    return parseInt(numStr); // Convert each string number to an integer
  });
}
