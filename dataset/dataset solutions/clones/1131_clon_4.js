const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

const inputLines = fileContent.trim().split('\n');
const [ targetAmountStr, numCoinTypesStr ] = inputLines[0].split(' ');
const coinValuesStr = inputLines[1].trim().split(' ');

const targetAmount = Number(targetAmountStr);
const numCoinTypes = Number(numCoinTypesStr);
const coinValues = coinValuesStr.map(Number);

// Initialize an array to store the minimum number of coins required for each amount.
// The array size is `targetAmount + 1` to cover amounts from 0 to `targetAmount`.
// Each element is initialized to `targetAmount + 1`, which acts as an "infinity" value.
// This is because the maximum possible coins needed for `targetAmount` `N` (if all coins are 1) is `N`.
// So `N + 1` indicates that an amount is not reachable.
const minCoinsForAmount = new Array(targetAmount + 1).fill(targetAmount + 1);

// Base case: 0 coins are needed to make an amount of 0.
minCoinsForAmount[0] = 0;

// Iterate through each possible sum from 1 up to the target amount.
for (let currentSum = 1; currentSum <= targetAmount; currentSum++) {
  // For each sum, consider all available coin denominations.
  for (let coinIdx = 0; coinIdx < numCoinTypes; coinIdx++) {
    const currentCoinDenomination = coinValues[coinIdx];

    // If the current coin denomination can be subtracted from the current sum
    // without resulting in a negative value (i.e., it's a valid previous state).
    if (currentSum - currentCoinDenomination >= 0) {
      // Check if the previous state (currentSum - currentCoinDenomination) is reachable.
      // If `minCoinsForAmount[currentSum - currentCoinDenomination]` is not `targetAmount + 1`,
      // it means a solution exists for that smaller sum.
      if (minCoinsForAmount[currentSum - currentCoinDenomination] !== targetAmount + 1) {
        // Update the minimum coins needed for `currentSum`.
        // It's the minimum of its current value and (1 + minimum coins for the remaining sum).
        minCoinsForAmount[currentSum] = Math.min(
          minCoinsForAmount[currentSum],
          minCoinsForAmount[currentSum - currentCoinDenomination] + 1
        );
      }
    }
  }
}

// The final result is the minimum number of coins needed for the `targetAmount`.
// If `minCoinsForAmount[targetAmount]` is still `targetAmount + 1`, it means the target amount
// cannot be formed with the given coin denominations. The problem context implies a solution exists.
console.log(minCoinsForAmount[targetAmount]);
