"use strict";

function processInputData(rawData) {
  const numberPattern = /\d+/g;
  const parsedNumbers = Array.from(rawData.matchAll(numberPattern), m => m[0]);

  const elementCount = parseInt(parsedNumbers[0]);
  const limitValueBinary = parseInt(parsedNumbers[1]).toString(2).padStart(50, '0');

  const binaryValues = parsedNumbers.slice(2, 2 + elementCount).map(valStr =>
    parseInt(valStr).toString(2).padStart(50, '0')
  );

  const bitPositionCounts = Array.from({ length: 50 }, (_, bitIdx) =>
    binaryValues.reduce((count, currentBinary) =>
      count + (currentBinary[bitIdx] === '1' ? 1 : 0), 0
    )
  );

  const memoizationTable = Array.from({ length: 51 }, () =>
    Array(2).fill(null)
  );

  function calculateMaximumXorSum(currentBitIndex, isCurrentlyTight) {
    if (currentBitIndex === 50) {
      return 0;
    }

    if (memoizationTable[currentBitIndex][isCurrentlyTight] !== null) {
      return memoizationTable[currentBitIndex][isCurrentlyTight];
    }

    let maximumSuffixScore = 0;
    const upperLimitDigit = isCurrentlyTight ? parseInt(limitValueBinary[currentBitIndex]) : 1;

    for (let chosenDigit = 0; chosenDigit <= upperLimitDigit; chosenDigit++) {
      const newTightState = isCurrentlyTight && (chosenDigit === upperLimitDigit);
      
      const currentBitContribution = (
        (chosenDigit === 0 ? bitPositionCounts[currentBitIndex] : elementCount - bitPositionCounts[currentBitIndex]) *
        Math.pow(2, 49 - currentBitIndex)
      );

      const remainingBitsScore = calculateMaximumXorSum(currentBitIndex + 1, newTightState);
      
      maximumSuffixScore = Math.max(maximumSuffixScore, currentBitContribution + remainingBitsScore);
    }

    memoizationTable[currentBitIndex][isCurrentlyTight] = maximumSuffixScore;
    return maximumSuffixScore;
  }

  const overallMaximumScore = calculateMaximumXorSum(0, true);
  console.log(overallMaximumScore);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
