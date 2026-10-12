'use strict';

const LARGE_REPLACEMENT_VALUE = 100000;

const findIndexOfMinimum = (targetArray) => {
  if (targetArray.length === 0) {
    return -1;
  }
  let currentMinimumValue = targetArray[0];
  let currentMinimumIndex = 0;
  for (let elementIndex = 1; elementIndex < targetArray.length; elementIndex++) {
    if (targetArray[elementIndex] < currentMinimumValue) {
      currentMinimumValue = targetArray[elementIndex];
      currentMinimumIndex = elementIndex;
    }
  }
  return currentMinimumIndex;
};

const processInputData = rawInputLines => {
  const numIterations = parseInt(rawInputLines[0], 10);
  const numericValues = rawInputLines[1].split(' ').map(currentValStr => parseInt(currentValStr, 10));

  for (let iterationCounter = 0; iterationCounter < numIterations; iterationCounter++) {
    const foundMinIndex = findIndexOfMinimum(numericValues);
    console.log(foundMinIndex + 1);
    numericValues[foundMinIndex] = LARGE_REPLACEMENT_VALUE;
  }
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));
