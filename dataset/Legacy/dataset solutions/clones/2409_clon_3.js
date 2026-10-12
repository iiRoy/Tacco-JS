'use strict';

// Helper function to calculate the sum of a subarray from index 0 up to (but not including) a given end index.
const calculatePrefixSum = (numericArray, exclusiveEndIndex) => {
  let currentSum = 0;
  for (let k = 0; k < exclusiveEndIndex; k++) {
    currentSum += numericArray[k];
  }
  return currentSum;
};

const processInputData = (rawInputContent) => {
  // Step 1: Parse the input string into an array of lines.
  const inputLines = rawInputContent.trim().split('\n');

  // Step 2: Extract the second line, split it by spaces, and convert to numbers.
  const stringSegments = inputLines[1].split(' ');
  const numericSegments = stringSegments.map(segmentStr => parseInt(segmentStr, 10));

  // Step 3: Calculate the total sum of all segments.
  const overallTotalSum = numericSegments.reduce((acc, val) => acc + val, 0);

  // Step 4: Determine the target sum for one half.
  const targetHalfSum = overallTotalSum / 2;

  // Step 5: Find the split point using a while loop.
  let currentAccumulatedSum = 0;
  let splitIndex = 0; // This 'splitIndex' corresponds to 'i' in the original code.

  while (currentAccumulatedSum < targetHalfSum) {
    currentAccumulatedSum += numericSegments[splitIndex];
    splitIndex++;
  }

  // Step 6: Calculate the sums for the two potential split scenarios based on 'splitIndex'.
  // Scenario A: Sum of elements from index 0 to (splitIndex - 1).
  // This corresponds to original `ans1` (sum up to `i-1`).
  const sumOptionA = calculatePrefixSum(numericSegments, splitIndex);

  // Scenario B: Sum of elements from index 0 to (splitIndex).
  // This corresponds to original `ans2` (sum up to `i`).
  const sumOptionB = calculatePrefixSum(numericSegments, splitIndex + 1);

  // Step 7: Apply the original conditional logic to determine the absolute difference for Option A.
  let finalDifferenceA;
  const remainingSumA = overallTotalSum - sumOptionA;
  if (sumOptionA === targetHalfSum && remainingSumA === targetHalfSum) {
    finalDifferenceA = 0;
  } else {
    finalDifferenceA = Math.abs(sumOptionA - remainingSumA);
  }

  // Step 8: Apply the original conditional logic to determine the absolute difference for Option B.
  let finalDifferenceB;
  const remainingSumB = overallTotalSum - sumOptionB;
  if (sumOptionB === overallTotalSum) { // This means the second sum option covers the entire array.
    finalDifferenceB = Infinity;
  } else {
    finalDifferenceB = Math.abs(sumOptionB - remainingSumB);
  }

  // Step 9: Output the smaller of the two calculated differences.
  if (finalDifferenceA < finalDifferenceB) {
    console.log(finalDifferenceA);
  } else {
    console.log(finalDifferenceB);
  }
};

// Execute the main processing function with input from stdin.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
