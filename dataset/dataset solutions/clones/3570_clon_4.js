'use strict';
const processData = (sourceTxt) => {
  const numericInputs = sourceTxt.trim().split(' ').map(Number);
  const upperLimit = numericInputs[0];
  const divisorVal = numericInputs[1];

  const acquireCount = (topVal, divBy, targetMod) => {
    if (targetMod === 0) {
      return (topVal / divBy) | 0;
    } else {
      return ((topVal + targetMod) / divBy) | 0;
    }
  };

  const congruencesToConsider = [0];
  if (divisorVal % 2 === 0) {
    congruencesToConsider.push(divisorVal / 2);
  }

  const finalSummation = congruencesToConsider.reduce((currentTotal, currentRemainder) => {
    const countForRemainder = acquireCount(upperLimit, divisorVal, currentRemainder);
    return currentTotal + (countForRemainder * countForRemainder * countForRemainder);
  }, 0);

  console.log(finalSummation);
};

processData(require('fs').readFileSync('/dev/stdin', 'utf8'));