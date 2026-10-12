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
  // This function takes a line of text (or an array of strings) and converts its parts into integers.
  function parseNumbersFromString(inputLine) {
    // If the input is already an array, use it directly; otherwise, split the string by one or more spaces.
    const parts = Array.isArray(inputLine) ? inputLine : inputLine.split(/\s+/);
    // Map each string part to its integer representation.
    return parts.map(function (numStr) {
      return parseInt(numStr, 10); // Explicitly specify base 10 for parsing.
    });
  }

  // Main logic encapsulated in an immediately invoked function expression.
  !function (rawData) {
    // Split the entire raw input into an array of lines.
    const dataRows = rawData.split("\n");

    // Parse the first line to get two numerical values.
    const parsedValues = parseNumbersFromString(dataRows[0]);
    const destructuredValues = _slicedToArray(parsedValues, 2);
    const firstVal = destructuredValues[0];
    const secondVal = destructuredValues[1];

    // Apply conditional logic based on the value of 'firstVal'.
    if (firstVal <= 5) {
      // If 'firstVal' is 5 or less, output 0.
      console.log(0);
    } else if (firstVal <= 16) {
      // If 'firstVal' is between 6 and 16 (inclusive), output half of 'secondVal'.
      console.log(secondVal / 2);
    } else {
      // If 'firstVal' is greater than 16, output 'secondVal'.
      console.log(secondVal);
    }
  }(require("fs").readFileSync("/dev/stdin", "utf8")); // Read input from standard input using Node.js 'fs' module.
}();
