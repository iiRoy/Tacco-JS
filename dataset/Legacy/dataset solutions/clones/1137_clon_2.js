function computeMaxVal() {
  // Initialize a 2D array for dynamic programming.
  // This table will store the maximum value that can be obtained
  // for a given number of items and a given weight capacity.
  const dpTable = [];

  // Allocate space for rows based on the total number of available goods.
  for (let itemIndex = 0; itemIndex <= totalItemsCount; itemIndex++) {
    dpTable[itemIndex] = [];
  }

  // Initialize the first row (0 items) with zero values for all capacities.
  for (let currentWeight = 0; currentWeight <= maxCapacity; currentWeight++) {
    dpTable[0][currentWeight] = 0;
  }

  // Initialize the first column (0 capacity) with zero values for all items.
  for (let itemIndex = 0; itemIndex <= totalItemsCount; itemIndex++) {
    dpTable[itemIndex][0] = 0;
  }

  // Fill the DP table using the knapsack algorithm.
  // Iterate through each item.
  for (let itemIndex = 1; itemIndex <= totalItemsCount; itemIndex++) {
    // Iterate through each possible weight capacity.
    for (let currentWeight = 1; currentWeight <= maxCapacity; currentWeight++) {
      // Check if the current item's weight is less than or equal to the current capacity.
      if (availableGoods[itemIndex].itemWeight <= currentWeight) {
        // If including the current item yields a higher value, take it.
        // Value = current item's value + value from remaining capacity with previous items.
        if (availableGoods[itemIndex].itemValue + dpTable[itemIndex - 1][currentWeight - availableGoods[itemIndex].itemWeight] > dpTable[itemIndex - 1][currentWeight]) {
          dpTable[itemIndex][currentWeight] = availableGoods[itemIndex].itemValue + dpTable[itemIndex - 1][currentWeight - availableGoods[itemIndex].itemWeight];
        } else {
          // Otherwise, don't include the current item; take the value from previous items.
          dpTable[itemIndex][currentWeight] = dpTable[itemIndex - 1][currentWeight];
        }
      } else {
        // If the current item's weight is too high, it cannot be included.
        // Take the value from previous items for the same capacity.
        dpTable[itemIndex][currentWeight] = dpTable[itemIndex - 1][currentWeight];
      }
    }
  }

  // The maximum value for all items and the full capacity is at dpTable[totalItemsCount][maxCapacity].
  return dpTable[totalItemsCount][maxCapacity];
}

// Read input from standard input.
const fileSystem = require('fs');
const rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');

// Process the raw input data.
const lineSegments = rawData.trim().split("\n");

// Extract the number of initial items and the maximum knapsack capacity.
const params = (lineSegments.shift()).split(" ").map(Number);
const initialItemCount = params[0];
const maxCapacity = params[1];

// An object to store processed goods, mapping weight to the maximum value for that weight.
const processedGoodsMap = {};

// Iterate through the initial items to generate a refined set of available goods.
for (let itemIdx = 1; itemIdx <= initialItemCount; itemIdx++) {
  const currentLineParts = (lineSegments.shift()).split(" ").map(Number);
  let multiplier = 1;

  // Generate scaled versions of the current item up to the knapsack's max capacity.
  while (currentLineParts[1] * multiplier <= maxCapacity) {
    const currentWeight = currentLineParts[1] * multiplier;
    const currentValue = currentLineParts[0] * multiplier;

    // If an item with this weight already exists in the map,
    // check if the current scaled item offers a better value.
    if (currentWeight in processedGoodsMap) {
      if (processedGoodsMap[currentWeight] > currentValue) {
        multiplier++;
        continue; // Skip if existing item is better.
      }
    }
    // Store or update the item with the maximum value for this weight.
    processedGoodsMap[currentWeight] = currentValue;
    multiplier++;
  }
}

// Convert the processed goods map into an array of item objects for the knapsack algorithm.
// The first element is null to align indices with the DP table (1-based indexing for items).
const availableGoods = [null];
for (const weightKey in processedGoodsMap) {
  availableGoods.push({ itemValue: processedGoodsMap[weightKey], itemWeight: Number(weightKey) });
}

// Update the global totalItemsCount based on the refined list.
const totalItemsCount = availableGoods.length - 1;

// Execute the knapsack algorithm to find the maximum value.
const finalResult = computeMaxVal();

// Output the final maximum value.
console.log(finalResult);
