"use strict";

function processInput(inputString) {
  const parameters = inputString.trim().split(' ');
  const upperLimit = parseInt(parameters[0], 10);
  const lowerBound = parseInt(parameters[1], 10);
  const upperBound = parseInt(parameters[2], 10);

  let totalSum = 0;

  const computeDigitSum = (value) => {
    let currentNumber = value;
    let digitAccumulator = 0;
    while (currentNumber > 0) {
      digitAccumulator += currentNumber % 10;
      currentNumber = Math.floor(currentNumber / 10);
    }
    return digitAccumulator;
  };

  for (let currentVal = 1; currentVal <= upperLimit; currentVal++) {
    const currentDigitSum = computeDigitSum(currentVal);
    if (currentDigitSum >= lowerBound && currentDigitSum <= upperBound) {
      totalSum += currentVal;
    }
  }

  console.log(totalSum);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
