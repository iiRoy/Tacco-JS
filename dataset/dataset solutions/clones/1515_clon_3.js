"use strict";

const main = (inputStr) => {
  const MOD_CONSTANT = 998244353;

  const inputLines = inputStr.trim().split("\n");

  const firstLineParts = inputLines[0].split(" ");
  const numElements = Number(firstLineParts[0]);
  const numRanges = Number(firstLineParts[1]);

  const rangeBounds = inputLines
    .slice(1, numElements + 1)
    .map((line) => line.split(" ").map(Number));

  // Initialize difference array for IMOS method
  const diffArray = new Array(numElements + 1).fill(0);

  // Apply range updates to the difference array
  for (let k = 0; k < numRanges; k++) {
    const leftBound = rangeBounds[k][0];
    const rightBound = rangeBounds[k][1];
    diffArray[leftBound]++;
    diffArray[rightBound + 1]--;
  }

  // Calculate covered indices using the difference array
  const coveredIndices = [];
  let coverageCounter = 0;
  for (let i = 0; i < numElements; i++) {
    coverageCounter += diffArray[i];
    if (coverageCounter !== 0) {
      coveredIndices.push(i);
    }
  }

  // Initialize dynamic programming array
  const dynamicProg = new Array(numElements).fill(0);
  dynamicProg[0] = 1; // Base case: one way to reach index 0

  const numCovered = coveredIndices.length;

  // Fill DP table
  for (let i = 1; i < numElements; i++) {
    let currentSum = 0;
    for (let j = 0; j < numCovered; j++) {
      const offsetIdx = coveredIndices[j];
      const prevIdx = i - offsetIdx;

      // Ensure prevIdx is valid and contributes to the sum
      if (prevIdx >= 0) {
        currentSum = (currentSum + dynamicProg[prevIdx]) % MOD_CONSTANT;
      }
    }
    dynamicProg[i] = currentSum;
  }

  console.log(dynamicProg[numElements - 1]);
};

main(require("fs").readFileSync("/dev/stdin", "utf8"));
