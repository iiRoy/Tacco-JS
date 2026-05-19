function calculateOptimalValue() {
  // Initialize a dynamic programming table to store maximum values
  let valueMatrix = [];

  // Prepare the table dimensions
  for (let itemIndex = 0; itemIndex <= totalItems; itemIndex++) {
    valueMatrix[itemIndex] = [];
  }

  // Fill the first row with zeros (no items considered)
  for (let currentCapacity = 0; currentCapacity <= maxCapacity; currentCapacity++) {
    valueMatrix[0][currentCapacity] = 0;
  }

  // Fill the first column with zeros (zero capacity)
  for (let itemIndex = 0; itemIndex <= totalItems; itemIndex++) {
    valueMatrix[itemIndex][0] = 0;
  }

  // Iterate through items and capacities to fill the DP table
  for (let itemIndex = 1; itemIndex <= totalItems; itemIndex++) {
    for (let currentCapacity = 1; currentCapacity <= maxCapacity; currentCapacity++) {
      // Check if the current item's weight is within the overall maximum capacity
      // Note: The original code uses 'W' here, not 'j' (currentCapacity).
      // This behavior is preserved as per Type II cloning rules.
      if (itemDetails[itemIndex].wt <= maxCapacity) {
        // Calculate the maximum value considering three options:
        // 1. Not including the current item (value from previous row)
        // 2. Including the current item once (value from previous row with reduced capacity)
        // 3. Including the current item multiple times (value from current row with reduced capacity - unbounded knapsack style)
        valueMatrix[itemIndex][currentCapacity] = Math.max(
          valueMatrix[itemIndex - 1][currentCapacity],
          itemDetails[itemIndex].val + valueMatrix[itemIndex - 1][currentCapacity - itemDetails[itemIndex].wt],
          itemDetails[itemIndex].val + valueMatrix[itemIndex][currentCapacity - itemDetails[itemIndex].wt]
        );
      } else {
        // If the item's weight exceeds the overall maximum capacity,
        // it cannot be included, so take the value from the previous row.
        valueMatrix[itemIndex][currentCapacity] = valueMatrix[itemIndex - 1][currentCapacity];
      }
    }
  }
  // The final result is the maximum value for all items and the total capacity
  return valueMatrix[totalItems][maxCapacity];
}

// Load input data from standard input
const fileSystem = require('fs');
let rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');

// Process the input string
let lineData = (rawData.trim()).split("\n");

// Extract N (total items) and W (max capacity) from the first line
let params = (lineData.shift()).split(" ").map(Number);
let totalItems = params[0];
let maxCapacity = params[1];

// Initialize an array to store item properties (value and weight)
// The first element is null to align with 1-based indexing used in the DP table
let itemDetails = [null];

// Parse item value and weight for each subsequent line
for (let itemIndex = 1; itemIndex <= totalItems; itemIndex++) {
  let itemInfo = (lineData.shift()).split(" ").map(Number);
  itemDetails[itemIndex] = { val: itemInfo[0], wt: itemInfo[1] };
}

// Execute the knapsack calculation
let finalResult = calculateOptimalValue();

// Output the computed maximum value
console.log(finalResult);
