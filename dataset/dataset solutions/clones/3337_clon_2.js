'use strict';
(function(dataInput) {
  // Process the raw input string: trim leading/trailing whitespace,
  // split by any sequence of whitespace characters, and convert each part to a number.
  dataInput = dataInput.trim().split(/\s+/).map(val => val - 0);

  // Extract the number of children (N) and the total number of candies (K)
  // from the beginning of the processed input array.
  const childCount = dataInput.shift();
  const totalCandies = dataInput.shift();

  // Define the modulo value to be used in all calculations to prevent integer overflow.
  // This is a common prime number used in competitive programming.
  const moduloVal = Math.pow(10, 9) + 7;

  // The remaining elements in the dataInput array represent the maximum
  // number of candies each child can receive.
  const childCandyLimits = dataInput;

  // Initialize the dynamic programming table.
  // `dynamicProgTable[childIdx][candyCount]` will store the cumulative sum
  // of ways to distribute `0` to `candyCount` candies among children from `0` to `childIdx`.
  const dynamicProgTable = new Array(childCount).fill(0).map(val => new Array(totalCandies + 1).fill(0));

  // --- Base Case Initialization for DP Table ---
  // This handles a conceptual "child -1" state, representing the state before any children are considered.
  // If there are no children, there's 1 way to distribute 0 candies (do nothing), and 0 ways for more.
  // However, the problem's DP state definition implies `dp[i][k]` is a prefix sum.
  // `dynamicProgTable[-1]` is treated as an object property in JavaScript, not an array index.
  dynamicProgTable[-1] = new Array(totalCandies + 1).fill(1);

  // Initialize the DP table for a conceptual "candyCount -1" state.
  // This means there are 0 ways to distribute a negative number of candies.
  for (let childIdx = -1; childIdx < childCount; childIdx++) {
    dynamicProgTable[childIdx][-1] = 0;
  }

  // --- Fill the Dynamic Programming Table ---
  // Iterate through each child from the first (index 0) to the last.
  for (let childIdx = 0; childIdx < childCount; childIdx++) {
    // For the current child, iterate through all possible candy counts up to their individual limit.
    for (let candyCount = 0; candyCount <= childCandyLimits[childIdx]; candyCount++) {
      // The number of ways to distribute `candyCount` candies up to `childIdx`
      // is the sum of:
      // 1. Ways to distribute `candyCount - 1` candies up to `childIdx` (current child takes 0 candies).
      // 2. Ways to distribute `candyCount` candies up to `childIdx - 1` (current child takes `candyCount` candies).
      // This formula is for prefix sums.
      dynamicProgTable[childIdx][candyCount] = (dynamicProgTable[childIdx][candyCount - 1] + dynamicProgTable[childIdx - 1][candyCount]) % moduloVal;
    }
    // For candy counts exceeding the current child's individual limit.
    for (let candyCount = childCandyLimits[childIdx] + 1; candyCount <= totalCandies; candyCount++) {
      // When the current child's candy limit is exceeded, we need to subtract
      // the invalid combinations from the prefix sum.
      // The formula `dp[i][k-1] + dp[i-1][k] - dp[i-1][k-a[i]-1]` effectively
      // removes the cases where the current child takes more candies than allowed.
      // Adding `moduloVal` before the final modulo ensures the result is positive.
      dynamicProgTable[childIdx][candyCount] = (dynamicProgTable[childIdx][candyCount - 1] + dynamicProgTable[childIdx - 1][candyCount] - dynamicProgTable[childIdx - 1][candyCount - childCandyLimits[childIdx] - 1] + moduloVal) % moduloVal;
    }
  }

  // --- Calculate the Final Result ---
  // The problem asks for the number of ways to distribute *exactly* `totalCandies`.
  // Since `dynamicProgTable[childCount - 1][totalCandies]` stores the sum of ways
  // to distribute `0` to `totalCandies`, we subtract the sum of ways to distribute
  // `0` to `totalCandies - 1` to get the count for exactly `totalCandies`.
  // Adding `moduloVal` before the final modulo handles potential negative results from subtraction.
  const finalResult = (dynamicProgTable[childCount - 1][totalCandies] - dynamicProgTable[childCount - 1][totalCandies - 1] + moduloVal) % moduloVal;

  // Output the calculated final result to the console.
  console.log(finalResult);
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
