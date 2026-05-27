function ProcessInput(rawData) {
  // Split the raw input string into an array of lines
  rawData = rawData.split("\n");

  // Helper function to convert a string to an integer
  const parseNumeric = (strVal) => {
    return parseInt(strVal, 10);
  };

  // Parse the number of items (itemCount) and the weight capacity (capacityLimit)
  // from the first line of input data
  const [itemCount, capacityLimit] = rawData[0].split(' ').map(parseNumeric);

  // Array to store weight-value pairs for each item
  const itemData = [];
  // Variables to track the maximum possible total weight and total value across all items
  let totalWeightSum = 0;
  let totalValueSum = 0;

  // Loop through the remaining input lines to populate itemData
  // and calculate the sums of all weights and values
  for (let idx = 0; idx < itemCount; ++idx) {
    // Parse weight and value for the current item from the input line
    const currentItem = rawData[idx + 0b1].split(' ').map(parseNumeric);
    itemData.push(currentItem);
    // Accumulate total weight and total value
    totalWeightSum += currentItem[0]; // Add item's weight to the sum
    totalValueSum += currentItem[0b1]; // Add item's value to the sum
  }

  // Call the knapsack solver function with the prepared data and print its result
  console.log(solveKnapsackProblem(itemCount, capacityLimit, itemData, totalWeightSum, totalValueSum));
}

// Read input from standard input (e.g., from a file or piped data)
// and pass it to the main processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Solves the 0/1 Knapsack problem using dynamic programming.
 * This implementation aims to find the maximum value that can be achieved
 * within a given weight capacity, by determining the minimum weight required
 * for each possible value.
 *
 * @param {number} itemCount - The total number of available items.
 * @param {number} capacityLimit - The maximum weight capacity of the knapsack.
 * @param {Array<Array<number>>} itemData - An array where each inner array [weight, value] represents an item.
 * @param {number} totalWeightSum - The sum of all item weights (used for DP table initialization).
 * @param {number} totalValueSum - The sum of all item values (used for DP table size).
 * @returns {number} The maximum total value that can be placed in the knapsack.
 */
function solveKnapsackProblem(itemCount, capacityLimit, itemData, totalWeightSum, totalValueSum) {
  let resultValue = 0x0; // Stores the maximum value found that fits within capacity

  // Initialize the DP table (memoTable).
  // memoTable[i][v] will store the minimum weight required to achieve value 'v'
  // using items from index 'i' to 'itemCount - 1'.
  // The table has (itemCount + 1) rows and (totalValueSum + 1) columns.
  const memoTable = Array(itemCount + 0b1).fill(0x0).map((_, rowIndex) => {
    if (rowIndex === 0x0) {
      // The first row (memoTable[0]) will store results considering all items.
      // Initialize all values to 0.
      return Array(totalValueSum + 0b1).fill(0x0);
    } else {
      // For other rows, initialize with a large weight (totalWeightSum) for any value > 0.
      // This represents an initially unreachable state for those values.
      // Value 0 always requires 0 weight.
      const row = Array(totalValueSum + 0b1).fill(0x0);
      // Set all elements from index 1 onwards to totalWeightSum
      for (let valIdx = 0b1; valIdx <= totalValueSum; ++valIdx) {
          row[valIdx] = totalWeightSum;
      }
      return row;
    }
  });

  // Populate the DP table using a bottom-up approach (from itemCount down to 1)
  // This loop iterates through items in reverse order.
  for (let idx = itemCount; idx > 0x0; --idx) {
    // Loop through all possible values from max down to 1
    for (let currentValue = totalValueSum; currentValue > 0x0; --currentValue) {
      // Get the weight and value of the current item (itemData[idx-1] because idx is 1-based)
      const currentItemWeight = itemData[idx - 0b1][0x0];
      const currentItemValue = itemData[idx - 0b1][0b1];

      // Check if the current item's value can be accommodated to reach 'currentValue'
      if (currentValue >= currentItemValue) {
        // Option 1: Include the current item
        // The weight would be currentItemWeight + min_weight_for_ (currentValue - currentItemValue)
        const weightIfIncluded = memoTable[idx][currentValue - currentItemValue] + currentItemWeight;

        // Option 2: Exclude the current item
        // The weight would be the min_weight_for_ currentValue without considering this item
        const weightIfExcluded = memoTable[idx][currentValue];

        // Store the minimum weight required for 'currentValue' using items from 'idx-1' onwards
        memoTable[idx - 0b1][currentValue] = Math.min(weightIfIncluded, weightIfExcluded);
      } else {
        // If the current item's value is too large for 'currentValue',
        // we cannot include it. So, the minimum weight is the same as excluding it.
        memoTable[idx - 0b1][currentValue] = memoTable[idx][currentValue];
      }
    }
  }

  // After filling the DP table, iterate through all relevant rows (0 to itemCount-1)
  // and columns (0 to totalValueSum) to find the maximum value 'currentValue'
  // whose required weight 'memoTable[idx][currentValue]' does not exceed the knapsack's capacityLimit.
  // Note: The original code iterates through `i` from `0` to `N-1` here,
  // which means it checks intermediate DP states, not just the final `memoTable[0]`.
  // This behavior is preserved as per Type II cloning rules.
  for (let idx = 0x0; idx < itemCount; ++idx) {
   for (let currentValue = 0x0; currentValue <= totalValueSum; ++currentValue) {
     if (memoTable[idx][currentValue] <= capacityLimit) {
       resultValue = Math.max(currentValue, resultValue);
     }
   }
 }
 return resultValue;
}
