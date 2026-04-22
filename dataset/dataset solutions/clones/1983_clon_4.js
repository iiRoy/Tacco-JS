const processNumericalInput = (rawText) => {
  return Number(rawText.trim());
};

const obtainSeriesSum = (limitVal) => {
  return limitVal * (limitVal + 1) / 2;
};

const calculateDivisibleSum = (divisorVal, limitVal) => {
  const count = Math.floor(limitVal / divisorVal);
  return divisorVal * obtainSeriesSum(count);
};

const determineFinalSum = (rawInput) => {
  const ceilingValue = processNumericalInput(rawInput);

  const firstDivisor = 3;
  const secondDivisor = 5;
  const commonDivisor = 15;

  const totalSumAll = obtainSeriesSum(ceilingValue);
  const sumMultiplesOfThree = calculateDivisibleSum(firstDivisor, ceilingValue);
  const sumMultiplesOfFive = calculateDivisibleSum(secondDivisor, ceilingValue);
  const sumMultiplesOfFifteen = calculateDivisibleSum(commonDivisor, ceilingValue);

  const finalOutcome = totalSumAll - sumMultiplesOfThree - sumMultiplesOfFive + sumMultiplesOfFifteen;

  console.log(finalOutcome);
};

const systemIO = require('fs');
const sourceFile = '/dev/stdin';
const incomingData = systemIO.readFileSync(sourceFile, 'utf8');
determineFinalSum(incomingData);