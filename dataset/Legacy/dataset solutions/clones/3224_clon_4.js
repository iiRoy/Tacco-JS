'use strict';

function processInput(rawData) {
  const inputData = rawData.split('\n');
  const countElements = parseInt(inputData[0], 10);
  const numericValues = inputData[1].split(' ').map(Number);

  let greatestValue = -Infinity;
  let totalSum = 0;

  for (let idx = 0; idx < countElements; idx++) {
    const currentNumber = numericValues[idx];
    if (currentNumber > greatestValue) {
      greatestValue = currentNumber;
    }
    totalSum += currentNumber;
  }

  const sumOfOthers = totalSum - greatestValue;

  let comparisonResult;
  if (greatestValue < sumOfOthers) {
    comparisonResult = 'Yes';
  } else {
    comparisonResult = 'No';
  }
  console.log(comparisonResult);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
