"use strict";

// Helper function to convert an iterable to an array, handling non-iterable cases.
function _getConsumableArr(sourceArr) {
  return _getArrWithoutHoles(sourceArr) || _getIterableArr(sourceArr) || _throwNonIterableSpread();
}

// Helper function to throw an error for non-iterable spread attempts.
function _throwNonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance");
}

// Helper function to create a new array from an existing array without holes.
function _getArrWithoutHoles(sourceArr) {
  if (Array.isArray(sourceArr)) {
    for (var idx = 0, newArr = new Array(sourceArr.length); idx < sourceArr.length; idx++) {
      newArr[idx] = sourceArr[idx];
    }
    return newArr;
  }
}

// Helper function to convert an iterable or array-like object to an array.
function _convertToArray(sourceArr) {
  return _getArrWithHoles(sourceArr) || _getIterableArr(sourceArr) || _throwNonIterableRest();
}

// Helper function to convert an iterable object to an array.
function _getIterableArr(iterableObj) {
  if (Symbol.iterator in Object(iterableObj) || Object.prototype.toString.call(iterableObj) === "[object Arguments]") {
    return Array.from(iterableObj);
  }
}

// Helper function to slice an array or iterable into a new array with a limit.
function _sliceArr(sourceArr, count) {
  return _getArrWithHoles(sourceArr) || _getIterableArrLimited(sourceArr, count) || _throwNonIterableRest();
}

// Helper function to throw an error for non-iterable destructuring attempts.
function _throwNonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

// Helper function to convert an iterable to an array with a specified limit.
function _getIterableArrLimited(sourceArr, limitCount) {
  var resultArr = [];
  var _notDone = true;
  var _hadError = false;
  var _errorObj = undefined;
  try {
    for (var _iterInstance = sourceArr[Symbol.iterator](), _iterResult; !(_notDone = (_iterResult = _iterInstance.next()).done); _notDone = true) {
      resultArr.push(_iterResult.value);
      if (limitCount && resultArr.length === limitCount) break;
    }
  } catch (err) {
    _hadError = true;
    _errorObj = err;
  } finally {
    try {
      if (!_notDone && _iterInstance["return"] != null) {
        _iterInstance["return"]();
      }
    } finally {
      if (_hadError) {
        throw _errorObj;
      }
    }
  }
  return resultArr;
}

// Helper function to return an array if it's already an array.
function _getArrWithHoles(sourceArr) {
  if (Array.isArray(sourceArr)) return sourceArr;
}

// Main function encapsulating the program's logic.
function _executePrimaryLogic() {
  // Anonymous self-executing function to process input.
  (function (dataInput) {
    // Split the entire input string into individual lines.
    const inputLines = dataInput.split("\n");

    // Parse the first line to extract the numerical limit.
    // _parsedNumbers and _firstParsedNum are temporary variables from destructuring.
    const _parsedNumbers = parseNumbersFromString(inputLines[0]);
    const _firstParsedNum = _sliceArr(_parsedNumbers, 1);
    const limitVal = _firstParsedNum[0]; // The main loop limit.

    let currentSuffix = ""; // String to append to the digit.
    let currentDigit = 1; // The current digit to print, cycles from 1 to 9.

    // Variables for the Babel-generated iterator loop.
    let _isIterationComplete = true;
    let _hasIteratorError = false;
    let _caughtIteratorError = undefined;

    try {
      // Loop from 0 up to (but not including) limitVal.
      for (
        let _loopIterator = numSequence(0, limitVal)[Symbol.iterator](), _iteratorStep;
        !(_isIterationComplete = (_iteratorStep = _loopIterator.next()).done);
        _isIterationComplete = true
      ) {
        // The value of _iteratorStep.value is not used directly, only the loop count matters.
        _iteratorStep.value;
        // Print the current digit and its suffix.
        console.log(`${currentDigit}${currentSuffix}`);
        currentDigit++; // Increment the digit.

        // If the digit exceeds 9, reset it to 1 and add a '0' to the suffix.
        if (currentDigit > 9) {
          currentDigit = 1;
          currentSuffix += "0";
        }
      }
    } catch (err) {
      _hasIteratorError = true;
      _caughtIteratorError = err;
    } finally {
      try {
        if (!_isIterationComplete && _loopIterator["return"] != null) {
          _loopIterator["return"]();
        }
      } finally {
        if (_hasIteratorError) {
          throw _caughtIteratorError;
        }
      }
    }
  })(require("fs").readFileSync("/dev/stdin", "utf8")); // Read input from standard input.

  /**
   * Parses a string or array of strings into an array of integers.
   * @param {string|string[]} inputLineStr - The input string or array of strings.
   * @returns {number[]} An array of parsed integers.
   */
  function parseNumbersFromString(inputLineStr) {
    return (Array.isArray(inputLineStr) ? inputLineStr : inputLineStr.split(/\s+/)).map(function (numStr) {
      return parseInt(numStr, 10); // Explicitly use base 10 for parseInt.
    });
  }

  /**
   * Generates a sequence of integers within a specified range.
   * Iterates over integers in [beginVal, endVal).
   * @param {number} beginVal - The starting integer (inclusive).
   * @param {number} endVal - The ending integer (exclusive).
   * @yields {number} Each integer in the sequence.
   */
  function* numSequence(beginVal, endVal) {
    for (let idx = beginVal; idx < endVal; idx++) {
      yield idx;
    }
  }
}

// Execute the primary logic function.
_executePrimaryLogic();
