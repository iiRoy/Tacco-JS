'use strict';

function parseNumbersFromString(numberString) {
  return numberString.split(' ').map(val => parseInt(val, 10));
}

function checkArraySortability(originalValues) {
  const arrayLength = originalValues.length;
  const initialSequence = originalValues.slice();
  const orderedSequence = originalValues.slice().sort((a, b) => a - b);

  console.log(initialSequence);
  console.log(orderedSequence);

  let mismatchCount = 0;
  const MAX_ALLOWED_MISMATCHES_FOR_YES = 2;
  const MAX_MISMATCHES_BEFORE_LOOP_TERMINATION = 3; // Loop terminates if mismatchCount exceeds this (becomes 4)

  for (let currentIndex = 0; currentIndex < arrayLength; currentIndex++) {
    if (initialSequence[currentIndex] !== orderedSequence[currentIndex]) {
      mismatchCount++;
    }
    if (mismatchCount > MAX_MISMATCHES_BEFORE_LOOP_TERMINATION) {
      break;
    }
  }

  if (mismatchCount <= MAX_ALLOWED_MISMATCHES_FOR_YES) {
    return 'YES';
  } else {
    return 'NO';
  }
}

function processInput(rawDataString) {
  const inputLines = rawDataString.split('\n').filter(Boolean);

  // The first line, representing the number of elements, is not utilized in the core logic.
  // const elementCount = parseInt(inputLines[0], 10);

  const originalArray = parseNumbersFromString(inputLines[1]);

  console.log(checkArraySortability(originalArray));
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
