"use strict";

function findLargestProperDivisor(targetNumber) {
  if (targetNumber < 2) {
    return 1;
  }

  let currentMaxDivisor = 1;
  const searchUpperBound = targetNumber / 2;

  for (let iterator = 2; iterator < searchUpperBound; ++iterator) {
    const isDivisible = (targetNumber % iterator === 0);
    const isLargerThanCurrentMax = (iterator > currentMaxDivisor);

    if (isDivisible && isLargerThanCurrentMax) {
      currentMaxDivisor = iterator;
    }
  }
  return currentMaxDivisor;
}

function processInputAndCalculate(rawData) {
  const firstLineOfInput = rawData.split("\n")[0];
  const parsedNumber = parseInt(firstLineOfInput, 10);

  console.log(parsedNumber);

  const foundDivisor = findLargestProperDivisor(parsedNumber);

  const firstComponent = foundDivisor - 1;
  const secondComponent = parsedNumber / foundDivisor;
  const finalAdjustment = -1;

  const calculatedOutput = firstComponent + secondComponent + finalAdjustment;

  console.log(calculatedOutput);
}

processInputAndCalculate(require("fs").readFileSync("/dev/stdin", "UTF-8"));
