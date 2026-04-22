'use strict';

const determineOutcome = (sourceData) => {
  const primaryLine = sourceData[0];
  const extractedNumbers = primaryLine.match(/-?\d+/g);
  
  const convertedValues = extractedNumbers.map(valStr => Number(valStr));

  const firstTerm = convertedValues[0];
  const secondTerm = convertedValues[1];
  const thirdTerm = convertedValues[2];

  const sumOfSecondAndThird = secondTerm + thirdTerm;
  const computationResult = sumOfSecondAndThird - firstTerm;

  return Math.max(0, computationResult);
};

(function processExternalInput() {
  const fileSystemModule = require("fs");
  const rawFileContents = fileSystemModule.readFileSync("/dev/stdin", "utf8");
  const lineCollection = rawFileContents.split('\n');
  const finalCalculation = determineOutcome(lineCollection);
  console.log(finalCalculation);
})();