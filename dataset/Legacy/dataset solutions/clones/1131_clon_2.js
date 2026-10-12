const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input string into usable data structures.
const lineData = rawData.trim().split('\n');
const [ goalValue, coinCount ] = lineData[0].split(' ');
const coinDenominations = lineData[1].trim().split(' ');

/**
 * Generates a unique string key for caching purposes based on provided arguments.
 * @param {...any} args - Arguments to be joined into a key.
 * @returns {string} A concatenated string representing the cache key.
 */
const createCacheKey = (...args) => {
  const cacheIdentifier = args.join(':'); // Use a colon as a separator
  return cacheIdentifier;
};

// Initialize a Map to store computed results for memoization.
const memoizationTable = new Map();

/**
 * Recursively calculates the minimum number of coins needed to reach a target amount.
 * This function uses dynamic programming with memoization to avoid redundant calculations.
 *
 * @param {number} currentDepth - Represents the current recursion depth or number of coins used so far (not directly used in calculation, but for key generation).
 * @param {number} remainingAmount - The target amount that still needs to be reached.
 * @returns {number} The minimum number of coins required to make up the remainingAmount.
 */
const calculateMinCoins = (currentDepth, remainingAmount) => {
  const cacheIdentifier = createCacheKey(currentDepth, remainingAmount);
  let outcome = 0; // Default outcome if not found in cache

  // Check if the result for this state is already memoized.
  if (memoizationTable.has(cacheIdentifier)) {
    outcome = memoizationTable.get(cacheIdentifier);
  } else if (remainingAmount !== 0) {
    // If the remaining amount is not zero, we need to calculate it.
    // The problem constraints (N <= 50,000) suggest a large initial minimum.
    const nextDepth = currentDepth + 1;
    let minimumCoins = 50000; // A sufficiently large initial value for minimum

    // Iterate through all available coin denominations.
    for (let idx = 0; idx < Number(coinCount); idx++) {
      const newRemainingAmount = remainingAmount - Number(coinDenominations[idx]);

      // If subtracting the coin results in a negative amount, this path is invalid.
      if (newRemainingAmount < 0) {
        continue; // Skip to the next coin denomination
      }

      // Recursively call the function for the new remaining amount.
      const recursiveResult = calculateMinCoins(nextDepth, newRemainingAmount);
      // Store the result of the recursive call in the memoization table.
      memoizationTable.set(createCacheKey(nextDepth, newRemainingAmount), recursiveResult);
      // Update the minimum coins found so far for the current state.
      minimumCoins = Math.min(minimumCoins, recursiveResult);
    }
    // The result for the current state is one more than the minimum found from its subproblems.
    outcome = minimumCoins + 1;
  }

  // Return the computed or memoized result.
  return outcome;
};

// Execute the main function with initial parameters and print the final result.
console.log(calculateMinCoins(0, Number(goalValue)));
