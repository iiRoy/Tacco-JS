'use strict'

function buildCumulativeSums(sourceArray) {
  const cumulative = [0];
  sourceArray.reduce((accumulator, currentElement) => {
    const nextTotal = accumulator + currentElement;
    cumulative.push(nextTotal);
    return nextTotal;
  }, 0);
  return cumulative;
}

function computeOptimalCost(arrayLength, inputNumbers) {
  const cumulativeSums = buildCumulativeSums(inputNumbers);

  const retrieveSegmentSum = (startIdx, endIdx) => {
    return cumulativeSums[endIdx + 1] - cumulativeSums[startIdx];
  };

  const memoizationTable = Array.from({ length: arrayLength }, () =>
    Array(arrayLength).fill(null)
  );

  const findMinPartitionCost = (segmentStart, segmentEnd) => {
    if (segmentStart === segmentEnd) {
      return 0;
    }
    if (memoizationTable[segmentStart][segmentEnd] !== null) {
      return memoizationTable[segmentStart][segmentEnd];
    }

    let currentMinimum = Number.MAX_SAFE_INTEGER;

    for (let partitionPoint = segmentStart; partitionPoint < segmentEnd; partitionPoint++) {
      const costForCurrentPartition =
        findMinPartitionCost(segmentStart, partitionPoint) +
        findMinPartitionCost(partitionPoint + 1, segmentEnd) +
        retrieveSegmentSum(segmentStart, partitionPoint) +
        retrieveSegmentSum(partitionPoint + 1, segmentEnd);
      currentMinimum = Math.min(currentMinimum, costForCurrentPartition);
    }

    memoizationTable[segmentStart][segmentEnd] = currentMinimum;
    return currentMinimum;
  };

  return findMinPartitionCost(0, arrayLength - 1);
}

function processInput(rawData) {
  const dataLines = rawData.split("\n");
  const elementCount = parseInt(dataLines[0], 10);
  const valuesArray = dataLines[1].split(' ').map(val => parseInt(val, 10));

  const finalAnswer = computeOptimalCost(elementCount, valuesArray);
  console.log(finalAnswer);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
