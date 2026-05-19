function calculateMaxVal() {
  // Initialize a 2D array for dynamic programming table
  let dpTable = [];

  // Create rows for the DP table
  for (let rowIdx = 0; rowIdx <= numItems; rowIdx++) {
    dpTable[rowIdx] = [];
  }

  // Fill the first row with zeros (no items considered)
  for (let colIdx = 0; colIdx <= capacity; colIdx++) {
    dpTable[0][colIdx] = 0;
  }

  // Fill the first column with zeros (no capacity available)
  for (let rowIdx = 0; rowIdx <= numItems; rowIdx++) {
    dpTable[rowIdx][0] = 0;
  }

  // Iterate through items and capacities to fill the DP table
  for (let rowIdx = 1; rowIdx <= numItems; rowIdx++) {
    for (let colIdx = 1; colIdx <= capacity; colIdx++) {
      // Calculate how many times the current item can fit
      let itemCount = Math.floor(colIdx / availableItems[rowIdx].weight);
      // Calculate the total weight if this many items are taken
      let totalWeight = itemCount * availableItems[rowIdx].weight;
      // Calculate the total value if this many items are taken
      let totalValue = itemCount * availableItems[rowIdx].value;

      // Check if the total weight of current items fits within current capacity
      if (totalWeight <= capacity) {
        // Compare taking the current item(s) vs. not taking them
        if (totalValue + dpTable[rowIdx - 1][colIdx - totalWeight] > dpTable[rowIdx - 1][colIdx]) {
          // If taking them yields more value, update the table
          dpTable[rowIdx][colIdx] = totalValue + dpTable[rowIdx - 1][colIdx - totalWeight];
        } else {
          // Otherwise, carry over the value from the previous item
          dpTable[rowIdx][colIdx] = dpTable[rowIdx - 1][colIdx];
        }
      } else {
        // If the current item(s) cannot fit, carry over the value from the previous item
        dpTable[rowIdx][colIdx] = dpTable[rowIdx - 1][colIdx];
      }
    }
  }
  // The maximum value for the given number of items and capacity
  return dpTable[numItems][capacity];
}

// Read input from standard input
const fileSystem = require('fs');
let rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');

// Process input lines
let inputLines = rawData.trim().split("\n");

// Extract N (number of items) and W (knapsack capacity)
let dimensions = (inputLines.shift()).split(" ").map(Number);
let numItems = dimensions[0];
let capacity = dimensions[1];

// Initialize array to store item objects (value and weight)
let availableItems = [null]; // Use 1-based indexing for convenience

// Populate the availableItems array from input
for (let rowIdx = 1; rowIdx <= numItems; rowIdx++) {
  let itemData = (inputLines.shift()).split(" ").map(Number);
  availableItems[rowIdx] = {
    value: itemData[0],
    weight: itemData[1]
  };
}

// Calculate the maximum value using the knapsack algorithm
let finalResult = calculateMaxVal();

// Output the result
console.log(finalResult);
