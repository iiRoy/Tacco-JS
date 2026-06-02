'use strict'

const moduloConstant = 1e9 + 7

function computeCombinations(countElements, targetSum, valueLimits) {
  if (targetSum === 0) {
    return 1
  }

  const memoizationTable = Array.from({ length: countElements }, () => Array(targetSum + 1).fill(null));

  function findWays(elementIndex, currentTarget) {
    if (currentTarget < 0) {
      return 0;
    }
    if (elementIndex < 0) {
      return currentTarget === 0 ? 1 : 0;
    }

    if (memoizationTable[elementIndex][currentTarget] !== null) {
      return memoizationTable[elementIndex][currentTarget];
    }

    let totalCount = 0;
    for (let numUses = 0; numUses <= valueLimits[elementIndex]; numUses++) {
      totalCount = (totalCount + findWays(elementIndex - 1, currentTarget - numUses)) % moduloConstant;
    }

    return memoizationTable[elementIndex][currentTarget] = totalCount;
  }

  return findWays(countElements - 1, targetSum);
}

function processInput(inputData) {
  const inputLines = inputData.split("\n");
  const parsedParams = inputLines[0].split(' ').map(val => parseInt(val));
  const N = parsedParams[0];
  const K = parsedParams[1];
  const A = inputLines[1].split(' ').map(val => parseInt(val));
  const finalResult = computeCombinations(N, K, A);
  console.log(finalResult);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
