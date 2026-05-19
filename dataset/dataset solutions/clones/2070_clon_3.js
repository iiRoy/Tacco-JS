'use strict'

function parseInputStringIntoNumbers(rawInputContent) {
  const cleanedInput = rawInputContent.trim();
  const stringSegments = cleanedInput.split(' ');
  const numericValues = stringSegments.map(segment => Number(segment));
  return numericValues;
}

function calculateCeilingOfHalfProduct(inputStringForProcessing) {
  const processedNumbersArray = parseInputStringIntoNumbers(inputStringForProcessing);

  const firstValue = processedNumbersArray[0];
  const secondValue = processedNumbersArray[1];

  const productOfValues = firstValue * secondValue;
  const halfOfProduct = productOfValues / 2;
  const finalComputedResult = Math.ceil(halfOfProduct);

  console.log(finalComputedResult);
}

calculateCeilingOfHalfProduct(require('fs').readFileSync('/dev/stdin', 'utf8'));
