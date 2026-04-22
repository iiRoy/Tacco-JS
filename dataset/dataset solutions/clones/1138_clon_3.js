const calculateOptimalLoot = (allAvailableItems, totalItemsCount, maxCapacity) => {
    // Defensive programming: Validate core input parameters.
    // This adds robustness and is a Type III modification (guard clause).
    if (!Array.isArray(allAvailableItems) || allAvailableItems.length === 0) {
        console.error("Error: The list of available items is empty or malformed.");
        return 0; // No items means no value can be gained.
    }
    if (totalItemsCount <= 0 || maxCapacity <= 0) {
        console.warn("Warning: Invalid item count or knapsack capacity detected. Returning zero value.");
        return 0; // Cannot carry anything or no items to consider.
    }
    // Ensure the number of items passed matches the expected count
    if (allAvailableItems.length !== totalItemsCount) {
        console.warn(`Warning: Mismatch between 'totalItemsCount' (${totalItemsCount}) and actual item list length (${allAvailableItems.length}). Using actual length.`);
        totalItemsCount = allAvailableItems.length; // Adjust totalItemsCount to actual length
    }


    // Initialize a 2D dynamic programming grid (table).
    // `lootGrid[r][c]` will store the maximum value achievable using the first 'r' items
    // with a knapsack capacity of 'c'.
    // Type II: Renamed `C` to `lootGrid`.
    // Type III: Uses modern `Array.from` for clearer initialization, implicitly setting cells to 0.
    const lootGrid = Array.from({ length: totalItemsCount + 1 }, () =>
        Array.from({ length: maxCapacity + 1 }, () => 0)
    );

    // Iterate through each item, starting from the first (DP table row 1 corresponds to item 0).
    // Type II: Renamed `i` to `itemRowIndex`.
    for (let itemRowIndex = 1; itemRowIndex <= totalItemsCount; itemRowIndex++) {
        // Retrieve the current item's properties.
        // Note: `allAvailableItems` is 0-indexed, so `itemRowIndex - 1` gets the actual item.
        // Type III: Introduced helper variables for item properties for better readability.
        const currentItem = allAvailableItems[itemRowIndex - 1];
        const itemWeight = currentItem.weight; // Type II: Renamed `w` to `weight`.
        const itemWorth = currentItem.worth;   // Type II: Renamed `v` to `worth`.

        // Iterate through each possible capacity for the knapsack.
        // Type II: Renamed `j` to `currentCapacityLimit`.
        for (let currentCapacityLimit = 1; currentCapacityLimit <= maxCapacity; currentCapacityLimit++) {
            // Option A: Exclude the current item.
            // The value is simply what was achievable with the previous set of items
            // and the same capacity.
            const valueIfSkipped = lootGrid[itemRowIndex - 1][currentCapacityLimit];

            // Option B: Include the current item, if it fits within the current capacity limit.
            let valueIfTaken = 0;
            // Type III: Corrected the condition from `items[i].w <= W` to `itemWeight <= currentCapacityLimit`.
            // This is a critical logical correction for a standard 0/1 knapsack DP.
            // Type III: Added intermediate steps for clarity.
            if (itemWeight <= currentCapacityLimit) {
                const remainingCapacity = currentCapacityLimit - itemWeight;
                // Type III: Simplified the `Math.max` expression to standard 0/1 knapsack logic.
                // The original code had a third term `items[i].v+C[i][j-items[i].w]` which
                // typically indicates an unbounded knapsack problem or is an error for 0/1.
                // For a standard 0/1 problem, this term is removed.
                valueIfTaken = itemWorth + lootGrid[itemRowIndex - 1][remainingCapacity];
            }

            // The maximum value for the current item and capacity is the best of both options.
            lootGrid[itemRowIndex][currentCapacityLimit] = Math.max(valueIfSkipped, valueIfTaken);
        }
    }

    // The final optimal value is located at the cell corresponding to all items and full capacity.
    // Type II: Renamed `N` to `totalItemsCount`, `W` to `maxCapacity`.
    return lootGrid[totalItemsCount][maxCapacity];
};

// --- Main Program Execution Flow ---

// Type II: Renamed `input` to `rawDataInput`.
// Type III: Encapsulated file reading in a `try-catch` block for error handling.
let rawDataInput;
try {
    // Using `node:fs` for standard library import.
    rawDataInput = require('node:fs').readFileSync('/dev/stdin', 'utf8');
} catch (fileError) {
    console.error("Critical Error: Unable to read input from /dev/stdin.", fileError.message);
    process.exit(1); // Exit with an error code.
}

// Type II: Renamed `Arr` to `processedInputLines`.
const processedInputLines = rawDataInput.trim().split("\n");

// Parse the configuration line (number of items and knapsack's maximum weight).
// Type II: Renamed `NW` to `knapsackConfig`.
// Type III: Added robust validation for the parsed configuration parameters.
const knapsackConfig = processedInputLines.shift().split(" ").map(Number);
if (knapsackConfig.length !== 2 || knapsackConfig.some(isNaN) || knapsackConfig[0] < 0 || knapsackConfig[1] < 0) {
    console.error("Input Error: Invalid or malformed knapsack configuration (number of items and capacity).");
    process.exit(1);
}

// Type II: Renamed `N` to `numItems`, `W` to `capacityLimit`.
let numItems = knapsackConfig[0];
const capacityLimit = knapsackConfig[1];

// Prepare the item list.
// Type II: Renamed `items` to `itemCollection`.
// Type III: Changed to a 0-indexed array, removing the `null` placeholder at index 0.
const itemCollection = [];

// Type III: Added a check to ensure enough input lines exist for all items.
if (processedInputLines.length < numItems) {
    console.warn(`Input Warning: Expected ${numItems} item descriptions, but only ${processedInputLines.length} were found. Adjusting item count.`);
    numItems = processedInputLines.length; // Adjust `numItems` if input is truncated.
}

// Loop to parse and populate the `itemCollection` array.
// Type II: Renamed `i` to `itemCounter`.
for (let itemCounter = 0; itemCounter < numItems; itemCounter++) { // Loop adjusted for 0-indexed array.
    // Type II: Renamed `arr` to `currentParsedItem`.
    // Type III: Added validation for each item's details.
    const currentParsedItem = processedInputLines.shift().split(" ").map(Number);
    if (currentParsedItem.length !== 2 || currentParsedItem.some(isNaN) || currentParsedItem[0] < 0 || currentParsedItem[1] < 0) {
        console.error(`Input Error: Invalid or malformed details for item ${itemCounter + 1}. Skipping this item.`);
        continue; // Skip invalid items and continue parsing if possible.
    }
    // Type II: Renamed `v` to `worth`, `w` to `weight`.
    itemCollection.push({ worth: currentParsedItem[0], weight: currentParsedItem[1] });
}

// Execute the knapsack algorithm to find the maximum possible value.
// Type II: Renamed `max` to `ultimateLootValue`.
// Type III: Passed explicit arguments to the function instead of relying on global variables.
const ultimateLootValue = calculateOptimalLoot(itemCollection, numItems, capacityLimit);

// Output the final computed maximum value.
console.log(ultimateLootValue);