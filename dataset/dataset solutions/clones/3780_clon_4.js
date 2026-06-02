"use strict";

const acquireNumericInput = () => {
  return Number(require('fs').readFileSync('/dev/stdin', 'utf8').split('\n')[0]);
};

const computeSumOfDigits = (digitSequence) => {
  return digitSequence.reduce((totalAccumulation, currentDigitChar) => totalAccumulation + Number(currentDigitChar), 0);
};

const determineMinimalDigitSumPair = (initialNumericValue) => {
  const iterationLimit = Math.floor(initialNumericValue / 2);

  const candidatePairs = Array.from({ length: iterationLimit }, (_, index) => index + 1);

  const finalMinimumValue = candidatePairs.reduce((currentMinimumTracker, firstComponent) => {
    const secondComponent = initialNumericValue - firstComponent;
    const combinedComponentDigitSum = computeSumOfDigits(firstComponent.toString().split('')) +
                                      computeSumOfDigits(secondComponent.toString().split(''));
    return Math.min(currentMinimumTracker, combinedComponentDigitSum);
  }, initialNumericValue);

  return finalMinimumValue;
};

const primaryInput = acquireNumericInput();
const outcomeValue = determineMinimalDigitSumPair(primaryInput);
console.log(outcomeValue);
