'use strict';
const processInput = (rawText) => {
  const [upperBound, lowerSumThreshold, upperSumThreshold] = rawText.split(' ').map(Number);

  const obtainDigitSum = (value) => {
    let currentVal = value;
    let totalSum = 0;
    while (currentVal > 0) {
      totalSum += currentVal % 10;
      currentVal = Math.floor(currentVal / 10);
    }
    return totalSum;
  };

  const finalResult = Array.from({
    length: upperBound
  }, (_, index) => index + 1)
    .filter(currentNumber => {
      const currentDigitSum = obtainDigitSum(currentNumber);
      return currentDigitSum >= lowerSumThreshold && currentDigitSum <= upperSumThreshold;
    })
    .reduce((accumulator, matchingNumber) => accumulator + matchingNumber, 0);

  return finalResult;
};

const mainExecution = (inputContent) => {
  console.log(processInput(inputContent));
};

mainExecution(require('node:fs').readFileSync('/dev/stdin', 'utf8'));
