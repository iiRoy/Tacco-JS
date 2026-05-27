'use strict'

function verifyTaxRates(candidateValue, targetA, targetB) {
  const taxRateA = 0.08;
  const taxRateB = 0.10;

  const calculatedTaxA = Math.floor(candidateValue * taxRateA);
  const calculatedTaxB = Math.floor(candidateValue * taxRateB);

  const matchesTargetA = calculatedTaxA === targetA;
  const matchesTargetB = calculatedTaxB === targetB;

  return matchesTargetA && matchesTargetB;
}

function main(inputStringData) {
  let trimmedInputData = inputStringData.trim();
  let stringParts = trimmedInputData.split(' ');
  
  let numericInputs = stringParts.map(strVal => Number(strVal));

  const primaryValueA = numericInputs[0];
  const primaryValueB = numericInputs[1];

  let finalResult = -1;

  const EIGHT_PERCENT_DIVISOR = 0.08;
  const TEN_PERCENT_DIVISOR = 0.10;

  let searchUpperBound = Math.floor(primaryValueA / EIGHT_PERCENT_DIVISOR);
  
  let secondaryBoundCheck = Math.floor(primaryValueB / TEN_PERCENT_DIVISOR);

  for (let currentIterationValue = 1; currentIterationValue <= searchUpperBound; currentIterationValue++) {
    if (verifyTaxRates(currentIterationValue, primaryValueA, primaryValueB)) {
      finalResult = currentIterationValue;
    }
  }

  console.log(finalResult);
}

const fileSystemModule = require('fs');
const standardInputPath = '/dev/stdin';
const encodingType = 'utf8';

const rawInputContent = fileSystemModule.readFileSync(standardInputPath, encodingType);
main(rawInputContent);
