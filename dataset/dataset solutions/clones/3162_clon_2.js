"use strict";

// Helper function to create a shallow copy of an array.
function _getArrayCopy(inputArray) {
  return _getArrayWithoutHoles(inputArray) || _transformIterableToArray(inputArray) || _throwNonIterableSpreadError();
}

// Throws an error if an attempt is made to spread a non-iterable instance.
function _throwNonIterableSpreadError() {
  throw new TypeError("Invalid attempt to spread non-iterable instance");
}

// Helper to get an array without holes, if it's a true array.
function _getArrayWithoutHoles(inputArray) {
  if (Array.isArray(inputArray)) {
    for (var i = 0, newArray = new Array(inputArray.length); i < inputArray.length; i++) {
      newArray[i] = inputArray[i];
    }
    return newArray;
  }
}

// Verifies that a function is called as a constructor.
function _verifyClassInstance(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

// Defines properties on a target object.
function _setObjectProperties(targetObject, propertiesList) {
  for (var i = 0; i < propertiesList.length; i++) {
    var propertyDescriptor = propertiesList[i];
    propertyDescriptor.enumerable = propertyDescriptor.enumerable || false;
    propertyDescriptor.configurable = true;
    if ("value" in propertyDescriptor) propertyDescriptor.writable = true;
    Object.defineProperty(targetObject, propertyDescriptor.key, propertyDescriptor);
  }
}

// Creates a class with prototype and static properties.
function _constructClass(Constructor, prototypeProperties, staticProperties) {
  if (prototypeProperties) _setObjectProperties(Constructor.prototype, prototypeProperties);
  if (staticProperties) _setObjectProperties(Constructor, staticProperties);
  return Constructor;
}

// Converts an iterable to an array.
function _convertToArray(inputIterable) {
  return _getArrayWithHoles(inputIterable) || _transformIterableToArray(inputIterable) || _throwNonIterableRestError();
}

// Transforms an iterable object into an array.
function _transformIterableToArray(iter) {
  if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
}

// Extracts a slice from an array with a limit.
function _extractArraySlice(inputArray, limit) {
  return _getArrayWithHoles(inputArray) || _limitIterableToArray(inputArray, limit) || _throwNonIterableRestError();
}

// Throws an error for non-iterable destructuring.
function _throwNonIterableRestError() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

// Limits an iterable to a certain number of elements and converts to array.
function _limitIterableToArray(inputArray, limitCount) {
  var _tempArray = [];
  var _isNormal = true;
  var _hasError = false;
  var _errorDetails = undefined;
  try {
    for (var _iterator = inputArray[Symbol.iterator](), _step; !(_isNormal = (_step = _iterator.next()).done); _isNormal = true) {
      _tempArray.push(_step.value);
      if (limitCount && _tempArray.length === limitCount) break;
    }
  } catch (err) {
    _hasError = true;
    _errorDetails = err;
  } finally {
    try {
      if (!_isNormal && _iterator["return"] != null) _iterator["return"]();
    } finally {
      if (_hasError) throw _errorDetails;
    }
  }
  return _tempArray;
}

// Returns an array if it's a true array.
function _getArrayWithHoles(inputArray) {
  if (Array.isArray(inputArray)) return inputArray;
}

// Main execution function for the program.
function _executePrimaryLogic() {
  // Helper function to parse numbers from a string or array.
  function parseNumbersFromString(inputLine) {
    return (Array.isArray(inputLine) ? inputLine : inputLine.split(/\s+/)).map(function (numStr) {
      return parseInt(numStr);
    });
  }

  /**
   * Implementation of an arbitrary-precision unsigned integer.
   * This class handles large numbers by storing them in segments.
   */
  var BigIntHandler =
  /*#__PURE__*/
  function () {
    // Constructor initializes the big integer with a given value.
    function BigIntHandler(initialValue) {
      _verifyClassInstance(this, BigIntHandler); // Ensure it's called with 'new'.

      // Internal array to store number segments. Enough for 64-bit values.
      this.dataSegments = [0, 0, 0];
      var currentSegmentIndex = 0;

      // Convert the initial value into segments.
      while (initialValue !== 0) {
        this.dataSegments[currentSegmentIndex] = initialValue % BigIntHandler.segmentBoundary;
        initialValue = Math.floor(initialValue / BigIntHandler.segmentBoundary);
        currentSegmentIndex++;
      }
    }

    // Define methods for the BigIntHandler class.
    _constructClass(BigIntHandler, [{
      key: "performAddition",
      value: function performAddition(otherOperand) {
        var operationResult = new BigIntHandler(0); // Initialize result.
        var maxLength = Math.max(this.dataSegments.length, otherOperand.dataSegments.length);
        var carryOver = 0;
        var segmentIterator = 0;

        // Iterate through segments, performing addition with carry.
        for (; segmentIterator < maxLength; segmentIterator++) {
          var currentSum = (this.dataSegments[segmentIterator] || 0) + (otherOperand.dataSegments[segmentIterator] || 0) + carryOver;
          operationResult.dataSegments[segmentIterator] = currentSum % BigIntHandler.segmentBoundary;
          carryOver = Math.floor(currentSum / BigIntHandler.segmentBoundary);
        }

        // If there's a remaining carry, add it as a new segment.
        if (carryOver > 0) {
          operationResult.dataSegments[segmentIterator] = carryOver;
        }

        return operationResult;
      }
    }, {
      key: "performMultiplication",
      value: function performMultiplication(otherOperand) {
        var operationResult = new BigIntHandler(0); // Initialize result.

        // Nested loops to multiply each segment.
        for (var leftSegmentIndex = 0; leftSegmentIndex < this.dataSegments.length; leftSegmentIndex++) {
          for (var rightSegmentIndex = 0; rightSegmentIndex < otherOperand.dataSegments.length; rightSegmentIndex++) {
            var productPart = this.dataSegments[leftSegmentIndex] * otherOperand.dataSegments[rightSegmentIndex];
            var targetSegmentIndex = leftSegmentIndex + rightSegmentIndex;
            var currentProductValue = productPart;

            // Propagate carries from the product.
            while (currentProductValue > 0) {
              var segmentSum = (operationResult.dataSegments[targetSegmentIndex] || 0) + currentProductValue;
              operationResult.dataSegments[targetSegmentIndex] = segmentSum % BigIntHandler.segmentBoundary;
              currentProductValue = Math.floor(segmentSum / BigIntHandler.segmentBoundary);
              targetSegmentIndex++;
            }
          }
        }

        return operationResult;
      }
    }, {
      key: "toDecimalString",
      value: function toDecimalString() {
        // Create a reversed copy of the data segments.
        var reversedDataSegments = this.dataSegments.concat().reverse();

        // Find the index of the first non-zero segment.
        var firstNonZeroIndex = function (inputArray, predicateFunction) {
          for (var loopCounter = 0; loopCounter < inputArray.length; loopCounter++) {
            if (predicateFunction(inputArray[loopCounter], loopCounter)) {
              return loopCounter;
            }
          }
          return null; // Return null if no non-zero segment is found.
        }(reversedDataSegments, function (currentValue) {
          return currentValue !== 0;
        });

        // If all segments are zero, the number is "0".
        if (firstNonZeroIndex == null) {
          return "0";
        }

        // Convert segments to string, padding as necessary.
        return reversedDataSegments.slice(firstNonZeroIndex).map(function (currentValue, index) {
          if (index === 0) {
            return String(currentValue); // First segment is not padded.
          } else {
            // Pad subsequent segments with leading zeros.
            return padStringStart(String(currentValue), BigIntHandler.segmentDigits, "0");
          }
        }).join(""); // Join all segment strings.

        // Local helper function to pad a string at the start.
        function padStringStart(inputString, targetLength, paddingChar) {
          var paddingNeeded = targetLength - inputString.length;
          var resultString = "";

          for (var loopCounter = 0; loopCounter < paddingNeeded; loopCounter++) {
            resultString += paddingChar;
          }

          return resultString + inputString;
        }
      }
    }]);

    return BigIntHandler;
  }();

  /** Number of digits per segment. */
  BigIntHandler.segmentDigits = 7;
  /** The boundary value for each segment (10^segmentDigits). */
  BigIntHandler.segmentBoundary = Math.pow(10, BigIntHandler.segmentDigits);

  /**
   * DisjointSet data structure for integers in [0, N).
   * Used for managing connected components.
   */
  var DisjointSet =
  /*#__PURE__*/
  function () {
    // Constructor initializes N elements, each in its own set.
    function DisjointSet(totalElements) {
      _verifyClassInstance(this, DisjointSet);

      this.elementNodes = new Array(totalElements).fill(null).map(function () {
        return {
          parentNode: null, // Reference to parent node.
          /**
           * Size of the set.
           * Meaningful only if this node is the root of its set.
           */
          setSize: 1
        };
      });
    }

    /**
     * Finds the root of the set containing the given element.
     * Performs path compression during traversal.
     */
    _constructClass(DisjointSet, [{
      key: "findRoot",
      value: function findRoot(elementId) {
        var currentNode = this.elementNodes[elementId];
        var pathCompressionRoute = []; // Stores nodes visited on the way to the root.

        // Traverse up to find the root.
        while (currentNode.parentNode != null) {
          pathCompressionRoute.push(currentNode);
          currentNode = currentNode.parentNode;
        }

        // Path compression: make all nodes on the path point directly to the root.
        for (var _loopIndex = 0; _loopIndex < pathCompressionRoute.length; _loopIndex++) {
          var routeNode = pathCompressionRoute[_loopIndex];
          routeNode.parentNode = currentNode;
        }

        return currentNode; // Return the root node.
      }
      /**
       * Unites two sets containing the given elements.
       * @returns The new root of the merged set, or undefined if already in the same set.
       */

    }, {
      key: "uniteSets",
      value: function uniteSets(firstElement, secondElement) {
        var rootOne = this.findRoot(firstElement);
        var rootTwo = this.findRoot(secondElement);

        // If elements are already in the same set, do nothing.
        if (rootOne === rootTwo) {
          return;
        }

        // Merge the smaller set into the larger one (by size, though not explicitly implemented here, just attaching).
        rootTwo.parentNode = rootOne;
        rootOne.setSize += rootTwo.setSize; // Update the size of the new root.
        return rootOne;
      }
    }]);

    return DisjointSet;
  }();

  // ---------- Main program logic starts here ----------
  (function (rawData) {
    var inputLines = rawData.split("\n");

    // Parse N (number of cities) and M (number of bridges) from the first line.
    var _parsedConfig = parseNumbersFromString(inputLines[0]),
        _extractedConfig = _extractArraySlice(_parsedConfig, 2),
        numCities = _extractedConfig[0],
        numBridges = _extractedConfig[1];

    // Parse bridge connections from subsequent lines.
    var bridgeConnections = inputLines.slice(1, numBridges + 1).map(function (currentLine) {
      var _parsedBridge = parseNumbersFromString(currentLine),
          _extractedBridge = _extractArraySlice(_parsedBridge, 2),
          cityA = _extractedBridge[0],
          cityB = _extractedBridge[1];

      return {
        cityA: cityA,
        cityB: cityB
      };
    });

    var unhappinessScores = []; // Stores the calculated unhappiness scores.
    bridgeConnections.reverse(); // Process bridges in reverse order.

    var cityDisjointSets = new DisjointSet(numCities); // Initialize DisjointSet for cities.
    var currentPairCount = 0; // Tracks the number of connected pairs.

    var _iterCompletionStatus = true;
    var _iterHadError = false;
    var _iterErrorDetails = undefined;

    try {
      // Iterate through bridges in reverse order.
      for (var _dataIterator = bridgeConnections[Symbol.iterator](), _currentStep; !(_iterCompletionStatus = (_currentStep = _dataIterator.next()).done); _iterCompletionStatus = true) {
        var _currentBridgeData = _currentStep.value,
            cityA = _currentBridgeData.cityA,
            cityB = _currentBridgeData.cityB;

        unhappinessScores.push(currentPairCount); // Store current pair count before processing bridge.

        var rootOfA = cityDisjointSets.findRoot(cityA - 1); // Find root of city A's set.
        var rootOfB = cityDisjointSets.findRoot(cityB - 1); // Find root of city B's set.

        // If cities are already connected, no change in pair count.
        if (rootOfA === rootOfB) {
          continue;
        }

        // If cities are not connected, they will become connected.
        // Add the product of their set sizes to currentPairCount.
        currentPairCount += rootOfA.setSize * rootOfB.setSize;
        cityDisjointSets.uniteSets(cityA - 1, cityB - 1); // Unite the sets.
      }
    } catch (err) {
      _iterHadError = true;
      _iterErrorDetails = err;
    } finally {
      try {
        if (!_iterCompletionStatus && _dataIterator["return"] != null) {
          _dataIterator["return"]();
        }
      } finally {
        if (_iterHadError) {
          throw _iterErrorDetails;
        }
      }
    }

    unhappinessScores.reverse(); // Reverse the results to get them in original bridge order.

    // Calculate the final output values (total possible pairs - connected pairs).
    var finalOutputValues = unhappinessScores.map(function (connectedPairs) {
      return numCities * (numCities - 1) / 2 - connectedPairs;
    });

    // Print each calculated value to the console.
    finalOutputValues.forEach(function (outputValue) {
      return console.log(outputValue);
    });
  })(require("fs").readFileSync("/dev/stdin", "utf8"));
}

// Execute the primary logic function.
_executePrimaryLogic();
