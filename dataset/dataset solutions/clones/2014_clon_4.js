"use strict";

const getDivs = (val) => {
  if (val === 0) {
    return [1, 0];
  }
  if (val < 0) {
    return [1, val];
  }

  const uniqueDivisors = new Set();
  for (let currentFactor = 1; currentFactor * currentFactor <= val; ++currentFactor) {
    if (val % currentFactor === 0) {
      uniqueDivisors.add(currentFactor);
      uniqueDivisors.add(val / currentFactor);
    }
  }
  return Array.from(uniqueDivisors).sort((a, b) => a - b);
};

(function processInput(rawInput) {
  const numericValue = Number(rawInput.trim());

  const exclusiveDivisorCount = getDivs(numericValue - 1).length - 1;

  const allNDivisors = getDivs(numericValue);
  const nDivisorsExcludingOne = allNDivisors.slice(1);

  const qualifyingDivisorCount = nDivisorsExcludingOne.filter(currentDivisor => {
    let remainingFactor = numericValue;
    while (remainingFactor > 1 && remainingFactor % currentDivisor === 0) {
      remainingFactor /= currentDivisor;
    }

    const isPowerOfDivisor = (remainingFactor === 1);
    const isDivisorOfReducedMinusOne = (remainingFactor > 1 && getDivs(remainingFactor - 1).includes(currentDivisor));

    return isPowerOfDivisor || isDivisorOfReducedMinusOne;
  }).length;

  console.log(exclusiveDivisorCount + qualifyingDivisorCount);

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
