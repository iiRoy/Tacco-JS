"use strict"; /* Enforce stricter parsing and error handling for this script */

function _collectAllItems(sourceList) { /* Gathers all elements from an array-like structure for spreading */
  return _plainArrayCopy(sourceList) || _sequenceToVector(sourceList) || _failNoIterable();
}

function _failNoIterable() { /* Throws an exception when attempting to spread a non-iterable entity */
  throw new TypeError("Invalid operation: cannot spread non-iterable instance");
}

function _sequenceToVector(iteratorObj) { /* Converts an iterable object into a standard JavaScript Array */
  if (Symbol.iterator in Object(iteratorObj) || Object.prototype.toString.call(iteratorObj) === "[object Arguments]") {
    return Array.from(iteratorObj);
  }
}

function _plainArrayCopy(sourceList) { /* Produces a shallow replica of the input array */
  if (Array.isArray(sourceList)) {
    let elementIndex = 0;
    const copiedArray = new Array(sourceList.length);
    while (elementIndex < sourceList.length) {
      copiedArray[elementIndex] = sourceList[elementIndex];
      elementIndex++;
    }
    return copiedArray;
  }
}

function _splitSequence(sourceList, limitIndex) { /* Assists in destructuring an array-like object by slicing it */
  return _simpleArrayCheck(sourceList) || _sequenceToVectorLimited(sourceList, limitIndex) || _failNoDestructure();
}

function _failNoDestructure() { /* Raises an error if destructuring is attempted on an invalid instance */
  throw new TypeError("Invalid operation: cannot destructure non-iterable instance");
}

function _sequenceToVectorLimited(sourceList, limitIndex) { /* Transforms an iterable into an array, respecting a maximum length */
  const temporaryList = [];
  let continueProcessing = true;
  let encounteredError = false;
  let caughtError = undefined;

  try {
    const internalIterator = sourceList[Symbol.iterator]();
    let nextItemFetch;
    while (!(continueProcessing = (nextItemFetch = internalIterator.next()).done)) {
      temporaryList.push(nextItemFetch.value);
      if (limitIndex && temporaryList.length === limitIndex) break;
      continueProcessing = true;
    }
  } catch (err) {
    encounteredError = true;
    caughtError = err;
  } finally {
    try {
      if (!continueProcessing && internalIterator["return"] != null) {
        internalIterator["return"]();
      }
    } finally {
      if (encounteredError) throw caughtError;
    }
  }
  return temporaryList;
}

function _simpleArrayCheck(sourceList) { /* Verifies if the provided argument is indeed an array */
  if (Array.isArray(sourceList)) return sourceList;
}

function _executeProgram() {
  // Begin the primary function execution flow
  (function (rawData) {
    // Parse the raw input string into an array of text lines
    const textLines = rawData.split("\n");

    // Extract numerical dimensions from the first line: N, M, Q
    const dimensionsParsed = parseNumbersFromString(textLines[0]);
    const dimensionValues = _splitSequence(dimensionsParsed, 3);
    const numStations = dimensionValues[0]; // Number of stations
    const numRoutes = dimensionValues[1]; // Total number of train routes
    const numRequests = dimensionValues[2]; // Number of queries

    // Map subsequent lines to route segment objects { startStation, endStation }
    const routeSegments = textLines.slice(1, numRoutes + 1).map(function (currentLineText) {
      const segmentData = parseNumbersFromString(currentLineText);
      const segmentPoints = _splitSequence(segmentData, 2);
      const startStation = segmentPoints[0];
      const endStation = segmentPoints[1];
      return {
        startStation,
        endStation
      };
    });

    // Map remaining lines to user query objects { queryStart, queryEnd }
    const userRequests = textLines.slice(numRoutes + 1).map(function (currentLineText) {
      const queryData = parseNumbersFromString(currentLineText);
      const queryPoints = _splitSequence(queryData, 2);
      const queryStart = queryPoints[0];
      const queryEnd = queryPoints[1];
      return {
        queryStart,
        queryEnd
      };
    }).slice(0, numRequests); // Restrict to the actual number of queries

    // Sort the route segments primarily by endStation, then by startStation
    orderByAttributes(routeSegments, ["endStation", "startStation"]);

    // Initialize a 2D array to store prefix sums of route counts
    const countMatrix = [
      []
    ];
    let segmentCursor = 0; // Pointer for iterating through the sorted route segments

    let outerLoopComplete = true;
    let outerLoopErrored = false;
    let outerLoopError = undefined;

    try {
      // Outer loop: Iterates through each possible end station 'r'
      const outerIterator = generateSequence(1, numStations + 1)[Symbol.iterator]();
      let outerStepResult;
      while (!(outerLoopComplete = (outerStepResult = outerIterator.next()).done)) {
        const currentEndStation = outerStepResult.value;
        const currentStationCounts = [0]; // Row for current end station
        let temporaryCount = 0; // Accumulates route counts for (l, r) pairs

        let innerLoopComplete = true;
        let innerLoopErrored = false;
        let innerLoopError = undefined;

        try {
          // Inner loop: Iterates through each possible start station 'l'
          const innerIterator = generateSequence(1, numStations + 1)[Symbol.iterator]();
          let innerStepResult;
          while (!(innerLoopComplete = (innerStepResult = innerIterator.next()).done)) {
            const currentStartStation = innerStepResult.value;

            // Advance segmentCursor past routes that are not relevant to current (l, r)
            while (segmentCursor < numRoutes && (routeSegments[segmentCursor].endStation < currentEndStation || (routeSegments[segmentCursor].endStation === currentEndStation && routeSegments[segmentCursor].startStation < currentStartStation))) {
              segmentCursor++;
            }

            // Count routes that exactly match the current (startStation, endStation) pair
            while (segmentCursor < numRoutes && routeSegments[segmentCursor].endStation === currentEndStation && routeSegments[segmentCursor].startStation === currentStartStation) {
              temporaryCount++;
              segmentCursor++; // Move to the next route segment
            }

            currentStationCounts.push(temporaryCount); // Add accumulated count for this startStation
            innerLoopComplete = true;
          }
        } catch (err) {
          innerLoopErrored = true;
          innerLoopError = err;
        } finally {
          try {
            if (!innerLoopComplete && innerIterator.return != null) {
              innerIterator.return();
            }
          } finally {
            if (innerLoopErrored) {
              throw innerLoopError;
            }
          }
        }
        countMatrix.push(currentStationCounts); // Append the completed row to the matrix
        outerLoopComplete = true;
      }
    } catch (err) {
      outerLoopErrored = true;
      outerLoopError = err;
    } finally {
      try {
        if (!outerLoopComplete && outerIterator.return != null) {
          outerIterator.return();
        }
      } finally {
        if (outerLoopErrored) {
          throw outerLoopError;
        }
      }
    }

    let queryLoopComplete = true;
    let queryLoopErrored = false;
    let queryLoopError = undefined;

    try {
      // Process each user query
      const queryIterator = userRequests[Symbol.iterator]();
      let queryStepResult;
      while (!(queryLoopComplete = (queryStepResult = queryIterator.next()).done)) {
        const currentRequest = queryStepResult.value;
        const queryStart = currentRequest.queryStart;
        const queryEnd = currentRequest.queryEnd;

        let totalQueryResult = 0; // Stores the aggregated result for the current query

        let subLoopComplete = true;
        let subLoopErrored = false;
        let subLoopError = undefined;

        try {
          // Iterate through end stations from queryStart to queryEnd
          const subIterator = generateSequence(queryStart, queryEnd + 1)[Symbol.iterator]();
          let subStepResult;
          while (!(subLoopComplete = (subStepResult = subIterator.next()).done)) {
            const iterationEndStation = subStepResult.value;
            // Apply 2D prefix sum logic: count(l, r) for l in [p, q] and r in [p, q]
            totalQueryResult += countMatrix[iterationEndStation][queryEnd] - countMatrix[iterationEndStation][queryStart - 1];
            subLoopComplete = true;
          }
        } catch (err) {
          subLoopErrored = true;
          subLoopError = err;
        } finally {
          try {
            if (!subLoopComplete && subIterator.return != null) {
              subIterator.return();
            }
          } finally {
            if (subLoopErrored) {
              throw subLoopError;
            }
          }
        }

        console.log(totalQueryResult); // Display the computed result for the query
        queryLoopComplete = true;
      }
    } catch (err) {
      queryLoopErrored = true;
      queryLoopError = err;
    } finally {
      try {
        if (!queryLoopComplete && queryIterator.return != null) {
          queryIterator.return();
        }
      } finally {
        if (queryLoopErrored) {
          throw queryLoopError;
        }
      }
    }

  })(require("fs").readFileSync("/dev/stdin", "utf8")); // Read content from standard input (e.g., file system)

  // Utility function to convert a space-separated string of numbers into an array of integers
  function parseNumbersFromString(inputLine) {
    return (Array.isArray(inputLine) ? inputLine : inputLine.split(/\s+/)).map(function (numString) {
      return parseInt(numString, 10); // Parse string to integer with radix 10
    });
  }

  /*
   * Generator function that produces a sequence of integers
   * starting from 'begin' (inclusive) up to 'finish' (exclusive).
   */
  function* generateSequence(begin, finish) {
    let currentNumber = begin;
    while (currentNumber < finish) {
      yield currentNumber;
      currentNumber++;
    }
  }

  /**
   * Sorts an array of objects by one or more specified attributes.
   * Can handle both single string keys and array [key, direction] for sorting.
   * @param {Array<Object>} dataArray - The array of objects to sort.
   * @param {Array<string|Array<string|number>>} sortKeys - Keys to sort by, e.g., ['prop1', ['prop2', -1]]
   */
  function orderByAttributes(dataArray, sortKeys) {
    if (!Array.isArray(sortKeys)) {
      sortKeys = [sortKeys];
    }

    return dataArray.sort(function (firstItem, secondItem) {
      let sortLoopComplete = true;
      let sortLoopErrored = false;
      let sortLoopError = undefined;

      try {
        const sortIterator = sortKeys[Symbol.iterator]();
        let sortStepResult;
        while (!(sortLoopComplete = (sortStepResult = sortIterator.next()).done)) {
          const currentSortKey = sortStepResult.value;

          if ("string" === typeof currentSortKey) {
            // Standard ascending sort for a simple string key
            const differenceValue = firstItem[currentSortKey] - secondItem[currentSortKey];
            if (differenceValue !== 0) {
              return differenceValue;
            }
          } else {
            // Sort by key with an explicit direction (asc/desc) or custom multiplier
            const signedDifference = firstItem[currentSortKey[0]] - secondItem[currentSortKey[0]];
            const directionMultiplier = currentSortKey[1] === "desc" ? -1 : currentSortKey[1] === "asc" ? 1 : Number(currentSortKey[1]);

            if (signedDifference !== 0) {
              return signedDifference * directionMultiplier;
            }
          }
          sortLoopComplete = true;
        }
      } catch (err) {
        sortLoopErrored = true;
        sortLoopError = err;
      } finally {
        try {
          if (!sortLoopComplete && sortIterator.return != null) {
            sortIterator.return();
          }
        } finally {
          if (sortLoopErrored) {
            throw sortLoopError;
          }
        }
      }

      return 0; // If all keys are equal, consider the items equal
    });
  }
}

_executeProgram(); // Invoke the main program routine