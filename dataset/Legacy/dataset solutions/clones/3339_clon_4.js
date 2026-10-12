'use strict';

const MOD_CONSTANT = 1000000007;

function calculateWaysToDistribute(personCount, totalAmount, individualLimits) {
  if (totalAmount === 0) {
    return 1;
  }

  const memoizationCache = Array.from({ length: personCount }, () =>
    new Array(totalAmount + 1).fill(-1)
  );

  function findDistributionCount(pIdx, amt) {
    if (amt < 0) {
      return 0;
    }
    if (amt === 0) {
      return 1;
    }
    if (pIdx < 0) {
      return 0;
    }

    if (memoizationCache[pIdx][amt] !== -1) {
      return memoizationCache[pIdx][amt];
    }

    let currentResult;

    if (pIdx === 0) {
      currentResult = (amt <= individualLimits[0]) ? 1 : 0;
    } else {
      const termA = findDistributionCount(pIdx, amt - 1);
      const termB = findDistributionCount(pIdx - 1, amt);

      const limitExceededAmount = amt - individualLimits[pIdx] - 1;
      const termC = (limitExceededAmount >= 0) ? findDistributionCount(pIdx - 1, limitExceededAmount) : 0;

      currentResult = (termA + termB - termC + MOD_CONSTANT) % MOD_CONSTANT;
    }

    memoizationCache[pIdx][amt] = currentResult;
    return currentResult;
  }

  return findDistributionCount(personCount - 1, totalAmount);
}

function processInput(inputData) {
  const dataLines = inputData.split("\n");
  const dimensions = dataLines[0].split(' ').map(Number);
  const numPeople = dimensions[0];
  const totalItems = dimensions[1];
  const limitsArray = dataLines[1].split(' ').map(Number);

  const finalAnswer = calculateWaysToDistribute(numPeople, totalItems, limitsArray);
  console.log(finalAnswer);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
