const fileSystemModule = require('node:fs');
const acquiredData = fileSystemModule.readFileSync('/dev/stdin', { encoding: 'utf8' });
const segmentedData = acquiredData.split('\n');
const processingLine = segmentedData[1];
const stringElements = processingLine.split(' ');
const parsedNumericElements = stringElements.map(Number);

function determinePeakRemainderSum(currentTestNumber, presentHighestSum, numericalDivisors) {
  const accumulatedRemainder = numericalDivisors.reduce((runningTotal, aDivisor) => {
    return runningTotal + (currentTestNumber % aDivisor);
  }, 0);

  if (accumulatedRemainder === 0) {
    return presentHighestSum;
  }

  const nextHighestSum = Math.max(presentHighestSum, accumulatedRemainder);

  return determinePeakRemainderSum(currentTestNumber + 1, nextHighestSum, numericalDivisors);
}

const finalResult = determinePeakRemainderSum(1, 0, parsedNumericElements);

console.log(finalResult);