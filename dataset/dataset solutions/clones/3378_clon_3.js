"use strict";

function _destructureArray(arr, i) { return _checkArrayHoles(arr) || _limitIterableToArray(arr, i) || _throwNonIterableError(); }

function _throwNonIterableError() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _limitIterableToArray(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _checkArrayHoles(arr) { if (Array.isArray(arr)) return arr; }

function processInput(rawData) {
  const inputLines = rawData.split('\n');

  const firstLineNumbers = parseNumbersFromString(inputLines[0]);
  const destructuredFirstLine = _destructureArray(firstLineNumbers, 1);
  const elementCount = destructuredFirstLine[0];

  // The original `splitNum(input)` parses all numbers from the entire raw input string,
  // treating newlines as whitespace. This behavior is preserved.
  const allNumbersFromInput = parseNumbersFromString(rawData);
  const numberArray = allNumbersFromInput.slice(1, elementCount + 1);

  numberArray.sort((a, b) => a - b);

  let firstPlayerWins = numberArray[elementCount - 1] % 2 === 1;

  for (let currentIndex = elementCount - 2; currentIndex >= 0; currentIndex--) {
    const currentNumber = numberArray[currentIndex];
    const isOddAndGreaterThanOne = currentNumber > 1 && currentNumber % 2 === 1;

    if (isOddAndGreaterThanOne) {
      firstPlayerWins = !firstPlayerWins;
    }
  }

  console.log(firstPlayerWins ? 'first' : 'second');
}

// true: first, false: second
function determineWinnerRecursive(arrayLength, numbers, startIndex) {
  if (arrayLength === 1) {
    return numbers[startIndex] % 2 === 1;
  }

  const remainingResult = determineWinnerRecursive(arrayLength - 1, numbers, startIndex + 1);
  const currentValue = numbers[startIndex];
  // The original condition (cur - 1) % 2 === 1 means cur is even.
  // If cur is even, it returns remainingResult, otherwise !remainingResult.
  const isCurrentValueEven = (currentValue - 1) % 2 === 1;

  return isCurrentValueEven ? remainingResult : !remainingResult;
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));

function parseNumbersFromString(textLine) {
  const convertToInteger = (numStr) => parseInt(numStr, 10);
  return textLine.split(/\s+/).map(convertToInteger);
}
