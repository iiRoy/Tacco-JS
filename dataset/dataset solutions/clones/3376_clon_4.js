"use strict";

function extractNumericValues(lineContent) {
  return lineContent.split(/\s+/).map(str => parseInt(str, 10));
}

function processInputData(inputString) {
  const allLines = inputString.split('\n');
  const [firstVal, secondVal] = extractNumericValues(allLines[0]);

  if (firstVal === 1) {
    console.log(secondVal);
    return;
  }

  const searchCeiling = Math.floor(Math.pow(secondVal, 1 / firstVal));

  const candidateBaseNumbers = Array.from(
    { length: Math.max(0, searchCeiling - 1) },
    (_, index) => index + 2
  );

  const finalComputedResult = candidateBaseNumbers.reduce((accumulator, currentBase) => {
    if (secondVal % Math.pow(currentBase, firstVal) === 0) {
      return currentBase;
    }
    return accumulator;
  }, 1);

  console.log(finalComputedResult);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
