"use strict";

function _destructureArray(arr, i) { return _checkArrayHoles(arr) || _limitIterableToArray(arr, i) || _throwNonIterable(); }

function _throwNonIterable() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _limitIterableToArray(arr, i) {
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

function _checkArrayHoles(arr) { if (Array.isArray(arr)) return arr; }

function processInput(rawData) {
  const inputLines = rawData.split('\n');

  const firstLineNumbers = parseNumbersFromString(inputLines[0]);
  const elementCount = firstLineNumbers[0];

  // Parse all numbers from the raw data, then slice to get the actual elements
  const allParsedNumbers = parseNumbersFromString(rawData);
  const numericElements = allParsedNumbers.slice(1, elementCount + 1);

  numericElements.sort(function (valA, valB) {
    return valA - valB;
  });

  const lastElementIndex = elementCount - 1;
  let firstPlayerTurnResult = numericElements[lastElementIndex] % 2 === 1;

  const loopStartOffset = 2; // Corresponds to N-2
  const loopUpperLimit = elementCount - loopStartOffset; // Iterate from 0 up to N-2

  for (let currentIteration = 0; currentIteration <= loopUpperLimit; ++currentIteration) {
    const actualElementIndex = elementCount - loopStartOffset - currentIteration; // This sequence is N-2, N-3, ..., 0
    const currentElementValue = numericElements[actualElementIndex];

    // Original condition: (as[idx] - 1) % 2 === 0
    // This is equivalent to checking if as[idx] is odd.
    if (currentElementValue % 2 !== 0) {
      firstPlayerTurnResult = !firstPlayerTurnResult;
    }
  }

  const firstPlayerOutcome = 'first';
  const secondPlayerOutcome = 'second';

  console.log(firstPlayerTurnResult ? firstPlayerOutcome : secondPlayerOutcome);
}

// true: first, false: second
function determineWinnerRecursive(remainingCount, valuesArray, startIndex) {
  if (remainingCount === 1) {
    return valuesArray[startIndex] % 2 === 1;
  }

  const recursiveResult = determineWinnerRecursive(remainingCount - 1, valuesArray, startIndex + 1);
  const currentValue = valuesArray[startIndex];

  // Original condition: (cur - 1) % 2 === 1
  // This is equivalent to checking if cur is even.
  return currentValue % 2 === 0 ? recursiveResult : !recursiveResult;
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));

function parseNumbersFromString(inputString) {
  return inputString.split(/\s+/).map(function (numberString) {
    return parseInt(numberString);
  });
}
