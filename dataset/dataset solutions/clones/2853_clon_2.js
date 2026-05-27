"use strict";

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

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

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

!function () {
  // Function to parse a line of numbers, either from an array or a space-separated string
  function parseNumbers(inputLine) {
    // If input is already an array, use it directly; otherwise, split the string by one or more spaces
    const numberStrings = Array.isArray(inputLine) ? inputLine : inputLine.split(/\s+/);
    // Convert each string part into an integer
    return numberStrings.map(function (numStr) {
      return parseInt(numStr, 10); // Parse as base-10 integer
    });
  }

  // Main logic encapsulated in an immediately invoked function expression
  !function (rawData) {
    // Split the entire input data into an array of individual rows
    const dataRows = rawData.split("\n");

    // Parse the first row of data to extract three numerical values
    const _parsedValues = parseNumbers(dataRows[0]);
    const _parsedValuesArr = _slicedToArray(_parsedValues, 3);

    // Assign the extracted numbers to distinct variables
    const valA = _parsedValuesArr[0];
    const valB = _parsedValuesArr[1];
    const valC = _parsedValuesArr[2];

    // Calculate the minimum sum of pairs (valA+valB, valB+valC, valC+valA) and print it
    console.log(Math.min(valA + valB, valB + valC, valC + valA));
  }(require("fs").readFileSync("/dev/stdin", "utf8")); // Read input from standard input as UTF-8 string
}();
