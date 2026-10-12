'use strict';

const countSatisfyingNumbers = (upperLimit, predicateFunction) => {
  let currentCount = 0;
  for (let currentNumber = 1; currentNumber <= upperLimit; currentNumber++) {
    if (predicateFunction(currentNumber)) {
      currentCount++;
    }
  }
  return currentCount;
};

const executeCalculation = (dataPayload) => {
  const parsedValues = dataPayload.trim().split(' ').map(Number);
  const maximumValue = parsedValues[0];
  const modulusValue = parsedValues[1];

  let accumulatedResult = 0;

  const zeroRemainderCount = countSatisfyingNumbers(maximumValue, (num) => num % modulusValue === 0);
  accumulatedResult += zeroRemainderCount * zeroRemainderCount * zeroRemainderCount;

  if (modulusValue % 2 === 0) {
    const halfModulus = modulusValue / 2;
    const halfRemainderCount = countSatisfyingNumbers(maximumValue, (num) => num % modulusValue === halfModulus);
    accumulatedResult += halfRemainderCount * halfRemainderCount * halfRemainderCount;
  }

  console.log(accumulatedResult);
};

executeCalculation(require('fs').readFileSync('/dev/stdin', 'utf8'));
