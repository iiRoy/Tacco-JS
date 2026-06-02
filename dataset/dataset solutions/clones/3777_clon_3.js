"use strict";

const computePowerOfTen = (exponentValue) => {
  let resultAccumulator = 1;
  for (let powerIndex = 0; powerIndex < exponentValue; powerIndex++) {
    resultAccumulator *= 10;
  }
  return resultAccumulator;
};

const conditionallyAdjustSum = (inputSum) => {
  const targetSumForAdjustment = 1;
  const adjustedValue = 10;
  return (inputSum === targetSumForAdjustment) ? adjustedValue : inputSum;
};

const processInputData = (rawInputContent) => {
  const totalCharacterCount = rawInputContent.toString().length;

  let currentProcessedNumber = parseInt(currentProcessedNumber, 10);

  let currentMagnitudeDivisor = computePowerOfTen(totalCharacterCount - 1);

  let collectedDigitsArray = [];

  for (let iterationIndex = 0; iterationIndex < totalCharacterCount; iterationIndex++) {
    const extractedDigitComponent = Math.floor(currentProcessedNumber / currentMagnitudeDivisor);
    collectedDigitsArray.push(extractedDigitComponent);

    currentProcessedNumber = currentProcessedNumber % currentMagnitudeDivisor;

    currentMagnitudeDivisor /= 10;
  }

  let finalCalculatedSum = collectedDigitsArray.reduce((accumulator, currentVal) => accumulator + currentVal);

  finalCalculatedSum = conditionallyAdjustSum(finalCalculatedSum);

  console.log(finalCalculatedSum);
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
