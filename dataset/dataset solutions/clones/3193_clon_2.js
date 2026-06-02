"use strict";

// Babel-generated helper functions for destructuring, kept as-is.
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

// Main application logic wrapped in an immediately invoked function expression.
!function () {

  /**
   * Parses a line of space-separated numbers into an array of integers.
   * @param {string|string[]} inputLine - The input string or array of strings.
   * @returns {number[]} An array of parsed integers.
   */
  function parseNumbers(inputLine) {
    // If the input is already an array, use it directly; otherwise, split the string by whitespace.
    return (Array.isArray(inputLine) ? inputLine : inputLine.split(/\s+/)).map(function (numStr) {
      return parseInt(numStr, 10); // Explicitly use base 10 for parsing.
    });
  }

  /**
   * A generator function that yields numbers in a specified range.
   * @param {number} beginVal - The starting value (inclusive).
   * @param {number} endVal - The ending value (exclusive).
   * @yields {number} Each number in the range.
   */
  function* numberSequence(beginVal, endVal) {
    for (let currentIdx = beginVal; currentIdx < endVal; currentIdx++) {
      yield currentIdx;
    }
  }

  /**
   * Sorts an array of objects based on one or more properties.
   * Supports ascending/descending order and numeric comparison.
   * @param {Array<Object>} dataArray - The array of objects to sort.
   * @param {string|Array<string|Array>} sortKeys - A key or an array of keys/key-direction pairs.
   * @returns {Array<Object>} The sorted array.
   */
  function orderByProperties(dataArray, sortKeys) {
    // Ensure sortKeys is always an array for consistent iteration.
    if (!Array.isArray(sortKeys)) {
      sortKeys = [sortKeys];
    }

    return dataArray.sort(function (itemA, itemB) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        // Iterate through each sorting key provided.
        for (var _iterator = sortKeys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var currentKey = _step.value;

          if ('string' === typeof currentKey) {
            // Simple numeric comparison for a single string key.
            const diffVal = itemA[currentKey] - itemB[currentKey];
            if (0.0 !== diffVal) {
              return diffVal;
            }
          } else {
            // Complex comparison with key and direction (e.g., ["property", "descending"]).
            const propDiff = itemA[currentKey[0]] - itemB[currentKey[0]];
            // Determine the sign multiplier based on sort direction.
            const signMultiplier = 'descending' === currentKey[1] ? -1.0 : 'ascending' === currentKey[1] ? 1.0 : Number(currentKey[1]);
            if (0.0 !== propDiff) {
              return propDiff * signMultiplier;
            }
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      // If all keys are equal, the items are considered equal.
      return 0x0;
    });
  }

  // Main execution block, immediately invoked with input from stdin.
  !function (rawData) {
    const inputLines = rawData.split("\n");

    // Parse the first line for N (targetSum) and M (numDigits).
    const _splitNum = parseNumbers(inputLines[0]),
          _splitNum2 = _slicedToArray(_splitNum, 2),
          targetSum = _splitNum2[0], // N: The target sum to achieve.
          numDigits = _splitNum2[1]; // M: The number of available digits.

    // Parse the second line for available digits, taking only M of them.
    const availableDigits = parseNumbers(inputLines[1]).slice(0, numDigits);

    // Define the cost for each digit (0-9).
    const digitCosts = [0, 2, 5, 5, 4, 5, 6, 3, 7, 6];

    // Map available digits to objects containing their value and cost.
    const digitInfo = availableDigits.map(function (val) {
      return {
        val: val,
        price: digitCosts[val]
      };
    });

    // Sort the digit information in descending order of digit value.
    orderByProperties(digitInfo, [["val", -1.0]]);

    // Initialize dynamic programming table.
    // memoTable[i] stores [max_length, digit_used_to_reach_this_length] for sum i.
    const memoTable = [[0x0, void 0], [Number.NEGATIVE_INFINITY, void 0]];

    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      // Iterate from sum 2 up to N (targetSum).
      for (var _iterator2 = numberSequence(2.0, targetSum + 1.0)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        const currentSum = _step2.value;
        // Initialize max length and corresponding digit for the current sum.
        let maxLenDigit = [Number.NEGATIVE_INFINITY, void 0];

        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          // Consider each available digit.
          for (var _iterator3 = digitInfo[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var _step3$value = _step3.value,
                val = _step3$value.val, // The digit's value.
                price = _step3$value.price; // The digit's cost.

            // If the current digit's cost can be afforded by the current sum.
            if (price <= currentSum) {
              // Calculate the length if this digit is used.
              const currentLength = 1.0 + memoTable[currentSum - price][0];
              // If this path yields a longer number, update maxLenDigit.
              if (currentLength > maxLenDigit[0]) {
                maxLenDigit = [currentLength, val];
              }
            }
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
              _iterator3.return();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }

        // Store the best result for the current sum.
        memoTable[currentSum] = maxLenDigit;
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }

    // Reconstruct the largest number by backtracking.
    let finalResult = "";
    let remainingSum = targetSum;

    // Backtrack through the memoTable to build the number.
    for (; remainingSum > 0x0;) {
      const _dp$matches = _slicedToArray(memoTable[remainingSum], 2),
            chosenVal = _dp$matches[1]; // The digit chosen for this sum.

      finalResult += chosenVal; // Append the digit to the result string.
      remainingSum -= digitCosts[chosenVal]; // Subtract its cost from the remaining sum.
    }

    // Output the final result to the console.
    console.log(finalResult);

  }(require("fs").readFileSync('/dev/stdin', "utf8")); // Read input from standard input.
}();
