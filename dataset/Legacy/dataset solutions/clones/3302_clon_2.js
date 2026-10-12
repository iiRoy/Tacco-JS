"use strict";

// This function processes the input string to solve a variation of the knapsack problem.
const processInput = (inputString) => {
    // Normalize and split the input into individual lines.
    const inputLines = inputString.trim().split("\n");

    // Extract the total number of items and the maximum allowable weight from the first line.
    const [numItemsStr, capacityLimitStr] = inputLines[0].split(" ");
    const numItems = parseInt(numItemsStr, 10);
    const capacityLimit = parseInt(capacityLimitStr, 10);

    // Parse the weight and value for each item from the subsequent lines.
    // Each entry in 'itemDetails' will be an array: [itemWeight, itemValue].
    const itemDetails = inputLines.slice(1, numItems + 1).map(lineContent =>
        lineContent.split(" ").map(numericString => parseInt(numericString, 10))
    );

    // Initialize a 2D array, which serves as our dynamic programming table.
    // `valueTable[i][j]` will store the maximum value obtainable using the first 'i' items
    // with a total weight not exceeding 'j'.
    let valueTable = Array.from({ length: numItems + 1 }, () =>
        Array.from({ length: capacityLimit + 1 }).fill(0)
    );

    // A variable to keep track of the highest value found across all states.
    let overallMaximumValue = 0;

    // Iterate through each item, starting from the first (index 1 in our 1-based DP table).
    for (let currentItemIndex = 1; currentItemIndex <= numItems; currentItemIndex++) {
        // Retrieve the weight and value of the item currently being considered.
        // Note: 'itemDetails' is 0-indexed, so we use `currentItemIndex - 1`.
        const currentItemWeight = itemDetails[currentItemIndex - 1][0];
        const currentItemValue = itemDetails[currentItemIndex - 1][1];

        // Iterate through all possible weight capacities, from zero up to the maximum limit.
        for (let currentWeightCapacity = 0; currentWeightCapacity <= capacityLimit; currentWeightCapacity++) {
            // If the current item's weight is greater than the current capacity,
            // this item cannot be included. The maximum value for this state
            // is therefore the same as the maximum value without considering this item.
            if (currentItemWeight > currentWeightCapacity) {
                valueTable[currentItemIndex][currentWeightCapacity] = valueTable[currentItemIndex - 1][currentWeightCapacity];
            } else {
                // If the item can be included, we have two options:
                // 1. Exclude the current item: The value is `valueTable[currentItemIndex - 1][currentWeightCapacity]`.
                // 2. Include the current item: The value is `currentItemValue` plus the maximum value
                //    that could be obtained from previous items with the remaining capacity
                //    (`valueTable[currentItemIndex - 1][currentWeightCapacity - currentItemWeight]`).
                // We choose the option that yields the higher value.
                valueTable[currentItemIndex][currentWeightCapacity] = Math.max(
                    valueTable[currentItemIndex - 1][currentWeightCapacity],
                    currentItemValue + valueTable[currentItemIndex - 1][currentWeightCapacity - currentItemWeight]
                );
            }

            // After calculating the value for the current state, check if it's a new overall maximum.
            if (valueTable[currentItemIndex][currentWeightCapacity] > overallMaximumValue) {
                overallMaximumValue = valueTable[currentItemIndex][currentWeightCapacity];
            }
        }
    }

    // Print the final calculated maximum value to the console.
    console.log(overallMaximumValue);
};

// Read the entire input from standard input (usually a file or piped data)
// and then pass it to our processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
