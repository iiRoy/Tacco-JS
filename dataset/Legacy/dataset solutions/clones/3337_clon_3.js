'use strict';
(function(initialInputString){

  function createFilledArray(size, fillValue) {
    return new Array(size).fill(fillValue);
  }

  const trimmedInput = initialInputString.trim();
  const inputParts = trimmedInput.split(/\s+/);
  const numericValues = inputParts.map(val => Number(val));

  const childCount = numericValues.shift();
  const maxCandies = numericValues.shift();
  const candyLimits = numericValues;

  const modulusVal = Math.pow(10, 9) + 7;

  // dynamicProgTable will store the DP states for each child
  const dynamicProgTable = new Array(childCount);

  // previousChildDP represents the base case for the DP,
  // equivalent to dp[-1] in the original, where all ways to distribute 0 to K candies is 1
  let previousChildDP = createFilledArray(maxCandies + 1, 1);

  // Iterate through each child
  for (let childIdx = 0; childIdx < childCount; childIdx++) {
    const currentChildDP = createFilledArray(maxCandies + 1, 0);
    const currentChildCandyLimit = candyLimits[childIdx];

    // Base case for currentChildDP[0]:
    // currentChildDP[0] = (currentChildDP[-1] + previousChildDP[0]) % modulusVal
    // Since currentChildDP[-1] is conceptually 0, it simplifies to:
    currentChildDP[0] = previousChildDP[0];

    // Iterate through possible total candies (k)
    for (let currentCandies = 1; currentCandies <= maxCandies; currentCandies++) {
      const termFromCurrentRowPrevCol = currentChildDP[currentCandies - 1]; // dp[i][k-1]
      const termFromPrevRowSameCol = previousChildDP[currentCandies];       // dp[i-1][k]

      let currentSum = (termFromCurrentRowPrevCol + termFromPrevRowSameCol) % modulusVal;

      // This condition handles the subtraction for cases where currentCandies > candyLimits[childIdx]
      // Equivalent to the second inner loop in the original code
      if (currentCandies > currentChildCandyLimit) {
        const subtractTermIndex = currentCandies - currentChildCandyLimit - 1;
        const subtractTermValue = previousChildDP[subtractTermIndex]; // dp[i-1][k-a[i]-1]
        currentSum = (currentSum - subtractTermValue + modulusVal) % modulusVal;
      }
      currentChildDP[currentCandies] = currentSum;
    }
    dynamicProgTable[childIdx] = currentChildDP;
    previousChildDP = currentChildDP; // Update previousChildDP for the next iteration
  }

  // The final answer is dp[N-1][K] - dp[N-1][K-1]
  const lastChildRow = dynamicProgTable[childCount - 1];
  const totalWaysK = lastChildRow[maxCandies];
  const totalWaysKMinus1 = lastChildRow[maxCandies - 1];

  const finalResult = (totalWaysK - totalWaysKMinus1 + modulusVal) % modulusVal;
  console.log(finalResult);

})(require('fs').readFileSync('/dev/stdin','utf8'));
