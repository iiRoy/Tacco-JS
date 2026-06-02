function calculateTotalCost(rawDataString) {
  const numericParams = rawDataString.split(/\s|\n/).map(Number);

  let accumulatedCost = 0;

  const paramA = numericParams[0];
  const paramB = numericParams[1];
  const paramC = numericParams[2];
  const paramD = numericParams[3];
  const paramE = numericParams[4];

  const sumOfInitialParams = paramA + paramB;
  const averageOfInitialParams = sumOfInitialParams / 2;
  const minimumOfDE = Math.min(paramD, paramE);

  if (averageOfInitialParams > paramC) {
    const firstRuleComponent = paramC * 2;
    accumulatedCost += firstRuleComponent * minimumOfDE;
  } else {
    const secondRuleComponent = sumOfInitialParams;
    accumulatedCost += secondRuleComponent * minimumOfDE;
  }

  if (paramD > paramE) {
    const differenceDE = paramD - paramE;
    accumulatedCost += paramA * differenceDE;
  } else {
    const differenceED = paramE - paramD;
    accumulatedCost += paramB * differenceED;
  }

  console.log(accumulatedCost);
}

const fileSystemModule = require('fs');
const standardInputPath = '/dev/stdin';
const encodingType = 'utf8';

const inputDataFromFile = fileSystemModule.readFileSync(standardInputPath, encodingType);
calculateTotalCost(inputDataFromFile);
