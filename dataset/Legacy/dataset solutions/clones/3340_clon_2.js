'use strict';

(function(initialInputData) {
  // Parse the incoming raw string data into an array of numerical values.
  // First, remove leading/trailing whitespace, then split by any whitespace,
  // and finally convert each resulting string part to a number.
  let processedNumbers = initialInputData.trim().split(/\s+/).map(valStr => Number(valStr));

  // Extract the primary problem parameters from the beginning of the processed array.
  // 'childCount' corresponds to 'N' in the original problem.
  const childCount = processedNumbers.shift();
  // 'candyLimit' corresponds to 'K' in the original problem.
  const candyLimit = processedNumbers.shift();

  // Define the modulus value for calculations, often used in combinatorics problems.
  // This is 'M' from the original code.
  const modulusValue = Math.pow(10, 9) + 7;

  // The remaining numbers in 'processedNumbers' represent the individual candy capacities.
  // This is 'a' from the original code.
  const individualCandyCaps = processedNumbers;

  // Initialize a two-dimensional array for dynamic programming.
  // 'dynamicProgTable[i][k]' will store the number of ways to distribute
  // up to 'k' candies among the first 'i+1' children.
  const dynamicProgTable = new Array(childCount).fill(0).map(
    () => new Array(candyLimit + 1).fill(0)
  );

  // Establish a crucial base case for the DP table, handling the "state before any children".
  // In JavaScript, negative indices are treated as property names, which is leveraged here.
  // 'dynamicProgTable[-1][k]' is initialized to 1, signifying one way to distribute 0 candies
  // when no children have been considered yet.
  dynamicProgTable[-1] = new Array(candyLimit + 1).fill(1);

  // Initialize another set of base cases for the DP table.
  // For each child, if the candy amount is effectively -1 (a conceptual boundary),
  // the number of ways is 0.
  for (let childIndex = 0; childIndex < childCount; childIndex++) {
    dynamicProgTable[childIndex][-1] = 0;
  }

  // Populate the dynamic programming table using the defined recurrence relation.
  // The outer loop iterates through each child.
  for (let currentChildIndex = 0; currentChildIndex < childCount; currentChildIndex++) {
    // The inner loop iterates through each possible candy amount up to the limit.
    for (let currentCandyAmount = 0; currentCandyAmount <= candyLimit; currentCandyAmount++) {
      // Determine the lower bound for the previous state calculation.
      // This corresponds to 'k - a[i]' in the original formula, ensuring it doesn't go below -1.
      let previousStateLowerBound = Math.max(-1, currentCandyAmount - individualCandyCaps[currentChildIndex]);

      // Apply the core DP recurrence relation.
      // This formula is a common pattern for problems involving "at most K" items,
      // often derived from prefix sums or inclusion-exclusion principles.
      let calculatedValue = dynamicProgTable[currentChildIndex][currentCandyAmount - 1] +
                            dynamicProgTable[currentChildIndex - 1][currentCandyAmount] -
                            dynamicProgTable[currentChildIndex - 1][previousStateLowerBound];

      // Apply the modulo operation to keep the result within the specified range.
      // Note: JavaScript's '%' operator can return negative results for negative operands.
      // The original code's `%=` would preserve this.
      dynamicProgTable[currentChildIndex][currentCandyAmount] = calculatedValue % modulusValue;
    }
  }

  // The final answer is the number of ways to distribute exactly 0 candies
  // among all 'childCount' children, which is found at dynamicProgTable[childCount-1][0].
  console.log(dynamicProgTable[childCount - 1][0]);

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
