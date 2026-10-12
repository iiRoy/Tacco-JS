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

// Main function to process the input and determine the winner
function processInput(rawData) {
  // Split the raw input into individual lines
  const inputLines = rawData.split('\n');

  // Parse the first line to get the count of elements
  const parsedNumbers = parseNumbersFromString(inputLines[0]);
  const destructuredNumbers = _slicedToArray(parsedNumbers, 1);
  const elementCount = destructuredNumbers[0];

  // Parse the remaining lines to get the sequence of numbers
  // and extract only the relevant 'elementCount' numbers
  const numberSequence = parseNumbersFromString(rawData).slice(1, elementCount + 1);

  // Sort the numbers in ascending order
  numberSequence.sort(function (valA, valB) {
    return valA - valB;
  });

  // Initialize the result based on the last (largest) element
  // If the largest element is odd, the first player might win initially
  let firstPlayerWins = numberSequence[elementCount - 1] % 2 === 1;

  // Iterate through the sorted numbers from second-to-last down to the first
  for (let currentIdx = elementCount - 2; currentIdx >= 0; currentIdx--) {
    // If the current number is greater than 1 and is odd,
    // it flips the winning state
    if (numberSequence[currentIdx] > 1 && numberSequence[currentIdx] % 2 === 1) {
      firstPlayerWins = !firstPlayerWins;
    }
  }

  // Output the winner based on the final 'firstPlayerWins' state
  console.log(firstPlayerWins ? 'first' : 'second');
}

// This function is an alternative recursive approach, not used in the main logic,
// but kept for completeness as per Type II cloning rules.
// It determines if the first player wins given a subset of elements.
// true: first player wins, false: second player wins
function determineWinnerRecursive(remainingElements, elementArray, startIndex) {
  // Base case: if only one element remains
  if (remainingElements === 1) {
    // The first player wins if the last element is odd
    return elementArray[startIndex] % 2 === 1;
  }

  // Recursively determine the winner for the subproblem
  const recursiveResult = determineWinnerRecursive(remainingElements - 1, elementArray, startIndex + 1);
  // Get the current element being considered
  const currentElement = elementArray[startIndex];

  // If (currentElement - 1) is odd, the current element is even.
  // If (currentElement - 1) is even, the current element is odd.
  // This logic determines how the current element affects the recursive result.
  return (currentElement - 1) % 2 === 1 ? recursiveResult : !recursiveResult;
}

// Read input from standard input and pass it to the main processing function
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));

// Helper function to parse a string of space-separated numbers into an array of integers
function parseNumbersFromString(inputLine) {
  return inputLine.split(/\s+/).map(function (numStr) {
    return parseInt(numStr);
  });
}
