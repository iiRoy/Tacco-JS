const UPPER_BOUND_ITEM_VALUE = 1000; // Defines a maximum possible value for any single item

let fileContents = require('fs')
  .readFileSync('/dev/stdin', 'utf8');

let processedLines = fileContents.trim()
  .split('\n');

const initialParameters = processedLines[0].split(' ')
  .map(Number);

const totalItemsCount = initialParameters[0];
const maxCapacityWeight = initialParameters[1];

const itemDetailsList = processedLines
  .slice(1)
  .map(singleLine => singleLine.split(' ').map(Number));

// Initialize a 2D array for dynamic programming, filled with zeros
let dpTable = Array.from(
  { length: totalItemsCount + 1 },
  _ => Array(totalItemsCount * UPPER_BOUND_ITEM_VALUE + 1).fill(0)
);

dpTable[0] = Array(totalItemsCount * UPPER_BOUND_ITEM_VALUE + 1).fill(Infinity);
dpTable[0][0] = 0; // Base case: zero weight, zero value

function computeBestValue() {

  // Iterate through each item available
  for (let currentItemIdx = 0; currentItemIdx < totalItemsCount; currentItemIdx++) {
    // Iterate through all possible accumulated values
    for (let currentAccumulatedValue = 0; currentAccumulatedValue <= totalItemsCount * UPPER_BOUND_ITEM_VALUE; currentAccumulatedValue++) {
      const itemWeight = itemDetailsList[currentItemIdx][1];
      const itemValue = itemDetailsList[currentItemIdx][0];

      // Check if the current item's weight can be accommodated
      if (itemWeight <= currentAccumulatedValue) {
        // Option 1: Include the current item
        const weightIfIncluded = dpTable[currentItemIdx][currentAccumulatedValue - itemWeight] + itemValue;
        // Option 2: Exclude the current item
        const weightIfExcluded = dpTable[currentItemIdx][currentAccumulatedValue];

        dpTable[currentItemIdx + 1][currentAccumulatedValue] = Math.min(weightIfIncluded, weightIfExcluded);
      } else {
        // If item weight is too large, we must exclude it
        dpTable[currentItemIdx + 1][currentAccumulatedValue] = dpTable[currentItemIdx][currentAccumulatedValue];
      }
    }
  }

  let finalMaxAchievableValue = 0; // Stores the highest value whose total weight is within capacity

  // Find the maximum value whose corresponding weight is within the allowed capacity
  for (let valueIterator = 0; valueIterator <= totalItemsCount * UPPER_BOUND_ITEM_VALUE; valueIterator++) {
    if (dpTable[totalItemsCount][valueIterator] <= maxCapacityWeight) {
      finalMaxAchievableValue = valueIterator;
    }
  }

  return finalMaxAchievableValue;
}

console.log(computeBestValue());