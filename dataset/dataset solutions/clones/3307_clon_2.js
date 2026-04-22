// This module contains logic for processing input and solving a knapsack problem.

/**
 * Processes raw input data to extract problem parameters and execute the solver.
 * @param {string} rawData - The entire input string, typically from stdin.
 */
function processInputData(rawData) {
  // Break the input string into individual lines for easier parsing.
  let allInputLines = rawData.split('\n');

  /**
   * Converts a string representation of a number to an integer.
   * @param {string} stringNumber - The string to convert.
   * @returns {number} The parsed integer.
   */
  const convertToInteger = (stringNumber) => {
    return parseInt(stringNumber, 10); // Ensure base-10 parsing.
  };

  // The first line contains the total count of items and the knapsack's weight capacity.
  const [totalItemCount, knapsackCapacity] = allInputLines[0].split(' ').map(convertToInteger);

  // An array to store the weight and value for each item.
  const itemSpecifications = [];
  let cumulativeWeightUpperBound = 0; // Tracks the sum of all item weights.
  let cumulativeValueUpperBound = 0;  // Tracks the sum of all item values.

  // Iterate from the second line onwards to parse each item's weight and value.
  for (let k = 0; k < totalItemCount; ++k) {
    let itemDetails = allInputLines[k + 1].split(' ').map(convertToInteger);
    itemSpecifications.push(itemDetails); // Store as [weight, value]
    cumulativeWeightUpperBound += itemDetails[0]; // Add current item's weight to total.
    cumulativeValueUpperBound += itemDetails[1];  // Add current item's value to total.
  }

  // Invoke the core knapsack algorithm with the parsed data and print the result.
  console.log(calculateMaxKnapsackValue(totalItemCount, knapsackCapacity, itemSpecifications, cumulativeWeightUpperBound, cumulativeValueUpperBound));
}

// Standard entry point for competitive programming: read from /dev/stdin.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));


/**
 * Solves the 0/1 knapsack problem to find the maximum value that can be carried.
 * This implementation uses dynamic programming where dp[i][v] stores the minimum
 * weight required to achieve a total value 'v' using items from index 'i' to N-1.
 *
 * @param {number} numAvailableItems - The total number of items available.
 * @param {number} maxKnapsackWeightLimit - The maximum weight the knapsack can hold.
 * @param {Array<Array<number>>} itemWeightsAndValues - An array where each inner array is [weight, value] for an item.
 * @param {number} maxPossibleTotalWeight - The sum of all item weights, used as an "infinity" marker.
 * @param {number} maxPossibleTotalValue - The sum of all item values, representing the upper bound for value iteration.
 * @returns {number} The maximum total value achievable within the knapsack's capacity.
 */
function calculateMaxKnapsackValue(
  numAvailableItems,
  maxKnapsackWeightLimit,
  itemWeightsAndValues,
  maxPossibleTotalWeight,
  maxPossibleTotalValue
) {
  let finalAchievedValue = 0; // Initialize the maximum value found.

  // Initialize the DP table. `dpTable[i][v]` = minimum weight for value `v` using items `i` through `N-1`.
  // The table has `numAvailableItems + 1` rows and `maxPossibleTotalValue + 1` columns.
  // `dpTable[numAvailableItems]` serves as the base case (no items remaining).
  const dpTable = Array(numAvailableItems + 1).fill(0).map((_unused, rowIndex) => {
    // For the first row (dpTable[0]), all value slots are initialized to 0.
    if (rowIndex === 0) {
      return Array(maxPossibleTotalValue + 1).fill(0);
    } else {
      // For other rows (dpTable[1] to dpTable[N]), initialize dpTable[i][0] to 0 (0 value needs 0 weight)
      // and dpTable[i][v > 0] to `maxPossibleTotalWeight` (acting as an "infinite" weight).
      return Array(maxPossibleTotalValue + 1).fill(0).fill(maxPossibleTotalWeight, 1);
    }
  });

  // Fill the DP table using a reverse item iteration (from N down to 1).
  // `itemPointer` iterates from `numAvailableItems` down to `1`.
  // `dpTable[itemPointer - 1]` depends on `dpTable[itemPointer]`.
  for (let itemPointer = numAvailableItems; itemPointer > 0; --itemPointer) {
    const currentItemWeight = itemWeightsAndValues[itemPointer - 1][0];
    const currentItemValue = itemWeightsAndValues[itemPointer - 1][1];

    // `targetValue` iterates from `maxPossibleTotalValue` down to `1`.
    for (let targetValue = maxPossibleTotalValue; targetValue > 0; --targetValue) {
      // Option 1: Do not include the current item (at index `itemPointer - 1`).
      // The minimum weight for `targetValue` is simply what was needed using items `itemPointer` to `N-1`.
      let weightIfSkipped = dpTable[itemPointer][targetValue];

      // Option 2: Consider including the current item.
      let weightIfTaken = maxPossibleTotalWeight; // Default to "infinity"

      // Check if including the item is feasible (if `targetValue` is large enough to contain `currentItemValue`).
      if (targetValue >= currentItemValue) {
        // Calculate the value needed from the subsequent items (items `itemPointer` to `N-1`).
        const remainingValueTarget = targetValue - currentItemValue;

        // If the remaining value was achievable with items `itemPointer` to `N-1` (i.e., not "infinity").
        if (dpTable[itemPointer][remainingValueTarget] < maxPossibleTotalWeight) {
          // The weight if current item is taken is its weight plus the minimum weight for the remaining value.
          weightIfTaken = dpTable[itemPointer][remainingValueTarget] + currentItemWeight;
        }
      }

      // Store the minimum weight to achieve `targetValue` using items `itemPointer - 1` to `N-1`.
      dpTable[itemPointer - 1][targetValue] = Math.min(weightIfSkipped, weightIfTaken);
    }
  }

  // After populating the DP table, find the maximum value that fits within the knapsack capacity.
  // The original problem's logic iterates through all intermediate `dpTable[i]` rows (from `0` to `N-1`).
  // This means it considers the maximum value achievable using items from `i` to `N-1` that fits.
  for (let currentTableIndex = 0; currentTableIndex < numAvailableItems; ++currentTableIndex) {
    // Iterate through all possible values for the current `dpTable` row.
    for (let possibleValue = 0; possibleValue <= maxPossibleTotalValue; ++possibleValue) {
      // If the minimum weight required for `possibleValue` is within the knapsack's capacity.
      if (dpTable[currentTableIndex][possibleValue] <= maxKnapsackWeightLimit) {
        // Update the maximum value found so far.
        finalAchievedValue = Math.max(possibleValue, finalAchievedValue);
      }
    }
  }

  return finalAchievedValue; // Return the computed maximum value.
}