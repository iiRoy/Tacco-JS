'use strict';
(function(rawData){
  const moduloConstant = Math.pow(10, 9) + 7;

  const calculateSafeModulo = (value, mod) => {
      return (value % mod + mod) % mod;
  };

  const executeCandyDistributionDP = (inputString) => {
      const parsedNumericData = inputString.trim().split(/\s+/).map(Number);
      const numberOfChildren = parsedNumericData.shift();
      const maximumCandies = parsedNumericData.shift();
      const childAllowanceLimits = parsedNumericData;

      // Initialize the dynamic programming table
      // waysToDistribute[childIndex][candySum] stores the sum of ways to distribute 0 to candySum candies
      // among children from 0 to childIndex.
      const waysToDistribute = Array.from({ length: numberOfChildren }, () => Array(maximumCandies + 1).fill(0));

      // This array represents the base case for the "previous" row (conceptually dp[-1] from the original).
      // It signifies the state before any children are considered.
      // For 0 children, there is 1 way to distribute any sum of candies (by giving 0 to all).
      let previousChildWays = Array(maximumCandies + 1).fill(1);

      for (let currentChildIndex = 0; currentChildIndex < numberOfChildren; currentChildIndex++) {
          // Iterate through all possible candy sums for the current child
          for (let currentCandySum = 0; currentCandySum <= maximumCandies; currentCandySum++) {
              // Term 1: Equivalent to dp[currentChildIndex][currentCandySum - 1]
              // This is the value from the *current* child's row, but for the previous candy sum.
              // If currentCandySum is 0, this term is 0 (mimicking dp[i][-1] = 0).
              const currentChildPrevSumTerm = (currentCandySum > 0)
                  ? waysToDistribute[currentChildIndex][currentCandySum - 1]
                  : 0;

              // Term 2: Equivalent to dp[currentChildIndex - 1][currentCandySum]
              // This is the value from the *previous* child's row, for the current candy sum.
              const prevChildCurrentSumTerm = previousChildWays[currentCandySum];

              // Calculate the lower bound for the subtraction term (l in original)
              // This represents the point where child 'currentChildIndex' would exceed their candy limit.
              const exclusionIndex = Math.max(-1, currentCandySum - childAllowanceLimits[currentChildIndex]);

              // Term 3: Equivalent to dp[currentChildIndex - 1][exclusionIndex]
              // This is the value from the *previous* child's row, at the calculated exclusion index.
              // If exclusionIndex is -1, this term is 0 (mimicking dp[-1][-1] = 0).
              const prevChildExclusionTerm = (exclusionIndex >= 0)
                  ? previousChildWays[exclusionIndex]
                  : 0;

              // Apply the DP recurrence relation
              let intermediateCalculation = currentChildPrevSumTerm + prevChildCurrentSumTerm - prevChildExclusionTerm;
              waysToDistribute[currentChildIndex][currentCandySum] = calculateSafeModulo(intermediateCalculation, moduloConstant);
          }
          // After completing the current child's row, it becomes the 'previousChildWays' for the next iteration.
          previousChildWays = waysToDistribute[currentChildIndex];
      }

      // The problem asks for the value at dp[N-1][0]
      return waysToDistribute[numberOfChildren - 1][0];
  };

  const finalComputedResult = executeCandyDistributionDP(rawData);
  console.log(finalComputedResult);
})(require('fs').readFileSync('/dev/stdin','utf8'));
