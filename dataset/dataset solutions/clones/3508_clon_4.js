'use strict'

function processInputData(rawText) {
  const divisorConstant = 111;
  let numericValue = Number(rawText) | 0;

  let computedResult = numericValue;
  while (true) {
    if (computedResult >= numericValue && computedResult % divisorConstant === 0) {
      break;
    }
    computedResult++;
  }
  console.log(computedResult);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
