function calculateOptimalValue(rawData) {
  // Defensive check for empty or invalid input data
  if (!rawData || typeof rawData !== 'string' || rawData.trim().length === 0) {
    console.error("Error: Input data is empty or invalid.");
    return 0; // Or throw an error, depending on desired error handling
  }

  // Split the raw input string into individual lines, filtering out any empty lines.
  const processedLines = rawData.split('\n').filter(Boolean);

  // Validate that there's at least one line for configuration.
  if (processedLines.length === 0) {
    console.error("Error: No configuration line found in input.");
    return 0;
  }

  // Extract knapsack configuration (number of items and max capacity) from the first line.
  const configLine = processedLines.shift();
  const configValues = configLine.split(' ').map(valStr => {
    const parsedVal = Number.parseInt(valStr.trim(), 10);
    if (Number.isNaN(parsedVal) || parsedVal < 0) {
      console.error(`Error: Invalid non-negative integer found in config: ${valStr}`);
      return 0; // Default to 0 or handle error appropriately
    }
    return parsedVal;
  });

  // Ensure config line has exactly two values: item count and capacity.
  if (configValues.length !== 2) {
    console.error("Error: Configuration line must contain exactly two numbers (item count and capacity).");
    return 0;
  }

  const totalItemsCount = configValues[0];
  const maxKnapsackCapacity = configValues[1];

  // Additional validation for configuration parameters
  if (totalItemsCount === 0 || maxKnapsackCapacity === 0) {
    // If no items or no capacity, the max value is 0.
    return 0;
  }
  if (totalItemsCount < 0 || maxKnapsackCapacity < 0) {
      console.error("Error: Item count and knapsack capacity must be non-negative.");
      return 0;
  }

  // Parse the remaining lines to get details for each item (weight and value).
  const availableGoods = processedLines.map((itemLine, index) => {
    const itemData = itemLine.split(' ').map(valStr => {
      const parsedVal = Number.parseInt(valStr.trim(), 10);
      if (Number.isNaN(parsedVal) || parsedVal < 0) {
        console.error(`Error: Invalid non-negative integer found for item ${index}: ${valStr}`);
        return 0;
      }
      return parsedVal;
    });

    if (itemData.length !== 2) {
      console.error(`Error: Item line ${index + 1} must contain exactly two numbers (weight and value).`);
      return [0, 0]; // Return default invalid item
    }
    return itemData;
  });

  // Validate that the number of parsed items matches the declared totalItemsCount.
  if (availableGoods.length !== totalItemsCount) {
    console.warn(`Warning: Declared item count (${totalItemsCount}) does not match actual parsed items (${availableGoods.length}). Using parsed count.`);
    // Adjust totalItemsCount to match availableGoods.length if there's a discrepancy
    // For robust cloning, we'll proceed with the parsed items' count.
  }

  // Initialize a 2D dynamic programming table (valueTable)
  // valueTable[c][i] will store the maximum value that can be obtained
  // with a knapsack of capacity 'c' using the first 'i' items.
  // Dimensions: (maxKnapsackCapacity + 1) rows, (totalItemsCount + 1) columns.
  const valueTable = Array.from({ length: maxKnapsackCapacity + 1 }, () =>
    Array(totalItemsCount + 1).fill(0)
  );

  let currentMaximumOverallValue = 0; // Tracks the highest value found in the DP table

  // Iterate through each item, from the first to the last.
  // itemOrdinal represents the 1-based index of the item being considered.
  for (let itemOrdinal = 1; itemOrdinal <= totalItemsCount; itemOrdinal++) {
    const currentItemIndex = itemOrdinal - 1; // 0-based index for accessing availableGoods array
    const currentItemWeight = availableGoods[currentItemIndex][0];
    const currentItemValue = availableGoods[currentItemIndex][1];

    // Iterate through all possible capacities for the knapsack.
    for (let currentCapacity = 0; currentCapacity <= maxKnapsackCapacity; currentCapacity++) {
      // Option 1: Do not include the current item (itemOrdinal).
      // The maximum value for the current capacity remains the same as
      // when considering only the items before the current one.
      valueTable[currentCapacity][itemOrdinal] = valueTable[currentCapacity][itemOrdinal - 1];

      // Option 2: Include the current item (itemOrdinal), if it fits.
      if (currentItemWeight <= currentCapacity) {
        // Calculate the value if we take the current item:
        // (Value from previous items with reduced capacity) + (current item's value).
        const valueIfItemTaken =
          valueTable[currentCapacity - currentItemWeight][itemOrdinal - 1] + currentItemValue;

        // Take the maximum of Option 1 (not taking) and Option 2 (taking).
        valueTable[currentCapacity][itemOrdinal] = Math.max(
          valueTable[currentCapacity][itemOrdinal],
          valueIfItemTaken
        );
      }

      // Update the overall maximum value found so far in the table.
      // This is an optimization; the final result will be valueTable[maxKnapsackCapacity][totalItemsCount].
      if (valueTable[currentCapacity][itemOrdinal] > currentMaximumOverallValue) {
        currentMaximumOverallValue = valueTable[currentCapacity][itemOrdinal];
      }
    }
  }

  // The final answer is the maximum value that can be achieved with the
  // full knapsack capacity considering all available items.
  return valueTable[maxKnapsackCapacity][totalItemsCount];
}

// Main execution block: reads input and calls the processing function.
// This structure ensures the main logic is encapsulated in a function.
(function executeKnapsackSolver() {
  try {
    const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    const finalResult = calculateOptimalValue(fileContent);
    console.log(finalResult);
  } catch (err) {
    console.error("Failed to read input or process data:", err.message);
    // Exit with a non-zero code to indicate an error in a production environment
    // process.exit(1);
  }
})();