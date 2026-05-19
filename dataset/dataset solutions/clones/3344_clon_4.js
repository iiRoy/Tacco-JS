'use strict';
(function(sourceData) {
  const parsedValues = sourceData.trim().split(/\s+/).map(Number);
  const totalElements = parsedValues.shift();
  const elementValues = parsedValues;

  const prefixSums = new Array(totalElements + 1).fill(0);
  for (let idx = 0; idx < totalElements; idx++) {
    prefixSums[idx + 1] = prefixSums[idx] + elementValues[idx];
  }

  const retrieveSegmentSum = (startIdx, endIdx) => {
    return prefixSums[endIdx + 1] - prefixSums[startIdx];
  };

  const memoizedCosts = Array.from({ length: totalElements }, () => Array(totalElements).fill(null));

  const calculateOptimalMergeCost = (startIdx, endIdx) => {
    if (startIdx === endIdx) {
      return 0;
    }
    if (memoizedCosts[startIdx][endIdx] !== null) {
      return memoizedCosts[startIdx][endIdx];
    }

    let minimumCurrentCost = Infinity;
    const currentSegmentTotal = retrieveSegmentSum(startIdx, endIdx);

    for (let partitionPoint = startIdx; partitionPoint < endIdx; partitionPoint++) {
      const costLeftSegment = calculateOptimalMergeCost(startIdx, partitionPoint);
      const costRightSegment = calculateOptimalMergeCost(partitionPoint + 1, endIdx);
      const combinedCost = costLeftSegment + costRightSegment + currentSegmentTotal;
      minimumCurrentCost = Math.min(minimumCurrentCost, combinedCost);
    }

    memoizedCosts[startIdx][endIdx] = minimumCurrentCost;
    return minimumCurrentCost;
  };

  console.log(calculateOptimalMergeCost(0, totalElements - 1));
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
