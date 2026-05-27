"use strict";

// Helper function to convert an array-like object to an array with holes
function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

// Helper function to convert an iterable to an array
function _iterableToArray(iter) {
  if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
}

// Helper function for non-iterable rest elements
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

// Helper function to limit iterable to a certain number of elements
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
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }
  return _arr;
}

// Helper function for slicing an array into parts
function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

// Helper function to convert an array-like object to an array
function _toArray(arr) {
  return _arrayWithHoles(arr) || _iterableToArray(arr) || _nonIterableRest();
}

// Main application logic wrapped in an IIFE
(function () {

  /**
   * Parses a line of space-separated numbers into an array of integers.
   * @param {string|string[]} inputLine - The line string or an array of string numbers.
   * @returns {number[]} An array of parsed integers.
   */
  function parseNumbers(inputLine) {
    return (Array.isArray(inputLine) ? inputLine : inputLine.split(/\s+/)).map(function (numStr) {
      return parseInt(numStr);
    });
  }

  // Immediately invoked function to process input
  (function (rawData) {
    // Split the raw input string into individual lines
    var inputLines = rawData.split("\n");

    // Parse the first line to get the number of switches (numSwitches) and lamps (numLamps)
    var _parseNumbers = parseNumbers(inputLines[0]),
      _parseNumbers2 = _slicedToArray(_parseNumbers, 2),
      numSwitches = _parseNumbers2[0],
      numLamps = _parseNumbers2[1];

    // Process subsequent lines to get lamp configurations
    var lampConfigurations = inputLines.slice(1, numLamps + 1).map(function (currentLine, lampIndex) {
      var _parseNumbers3 = parseNumbers(currentLine),
        _parseNumbers4 = _toArray(_parseNumbers3),
        switchCount = _parseNumbers4[0], // Number of switches connected to this lamp
        switchIndices = _parseNumbers4.slice(1); // Indices of connected switches

      return {
        switchCount: switchCount,
        switchIndices: switchIndices,
        lampIdentifier: lampIndex // Original index of the lamp
      };
    });

    // Parse the line containing parity requirements for each lamp
    var parityRequirements = parseNumbers(inputLines[numLamps + 1]);

    // Initialize a counter for valid switch combinations
    var validCombinations = 0;

    // Iterate through all possible switch combinations (2^numSwitches)
    combinationLoop: for (var currentCombination = 0; currentCombination < Math.pow(2, numSwitches); currentCombination++) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        // For each combination, check every lamp
        for (var _iterator = lampConfigurations[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var _step$value = _step.value,
            lampSwitchIndices = _step$value.switchIndices, // Switches connected to the current lamp
            lampIdentifier = _step$value.lampIdentifier; // Index of the current lamp

          var activeSwitchCount = 0; // Counter for active switches for this lamp
          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            // Check each switch connected to the current lamp
            for (var _iterator2 = lampSwitchIndices[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var switchIdx = _step2.value; // Index of a connected switch

              // If the switch is 'on' in the current combination (bit is set)
              if (currentCombination & 1 << switchIdx - 1) {
                activeSwitchCount++;
              }
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

          // Check if the parity of active switches matches the requirement for this lamp
          if (activeSwitchCount % 2 !== parityRequirements[lampIdentifier]) {
            // If not, this combination is invalid; move to the next combination
            continue combinationLoop;
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

      // If all lamps are satisfied for this combination, increment the valid combinations count
      validCombinations++;
    }

    // Output the total number of valid switch combinations
    console.log(validCombinations);

  }(require("fs").readFileSync("/dev/stdin", "utf8"))); // Read input from stdin
}());
