'use strict';

const processNumericalSequence = (fullFileContent) => {
  const relevantLine = fullFileContent.split('\n')[0];
  const extractedValues = relevantLine.match(/-?\d+/g).map(x => parseInt(x, 10));

  const firstVal = extractedValues[0];
  const secondVal = extractedValues[1];
  const thirdVal = extractedValues[2];

  const thresholdSum = firstVal + secondVal;

  const calculationA = thirdVal + secondVal;
  const calculationB = firstVal + (2 * secondVal) + 1;

  const conditionHolds = (thirdVal <= thresholdSum);
  const conditionFails = (thirdVal > thresholdSum);

  const finalComputedValue = (conditionHolds * calculationA) + (conditionFails * calculationB);

  console.log(finalComputedValue);
};

processNumericalSequence(require('fs').readFileSync('/dev/stdin', 'utf8'));