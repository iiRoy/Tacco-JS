"use strict";

const obtainDigitSumValue = (valueToProcess) => {
  let sumOfIndividualDigits = 0;
  let transientValue = valueToProcess;
  while (transientValue > 0) {
    sumOfIndividualDigits += transientValue % 10;
    transientValue = Math.floor(transientValue / 10);
  }
  return sumOfIndividualDigits;
};

const processRangeRecursively = (
  currentElement,
  upperBoundForIteration,
  lowerBoundForDigitSum,
  upperBoundForDigitSum,
  accumulatedResult
) => {
  if (currentElement > upperBoundForIteration) {
    return accumulatedResult;
  }

  const currentElementDigitSum = obtainDigitSumValue(currentElement);

  if (currentElementDigitSum >= lowerBoundForDigitSum && currentElementDigitSum <= upperBoundForDigitSum) {
    return processRangeRecursively(
      currentElement + 1,
      upperBoundForIteration,
      lowerBoundForDigitSum,
      upperBoundForDigitSum,
      accumulatedResult + currentElement
    );
  } else {
    return processRangeRecursively(
      currentElement + 1,
      upperBoundForIteration,
      lowerBoundForDigitSum,
      upperBoundForDigitSum,
      accumulatedResult
    );
  }
};

const executeCalculation = (sourceData) => {
  const numericParameters = sourceData.match(/\d+/g).map(Number);
  
  const maximumNumber = numericParameters[0];
  const minSumBoundary = numericParameters[1];
  const maxSumBoundary = numericParameters[2];

  const finalCalculatedSum = processRangeRecursively(
    1,
    maximumNumber,
    minSumBoundary,
    maxSumBoundary,
    0
  );
  
  console.log(finalCalculatedSum);
};

executeCalculation(require('fs').readFileSync('/dev/stdin', 'utf8'));