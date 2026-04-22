/**
 * Calculates the maximum total value of items that can be placed into a knapsack
 * with a given capacity, using a specific dynamic programming approach.
 * This implementation considers a variant where for each item,
 * the maximum possible instances that fit into the current capacity are taken
 * and combined with the optimal value from *previous* items for the remaining capacity.
 *
 * @param {number} itemCount - The total number of distinct items available.
 * @param {number} maxCapacity - The maximum weight capacity of the knapsack.
 * @param {Array<Object>} allAvailableItems - An array of item objects, where each object has
 *                                         'itemValue' (v) and 'itemWeight' (w) properties.
 *                                         Assumed to be 0-indexed.
 * @returns {number} The maximum achievable value.
 */
const calculateMaxWorth = (itemCount, maxCapacity, allAvailableItems) => {
    // Basic validation for input parameters
    if (itemCount <= 0 || maxCapacity <= 0 || !Array.isArray(allAvailableItems) || allAvailableItems.length !== itemCount) {
        // For simplicity, returning 0 or throwing an error on invalid input.
        // A more robust system might throw specific errors.
        console.error("Invalid input parameters for knapsack calculation.");
        return 0;
    }

    // Initialize a 2D dynamic programming table (matrix) to store optimal values.
    // dpTable[i][j] will store the maximum value for the first 'i' items
    // with a knapsack capacity of 'j'.
    // All cells are initialized to 0, representing no value.
    const dpTable = Array.from({ length: itemCount + 1 }, () => Array(maxCapacity + 1).fill(0));

    // Iterate through each item, starting from the first item (index 1 in DP table).
    for (let currentItemIdx = 1; currentItemIdx <= itemCount; currentItemIdx++) {
        // Retrieve the current item's details.
        // Note: allAvailableItems is 0-indexed, so we access currentItemIdx - 1.
        const currentItem = allAvailableItems[currentItemIdx - 1];
        const { itemValue, itemWeight } = currentItem;

        // Iterate through each possible capacity, from 1 up to the maximum knapsack capacity.
        for (let currentCapacity = 1; currentCapacity <= maxCapacity; currentCapacity++) {
            // Option 1: Do not include the current item.
            // The optimal value is simply the value obtained with the previous items
            // at the same capacity.
            let valueWithoutCurrentItem = dpTable[currentItemIdx - 1][currentCapacity];

            // Option 2: Consider including the current item.
            // This variant takes the maximum possible instances of the current item that fit
            // into the 'currentCapacity', and adds the value from previous items.
            if (itemWeight <= currentCapacity) {
                // Calculate how many instances of the current item can fit entirely.
                const numInstancesThatFit = Math.floor(currentCapacity / itemWeight);

                // Calculate the total weight and value for these instances.
                const totalWeightOfInstances = numInstancesThatFit * itemWeight;
                const totalValueOfInstances = numInstancesThatFit * itemValue;

                // Calculate the value if these instances are taken:
                // Value from current instances + optimal value from previous items
                // for the remaining capacity.
                const valueWithInstances = totalValueOfInstances + dpTable[currentItemIdx - 1][currentCapacity - totalWeightOfInstances];

                // Update the current cell with the maximum of the two options.
                dpTable[currentItemIdx][currentCapacity] = Math.max(valueWithoutCurrentItem, valueWithInstances);
            } else {
                // If the current item's weight is greater than the current capacity,
                // it cannot be included. So, the value is the same as without it.
                dpTable[currentItemIdx][currentCapacity] = valueWithoutCurrentItem;
            }
        }
    }

    // The final result is the maximum value for all items and the full knapsack capacity.
    return dpTable[itemCount][maxCapacity];
};

// --- Main Program Execution ---

// Set up standard input reading
const standardInput = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process raw input data
const inputLines = standardInput.trim().split('\n');

// Parse configuration parameters (number of items and knapsack capacity)
const configParams = inputLines.shift().split(' ').map(Number);
const numGoods = configParams[0];
const capacityLimit = configParams[1];

// Add a guard clause for invalid N or W
if (isNaN(numGoods) || isNaN(capacityLimit) || numGoods < 0 || capacityLimit < 0) {
    console.error("Error: Invalid number of goods or knapsack capacity provided.");
    process.exit(1); // Exit with an error code
}

// Prepare the list of available items.
// Using 0-indexed array for more idiomatic JavaScript.
const availableItems = [];
for (let goodsCounter = 0; goodsCounter < numGoods; goodsCounter++) {
    const itemData = inputLines.shift().split(' ').map(Number);
    const valueComponent = itemData[0];
    const weightComponent = itemData[1];

    // Basic validation for item data
    if (isNaN(valueComponent) || isNaN(weightComponent) || valueComponent < 0 || weightComponent < 0) {
        console.error(`Error: Invalid item data at line ${goodsCounter + 2}. Skipping item.`);
        continue; // Skip this item and continue with the next
    }

    availableItems.push({ itemValue: valueComponent, itemWeight: weightComponent });
}

// Calculate the final optimal value using the knapsack function
const finalOptimalValue = calculateMaxWorth(numGoods, capacityLimit, availableItems);

// Display the computed result
console.log(`The maximum value that can be obtained is: ${finalOptimalValue}`);