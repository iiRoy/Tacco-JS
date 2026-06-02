"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

// Helper function for parsing number pairs
function parseNumberPair(lineContent) {
  const parsedNumbers = splitNumericString(lineContent);
  const [_val1, _val2] = _slicedToArray(parsedNumbers, 2);
  return { val1: _val1, val2: _val2 };
}

// Renamed and slightly rephrased splitNum
function splitNumericString(lineInput) {
  return (Array.isArray(lineInput) ? lineInput : lineInput.split(/\s+/)).map(function (numStr) {
    return parseInt(numStr, 10); // Explicit radix
  });
}

// Renamed sortByKey to sortObjectsByMultipleKeys
function sortObjectsByMultipleKeys(dataArray, keyDefinitions) {
  if (!Array.isArray(keyDefinitions)) {
    keyDefinitions = [keyDefinitions];
  }

  return dataArray.sort(function (objA, objB) {
    for (const keyDef of keyDefinitions) {
      let currentKey;
      let sortDirection = 1; // Default ascending

      if (typeof keyDef === "string") {
        currentKey = keyDef;
      } else {
        currentKey = keyDef[0];
        const directionSpec = keyDef[1];
        if (directionSpec === "desc") {
          sortDirection = -1;
        } else if (directionSpec === "asc") {
          sortDirection = 1;
        } else {
          sortDirection = Number(directionSpec);
        }
      }

      const comparisonResult = objA[currentKey] - objB[currentKey];
      if (comparisonResult !== 0) {
        return comparisonResult * sortDirection;
      }
    }
    return 0;
  });
}

function _main() {
  (function (inputData) {
    const inputLines = inputData.split("\n");

    // Guard clause for empty input
    if (inputLines.length === 0) {
      return;
    }

    const firstLineNumbers = splitNumericString(inputLines[0]);
    const [numN, numM, numQ] = _slicedToArray(firstLineNumbers, 3);

    // Parse train data
    const trainRecords = inputLines.slice(1, numM + 1).map(function (lineStr) {
      const { val1: leftCoord, val2: rightCoord } = parseNumberPair(lineStr);
      return { l: leftCoord, r: rightCoord };
    });

    // Parse query data - removed redundant .slice(0, Q)
    const queryRequests = inputLines.slice(numM + 1, numM + 1 + numQ).map(function (lineStr) {
      const { val1: queryP, val2: queryQ } = parseNumberPair(lineStr);
      return { p: queryP, q: queryQ };
    });

    // Sort train records
    sortObjectsByMultipleKeys(trainRecords, ["r", "l"]);

    // Step 1: Count occurrences of each (l, r) pair
    // Initialize a 2D array to store raw counts: trainOccurrenceCounts[r][l]
    const trainOccurrenceCounts = Array(numN + 1).fill(0).map(() => Array(numN + 1).fill(0));
    for (const trainItem of trainRecords) {
      trainOccurrenceCounts[trainItem.r][trainItem.l]++;
    }

    // Step 2: Build the 2D prefix sum array (cumulative counts)
    // cumulativeTrainCounts[r][l] will store count of trains (L, R) where R=r and L <= l
    const cumulativeTrainCounts = Array(numN + 1).fill(0).map(() => Array(numN + 1).fill(0));

    for (let currentR = 1; currentR <= numN; currentR++) {
      let currentRRowSum = 0;
      for (let currentL = 1; currentL <= numN; currentL++) {
        currentRRowSum += trainOccurrenceCounts[currentR][currentL];
        cumulativeTrainCounts[currentR][currentL] = currentRRowSum;
      }
    }

    // Process queries
    for (const currentQuery of queryRequests) {
      const queryStartP = currentQuery.p;
      const queryEndQ = currentQuery.q;
      let queryResult = 0;

      // Rewriting the range loop with a standard for loop
      for (let rIndex = queryStartP; rIndex <= queryEndQ; rIndex++) {
        const countUpToQ = cumulativeTrainCounts[rIndex][queryEndQ];
        const countBeforeP = cumulativeTrainCounts[rIndex][queryStartP - 1];
        queryResult += countUpToQ - countBeforeP;
      }
      console.log(queryResult);
    }
  })(require("fs").readFileSync("/dev/stdin", "utf8"));
}

_main();
