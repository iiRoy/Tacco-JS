"use strict";

function _convertToArray(inputArray) {
  return _fillArray(inputArray) || _toArrayFromIterable(inputArray) || _noSpread();
}

function _noSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance");
}

function _toArrayFromIterable(iterableObj) {
  if (Symbol.iterator in Object(iterableObj) || Object.prototype.toString.call(iterableObj) === "[object Arguments]") return Array.from(iterableObj);
}

function _fillArray(sourceArray) {
  if (Array.isArray(sourceArray)) {
    for (var i = 0, newArray = new Array(sourceArray.length); i < sourceArray.length; i++) {
      newArray[i] = sourceArray[i];
    }
    return newArray;
  }
}

function _extractArrayParts(sourceArray, count) {
  return _getArray(sourceArray) || _limitIterableToArray(sourceArray, count) || _noRest();
}

function _noRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

function _limitIterableToArray(iterableObj, limit) {
  var _tempArr = [];
  var _isDone = false;
  var _hasError = false;
  var _errorVal = undefined;
  try {
    for (var _iter = iterableObj[Symbol.iterator](), _item; !(_isDone = (_item = _iter.next()).done); _isDone = true) {
      _tempArr.push(_item.value);
      if (limit && _tempArr.length === limit) break;
    }
  } catch (err) {
    _hasError = true;
    _errorVal = err;
  } finally {
    try {
      if (!_isDone && _iter["return"] != null) _iter["return"]();
    } finally {
      if (_hasError) {
        throw _errorVal;
      }
    }
  }
  return _tempArr;
}

function _getArray(inputArray) {
  if (Array.isArray(inputArray)) return inputArray;
}

function _executeProgram() {
  // Main program logic starts here
  (function (rawData) {
    // Split the entire input into individual lines
    var inputLines = rawData.split("\n");

    // Parse the first line for N, M, Q values
    var _parsedValues = parseNumbers(inputLines[0]),
      _extractedValues = _extractArrayParts(_parsedValues, 3),
      maxStation = _extractedValues[0],
      numTrains = _extractedValues[1],
      numQueries = _extractedValues[2];

    // Process train route data from subsequent lines
    var trainRoutes = inputLines.slice(1, numTrains + 1).map(function (currentLine) {
      var _routeValues = parseNumbers(currentLine),
        _extractedRoute = _extractArrayParts(_routeValues, 2),
        startStation = _extractedRoute[0],
        endStation = _extractedRoute[1];
      return {
        startStation: startStation,
        endStation: endStation
      };
    });

    // Process query data from the remaining lines
    var userQueries = inputLines.slice(numTrains + 1).map(function (currentLine) {
      var _queryValues = parseNumbers(currentLine),
        _extractedQuery = _extractArrayParts(_queryValues, 2),
        queryStart = _extractedQuery[0],
        queryEnd = _extractedQuery[1];
      return {
        queryStart: queryStart,
        queryEnd: queryEnd
      };
    }).slice(0, numQueries); // Ensure only Q queries are processed

    // Sort train routes primarily by endStation, then by startStation
    orderByKeys(trainRoutes, ["endStation", "startStation"]);

    // Initialize a 2D array to store cumulative counts
    var cumulativeCounts = [
      []
    ];
    var trainIndex = 0; // Pointer for iterating through sorted trainRoutes

    var _iterComplete1 = true;
    var _iterError1 = undefined;
    var _iterException1 = undefined;

    try {
      // Iterate through possible end stations (r)
      for (var _iterObj1 = numSequence(1, maxStation + 1)[Symbol.iterator](), _iterStep1; !(_iterComplete1 = (_iterStep1 = _iterObj1.next()).done); _iterComplete1 = true) {
        var currentEnd = _iterStep1.value;
        var rowCounts = [0]; // Array to store counts for the current endStation
        var currentCount = 0; // Counter for trains ending at currentEnd and starting at currentStart

        var _iterComplete3 = true;
        var _iterError3 = undefined;
        var _iterException3 = undefined;

        try {
          // Iterate through possible start stations (l)
          for (var _iterObj3 = numSequence(1, maxStation + 1)[Symbol.iterator](), _iterStep3; !(_iterComplete3 = (_iterStep3 = _iterObj3.next()).done); _iterComplete3 = true) {
            var currentStart = _iterStep3.value;

            // Advance trainIndex past trains that end before currentEnd or start before currentStart
            for (; trainIndex < numTrains && (trainRoutes[trainIndex].endStation < currentEnd || trainRoutes[trainIndex].endStation === currentEnd && trainRoutes[trainIndex].startStation < currentStart); trainIndex++) {}

            // Count trains that exactly match currentEnd and currentStart
            for (; trainIndex < numTrains && trainRoutes[trainIndex].endStation === currentEnd && trainRoutes[trainIndex].startStation === currentStart; trainIndex++) {
              currentCount++;
            }
            rowCounts.push(currentCount); // Store the count for this (currentStart, currentEnd) pair
          }
        } catch (err) {
          _iterError3 = true;
          _iterException3 = err;
        } finally {
          try {
            if (!_iterComplete3 && _iterObj3.return != null) {
              _iterObj3.return();
            }
          } finally {
            if (_iterError3) {
              throw _iterException3;
            }
          }
        }

        cumulativeCounts.push(rowCounts); // Add the row of counts to the main cumulativeCounts array
      }
    } catch (err) {
      _iterError1 = true;
      _iterException1 = err;
    } finally {
      try {
        if (!_iterComplete1 && _iterObj1.return != null) {
          _iterObj1.return();
        }
      } finally {
        if (_iterError1) {
          throw _iterException1;
        }
      }
    }

    var _iterComplete2 = true;
    var _iterError2 = undefined;
    var _iterException2 = undefined;

    try {
      // Process each query
      for (var _iterObj2 = userQueries[Symbol.iterator](), _iterStep2; !(_iterComplete2 = (_iterStep2 = _iterObj2.next()).done); _iterComplete2 = true) {
        var _currentQuery = _iterStep2.value,
          queryStartStation = _currentQuery.queryStart,
          queryEndStation = _currentQuery.queryEnd;
        var totalTrains = 0; // Accumulator for the current query's result

        var _iterComplete4 = true;
        var _iterError4 = undefined;
        var _iterException4 = undefined;

        try {
          // Iterate through the range of end stations for the current query
          for (var _iterObj4 = numSequence(queryStartStation, queryEndStation + 1)[Symbol.iterator](), _iterStep4; !(_iterComplete4 = (_iterStep4 = _iterObj4.next()).done); _iterComplete4 = true) {
            var currentRangeEnd = _iterStep4.value;
            // Calculate the number of trains within the query range for the current end station
            totalTrains += cumulativeCounts[currentRangeEnd][queryEndStation] - cumulativeCounts[currentRangeEnd][queryStartStation - 1];
          }
        } catch (err) {
          _iterError4 = true;
          _iterException4 = err;
        } finally {
          try {
            if (!_iterComplete4 && _iterObj4.return != null) {
              _iterObj4.return();
            }
          } finally {
            if (_iterError4) {
              throw _iterException4;
            }
          }
        }

        console.log(totalTrains); // Output the result for the current query
      }
    } catch (err) {
      _iterError2 = true;
      _iterException2 = err;
    } finally {
      try {
        if (!_iterComplete2 && _iterObj2.return != null) {
          _iterObj2.return();
        }
      } finally {
        if (_iterError2) {
          throw _iterException2;
        }
      }
    }
  })(require("fs").readFileSync("/dev/stdin", "utf8"));

  /**
   * Parses a line of space-separated numbers into an array of integers.
   * @param {string|Array<string>} inputString - The string or array of strings to parse.
   * @returns {Array<number>} An array of parsed integers.
   */
  function parseNumbers(inputString) {
    return (Array.isArray(inputString) ? inputString : inputString.split(/\s+/)).map(function (numStr) {
      return parseInt(numStr);
    });
  }

  /**
   * Generates a sequence of integers from beginVal (inclusive) to endVal (exclusive).
   * @param {number} beginVal - The starting integer.
   * @param {number} endVal - The ending integer (exclusive).
   * @yields {number} Each integer in the sequence.
   */
  function* numSequence(beginVal, endVal) {
    for (var idx = beginVal; idx < endVal; idx++) {
      yield idx;
    }
  }

  /**
   * Sorts an array of objects based on one or more keys.
   * Keys can specify ascending/descending order.
   * @param {Array<Object>} dataArray - The array of objects to sort.
   * @param {Array<string|Array>} sortKeys - An array of keys or [key, order] pairs.
   * @returns {Array<Object>} The sorted array.
   */
  function orderByKeys(dataArray, sortKeys) {
    if (!Array.isArray(sortKeys)) {
      sortKeys = [sortKeys];
    }

    return dataArray.sort(function (itemA, itemB) {
      var _iterComplete5 = true;
      var _iterError5 = undefined;
      var _iterException5 = undefined;

      try {
        for (var _iterObj5 = sortKeys[Symbol.iterator](), _iterStep5; !(_iterComplete5 = (_iterStep5 = _iterObj5.next()).done); _iterComplete5 = true) {
          var currentKey = _iterStep5.value;

          if ("string" === typeof currentKey) {
            var diffValue = itemA[currentKey] - itemB[currentKey];

            if (diffValue !== 0) {
              return diffValue;
            }
          } else {
            var _diffValue = itemA[currentKey[0]] - itemB[currentKey[0]];
            var sortDirection = currentKey[1] === "desc" ? -1 : currentKey[1] === "asc" ? 1 : Number(currentKey[1]);

            if (_diffValue !== 0) {
              return _diffValue * sortDirection;
            }
          }
        }
      } catch (err) {
        _iterError5 = true;
        _iterException5 = err;
      } finally {
        try {
          if (!_iterComplete5 && _iterObj5.return != null) {
            _iterObj5.return();
          }
        } finally {
          if (_iterError5) {
            throw _iterException5;
          }
        }
      }

      return 0; // Items are equal based on all specified keys
    });
  }
  // No recursive generator function is used in this specific problem.
}

_executeProgram();
