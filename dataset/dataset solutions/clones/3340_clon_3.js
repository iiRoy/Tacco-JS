'use strict';
(function(rawInputString){
  // Define a constant for modulo operation
  const MOD_PRIME = Math.pow(10, 9) + 7;

  // Helper function to ensure results are always positive after modulo
  const positiveModulo = (value, modulus) => (value % modulus + modulus) % modulus;

  // Input processing and validation
  if (!rawInputString || rawInputString.trim().length === 0) {
    console.error("Error: Input string is empty or invalid.");
    // In a real scenario, might throw an error or exit.
    return;
  }

  // Parse the raw input string into an array of numeric values
  const parsedNumbers = rawInputString.trim().split(/\s+/).map(str => {
    const num = parseInt(str, 10);
    if (isNaN(num)) {
      console.error(`Error: Invalid number found in input: '${str}'`);
      // Fallback or error handling for non-numeric input
      return 0; // Or throw an error
    }
    return num;
  });

  // Extract problem parameters
  const totalChildrenCount = parsedNumbers.shift();
  const maxOverallCandies = parsedNumbers.shift();
  const childCandyLimits = parsedNumbers; // Remaining numbers are individual child limits

  // Basic validation for key parameters
  if (totalChildrenCount === undefined || totalChildrenCount < 0 ||
      maxOverallCandies === undefined || maxOverallCandies < 0) {
    console.error("Error: Invalid child count or maximum candies. Must be non-negative integers.");
    return;
  }

  // Initialize the dynamic programming table
  // dpTable[i][k] will store the total ways to distribute 0 to 'k' candies
  // among the first 'i+1' children (children from index 0 to i).
  const dpTable = Array.from({ length: totalChildrenCount }, () =>
    Array(maxOverallCandies + 1).fill(0)
  );

  // Define a conceptual base row for the DP calculation when no children are considered.
  // This row signifies that there is 1 way to achieve any candy sum (by giving 0 to all children).
  // This is a common base case in certain combinatorial DP problems.
  const emptyChildrenBaseRow = Array(maxOverallCandies + 1).fill(1);

  // Helper function to safely retrieve values from the DP table or base cases.
  // This abstracts away the original code's `dp[-1]` and `dp[i][-1]` conceptual access.
  const getDpValue = (childRowIndex, candyColumnIndex) => {
    if (candyColumnIndex < 0) {
      // If candy sum is negative, there are no ways.
      return 0;
    }
    if (childRowIndex < 0) {
      // If childRowIndex is -1, use the special base row.
      return emptyChildrenBaseRow[candyColumnIndex];
    }
    // Otherwise, retrieve from the computed DP table.
    return dpTable[childRowIndex][candyColumnIndex];
  };

  // Iterate through each child to build up the DP table
  for (let currentChildIndex = 0; currentChildIndex < totalChildrenCount; currentChildIndex++) {
    // For each child, iterate through all possible candy sums
    for (let currentCandySum = 0; currentCandySum <= maxOverallCandies; currentCandySum++) {
      // Calculate the lower bound index for subtraction in the recurrence relation.
      // This corresponds to `k - a[i]` in the original code,
      // used to remove ways where the current child takes more than their limit.
      const subtractionPointIndex = Math.max(-1, currentCandySum - childCandyLimits[currentChildIndex] -1); // Adjusted by -1 from original for standard prefix sum DP

      // Apply the recurrence relation:
      // dpTable[currentChildIndex][currentCandySum] =
      //   dpTable[currentChildIndex][currentCandySum - 1] (ways to use up to currentCandySum-1 for current child)
      //   + getDpValue(currentChildIndex - 1, currentCandySum) (ways for previous children to sum up to currentCandySum)
      //   - getDpValue(currentChildIndex - 1, subtractionPointIndex) (subtract ways where current child takes too many)
      // All calculations are done using the helper `getDpValue` to handle base cases.
      let waysForCurrentState = getDpValue(currentChildIndex, currentCandySum - 1); // Ways for current child with currentCandySum-1
      waysForCurrentState = positiveModulo(waysForCurrentState + getDpValue(currentChildIndex - 1, currentCandySum), MOD_PRIME); // Add ways from previous children
      waysForCurrentState = positiveModulo(waysForCurrentState - getDpValue(currentChildIndex - 1, subtractionPointIndex), MOD_PRIME); // Subtract invalid ways

      dpTable[currentChildIndex][currentCandySum] = waysForCurrentState;
    }
  }

  // The problem's usual interpretation for distributing K candies among N children
  // implies the result should be dpTable[N-1][K].
  // The original code outputted dp[N-1][0], which typically means "ways to distribute 0 candies".
  // Assuming the intent is to find ways to distribute `maxOverallCandies` (K)
  // among `totalChildrenCount` (N) children.
  // If the original output was truly intended, `dpTable[totalChildrenCount - 1][0]` would be 1 (only one way: everyone takes 0).
  const finalResult = getDpValue(totalChildrenCount - 1, maxOverallCandies);
  console.log(finalResult);

})(require('fs').readFileSync('/dev/stdin','utf8'));