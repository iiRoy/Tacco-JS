"use strict";

const obtainData = (pathIdentifier) => {
  return require("fs").readFileSync(pathIdentifier, "utf8");
};

const executeOperation = (sourceData) => {
  const dataLines = sourceData.trim().split('\n');
  // The first line often contains a count, but it's not directly used in the core logic.
  // const initialCountValue = Number(dataLines[0]);
  const numericSequence = dataLines[1].split(' ').map(Number);

  const sequenceLength = numericSequence.length;

  // Pre-calculate cumulative sums to efficiently determine segment totals.
  // cumulativeSums[k] will store the sum of elements from index 0 to k-1.
  // cumulativeSums[0] is 0.
  const cumulativeSums = new Array(sequenceLength + 1).fill(0);
  for (let idx = 0; idx < sequenceLength; idx++) {
    cumulativeSums[idx + 1] = cumulativeSums[idx] + numericSequence[idx];
  }

  // Iterate through all possible split points to find the minimum absolute difference.
  // A split point 'sepIdx' means the left segment includes elements up to numericSequence[sepIdx],
  // and the right segment includes elements from numericSequence[sepIdx + 1] to the end.
  const calculatedDiscrepancies = [];
  for (let sepIdx = 0; sepIdx < sequenceLength; sepIdx++) {
    // Sum of the first segment (elements from 0 to sepIdx)
    const firstSegmentTotal = cumulativeSums[sepIdx + 1];
    // Sum of the second segment (elements from sepIdx + 1 to sequenceLength - 1)
    const secondSegmentTotal = cumulativeSums[sequenceLength] - cumulativeSums[sepIdx + 1];
    
    const currentAbsoluteDifference = Math.abs(secondSegmentTotal - firstSegmentTotal);
    calculatedDiscrepancies.push(currentAbsoluteDifference);
  }

  // Find the smallest difference among all calculated discrepancies.
  const minimalDiscrepancy = Math.min(...calculatedDiscrepancies);

  console.log(minimalDiscrepancy);
};

executeOperation(obtainData("/dev/stdin"));