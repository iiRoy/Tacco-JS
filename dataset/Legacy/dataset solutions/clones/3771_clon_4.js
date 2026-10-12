'use strict';
console.log(function(inputString){
  const targetNum = inputString.trim()|0;
  const minOps = Array(targetNum + 1).fill(Infinity);
  minOps[0] = 0;

  const possibleSteps = new Set();
  possibleSteps.add(1);

  let currentMultiplier = 6;
  while (currentMultiplier <= targetNum) {
    possibleSteps.add(currentMultiplier);
    if (targetNum / 6 < currentMultiplier) break;
    currentMultiplier *= 6;
  }

  currentMultiplier = 9;
  while (currentMultiplier <= targetNum) {
    possibleSteps.add(currentMultiplier);
    if (targetNum / 9 < currentMultiplier) break;
    currentMultiplier *= 9;
  }

  const sortedStepSizes = Array.from(possibleSteps).sort((a, b) => a - b);

  for (let currentVal = 1; currentVal <= targetNum; ++currentVal) {
    for (const step of sortedStepSizes) {
      if (currentVal - step >= 0) {
        minOps[currentVal] = Math.min(minOps[currentVal], minOps[currentVal - step] + 1);
      } else {
        break;
      }
    }
  }

  return minOps[targetNum].toString();
}(require('fs').readFileSync('/dev/stdin', 'utf8')));
