'use strict';
function processInputAndCalculate(rawInputString) {
  const cleanedParts = rawInputString.trim().split(' ');
  const [firstDimension, secondDimension] = cleanedParts.map(val => parseInt(val, 10));
  const productOfDimensions = firstDimension * secondDimension;
  const finalResult = (productOfDimensions + (productOfDimensions & 1)) >> 1;
  console.log(finalResult);
}

processInputAndCalculate(require('fs').readFileSync('/dev/stdin', 'utf8'));
