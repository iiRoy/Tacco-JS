let rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read raw input from standard input
const lines = rawData.trim().split('\n'); // Split input into individual lines
let firstLineParts = lines[0].split(' ').map(Number); // Parse the first line for N and W

const itemCount = firstLineParts[0]; // Number of items available
const maxWeight = firstLineParts[1]; // Maximum capacity of the knapsack

const items = lines.slice(1).map(line => line.split(' ').map(Number)); // Parse item details (weight, value)

// Initialize DP table: memoTable[i][j] will store the maximum value for 'i' items and 'j' capacity
let memoTable = Array.from({ length: itemCount + 1 }, (_ignored) => Array(maxWeight + 1).fill(0));

function calculateMaxVal() { // Function to compute the maximum value using dynamic programming

  // Iterate through each item
  for (let idx = 0; idx < itemCount; idx++) {
    // Iterate through each possible weight capacity
    for (let currentWeight = 0; currentWeight <= maxWeight; currentWeight++) {
      // Check if the current item's weight can fit into the current capacity
      if (items[idx][0] <= currentWeight) {
        // Option 1: Include the current item
        // Value is (value of previous items with remaining capacity) + (value of current item)
        let valIncludingCurrent = memoTable[idx][currentWeight - items[idx][0]] + items[idx][1];
        // Option 2: Exclude the current item
        // Value is (value of previous items with current capacity)
        let valExcludingCurrent = memoTable[idx][currentWeight];

        // Store the maximum value obtained from including or excluding the current item
        memoTable[idx + 1][currentWeight] = Math.max(valIncludingCurrent, valExcludingCurrent);
      } else {
        // If the current item's weight is too high for the current capacity,
        // we cannot include it. So, the value remains the same as without this item.
        memoTable[idx + 1][currentWeight] = memoTable[idx][currentWeight];
      }
    }
  }
  // The final maximum value is stored at memoTable[itemCount][maxWeight]
  return memoTable[itemCount][maxWeight];
}

console.log(calculateMaxVal()); // Output the result to the console
