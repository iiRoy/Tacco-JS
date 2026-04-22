const fileSystemUtilities = require('fs');

// Read the entire standard input as a UTF-8 string
const fileContent = fileSystemUtilities.readFileSync('/dev/stdin', 'utf8');

// Process the raw input: trim whitespace and split into individual lines
const linesOfText = fileContent
  .trim()
  .split('\n');

// Parse the first line to get problem parameters
const firstLineValues = linesOfText[0]
  .split(' ')
  .map(Number);

// Extract total number of items from the first parameter
const totalItems = firstLineValues[0];

// Extract maximum knapsack capacity from the second parameter
const maxCapacity = firstLineValues[1];

// Process the remaining lines to get item data (weight and value for each item)
const itemData = linesOfText
  .slice(1)
  .map(lineText => lineText
    .split(' ')
    .map(Number)
  );

// Initialize a 2D array for dynamic programming memoization.
// Dimensions are (totalItems + 1) x (maxCapacity + 1), filled with zeros.
const memoizationArray = Array.from({ length: totalItems + 1 }, _ =>
  Array(maxCapacity + 1).fill(0)
);

/**
 * Computes the maximum value that can be obtained from the items
 * given a specific knapsack capacity using dynamic programming.
 * @returns {number} The maximum achievable value.
 */
function calculateOptimalValue() {

  // Iterate through each item
  for (let itemIndex = 0; itemIndex < totalItems; itemIndex++) {

    // Iterate through each possible capacity from 0 up to maxCapacity
    for (let currentWeight = 0; currentWeight <= maxCapacity; currentWeight++) {

      // Get the weight of the current item
      const currentItemWeight = itemData[itemIndex][0];

      // Get the value of the current item
      const currentItemValue = itemData[itemIndex][1];

      // Check if the current item's weight can fit into the current capacity
      if (currentItemWeight <= currentWeight) {

        // Calculate the value if the current item is included:
        // Value of previous items at remaining capacity + current item's value
        const valueIfIncluded = memoizationArray[itemIndex][currentWeight - currentItemWeight] + currentItemValue;

        // Value if the current item is excluded:
        // Value of previous items at the same current capacity
        const valueIfExcluded = memoizationArray[itemIndex][currentWeight];

        // Store the maximum of these two options in the memoization table
        memoizationArray[itemIndex + 1][currentWeight] = Math.max(valueIfIncluded, valueIfExcluded);

      } else {
        // If the current item's weight is greater than the current capacity,
        // it cannot be included. So, the value remains the same as without this item.
        memoizationArray[itemIndex + 1][currentWeight] = memoizationArray[itemIndex][currentWeight];
      }
    }
  }

  // The final answer is stored at memoizationArray[totalItems][maxCapacity]
  return memoizationArray[totalItems][maxCapacity];
}

// Display the computed optimal value to the console
console.log(calculateOptimalValue());