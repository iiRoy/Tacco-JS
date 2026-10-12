'use strict';

// A large prime number used for modulo operations to prevent integer overflow.
const primeMod = 1e9 + 7;

/**
 * Calculates the number of ways to distribute a total number of candies
 * among a given number of children, respecting individual candy limits.
 *
 * @param {number} numChildren - The total number of children.
 * @param {number} totalCandies - The total number of candies to distribute.
 * @param {number[]} candyLimits - An array where candyLimits[i] is the maximum candies the i-th child can receive.
 * @returns {number} The number of distinct ways to distribute candies, modulo primeMod.
 */
function calculateWays(numChildren, totalCandies, candyLimits) {
  // Base case: If no candies are to be distributed, there's only one way (give 0 to everyone).
  if (totalCandies === 0) {
    return 1;
  }

  // currentDP[c] stores the number of ways to distribute 'c' candies among the children processed so far.
  let currentDP = new Array(totalCandies + 1).fill(0);

  // prefixSums[childIdx][c] stores the sum of currentDP[0]...currentDP[c] for child 'childIdx'.
  // This helps in efficiently calculating range sums.
  let prefixSums = new Array(numChildren).fill(0).map(element => new Array(totalCandies + 1).fill(0));

  // Iterate through each child.
  for (let childIdx = 0; childIdx < numChildren; childIdx++) {
    // Iterate through all possible candy counts from 0 up to totalCandies.
    for (let candyCount = 0; candyCount <= totalCandies; candyCount++) {
      // Handle the first child as a base case for DP.
      if (childIdx === 0) {
        // The first child can receive 'candyCount' if it's within their limit.
        currentDP[candyCount] = candyCount <= candyLimits[childIdx] ? 1 : 0;
        // Calculate prefix sum for the first child.
        prefixSums[childIdx][candyCount] = candyCount > 0 ? ((prefixSums[childIdx][candyCount - 1] + currentDP[candyCount]) % primeMod) : (currentDP[candyCount] % primeMod);
      } else {
        // For subsequent children, use the prefix sums from the previous child.
        // The number of ways to give 'candyCount' candies to 'childIdx' children
        // is the sum of ways to give 'candyCount - x' candies to 'childIdx - 1' children,
        // where 'x' is the number of candies given to the current child (0 <= x <= candyLimits[childIdx]).
        // This sum can be calculated using prefix sums: prefixSums[childIdx-1][candyCount] - prefixSums[childIdx-1][candyCount - candyLimits[childIdx] - 1].
        let lowerBound = candyCount - candyLimits[childIdx] - 1;
        currentDP[candyCount] = (lowerBound >= 0) ?
                                ((prefixSums[childIdx - 1][candyCount] - prefixSums[childIdx - 1][lowerBound]) % primeMod) :
                                (prefixSums[childIdx - 1][candyCount] % primeMod);

        // Ensure the result is non-negative after modulo, as JavaScript's % can return negative.
        currentDP[candyCount] = (currentDP[candyCount] + primeMod) % primeMod;

        // Calculate prefix sum for the current child.
        prefixSums[childIdx][candyCount] = candyCount > 0 ? ((prefixSums[childIdx][candyCount - 1] + currentDP[candyCount]) % primeMod) : (currentDP[candyCount] % primeMod);
      }
    } // End of inner loop for candyCount
  } // End of outer loop for childIdx

  // The final answer is the number of ways to distribute 'totalCandies' among all 'numChildren'.
  return currentDP[totalCandies] % primeMod;
}

/**
 * Main function to process input, call the solver, and print the result.
 * @param {string} rawData - The raw input string from stdin.
 */
function processInput(rawData) {
  // Split the input string into individual lines.
  const inputLines = rawData.split("\n");

  // Parse the first line to get N (number of children) and K (total candies).
  const parsedNK = inputLines[0].split(' ').map(linePart => parseInt(linePart, 10));
  const numChildren = parsedNK[0];
  const totalCandies = parsedNK[1];

  // Parse the second line to get the array of candy limits for each child.
  const candyLimits = inputLines[1].split(' ').map(linePart => parseInt(linePart, 10));

  // Call the main calculation function.
  const finalResult = calculateWays(numChildren, totalCandies, candyLimits);

  // Output the computed result to the console.
  console.log(finalResult);
}

// Read input from standard input and pass it to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
