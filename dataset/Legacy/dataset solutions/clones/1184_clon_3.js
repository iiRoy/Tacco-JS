const cfg = {stdin: '/dev/stdin', newline: '\n'};

const fileSystem = require('fs');

const parseNumericLine = (inputString) => {
  return inputString.split(' ').map(Number);
};

const rawInputContent = fileSystem.readFileSync(cfg.stdin, 'ascii');
const contentLines = rawInputContent.split(cfg.newline);

const firstNumericArray = parseNumericLine(contentLines[1]);
const secondNumericArray = parseNumericLine(contentLines[2]);

const calculateElementWiseAbsoluteDifferences = (arrA, arrB) => {
  const differenceResults = [];
  const arrayLength = arrA.length;
  for (let elementIndex = 0; elementIndex < arrayLength; elementIndex++) {
    differenceResults.push(Math.abs(arrA[elementIndex] - arrB[elementIndex]));
  }
  return differenceResults;
};

const absoluteDifferences = calculateElementWiseAbsoluteDifferences(firstNumericArray, secondNumericArray);

const sumOfDifferences = absoluteDifferences.reduce((currentSum, currentDiff) => {
  return currentSum + currentDiff;
}, 0);
console.log(sumOfDifferences);

const calculateSumOfPowers = (values, exponent) => {
  return values.reduce((total, val) => {
    return total + Math.pow(val, exponent);
  }, 0);
};

const sumOfSquaredDifferences = calculateSumOfPowers(absoluteDifferences, 2);
const euclideanNorm = Math.sqrt(sumOfSquaredDifferences);
console.log(euclideanNorm);

const sumOfCubedDifferences = calculateSumOfPowers(absoluteDifferences, 3);
const l3Norm = Math.pow(sumOfCubedDifferences, 1/3);
console.log(l3Norm);

const maximumDifference = absoluteDifferences.reduce((currentMax, currentDiff) => {
  return Math.max(currentMax, currentDiff);
}, 0);
console.log(maximumDifference);
