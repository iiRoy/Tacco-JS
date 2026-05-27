"use strict";

// Helper function to safely extract a specific number of elements from an array-like structure.
function _extractElements(data, count) {
  return _checkArray(data) || _limitIterableToArray(data, count) || _handleNonIterable();
}

// Throws an error if an attempt is made to destructure a non-iterable instance.
function _handleNonIterable() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

// Converts an iterable to an array, limiting the number of elements.
function _limitIterableToArray(source, limit) {
  var tempArr = [];
  var isDone = true;
  var hasError = false;
  var caughtError = undefined;

  try {
    for (var iterator = source[Symbol.iterator](), iterResult; !(isDone = (iterResult = iterator.next()).done); isDone = true) {
      tempArr.push(iterResult.value);
      if (limit && tempArr.length === limit) break;
    }
  } catch (err) {
    hasError = true;
    caughtError = err;
  } finally {
    try {
      if (!isDone && iterator["return"] != null) iterator["return"]();
    } finally {
      if (hasError) throw caughtError;
    }
  }
  return tempArr;
}

// Checks if the input is an array and returns it directly.
function _checkArray(inputArray) {
  if (Array.isArray(inputArray)) return inputArray;
}

// Main application logic encapsulated in an IIFE.
!function () {
  /**
   * Parses a line of text or an array of strings into an array of integers.
   * @param {string|string[]} inputLine - The input line or array of string numbers.
   * @returns {number[]} An array of parsed integers.
   */
  function parseNumbers(inputLine) {
    // If it's already an array, map directly; otherwise, split by whitespace first.
    return (Array.isArray(inputLine) ? inputLine : inputLine.split(/\s+/)).map(function (numStr) {
      return parseInt(numStr); // Convert each string part to an integer.
    });
  }

  // Another IIFE to process the input from stdin.
  !function (rawData) {
    // Split the entire input string into individual lines.
    var inputLines = rawData.split("\n");

    // Parse the first line and extract two numbers.
    var _parsedValues = parseNumbers(inputLines[0]);
    var _extractedPair = _extractElements(_parsedValues, 2);
    var firstVal = _extractedPair[0]; // The first number from the input.
    var secondVal = _extractedPair[1]; // The second number from the input.

    // Apply conditional logic based on the value of 'firstVal'.
    if (firstVal <= 5) {
      console.log(0); // Output 0 if firstVal is 5 or less.
    } else if (firstVal <= 12) {
      console.log(secondVal / 2); // Output half of secondVal if firstVal is between 6 and 12.
    } else {
      console.log(secondVal); // Output secondVal if firstVal is greater than 12.
    }
  }(require("fs").readFileSync("/dev/stdin", "utf8")); // Read input from standard input.
}();
