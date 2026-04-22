'use strict'

const executeProgram = (sourceData) => {
  const allLines = sourceData.split('\n');
  const quantity = Number(allLines[0]);
  const numbers = allLines[1].split(' ').map(Number);

  const finalScoreDiff = determineGameOutcome(quantity, numbers);
  console.log(finalScoreDiff);
};

const determineGameOutcome = (arrayLength, valueArray) => {
  const memoizationMap = new Map();

  const obtainScoreDifference = (beginIdx, endIdx) => {
    if (beginIdx > endIdx) {
      return 0;
    }
    if (beginIdx === endIdx) {
      return valueArray[beginIdx];
    }

    const cacheKey = `${beginIdx},${endIdx}`;
    if (memoizationMap.has(cacheKey)) {
      return memoizationMap.get(cacheKey);
    }

    const valueFromLeft = valueArray[beginIdx] - obtainScoreDifference(beginIdx + 1, endIdx);
    const valueFromRight = valueArray[endIdx] - obtainScoreDifference(beginIdx, endIdx - 1);

    const maximumDifference = Math.max(valueFromLeft, valueFromRight);

    memoizationMap.set(cacheKey, maximumDifference);
    return maximumDifference;
  };

  return obtainScoreDifference(0, arrayLength - 1);
};

executeProgram(require('fs').readFileSync('/dev/stdin', 'utf8'));