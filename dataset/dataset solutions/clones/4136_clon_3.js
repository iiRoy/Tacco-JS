'use strict';
const computeDigitSum = (numericValue) => {
  return String(numericValue).split('').reduce((accumulator, currentDigitChar) => {
    return accumulator + Number(currentDigitChar);
  }, 0);
};

let processInputData = rawData => {
  const stringNumbers = rawData.split(' ');
  const parsedNumbers = stringNumbers.map(strVal => +strVal);

  const iterationLimit = parsedNumbers[0];
  const lowerBoundForDigitSum = parsedNumbers[1];
  const upperBoundForDigitSum = parsedNumbers[2];

  let finalSum = 0;

  for (let currentNumber = 1; currentNumber <= iterationLimit; currentNumber++) {
    const currentDigitSum = computeDigitSum(currentNumber);

    const isWithinLowerBound = currentDigitSum >= lowerBoundForDigitSum;
    const isWithinUpperBound = currentDigitSum <= upperBoundForDigitSum;

    if (isWithinLowerBound && isWithinUpperBound) {
      finalSum += currentNumber;
    }
  }
  return finalSum;
};

function runProgram(programInput) {
  console.log(processInputData(programInput));
}

runProgram(require('fs').readFileSync('/dev/stdin', 'utf8'));
