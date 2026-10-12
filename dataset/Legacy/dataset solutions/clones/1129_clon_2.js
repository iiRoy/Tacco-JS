const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

const utilityModule = require('util'); // This module is imported but not utilized in the provided logic.

/**
 * Asynchronously yields control to the event loop using process.nextTick.
 * This helps prevent blocking the event loop during intensive synchronous operations.
 * @returns {Promise<any>} A promise that resolves after the next tick, or rejects if an error occurs.
 */
const yieldControl = () => {
  return new Promise((resolve, reject) => {
    process.nextTick((errorObject, operationResult) => {
      if (errorObject) {
        reject(errorObject);
        return;
      }
      resolve(operationResult);
    });
  });
};

// Process the raw input data
const dataLines = rawData.trim().split('\n');

// Extract target sum and number of coin types from the first line
let [ targetSum, coinTypes ] = dataLines[0].split(' ').map(Number);

// Extract coin denominations from the second line
let coinValues = dataLines[1].trim().split(' ').map(Number);

// Initialize a counter for recursive calls to manage event loop yielding
let invocationCounter = 0;

// Initialize a 2D array for memoization (dynamic programming table)
// The outer array has 'coinTypes' rows, and each inner array is initialized to 'targetSum' length.
// Note: The original code initializes inner arrays with 'n' (targetSum) elements,
// but the problem context usually implies dp[i][x] where i is coin index and x is current sum.
// The original `new Array(n)` for inner arrays is unusual if `n` is the target sum,
// as it would mean `dp[i]` is an array of `targetSum` elements, which is correct for `x` up to `targetSum`.
const memoTable = (new Array(coinTypes)).fill(targetSum).map((arraySize) => new Array(targetSum + 1));


/**
 * Asynchronously calculates the minimum number of coins required to reach a given sum.
 * This function uses dynamic programming with memoization and yields control periodically
 * to prevent stack overflow or event loop blocking for deep recursions.
 *
 * @param {number} typeIndex - The current index of the coin type being considered.
 * @param {number} currentSum - The remaining sum to achieve.
 * @returns {Promise<number>} A promise that resolves with the minimum number of coins.
 */
const calculateMinCoins = async (typeIndex, currentSum) => {
  // Periodically yield control to the event loop to prevent blocking
  if (++invocationCounter > 1000000) {
    // console.log('Yielding control: starting at count ' + invocationCounter);
    await yieldControl();
    invocationCounter = 0; // Reset the counter after yielding
    // console.log('Yielding control: finished, counter reset.');
  }

  // Base case: If all coin types have been considered
  if (typeIndex === coinValues.length) {
    // If the current sum is 0, no more coins are needed. Otherwise, it's impossible to reach 0 with remaining coins.
    return currentSum === 0 ? 0 : targetSum + 1; // targetSum + 1 represents an impossible state
  }

  // Check if the result for this subproblem is already memoized
  if (memoTable[typeIndex][currentSum] !== undefined) {
    return memoTable[typeIndex][currentSum];
  }

  // Option 1: Do not use the current coin type (move to the next coin type)
  let currentResult = await calculateMinCoins(typeIndex + 1, currentSum);

  // Option 2: Use the current coin type if it's possible
  if (currentSum >= coinValues[typeIndex]) {
    currentResult = Math.min(currentResult, await calculateMinCoins(typeIndex, currentSum - coinValues[typeIndex]) + 1);
  }

  // Memoize the result before returning
  return memoTable[typeIndex][currentSum] = currentResult;
};

// Execute the main logic within an immediately invoked async function expression
(async () => {
  // Log the final minimum number of coins required to reach the target sum
  console.log(await calculateMinCoins(0, targetSum));
})();
