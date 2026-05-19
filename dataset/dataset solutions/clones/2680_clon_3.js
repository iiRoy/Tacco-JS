'use strict'

function calculatePowerOfTen(exponentValue) {
  let currentPower = 1;
  for (let p = 0; p < exponentValue; p++) {
    currentPower *= 10;
  }
  return currentPower;
}

function processInput(rawInputData) {
  const numericString = rawInputData.trim();
  const stringLength = numericString.length;
  const numericValue = parseInt(numericString, 10);

  let modifierValue = 0;
  const isLengthOdd = (stringLength % 2 !== 0);

  if (isLengthOdd) {
    const divisorForMod = calculatePowerOfTen(stringLength - 1);
    modifierValue = (numericValue % divisorForMod) + 1;
  }

  const halfLength = Math.floor(stringLength / 2);
  
  let generatedPattern = '';
  if (halfLength > 0) {
      const segmentToRepeat = '09';
      generatedPattern = Array(halfLength).fill(segmentToRepeat).join('');
  }

  const finalPatternValue = parseInt(generatedPattern, 10);

  console.log(finalPatternValue + modifierValue);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'))
