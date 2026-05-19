const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

const lines = rawData.trim().split('\n');
const [ targetValueStr, coinTypeCountStr ] = lines[0].split(' ');
const targetValue = Number(targetValueStr);
const coinTypeCount = Number(coinTypeCountStr);
const coinDenominations = lines[1].trim().split(' ').map(Number);

const generateCacheKey = (...keyParts) => {
  return keyParts.join(':');
};

const memoizationCache = new Map();
const IMPOSSIBLE_COIN_COUNT = 50001; // A value larger than any possible valid result (N <= 50,000)

const calculateMinCoins = (currentRecursionDepth, remainingAmount) => {
  const cacheKey = generateCacheKey(currentRecursionDepth, remainingAmount);

  // Check if the result for this subproblem is already computed
  if (memoizationCache.has(cacheKey)) {
    return memoizationCache.get(cacheKey);
  }

  // Base case: If the remaining amount is zero, no more coins are needed
  if (remainingAmount === 0) {
    return 0;
  }

  // Initialize minimum coins for the current state to a very large value
  let minimumCoinsForCurrentState = IMPOSSIBLE_COIN_COUNT;

  // Prepare for the next level of recursion
  const nextRecursionDepth = currentRecursionDepth + 1;

  // Iterate through all available coin denominations
  for (let idx = 0; idx < coinTypeCount; idx++) {
    const currentCoinValue = coinDenominations[idx];
    const newRemainingAmount = remainingAmount - currentCoinValue;

    // If subtracting the current coin results in a negative amount, this path is invalid
    if (newRemainingAmount < 0) {
      continue;
    }

    // Recursively find the minimum coins for the new remaining amount
    const resultFromSubproblem = calculateMinCoins(nextRecursionDepth, newRemainingAmount);

    // Store the result of this subproblem in the cache for future use
    // This caches the result for (nextRecursionDepth, newRemainingAmount)
    memoizationCache.set(generateCacheKey(nextRecursionDepth, newRemainingAmount), resultFromSubproblem);

    // Update the minimum coins found for the current state
    minimumCoinsForCurrentState = Math.min(minimumCoinsForCurrentState, resultFromSubproblem);
  }

  // The result for the current state is 1 (for the coin just used) plus the minimum coins from the subproblems
  const finalResult = minimumCoinsForCurrentState + 1;

  // Note: The original code's memoization strategy only caches results for subproblems (nextRecursionDepth, newRemainingAmount),
  // not for the current (currentRecursionDepth, remainingAmount) call itself.
  // This behavior is preserved here.

  return finalResult;
};

// Initiate the calculation for the target value starting with a depth of 0
console.log(calculateMinCoins(0, targetValue));
