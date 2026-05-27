'use strict'

function parseInputToNumericArray(inputStringContent) {
  const characterSegments = inputStringContent.split('');
  const relevantSegments = characterSegments.slice(0, -1);

  const numericValues = [];
  for (const segment of relevantSegments) {
    const digitRepresentation = Number(segment);
    numericValues.push(digitRepresentation);
  }
  return numericValues;
}

function executeProcessing(rawInputString) {
  const processedDigits = parseInputToNumericArray(rawInputString);

  const digitCount = processedDigits.length;

  let countOfOnes = 0;
  for (const digitValue of processedDigits) {
    countOfOnes += digitValue;
  }

  const countOfZeros = digitCount - countOfOnes;

  const minimumCount = Math.min(countOfZeros, countOfOnes);

  const finalResult = minimumCount * 2;

  console.log(finalResult);
}

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
executeProcessing(fileContent);
