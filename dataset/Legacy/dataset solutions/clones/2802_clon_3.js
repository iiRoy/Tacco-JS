'use strict';

function parseInputString(inputStr) {
  return inputStr.split(' ').map(strVal => parseInt(strVal, 10));
}

function processData(inputString) {
  const numericParts = parseInputString(inputString);
  const itemCount = numericParts[0];
  const initialValue = numericParts[1];

  let runningTotal = 0;
  let elementWithSmallestAbs = Infinity;

  const loopUpperBound = initialValue + itemCount;

  for (let currentElement = initialValue; currentElement < loopUpperBound; ++currentElement) {
    runningTotal += currentElement;

    const currentAbsValue = Math.abs(currentElement);
    const minAbsSoFar = Math.abs(elementWithSmallestAbs);

    if (currentAbsValue < minAbsSoFar) {
      elementWithSmallestAbs = currentElement;
    }
  }
  
  console.log(runningTotal - elementWithSmallestAbs);
}

processData(require('fs').readFileSync('/dev/stdin', 'utf8'));
