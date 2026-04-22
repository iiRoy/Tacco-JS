const rawProblemData = require('fs').readFileSync('/dev/stdin', 'utf8');

const NEWLINE_DELIMITER = '\n';
const SPACE_DELIMITER = ' ';
const NO_SOLUTION_POSSIBLE = Infinity;
const BASE_CASE_COINS_NEEDED = 0;

const parseInteger = (valueString) => {
  const parsedValue = parseInt(valueString, 10);
  if (isNaN(parsedValue)) {
    // In a production system, this might involve more sophisticated error handling.
    // For competitive programming, we typically assume valid input formats.
    throw new Error(`Invalid number format encountered: '${valueString}'`);
  }
  return parsedValue;
};

const processedInputLines = rawProblemData.trim().split(NEWLINE_DELIMITER);

const [ targetSumString, numCoinTypesString ] = processedInputLines[0].split(SPACE_DELIMITER);
const goalAmount = parseInteger(targetSumString);
const numberOfCoinTypes = parseInteger(numCoinTypesString);

const coinDenominations = processedInputLines[1]
  .trim()
  .split(SPACE_DELIMITER)
  .map(parseInteger);

// A cache to store previously computed results for subproblems.
// This prevents redundant calculations, which is the core of dynamic programming.
const memoizedResultsCache = new Map();

/**
 * Computes the minimum number of coins required to achieve a given target amount.
 * This function employs a recursive, top-down dynamic programming approach with memoization.
 *
 * @param {number} currentRemainingAmount - The monetary value for which to find the minimum coins.
 * @returns {number} The smallest count of coins, or NO_SOLUTION_POSSIBLE if no combination works.
 */
const determineMinimumCoins = (currentRemainingAmount) => {
  // A guard clause for invalid states: negative amounts cannot be made with coins.
  if (currentRemainingAmount < BASE_CASE_COINS_NEEDED) {
    return NO_SOLUTION_POSSIBLE;
  }

  // The base case: if the amount is zero, no coins are needed.
  if (currentRemainingAmount === BASE_CASE_COINS_NEEDED) {
    return BASE_CASE_COINS_NEEDED;
  }

  // Generate a unique identifier for the current subproblem.
  const cacheKey = String(currentRemainingAmount);

  // Check if the result for this specific amount is already available in the cache.
  if (memoizedResultsCache.has(cacheKey)) {
    return memoizedResultsCache.get(cacheKey);
  }

  let lowestCoinCountFound = NO_SOLUTION_POSSIBLE; // Initialize with a value indicating no solution yet.

  // Iterate through each available coin type to explore all possible first moves.
  for (const coinValue of coinDenominations) {
    // Calculate the amount that would remain after using the current coin.
    const subsequentAmount = currentRemainingAmount - coinValue;

    // Recursively determine the minimum coins needed for the subsequent amount.
    const coinsForSubsequentAmount = determineMinimumCoins(subsequentAmount);

    // If a valid path was found for the subsequent amount (i.e., it's not impossible),
    // update our minimum by considering this path (1 for the current coin + coins for the rest).
    if (coinsForSubsequentAmount !== NO_SOLUTION_POSSIBLE) {
      lowestCoinCountFound = Math.min(lowestCoinCountFound, 1 + coinsForSubsequentAmount);
    }
  }

  // Store the calculated minimum coin count for the current amount in the cache.
  memoizedResultsCache.set(cacheKey, lowestCoinCountFound);

  // Return the result for the current subproblem.
  return lowestCoinCountFound;
};

// Initiate the dynamic programming process for the primary goal amount.
const overallMinimumCoins = determineMinimumCoins(goalAmount);

// Output the final result. If no solution was found, typically -1 is expected in such problems.
console.log(overallMinimumCoins === NO_SOLUTION_POSSIBLE ? -1 : overallMinimumCoins);