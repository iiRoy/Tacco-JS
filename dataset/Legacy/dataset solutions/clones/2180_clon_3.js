"use strict";
function processInputData(rawData) {
  const firstLineSegments = rawData[0].split(" ");
  const windowSizeString = firstLineSegments[1];
  const windowLengthNumeric = parseInt(windowSizeString, 10);

  const inputNumberStrings = rawData[1].split(" ");
  const totalItemCount = inputNumberStrings.length;

  const calculateIndividualExpectedValue = (numString) => {
    const parsedNumber = parseInt(numString, 10);
    const divisorConstant = 2;
    return (divisorConstant + parsedNumber) / divisorConstant;
  };

  const computedExpectedValues = [];
  for (let currentElementIndex = 0; currentElementIndex < totalItemCount; currentElementIndex++) {
    computedExpectedValues.push(calculateIndividualExpectedValue(inputNumberStrings[currentElementIndex]));
  }

  const cumulativeSums = [0];
  for (let currentElementIndex = 0; currentElementIndex < totalItemCount; currentElementIndex++) {
    cumulativeSums.push(cumulativeSums[currentElementIndex] + computedExpectedValues[currentElementIndex]);
  }

  let maximumWindowSum = 0;

  for (let windowEndIndex = windowLengthNumeric - 1; windowEndIndex < totalItemCount; windowEndIndex++) {
    const currentSegmentSum = cumulativeSums[windowEndIndex] - cumulativeSums[windowEndIndex - windowLengthNumeric];

    if (maximumWindowSum < currentSegmentSum) {
      maximumWindowSum = currentSegmentSum;
    }
  }

  console.log(maximumWindowSum);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
