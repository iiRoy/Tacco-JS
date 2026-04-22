// This script processes a list of numeric inputs to determine the optimal coin change.
// It simulates giving change from a 1000-unit bill for various purchase prices.

// Acquire the file system module for input operations.
const fileSystemInterface = require('fs');

// Define the fixed monetary value from which change is calculated.
const REFERENCE_BILL_VALUE = 1000;

// Establish the available denominations for coins, ordered from largest to smallest.
// The smallest denomination (1-unit coin) is handled as a remainder.
const CURRENCY_DENOMINATIONS = [500, 100, 50, 10, 5];

/**
 * Computes the minimum number of coins required to make up a specified amount.
 * This helper function applies a greedy algorithm using the predefined denominations.
 * @param {number} targetAmount - The total amount for which coin change is needed.
 * @returns {number} The cumulative count of all coins used.
 */
function calculateOptimalCoinCount(targetAmount) {
    let remainingValue = targetAmount;
    let accumulatedCoinTotal = 0;

    // Traverse through each available coin denomination.
    for (const currentDenomination of CURRENCY_DENOMINATIONS) {
        // As long as the remaining value is greater than or equal to the current denomination,
        // calculate how many of this coin can be used.
        if (remainingValue >= currentDenomination) {
            const numberOfUnits = Math.floor(remainingValue / currentDenomination);
            accumulatedCoinTotal += numberOfUnits;
            remainingValue %= currentDenomination; // Update the remainder.
        }
        // If the remaining value becomes zero, no further calculation is needed.
        if (remainingValue === 0) {
            break;
        }
    }

    // Any `remainingValue` at this point must be covered by 1-unit coins.
    // This completes the coin count for the smallest denomination.
    accumulatedCoinTotal += remainingValue;

    return accumulatedCoinTotal;
}

// Read the raw content from the standard input stream, interpreting it as UTF-8 text.
const rawInputContent = fileSystemInterface.readFileSync('/dev/stdin', 'utf8');

// Pre-process the raw input:
// 1. Remove leading/trailing whitespace.
// 2. Split the string into an array of lines.
// 3. Convert each line (potential number string) into a numeric type.
// 4. Filter out any results that are not valid numbers (e.g., from empty lines).
const numericDataPoints = rawInputContent
    .trim()
    .split('\n')
    .map(lineText => Number(lineText))
    .filter(val => !isNaN(val));

// Initialize an iterator for processing the array of numeric inputs.
let currentEntryIndex = 0;

// Loop through the processed numeric inputs.
while (currentEntryIndex < numericDataPoints.length) {
    const purchasePrice = numericDataPoints[currentEntryIndex];

    // A purchase price of 0 serves as a termination signal for the input sequence.
    if (purchasePrice === 0) {
        break;
    }

    // Compute the exact amount of change that needs to be returned.
    const changeDueAmount = REFERENCE_BILL_VALUE - purchasePrice;

    // Add a potential guard clause for invalid scenarios, though typically not triggered by problem constraints.
    // if (changeDueAmount < 0) {
    //     console.error(`Warning: Purchase price (${purchasePrice}) exceeds bill value (${REFERENCE_BILL_VALUE}). Skipping entry.`);
    //     currentEntryIndex++;
    //     continue;
    // }

    // Invoke the helper function to determine the minimum number of coins for the change.
    const finalCoinCount = calculateOptimalCoinCount(changeDueAmount);

    // Display the computed coin count for the current transaction.
    console.log(finalCoinCount);

    // Advance to the next input data point.
    currentEntryIndex++;
}