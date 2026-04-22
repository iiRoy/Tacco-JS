'use strict'

; (function (rawData) {
  // Process raw input data: trim whitespace, split into tokens, convert to numbers.
  let processedData = rawData
    .trim()
    .split(/\s+/)
    .map(item => parseInt(item))

  const numChildren = processedData.shift() // First element is the count of children
  const totalCandies = processedData.shift() // Second element is the total number of candies
  const moduloConstant = 1_000_000_007 // A large prime number for modulo operations

  const childLimits = processedData // Remaining elements are maximum candies each child can take

  // Initialize a 2D array (dynamic programming table)
  // waysToDistribute[c][t] will store the sum of ways to distribute 0 to 't' candies
  // among the first 'c' children.
  const waysToDistribute = new Array(numChildren)
    .fill(0)
    .map(_ => new Array(totalCandies + 1).fill(0))

  // Set up base cases for the DP table.
  // This represents a virtual "child -1" where 1 way exists to distribute any number of candies.
  waysToDistribute[-1] = new Array(totalCandies + 1).fill(1)
  for (let childIndex = 0; childIndex < numChildren; childIndex++) {
    waysToDistribute[childIndex][-1] = 0 // No ways to distribute negative candies
  }

  // Iterate through each child
  for (let childIndex = 0; childIndex < numChildren; childIndex++) {
    // Iterate through each possible candy count
    for (let currentCandyCount = 0; currentCandyCount <= totalCandies; currentCandyCount++) {
      // Calculate the lower bound for subtraction in the DP recurrence.
      // This accounts for the maximum candies the current child can receive.
      let subtractIndex = Math.max(-1, currentCandyCount - childLimits[childIndex])

      // Apply the DP recurrence relation:
      // waysToDistribute[c][t] = waysToDistribute[c][t-1] + waysToDistribute[c-1][t] - waysToDistribute[c-1][t-maxCandies]
      // This formula calculates cumulative sums correctly.
      waysToDistribute[childIndex][currentCandyCount] =
        waysToDistribute[childIndex][currentCandyCount - 1] +
        waysToDistribute[childIndex - 1][currentCandyCount] -
        waysToDistribute[childIndex - 1][subtractIndex]

      // Ensure the result remains positive and within the modulo range.
      waysToDistribute[childIndex][currentCandyCount] %= moduloConstant
      if (waysToDistribute[childIndex][currentCandyCount] < 0) {
        waysToDistribute[childIndex][currentCandyCount] += moduloConstant
      }
    }
  }

  // Log the final result: the number of ways to distribute 0 candies among all children.
  // This value is typically 1 (one way: give no candies to anyone).
  console.log(waysToDistribute[numChildren - 1][0])
})(require('node:fs').readFileSync('/dev/stdin', 'utf8'))