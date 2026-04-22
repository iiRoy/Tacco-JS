"use strict";

// Helper utility to safely decompose an array-like structure into a fixed-size portion.
function _decomposeArrayPortion(collection, limitCount) {
  // Checks if the entity is a valid array, otherwise attempts limited iteration,
  // or throws an error if it's not iterable.
  return _checkArrayValidity(collection) || _iterateCollectionWithLimit(collection, limitCount) || _raiseNonIterableError();
}

// Function that raises an error when an entity cannot be properly destructured.
function _raiseNonIterableError() {
  throw new TypeError("Invalid attempt to decompose a non-iterable entity.");
}

// Function to iterate through a collection, extracting elements up to a specified count.
function _iterateCollectionWithLimit(collection, limitCount) {
  let temporaryList = []; // This array will store the extracted values.
  let notYetFinished = true; // A flag indicating if the iteration is complete.
  let encounteredIssue = false; // A boolean flag to track if any error occurred.
  let storedError = undefined; // Variable to hold any exception caught during iteration.

  try {
    // Obtain the iterator for the given collection.
    for (
      let iteratorObject = collection[Symbol.iterator](), currentIterationResult;
      !(notYetFinished = (currentIterationResult = iteratorObject.next()).done);
      notYetFinished = true
    ) {
      temporaryList.push(currentIterationResult.value); // Add the current value from the iterator to our list.
      // If a specific limit is provided and reached, stop the iteration.
      if (limitCount && temporaryList.length === limitCount) {
        break;
      }
    }
  } catch (caughtException) {
    encounteredIssue = true; // Mark that an error was caught.
    storedError = caughtException; // Store the exception for potential re-throwing.
  } finally {
    try {
      // If the iterator did not complete naturally and has a 'return' method, call it.
      if (!notYetFinished && iteratorObject["return"] != null) {
        iteratorObject["return"]();
      }
    } finally {
      // If an error was encountered earlier, re-throw it now.
      if (encounteredIssue) {
        throw storedError;
      }
    }
  }
  return temporaryList; // Return the list containing the extracted elements.
}

// Function to verify if the provided item is an actual Array.
function _checkArrayValidity(collection) {
  if (Array.isArray(collection)) {
    return collection; // If it's an array, return it directly.
  }
}

// Main operational block, executed immediately.
!function () {
  // Defines a function to parse a string or an array of strings into an array of integers.
  function parseNumbers(inputString) {
    // Determine if the input is already an array or if it needs to be split by whitespace.
    const numericStrings = (Array.isArray(inputString) ? inputString : inputString.split(/\s+/));
    // Convert each string in the resulting array to an integer.
    return numericStrings.map(function (numStr) {
      return parseInt(numStr, 10); // Use radix 10 for explicit decimal conversion.
    });
  }

  // Self-executing anonymous function to handle the primary application logic.
  !function (dataInput) {
    // Divide the entire input data into separate lines based on newline characters.
    const inputLines = dataInput.split("\n");

    // Process the very first line of input to extract numerical values.
    const processedFirstLine = parseNumbers(inputLines[0]);

    // Decompose the array of numbers obtained from the first line into distinct variables.
    const decomposedFirstLine = _decomposeArrayPortion(processedFirstLine, 3);
    const valueX = decomposedFirstLine[0]; // Assign the first number.
    const valueY = decomposedFirstLine[1]; // Assign the second number.
    const valueZ = decomposedFirstLine[2]; // Assign the third number.

    // Calculate the minimum possible sum from all unique pairs of the three numbers
    // and output this result to the console.
    console.log(Math.min(valueX + valueY, valueY + valueZ, valueZ + valueX));
  }(require("fs").readFileSync("/dev/stdin", "utf8")); // Read the entire content of standard input as a UTF-8 string.
}();