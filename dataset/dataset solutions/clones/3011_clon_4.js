'use strict';

const calculateCommonDivisor = (firstOperand, secondOperand) =>
  Boolean(secondOperand) ? calculateCommonDivisor(secondOperand, firstOperand % secondOperand) : firstOperand;

const processNumericalData = (inputLines) => {
  const totalElements = parseInt(inputLines[0], 10);
  const numericalArray = inputLines[1].split(' ').map(Number);

  if (totalElements <= 1) {
    console.log(0);
    return;
  }

  const allPossibleGCDs = Array.from({ length: totalElements }, (_, excludedIndex) => {
    const currentSubset = numericalArray.filter((_, elementPosition) => elementPosition !== excludedIndex);
    return currentSubset.reduce(calculateCommonDivisor);
  });

  const overallMaximumGCD = allPossibleGCDs.reduce((currentMax, value) => Math.max(currentMax, value), 0);

  console.log(overallMaximumGCD);
};

const fileSystemModule = require("fs");
const rawInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
const processedInputLines = rawInputContent.trim().split(/\n/);

processNumericalData(processedInputLines);
