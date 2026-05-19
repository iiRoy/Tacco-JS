"use strict";
function main(inputContent) {
  const inputLines = inputContent.trim().split("\n");

  const firstLineParts = inputLines[0].split(" ");
  const windowLength = Number(firstLineParts[1]); // Corresponds to 'k'

  const numericStrings = inputLines[1].split(" "); // Corresponds to 'n'
  
  // Transform data points into expected values
  // Equivalent to original's 'exp' array calculation
  const transformedValues = numericStrings.map(str => (2 + parseInt(str, 10)) / 2);
  
  // Compute cumulative sums
  // Equivalent to original's 'sum' array calculation
  // prefixSums[j] stores the sum of transformedValues[0] through transformedValues[j-1]
  const prefixSums = transformedValues.reduce((accumulator, currentValue, index) => {
    accumulator.push(accumulator[index] + currentValue);
    return accumulator;
  }, [0]);
  
  // Calculate sums for all possible sliding windows, replicating original's logic
  // The original loop iterates from i = k-1 to n.length-1
  // For the first iteration (i = k-1), the index i-k becomes -1, leading to sum[-1] (undefined)
  // This results in NaN for the first window sum, which is then handled by Math.max
  const windowSums = Array.from({ length: transformedValues.length - (windowLength - 1) }, (_, windowIndex) => {
    const currentWindowEndIdx = windowLength - 1 + windowIndex; // This maps to 'i' in the original loop
    const currentWindowStartIdxForPrefix = currentWindowEndIdx - windowLength; // This maps to 'i-k' in the original loop
    
    // Replicate the original's behavior where prefixSums[negative_index] is undefined
    const valueToSubtract = prefixSums[currentWindowStartIdxForPrefix];
    
    return prefixSums[currentWindowEndIdx] - valueToSubtract;
  });
  
  // Determine the maximum window sum
  // The initial value is 0, and comparisons with NaN behave as in the original
  const overallMaximum = windowSums.reduce((currentMax, windowSumValue) => {
    return (currentMax < windowSumValue) ? windowSumValue : currentMax;
  }, 0);

  console.log(overallMaximum);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
