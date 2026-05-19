'use strict';

function processInput(sourceText) {
  let countOfOnes = 0;
  let countOfZeros = 0;

  for (let charPosition = 0; charPosition < sourceText.length - 1; charPosition++) {
    const currentSymbol = sourceText[charPosition];
    if (currentSymbol === '0') {
      countOfZeros++;
    } else if (currentSymbol === '1') {
      countOfOnes++;
    }
  }

  console.log(Math.min(countOfZeros, countOfOnes) * 2);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
