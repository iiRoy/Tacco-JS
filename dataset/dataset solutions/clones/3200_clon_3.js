'use strict'

const parseInputValues = (inputString) => {
  const firstLineContent = inputString.split('\n')[0];
  const numberStrings = firstLineContent.split(' ');
  const parsedN = Number(numberStrings[0]);
  const parsedK = Number(numberStrings[1]);
  return { nValue: parsedN, kValue: parsedK };
};

const processInput = (rawData) => {
  const { nValue: limitVal, kValue: thresholdVal } = parseInputValues(rawData);

  // The original loop counts odd numbers from 1 up to limitVal.
  // This can be calculated directly using Math.ceil(limitVal / 2).
  // For example:
  // N=1 -> ceil(0.5) = 1 (odd numbers: 1)
  // N=2 -> ceil(1)   = 1 (odd numbers: 1)
  // N=3 -> ceil(1.5) = 2 (odd numbers: 1, 3)
  // N=4 -> ceil(2)   = 2 (odd numbers: 1, 3)
  const calculatedOddNumbers = Math.ceil(limitVal / 2);

  const isCountExceedingThreshold = calculatedOddNumbers > thresholdVal;

  if (isCountExceedingThreshold) {
    console.log('YES');
  } else {
    console.log('NO');
  }
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
