("use strict"); // Enforce strict mode for cleaner code practices

// --- Core Helper Functions (Transpiled-like utilities for array/iterator operations) ---

/**
 * Ensures an iterable can be safely converted to an array for spreading.
 * @param {*} sourceCollection - The value to convert.
 * @returns {Array} A new array.
 * @throws {TypeError} If the value is not iterable.
 */
function _ensureArrayConvertible(sourceCollection) {
  return _createShallowArrayCopy(sourceCollection) || _convertIteratorToArray(sourceCollection) || _raiseNonIterableError();
}

/**
 * Throws a TypeError when attempting to spread a non-iterable instance.
 * @throws {TypeError}
 */
function _raiseNonIterableError() {
  throw new TypeError("Attempt to spread a non-iterable value failed.");
}

/**
 * Converts an iterable object (like arguments or generator) into a proper Array.
 * @param {*} iterElement - The iterable object.
 * @returns {Array|undefined} A new Array if iterable, otherwise undefined.
 */
function _convertIteratorToArray(iterElement) {
  if (Symbol.iterator in Object(iterElement) || Object.prototype.toString.call(iterElement) === "[object Arguments]") {
    return Array.from(iterElement);
  }
}

/**
 * Creates a shallow copy of an array.
 * @param {Array} originalArray - The array to copy.
 * @returns {Array|undefined} A new array if the input is an array, otherwise undefined.
 */
function _createShallowArrayCopy(originalArray) {
  if (Array.isArray(originalArray)) {
    const newArrayCopy = new Array(originalArray.length);
    for (let currentIdx = 0; currentIdx < originalArray.length; currentIdx++) {
      newArrayCopy[currentIdx] = originalArray[currentIdx];
    }
    return newArrayCopy;
  }
}

/**
 * Helper for destructuring array elements from an iterable.
 * @param {*} sourceArray - The iterable source.
 * @param {number} limit - The maximum number of elements to extract.
 * @returns {Array} An array containing the extracted elements.
 * @throws {TypeError} If the value is not iterable.
 */
function _destructureArrayParts(sourceArray, limit) {
  return _checkIfArray(sourceArray) || _extractLimitedIteratorElements(sourceArray, limit) || _raiseInvalidDestructureError();
}

/**
 * Throws a TypeError when attempting to destructure a non-iterable instance.
 * @throws {TypeError}
 */
function _raiseInvalidDestructureError() {
  throw new TypeError("Invalid attempt to destructure a non-iterable instance.");
}

/**
 * Extracts a limited number of elements from an iterator.
 * @param {*} sourceIterable - The iterable object.
 * @param {number} limitCount - The maximum number of elements to extract.
 * @returns {Array} An array of extracted elements.
 */
function _extractLimitedIteratorElements(sourceIterable, limitCount) {
  const extractedElements = [];
  let isIterationComplete = true;
  let didEncounterError = false;
  let iterationError = undefined;
  try {
    for (var _iteratorInstance = sourceIterable[Symbol.iterator](), _stepResult; !(isIterationComplete = (_stepResult = _iteratorInstance.next()).done); isIterationComplete = true) {
      extractedElements.push(_stepResult.value);
      if (limitCount && extractedElements.length === limitCount) break;
    }
  } catch (err) {
    didEncounterError = true;
    iterationError = err;
  } finally {
    try {
      if (!isIterationComplete && _iteratorInstance["return"] != null) {
        _iteratorInstance["return"]();
      }
    } finally {
      if (didEncounterError) throw iterationError;
    }
  }
  return extractedElements;
}

/**
 * Checks if a value is an array.
 * @param {*} candidateArray - The value to check.
 * @returns {Array|undefined} The array itself if it is one, otherwise undefined.
 */
function _checkIfArray(candidateArray) {
  if (Array.isArray(candidateArray)) return candidateArray;
}

// --- Application Logic Utilities ---

/**
 * Parses a string line into an array of integers.
 * Handles both single string lines and pre-split string arrays.
 * @param {string|string[]} inputLine - The line to parse, or an array of string numbers.
 * @returns {number[]} An array of parsed integers.
 */
function parseIntegersFromLine(inputLine) {
  const stringNumbers = Array.isArray(inputLine) ? inputLine : inputLine.trim().split(/\s+/);
  return stringNumbers.map(numericString => parseInt(numericString, 10));
}

/**
 * Generates a sequence of integers from `begin` (inclusive) to `stop` (exclusive).
 * Implemented as a generator function for memory efficiency, especially with large ranges.
 * @param {number} begin - The starting integer.
 * @param {number} stop - The ending integer (exclusive).
 * @yields {number} Each integer in the sequence.
 */
function* generateNumericSequence(begin, stop) {
  for (let currentNumber = begin; currentNumber < stop; currentNumber++) {
    yield currentNumber;
  }
}

// --- Main Program Logic ---

/**
 * Processes a set of train route data and answers regional queries based on station counts.
 * It builds a 2D prefix sum array to efficiently count routes within specified regions.
 * @param {string} rawInputData - The entire input string, typically from stdin.
 * @returns {string[]} An array of results for each query, formatted as strings.
 *                     Includes error messages for invalid inputs or queries.
 */
function executeTrainRouteAnalysis(rawInputData) {
  const inputLines = rawInputData.split("\n");
  const outputResults = [];

  // Input validation: ensure there's at least a header line
  if (inputLines.length === 0 || inputLines[0].trim() === "") {
    return ["Error: No input data provided or empty header line."];
  }

  // Parse header line: stationCount (N), routeCount (M), queryCount (Q)
  const parsedHeader = parseIntegersFromLine(inputLines[0]);
  const headerElements = _destructureArrayParts(parsedHeader, 3);
  const stationCount = headerElements[0]; // N: Total number of stations
  const routeCount = headerElements[1];   // M: Total number of train routes
  const queryCount = headerElements[2];   // Q: Total number of regional queries

  // Additional validation for header values
  if (stationCount < 1 || routeCount < 0 || queryCount < 0) {
    return [`Error: Invalid header values: N=${stationCount}, M=${routeCount}, Q=${queryCount}.`];
  }
  if (inputLines.length < 1 + routeCount + queryCount) {
    return [`Error: Not enough input lines. Expected ${1 + routeCount + queryCount}, got ${inputLines.length}.`];
  }

  // Parse route segments (train routes)
  // Each route is defined by a startStation (l) and an endStation (r)
  const routeSegments = inputLines.slice(1, routeCount + 1).map(line => {
    const routeParts = parseIntegersFromLine(line);
    const segmentCoordinates = _destructureArrayParts(routeParts, 2);
    return {
      startStation: segmentCoordinates[0],
      endStation: segmentCoordinates[1]
    };
  });

  // Parse regional queries
  // Each query is defined by a regionStart (p) and a regionEnd (q)
  const regionalQueries = inputLines.slice(routeCount + 1, routeCount + 1 + queryCount).map(line => {
    const queryParts = parseIntegersFromLine(line);
    const queryRange = _destructureArrayParts(queryParts, 2);
    return {
      regionStart: queryRange[0],
      regionEnd: queryRange[1]
    };
  });

  // Sort route segments primarily by endStation, then by startStation.
  // This optimization allows for efficient processing when building the prefix sum array.
  // This replaces the generic `sortByKey` function with an inlined, specific sort.
  routeSegments.sort((segmentA, segmentB) => {
    if (segmentA.endStation !== segmentB.endStation) {
      return segmentA.endStation - segmentB.endStation;
    }
    return segmentA.startStation - segmentB.startStation;
  });

  // Build a 2D prefix sum array: `prefixRouteCounts[r][l]` stores the count of routes (x, r) where x <= l.
  // `prefixRouteCounts` will be 1-indexed for stations, so `stationCount + 1` size.
  const prefixRouteCounts = [];
  prefixRouteCounts.push(new Array(stationCount + 1).fill(0)); // Dummy row at index 0 for 1-based indexing convenience.

  let segmentPointer = 0; // Pointer to efficiently traverse the sorted `routeSegments` array.

  // Iterate through each possible end station `currentEndStation` (from 1 to stationCount)
  // The following block uses verbose iterator variable names to match the transpiled style.
  let _iterNormalCompletion1 = true;
  let _iterDidError1 = false;
  let _iterError1 = undefined;
  try {
    for (var _iterator1 = generateNumericSequence(1, stationCount + 1)[Symbol.iterator](), _step1; !(_iterNormalCompletion1 = (_step1 = _iterator1.next()).done); _iterNormalCompletion1 = true) {
      const currentEndStation = _step1.value; // Corresponds to `r` in the original code.

      const currentEndStationPrefix = [0]; // Prefix sum array for routes ending at `currentEndStation`.
                                           // `currentEndStationPrefix[0]` is always 0.
      let segmentAccumulator = 0;          // Accumulates counts for routes (x, currentEndStation) where x <= currentStartStation.

      // Iterate through each possible start station `currentStartStation` (from 1 to stationCount)
      let _iterNormalCompletion2 = true;
      let _iterDidError2 = false;
      let _iterError2 = undefined;
      try {
        for (var _iterator2 = generateNumericSequence(1, stationCount + 1)[Symbol.iterator](), _step2; !(_iterNormalCompletion2 = (_step2 = _iterator2.next()).done); _iterNormalCompletion2 = true) {
          const currentStartStation = _step2.value; // Corresponds to `l` in the original code.

          // Advance `segmentPointer` to skip routes that end before `currentEndStation`
          // or routes that end at `currentEndStation` but start before `currentStartStation`.
          while (segmentPointer < routeCount &&
                 (routeSegments[segmentPointer].endStation < currentEndStation ||
                  (routeSegments[segmentPointer].endStation === currentEndStation &&
                   routeSegments[segmentPointer].startStation < currentStartStation))) {
            segmentPointer++;
          }

          // Count routes that exactly match (currentStartStation, currentEndStation).
          // `segmentAccumulator` will keep a running total for `currentEndStation`.
          while (segmentPointer < routeCount &&
                 routeSegments[segmentPointer].endStation === currentEndStation &&
                 routeSegments[segmentPointer].startStation === currentStartStation) {
            segmentAccumulator++;
            segmentPointer++;
          }
          // Store the cumulative count for routes (x, currentEndStation) where x <= currentStartStation.
          currentEndStationPrefix.push(segmentAccumulator);
        }
      } catch (err) {
        _iterDidError2 = true;
        _iterError2 = err;
      } finally {
        try {
          if (!_iterNormalCompletion2 && _iterator2["return"] != null) {
            _iterator2["return"]();
          }
        } finally {
          if (_iterDidError2) {
            throw _iterError2;
          }
        }
      }
      prefixRouteCounts.push(currentEndStationPrefix);
    }
  } catch (err) {
    _iterDidError1 = true;
    _iterError1 = err;
  } finally {
    try {
      if (!_iterNormalCompletion1 && _iterator1["return"] != null) {
        _iterator1["return"]();
      }
    } finally {
      if (_iterDidError1) {
        throw _iterError1;
      }
    }
  }

  // Process each regional query
  let _iterNormalCompletion3 = true;
  let _iterDidError3 = false;
  let _iterError3 = undefined;
  try {
    for (var _iterator3 = regionalQueries[Symbol.iterator](), _step3; !(_iterNormalCompletion3 = (_step3 = _iterator3.next()).done); _iterNormalCompletion3 = true) {
      const {
        regionStart,
        regionEnd
      } = _step3.value; // Corresponds to `p` and `q` in the original code.

      // Validate query range for current query
      if (regionStart < 1 || regionEnd > stationCount || regionStart > regionEnd) {
        outputResults.push(`Error: Invalid query range [${regionStart}, ${regionEnd}]. Stations must be within [1, ${stationCount}] and start <= end.`);
        continue; // Skip to the next query
      }

      let currentQueryResult = 0;

      // Iterate through end stations `currentQueryResultEnd` within the query range [regionStart, regionEnd]
      let _iterNormalCompletion4 = true;
      let _iterDidError4 = false;
      let _iterError4 = undefined;
      try {
        for (var _iterator4 = generateNumericSequence(regionStart, regionEnd + 1)[Symbol.iterator](), _step4; !(_iterNormalCompletion4 = (_step4 = _iterator4.next()).done); _iterNormalCompletion4 = true) {
          const currentQueryResultEnd = _step4.value; // Corresponds to `_r` in the original code.

          // Add the count of routes (l, currentQueryResultEnd) where `regionStart <= l <= regionEnd`.
          // This is efficiently calculated using the prefix sum:
          // `prefixRouteCounts[currentQueryResultEnd][regionEnd]` gives count for `x <= regionEnd`.
          // `prefixRouteCounts[currentQueryResultEnd][regionStart - 1]` gives count for `x <= regionStart - 1`.
          // Their difference gives count for `regionStart <= x <= regionEnd`.
          currentQueryResult += prefixRouteCounts[currentQueryResultEnd][regionEnd] - prefixRouteCounts[currentQueryResultEnd][regionStart - 1];
        }
      } catch (err) {
        _iterDidError4 = true;
        _iterError4 = err;
      } finally {
        try {
          if (!_iterNormalCompletion4 && _iterator4["return"] != null) {
            _iterator4["return"]();
          }
        } finally {
          if (_iterDidError4) {
            throw _iterError4;
          }
        }
      }
      outputResults.push(currentQueryResult.toString());
    }
  } catch (err) {
    _iterDidError3 = true;
    _iterError3 = err;
  } finally {
    try {
      if (!_iterNormalCompletion3 && _iterator3["return"] != null) {
        _iterator3["return"]();
      }
    } finally {
      if (_iterDidError3) {
        throw _iterError3;
      }
    }
  }

  return outputResults;
}

// --- Main Execution Block ---

// Define a constant for the standard input path to make it easily configurable.
const STD_INPUT_SOURCE_PATH = "/dev/stdin";

/**
 * Self-executing anonymous function to serve as the program's entry point.
 * It reads input, calls the main analysis function, and prints the results.
 */
(function() {
  try {
    // Dynamically require 'fs' module for file system operations.
    const fileSystemModule = require("fs");
    // Read the entire input from the specified path, typically stdin, as UTF-8.
    const programInput = fileSystemModule.readFileSync(STD_INPUT_SOURCE_PATH, "utf8");
    // Execute the main analysis logic.
    const processedOutputLines = executeTrainRouteAnalysis(programInput);
    // Print each result line to standard output.
    processedOutputLines.forEach(line => console.log(line));
  } catch (executionError) {
    // Catch and report any errors that occur during file reading or program execution.
    console.error("An error occurred during program execution:", executionError.message);
    // For debugging, uncomment the following line to see the full stack trace.
    // console.error(executionError.stack);
  }
})();