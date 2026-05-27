function calculateMaxVal() {
    // Initialize a 2D array to store maximum values for subproblems.
    // This table will hold C[item_index][current_weight_capacity].
    let valueTable = [];

    // Allocate memory for rows based on the number of items.
    for (let itemIdx = 0; itemIdx <= numItems; itemIdx++) {
        valueTable[itemIdx] = [];
    }

    // Initialize the first row (representing 0 items) with zeros.
    // If there are no items, the maximum value is always 0, regardless of capacity.
    for (let currentWeight = 0; currentWeight <= maxWeight; currentWeight++) {
        valueTable[0][currentWeight] = 0;
    }

    // Initialize the first column (representing 0 weight capacity) with zeros.
    // If the knapsack has no capacity, the maximum value is always 0, regardless of items.
    for (let itemIdx = 0; itemIdx <= numItems; itemIdx++) {
        valueTable[itemIdx][0] = 0;
    }

    // Iterate through each item and each possible weight capacity to fill the DP table.
    for (let itemIdx = 1; itemIdx <= numItems; itemIdx++) {
        for (let currentWeight = 1; currentWeight <= maxWeight; currentWeight++) {
            // The original code checks if the item's weight is less than or equal to the total knapsack capacity (maxWeight).
            // This condition, combined with JavaScript's NaN behavior for negative array indices,
            // effectively handles cases where itemData[itemIdx].weight > currentWeight.
            if (itemData[itemIdx].weight <= maxWeight) {
                // Calculate the value if the current item is included.
                // This involves adding the current item's value to the maximum value
                // obtained from previous items with the remaining capacity.
                // If (currentWeight - itemData[itemIdx].weight) is negative,
                // valueTable[itemIdx - 1][negative_index] will be undefined,
                // leading to valueIncludingCurrent becoming NaN.
                let valueIncludingCurrent = itemData[itemIdx].val + valueTable[itemIdx - 1][currentWeight - itemData[itemIdx].weight];

                // Calculate the value if the current item is excluded.
                // This is simply the maximum value obtained from previous items with the same capacity.
                let valueExcludingCurrent = valueTable[itemIdx - 1][currentWeight];

                // Compare the two options. If valueIncludingCurrent is NaN, the comparison
                // `NaN > valueExcludingCurrent` will be false, correctly leading to the else branch.
                if (valueIncludingCurrent > valueExcludingCurrent) {
                    valueTable[itemIdx][currentWeight] = valueIncludingCurrent;
                } else {
                    valueTable[itemIdx][currentWeight] = valueExcludingCurrent;
                }
            } else {
                // If the current item's weight is greater than the total knapsack capacity,
                // it can never be included. So, the value remains the same as without this item.
                valueTable[itemIdx][currentWeight] = valueTable[itemIdx - 1][currentWeight];
            }
        }
    }
    // The final result is the maximum value that can be obtained with all items and the total capacity.
    return valueTable[numItems][maxWeight];
}

// Read all input data from standard input.
let rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Trim whitespace from the input and split it into an array of lines.
let lineArray = (rawData.trim()).split("\n");

// The first line contains the number of items (N) and the maximum weight capacity (W).
// Extract these values and convert them to numbers.
let itemWeightLimits = (lineArray.shift()).split(" ").map(Number);
let numItems = itemWeightLimits[0]; // N
let maxWeight = itemWeightLimits[1]; // W

// Initialize an array to store item objects.
// We use `null` at index 0 to allow for 1-based indexing, matching the DP table.
let itemData = [null];

// Process the remaining lines to populate the itemData array.
// Each line represents an item with its value and weight.
for (let itemIdx = 1; itemIdx <= numItems; itemIdx++) {
    let itemProps = (lineArray.shift()).split(" ").map(Number);
    itemData[itemIdx] = { val: itemProps[0], weight: itemProps[1] };
}

// Call the dynamic programming function to compute the maximum possible value.
let finalMaxVal = calculateMaxVal();

// Print the calculated maximum value to the console.
console.log(finalMaxVal);
