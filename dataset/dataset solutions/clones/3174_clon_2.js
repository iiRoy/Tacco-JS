"use strict";

// Helper function to convert an iterable to an array, handling non-array iterables.
function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
}

// Throws an error if an attempt is made to spread a non-iterable instance.
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance");
}

// Creates a shallow copy of an array.
function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) {
      arr2[i] = arr[i];
    }
    return arr2;
  }
}

// Ensures a class is called with 'new'.
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

// Defines properties on a target object.
function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

// Creates a class with prototype and static properties.
function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

// Converts an iterable to an array, handling non-array iterables.
function _toArray(arr) {
  return _arrayWithHoles(arr) || _iterableToArray(arr) || _nonIterableRest();
}

// Converts an iterable to an array.
function _iterableToArray(iter) {
  if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
}

// Slices an array into a fixed number of elements.
function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

// Throws an error if an attempt is made to destructure a non-iterable instance.
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

// Converts an iterable to an array with a limit on the number of elements.
function _iterableToArrayLimit(arr, i) {
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;
  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);
      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) {
        _i["return"]();
      }
    } finally {
      if (_d) throw _e;
    }
  }
  return _arr;
}

// Returns an array if the input is an array.
function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

// The primary execution function for the program.
function mainProcess() {
  // --- Start of main logic ---
  (function (dataInput) {
    // Split the input string into an array of lines.
    var inputLines = dataInput.split("\n");

    // Parse the first line to get N, A, B, C.
    var parsedNumbers = parseNumbersFromString(inputLines[0]);
    var destructuredNumbers = _slicedToArray(parsedNumbers, 4);
    var numItems = destructuredNumbers[0]; // N
    var targetA = destructuredNumbers[1]; // A
    var targetB = destructuredNumbers[2]; // B
    var targetC = destructuredNumbers[3]; // C

    // Parse the subsequent lines to get the lengths of the bamboo items.
    var itemLengths = parseNumbersFromString(inputLines.slice(1).slice(0, numItems));

    // Initialize the minimum cost to a very large number.
    var minimumCost = Infinity;

    // Variables for iterator state (Babel generated).
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      // Iterate through all possible combinations of assigning bamboo items to groups A, B, C, or discarding them.
      // There are 4 choices for each of N items (A, B, C, or discard), so 4^N combinations.
      for (var _iterator = generateSequence(0, Math.pow(4, numItems))[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var combinationIndex = _step.value; // Represents the current combination as an integer.

        // Initialize arrays for items assigned to each group.
        var groupA = [],
          groupB = [],
          groupC = [];
        var itemCounter = 0; // Tracks which bamboo item is being processed.
        var tempCombinationIndex = combinationIndex; // Use a temporary variable for bit manipulation.

        // Decode the combination index to assign items to groups.
        while (itemCounter < numItems) {
          var assignedGroupType = tempCombinationIndex % 4; // 0: discard, 1: groupA, 2: groupB, 3: groupC
          // Add the current bamboo item's length to the corresponding group.
          [[], groupA, groupB, groupC][assignedGroupType].push(itemLengths[itemCounter]);
          tempCombinationIndex >>= 2; // Move to the next pair of bits for the next item.
          itemCounter++;
        }

        // If any group is empty, this combination is invalid, so skip it.
        if (groupA.length === 0 || groupB.length === 0 || groupC.length === 0) {
          continue;
        }

        // Calculate the total cost for the current combination.
        var currentCombinationCost = calculateMagicPoints(groupA, targetA) +
          calculateMagicPoints(groupB, targetB) +
          calculateMagicPoints(groupC, targetC);

        // Update the minimum cost if the current combination is cheaper.
        if (minimumCost > currentCombinationCost) {
          minimumCost = currentCombinationCost;
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

    // Output the final minimum cost.
    console.log(minimumCost);

    /**
     * Calculates the "magic points" cost for a given group of bamboo items.
     * @param {number[]} lengthsArray - An array of bamboo item lengths.
     * @param {number} desiredLength - The target length for the combined bamboo.
     * @returns {number} The calculated magic points cost.
     */
    function calculateMagicPoints(lengthsArray, desiredLength) {
      // Cost for combining items (10 MP per merge operation).
      var baseCost = (lengthsArray.length - 1) * 10;
      // Sum of all bamboo lengths in the group.
      var totalLength = lengthsArray.reduce(function (accumulator, current) {
        return accumulator + current;
      }, 0);
      // Add the cost for length adjustment (absolute difference from target).
      return baseCost + Math.abs(totalLength - desiredLength);
    }
  })(require("fs").readFileSync("/dev/stdin", "utf8")); // Read input from stdin.

  /**
   * Parses a string or array of strings into an array of integers.
   * @param {string|string[]} inputLine - The string or array of strings to parse.
   * @returns {number[]} An array of parsed integers.
   */
  function parseNumbersFromString(inputLine) {
    return (Array.isArray(inputLine) ? inputLine : inputLine.split(/\s+/)).map(function (numericString) {
      return parseInt(numericString);
    });
  }

  /**
   * Generates a sequence of integers within a specified range.
   * @generator
   * @param {number} startIndex - The starting integer (inclusive).
   * @param {number} endIndex - The ending integer (exclusive).
   * @yields {number} Each integer in the sequence.
   */
  function* generateSequence(startIndex, endIndex) {
    for (var currentNumber = startIndex; currentNumber < endIndex; currentNumber++) {
      yield currentNumber;
    }
  }

  // The following functions and class are not used in the main problem logic
  // but are part of the original file. They are cloned as Type II.

  /**
   * Iterates over integers in [end, start) in descending order.
   * (This function is present in the original but commented out/unused).
   */
  // function* generateReverseSequence(end, start) {
  //   for (var i = end - 1; i >= start; i--) {
  //     yield i;
  //   }
  // }

  /**
   * Implementation of an arbitrary-precision unsigned integer.
   * This class handles numbers larger than JavaScript's standard Number type can safely represent.
   */
  var BigIntHandler =
    /*#__PURE__*/
    function () {
      /**
       * Constructs a new BigIntHandler instance.
       * @param {number} initialValue - The initial numeric value.
       */
      function BigIntHandler(initialValue) {
        _classCallCheck(this, BigIntHandler);

        // Internal array to store segments of the large number.
        // Enough for 64-bit numbers (3 segments for 10^7 border).
        this.data = [0, 0, 0];
        var segmentIndex = 0;

        // Convert the initial value into segments based on the defined border.
        while (initialValue !== 0) {
          this.data[segmentIndex] = initialValue % BigIntHandler.segmentBoundary;
          initialValue = Math.floor(initialValue / BigIntHandler.segmentBoundary);
          segmentIndex++;
        }
      }

      _createClass(BigIntHandler, [{
        key: "add",
        value: function add(otherOperand) {
          var operationResult = new BigIntHandler(0);
          var maxSegmentCount = Math.max(this.data.length, otherOperand.data.length);
          var carryOver = 0;
          var segmentIndex = 0;

          // Perform addition segment by segment, handling carry-overs.
          for (; segmentIndex < maxSegmentCount; segmentIndex++) {
            var segmentSum = (this.data[segmentIndex] || 0) + (otherOperand.data[segmentIndex] || 0) + carryOver;
            operationResult.data[segmentIndex] = segmentSum % BigIntHandler.segmentBoundary;
            carryOver = Math.floor(segmentSum / BigIntHandler.segmentBoundary);
          }

          // If there's a final carry-over, add it as a new segment.
          if (carryOver > 0) {
            operationResult.data[segmentIndex] = carryOver;
          }

          return operationResult;
        }
      }, {
        key: "mul",
        value: function mul(otherOperand) {
          var operationResult = new BigIntHandler(0);

          // Perform multiplication using a standard long multiplication algorithm.
          for (var leftSegmentIndex = 0; leftSegmentIndex < this.data.length; leftSegmentIndex++) {
            for (var rightSegmentIndex = 0; rightSegmentIndex < otherOperand.data.length; rightSegmentIndex++) {
              var segmentProduct = this.data[leftSegmentIndex] * otherOperand.data[rightSegmentIndex];
              var targetSegmentIndex = leftSegmentIndex + rightSegmentIndex;
              var remainingProduct = segmentProduct;

              // Distribute the product into the result's segments, handling carries.
              while (remainingProduct > 0) {
                var segmentSum = (operationResult.data[targetSegmentIndex] || 0) + remainingProduct;
                operationResult.data[targetSegmentIndex] = segmentSum % BigIntHandler.segmentBoundary;
                remainingProduct = Math.floor(segmentSum / BigIntHandler.segmentBoundary);
                targetSegmentIndex++;
              }
            }
          }

          return operationResult;
        }
      }, {
        key: "toString",
        value: function toString() {
          // Create a copy and reverse it for easier processing (most significant segment first).
          var reversedSegments = this.data.concat().reverse();

          // Find the index of the first non-zero segment to avoid leading zeros.
          var firstSignificantSegmentIndex = function (segmentArray, checkFunction) {
            for (var i = 0; i < segmentArray.length; i++) {
              if (checkFunction(segmentArray[i], i)) {
                return i;
              }
            }
            return null;
          } // Not a full polyfill, just a simple findIndex.
          (reversedSegments, function (segmentValue) {
            return segmentValue !== 0;
          });

          // If all segments are zero, the number is "0".
          if (firstSignificantSegmentIndex == null) {
            return "0";
          }

          // Convert segments to strings, padding with zeros where necessary.
          return reversedSegments.slice(firstSignificantSegmentIndex).map(function (segmentValue, segmentPosition) {
            if (segmentPosition === 0) {
              return String(segmentValue); // First segment doesn't need padding.
            } else {
              // Subsequent segments need to be padded to the full segmentDigits length.
              return padStringWithChar(String(segmentValue), BigIntHandler.segmentDigits, "0");
            }
          }).join("");

          /**
           * Pads the start of a string with a specified character until it reaches a target length.
           * @param {string} inputString - The string to pad.
           * @param {number} targetLength - The desired total length of the string.
           * @param {string} paddingCharacter - The character to use for padding.
           * @returns {string} The padded string.
           */
          function padStringWithChar(inputString, targetLength, paddingCharacter) {
            var charsToPad = targetLength - inputString.length;
            var finalPaddedString = "";

            for (var i = 0; i < charsToPad; i++) {
              finalPaddedString += paddingCharacter;
            }

            return finalPaddedString + inputString;
          }
        }
      }]);

      return BigIntHandler;
    }();

  /** Number of digits per segment in the internal data array. */
  BigIntHandler.segmentDigits = 7;
  /** The boundary value for each segment (e.g., 10^7). */
  BigIntHandler.segmentBoundary = Math.pow(10, BigIntHandler.segmentDigits);

  /**
   * Runs a recursive function expressed as a generator function.
   * (This comment is present in the original but the functionality is not implemented/used).
   */
  // --- End of main logic ---
}

// Execute the main process.
mainProcess();
