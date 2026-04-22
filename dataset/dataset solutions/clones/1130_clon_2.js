const rawData = require('node:fs').readFileSync('/dev/stdin', 'utf-8');

const lineFragments = rawData.trim().split('\x0A');

let [ targetValueString, coinCountString ] = lineFragments[0].split('   ');
let targetValue = parseInt(targetValueString, 10);
let coinCount = parseInt(coinCountString, 10);

let coinDenominations = lineFragments[1].trim().split(' ');
coinDenominations = coinDenominations.map((denomination) => parseInt(denomination, 10));

// Initialize the memoization table for dynamic programming.
const memoizationTable = new Map();
memoizationTable.set(0, 0); // Base case: 0 coins are needed to achieve a sum of 0.

// A very large integer to represent an uninitialized or unreachable state.
const initialMaxVal = Number.MAX_SAFE_INTEGER;

// These lines were in the original code, likely for debugging.
// They display the current state of the memoization table.
console.log(memoizationTable);
console.log(memoizationTable.get(targetValue));

// Iterate through all possible sums from 0 up to the target value.
for (let currentSum = 0; currentSum <= targetValue; currentSum++) {
    // If the minimum coins for the current sum have already been computed, skip.
    if (memoizationTable.has(currentSum)) {
        continue;
    }

    let minimumCoins = initialMaxVal; // Start with the largest possible value.

    // Iterate through each available coin denomination.
    for (let denominationIndex = 0; denominationIndex < coinCount; denominationIndex++) {
        // Calculate the sum that would precede the current sum if this coin was used.
        const previousSum = currentSum - coinDenominations[denominationIndex];

        // If the previous sum is invalid (negative) or not yet computed, skip this coin.
        if (previousSum < 0 || !memoizationTable.has(previousSum)) {
            continue;
        }

        // Retrieve the result for the sub-problem (previous sum).
        const subProblemResult = memoizationTable.get(previousSum);

        // Update the minimum coins needed for the current sum.
        minimumCoins = Math.min(subProblemResult, minimumCoins);
    }

    // If a valid combination was found (i.e., minimumCoins was updated),
    // store the result in the memoization table (add 1 for the current coin).
    if (minimumCoins < initialMaxVal) {
        memoizationTable.set(currentSum, minimumCoins + 1);
    }
}

// Output the final answer: the minimum coins required for the target sum.
console.log(memoizationTable.get(targetValue));