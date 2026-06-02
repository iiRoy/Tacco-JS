'use strict'

function calculateRangeSum(startIndex, endIndex, prefixSums) {
  const valueAtEnd = prefixSums[endIndex];
  const valueBeforeStart = (startIndex > 0) ? prefixSums[startIndex - 1] : 0;
  return valueAtEnd - valueBeforeStart;
}

function computePrefixSums(inputArray) {
  const arrayLength = inputArray.length;
  const currentPrefixSums = new Array(arrayLength);

  if (arrayLength === 0) {
    return currentPrefixSums;
  }

  currentPrefixSums[0] = inputArray[0];
  for (let idx = 1; idx < arrayLength; idx++) {
    currentPrefixSums[idx] = currentPrefixSums[idx - 1] + inputArray[idx];
  }
  return currentPrefixSums;
}

function findMinCostPartition(arrayLength, dataArray) {
  const memoTable = Array.from({ length: arrayLength }, () => Array(arrayLength).fill(0));
  const computedPrefixSums = computePrefixSums(dataArray);

  // The original code iterates 'col' (representing the span or length-1)
  // and then 'r' (representing the start index).
  // 'c' was derived as 'r + col'.
  // This transformation uses 'len' for the span (length-1) and 'startIdx' for the start.
  // 'endIdx' is then 'startIdx + len'.
  for (let len = 1; len < arrayLength; len++) { // 'len' is the length of the segment minus one
    for (let startIdx = 0; startIdx < arrayLength - len; startIdx++) {
      const endIdx = startIdx + len; // This is the end index of the current segment

      memoTable[startIdx][endIdx] = Number.MAX_SAFE_INTEGER;

      for (let splitPoint = startIdx; splitPoint < endIdx; splitPoint++) {
        const leftSegmentSum = calculateRangeSum(startIdx, splitPoint, computedPrefixSums);
        const rightSegmentSum = calculateRangeSum(splitPoint + 1, endIdx, computedPrefixSums);
        
        const currentPartitionCost = memoTable[startIdx][splitPoint] +
                                     memoTable[splitPoint + 1][endIdx] +
                                     leftSegmentSum +
                                     rightSegmentSum;

        memoTable[startIdx][endIdx] = Math.min(memoTable[startIdx][endIdx], currentPartitionCost);
      }
    }
  }
  return memoTable[0][arrayLength - 1];
}

function processInputAndSolve(rawData) {
  const inputLines = rawData.split("\n");
  const arraySizeString = inputLines[0];
  const arrayElementsString = inputLines[1];

  const arraySize = parseInt(arraySizeString, 10);
  const numericArray = arrayElementsString.split(' ').map(val => parseInt(val, 10));

  const finalResult = findMinCostPartition(arraySize, numericArray);
  console.log(finalResult);
}

processInputAndSolve(require('fs').readFileSync('/dev/stdin', 'utf8'));
