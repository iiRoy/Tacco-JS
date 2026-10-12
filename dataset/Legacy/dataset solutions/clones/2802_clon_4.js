'use strict';

function main(sourceData) {
  const [firstParam, secondParam] = sourceData.split(' ').map(Number);
  const countElements = firstParam;
  const initialValue = secondParam;

  const finalValue = initialValue + countElements - 1;
  const overallSum = (countElements / 2) * (initialValue + finalValue);

  let elementNearestToZero;

  if (initialValue <= 0 && finalValue >= 0) {
    elementNearestToZero = 0;
  } else if (initialValue > 0) {
    elementNearestToZero = initialValue;
  } else {
    elementNearestToZero = finalValue;
  }
  
  console.log(overallSum - elementNearestToZero);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
