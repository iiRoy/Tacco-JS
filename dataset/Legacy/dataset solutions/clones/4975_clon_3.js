'use strict'

function processInput(rawData) {
  const charArray = rawData.trim().split('');
  const splitPointsCount = charArray.length - 1;

  let totalSum = 0;
  const totalCombinations = 1 << splitPointsCount;

  const calculateCombinationSum = (chars, mask, numSplitPoints) => {
    let currentSegments = [chars[0]];

    for (let splitIdx = 0; splitIdx < numSplitPoints; splitIdx++) {
      const nextChar = chars[splitIdx + 1];
      if (mask & (1 << splitIdx)) {
        currentSegments.push(nextChar);
      } else {
        const lastSegmentIndex = currentSegments.length - 1;
        currentSegments[lastSegmentIndex] += nextChar;
      }
    }

    return currentSegments.reduce((acc, segmentStr) => {
      const parsedValue = parseInt(segmentStr, 10);
      return acc + parsedValue;
    }, 0);
  };

  for (let combinationMask = 0; combinationMask < totalCombinations; combinationMask++) {
    totalSum += calculateCombinationSum(charArray, combinationMask, splitPointsCount);
  }

  console.log(totalSum);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
