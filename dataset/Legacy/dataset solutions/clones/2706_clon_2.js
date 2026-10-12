'use strict';

// Helper function to slice an array into parts, primarily used for destructuring assignments.
function _splitArrayIntoParts(arr, i) {
  return _arrayWithGaps(arr) || _limitedIterableToArray(arr, i) || _unsupportedArrayConversion(arr) || _noIterableRemainder();
}

// Throws a TypeError if an attempt is made to destructure a non-iterable instance.
function _noIterableRemainder() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

// Converts various unsupported iterable types (like arguments or typed arrays) into a standard array.
function _unsupportedArrayConversion(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _convertArrayLike(o, minLen);
  var typeName = Object.prototype.toString.call(o).slice(8, -1);
  if (typeName === "Object" && o.constructor) typeName = o.constructor.name;
  if (typeName === "Map" || typeName === "Set") return Array.from(o);
  if (typeName === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(typeName)) return _convertArrayLike(o, minLen);
}

// Converts an array-like object (e.g., string, arguments) into a new array up to a specified length.
function _convertArrayLike(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i = 0, newArray = new Array(len); i < len; i++) {
    newArray[i] = arr[i];
  }
  return newArray;
}

// Converts an iterable object into an array, with an optional limit on the number of elements.
function _limitedIterableToArray(arr, i) {
  if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
  var _tempArray = [];
  var _isIterationComplete = false;
  var _encounteredError = false;
  var _errorDetails = undefined;
  try {
    for (var _iterator = arr[Symbol.iterator](), _step; !(_isIterationComplete = (_step = _iterator.next()).done); _isIterationComplete = true) {
      _tempArray.push(_step.value);
      if (i && _tempArray.length === i) break;
    }
  } catch (err) {
    _encounteredError = true;
    _errorDetails = err;
  } finally {
    try {
      if (!_isIterationComplete && _iterator["return"] != null) _iterator["return"]();
    } finally {
      if (_encounteredError) throw _errorDetails;
    }
  }
  return _tempArray;
}

// Checks if the provided argument is an actual array.
function _arrayWithGaps(arr) {
  if (Array.isArray(arr)) return arr;
}

// Constants used throughout the dynamic programming solution.
const MODULO_CONSTANT = 1000000007; // (10^9 + 7) for modulo operations
const MAX_STRING_LENGTH_PLUS_ONE = 100001; // Max length of S is 10^5, plus one for array indexing
const NUM_REMAINDERS = 13; // We are interested in remainders when divided by 13
const TARGET_FINAL_REMAINDER = 5; // The specific remainder required by the problem
const DECIMAL_BASE = 10; // Base for numerical digit calculations

/**
 * Main function to process the input and compute the result.
 * @param {string[]} inputLines - An array where the first element is the input string S.
 */
function processInputData(inputLines) {
  // Extract the input string S from the first line.
  const _parsedInput = _splitArrayIntoParts(inputLines, 1);
  const inputString = _parsedInput[0];

  // Initialize a 2D array for memoization (dynamic programming table).
  // `memoizationTable[digits][remainder]` stores the number of ways to form a number
  // with `digits` length that has `remainder` when divided by 13.
  const memoizationTable = new Array(MAX_STRING_LENGTH_PLUS_ONE).fill(null).map(() => {
    return new Array(NUM_REMAINDERS).fill(undefined); // Use undefined to indicate uncomputed states
  });

  /**
   * Recursive dynamic programming function to count ways.
   * @param {number} currentDigits - The number of digits remaining to consider (from right to left).
   * @param {number} currentRemainder - The target remainder for the number formed by these `currentDigits`.
   * @returns {number} The count of valid ways for the given state.
   */
  function calculateWays(currentDigits, currentRemainder) {
    // Base case 1: If no digits are left and the remainder is 0, this is a valid way.
    if (currentDigits === 0 && currentRemainder === 0) {
      return 1;
    }
    // Base case 2: If no digits are left but the remainder is not 0, this path is invalid.
    if (currentDigits === 0) {
      return 0;
    }

    // Check if the result for this state has already been computed and memoized.
    const cachedResult = memoizationTable[currentDigits][currentRemainder];
    if (cachedResult !== undefined) {
      return cachedResult;
    }

    // Get the character at the current digit position (working from right to left).
    const currentCharacter = inputString[currentDigits - 1];
    let totalWaysForThisState = 0;

    // If the current character is a wildcard '?'
    if (currentCharacter === '?') {
      // Iterate through all possible digits (0-9) for the wildcard.
      totalWaysForThisState = new Array(DECIMAL_BASE).fill(null).reduce((accumulator, _, digitValue) => {
        // For each possible digit, find all previous remainders that would lead to `currentRemainder`.
        const waysWithThisDigit = new Array(NUM_REMAINDERS).fill(null).map((_, index) => index) // Create an array [0, 1, ..., 12]
          .filter(previousRemainder => {
            // The formula for new remainder is (previousRemainder * 10 + newDigit) % 13
            return (previousRemainder * DECIMAL_BASE + digitValue) % NUM_REMAINDERS === currentRemainder;
          })
          .reduce((innerAccumulator, previousRemainder) => {
            // Recursively call `calculateWays` for the previous state and sum up the results.
            return calculateWays(currentDigits - 1, previousRemainder) + innerAccumulator;
          }, 0);
        return (waysWithThisDigit + accumulator) % MODULO_CONSTANT; // Sum up and apply modulo
      }, 0);
    } else {
      // If the current character is a specific digit.
      const digitValue = Number(currentCharacter);
      // Find all previous remainders that would lead to `currentRemainder` with this fixed digit.
      totalWaysForThisState = new Array(NUM_REMAINDERS).fill(null).map((_, index) => index) // Create an array [0, 1, ..., 12]
        .filter(previousRemainder => {
          // The formula for new remainder is (previousRemainder * 10 + newDigit) % 13
          return (previousRemainder * DECIMAL_BASE + digitValue) % NUM_REMAINDERS === currentRemainder;
        })
        .reduce((accumulator, previousRemainder) => {
          // Recursively call `calculateWays` for the previous state and sum up the results.
          return calculateWays(currentDigits - 1, previousRemainder) + accumulator;
        }, 0) % MODULO_CONSTANT; // Sum up and apply modulo
    }

    // Memoize the computed result before returning it.
    return memoizationTable[currentDigits][currentRemainder] = totalWaysForThisState;
  }

  // Initiate the dynamic programming calculation with the full string length and the target remainder (5).
  console.log(calculateWays(inputString.length, TARGET_FINAL_REMAINDER));
}

/**
 * Sets up the standard input stream to read data and pass it to the main processing function.
 */
function executeWithStandardInput() {
  let accumulatedInputData = ""; // Buffer to store all incoming input
  process.stdin.resume(); // Ensure the standard input stream stays open
  process.stdin.setEncoding("utf8"); // Set the character encoding for input

  // Event listener for when data chunks are received from stdin.
  process.stdin.on("data", function (chunk) {
    accumulatedInputData += chunk; // Append the new chunk to the buffer
  });

  // Event listener for when the standard input stream ends.
  process.stdin.on("end", function () {
    // Split the accumulated data by newline characters and pass the resulting array to `processInputData`.
    processInputData(accumulatedInputData.split("\n"));
  });
}

// Start the process of reading from standard input.
executeWithStandardInput();
