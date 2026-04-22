const processInputData = (lineString) => {
    // Splits a space-separated string into an array of numbers.
    return lineString.split(' ').map(val => Number(val));
};

// Function to compute the maximum benefit for the 0/1 Knapsack problem
function determineMaxBenefit(totalItemsCount, maxCapacity, availableItemsList) {
    // Initialize a 2D array (DP table) to store the maximum value for each subproblem.
    // Rows represent items (from 0 to totalItemsCount), columns represent capacities (from 0 to maxCapacity).
    // All cells are initialized to 0, representing the base case where no items or no capacity yields no value.
    let benefitMatrix = [];
    for (let rowIdx = 0; rowIdx <= totalItemsCount; rowIdx++) {
        benefitMatrix.push(new Array(maxCapacity + 1).fill(0));
    }

    // Iterate through each item, starting from the first actual item (index 1).
    for (let currentItemIdx = 1; currentItemIdx <= totalItemsCount; currentItemIdx++) {
        // Retrieve the weight and value of the current item being considered.
        const currentItemWeight = availableItemsList[currentItemIdx].itemWeight;
        const currentItemValue = availableItemsList[currentItemIdx].itemValue;

        // Iterate through each possible weight limit for the knapsack, from 1 up to the maximum capacity.
        for (let currentWeightLimit = 1; currentWeightLimit <= maxCapacity; currentWeightLimit++) {
            // The benefit if the current item is NOT included is simply the benefit from the previous item
            // with the same weight limit.
            const benefitWithoutCurrent = benefitMatrix[currentItemIdx - 1][currentWeightLimit];

            // Check if the current item's weight allows it to be included within the current weight limit.
            if (currentItemWeight <= currentWeightLimit) {
                // If it can be included, calculate the benefit:
                // Value of current item + benefit from previous items with reduced capacity.
                const remainingCapacity = currentWeightLimit - currentItemWeight;
                const benefitWithCurrent = currentItemValue + benefitMatrix[currentItemIdx - 1][remainingCapacity];

                // Choose the maximum benefit between including the current item or not including it.
                benefitMatrix[currentItemIdx][currentWeightLimit] = Math.max(benefitWithCurrent, benefitWithoutCurrent);
            } else {
                // If the current item is too heavy for the current weight limit, it cannot be included.
                // The benefit is the same as not including it.
                benefitMatrix[currentItemIdx][currentWeightLimit] = benefitWithoutCurrent;
            }
        }
    }

    // The final result is stored in the bottom-right cell of the DP table.
    return benefitMatrix[totalItemsCount][maxCapacity];
}

// --- Main Program Execution ---

// Read raw input from standard input.
const rawInputBuffer = require('fs').readFileSync('/dev/stdin', 'utf8');

// Basic validation for empty input to prevent errors.
if (!rawInputBuffer || rawInputBuffer.trim() === '') {
    console.error('Error: No input data provided.');
    process.exit(1); // Exit with an error code.
}

// Split the input into individual lines and remove leading/trailing whitespace.
let inputLinesArray = rawInputBuffer.trim().split('\n');

// The first line contains the total number of items (N) and the knapsack capacity (W).
const configParameters = processInputData(inputLinesArray.shift());
const totalItemCount = configParameters[0]; // N
const knapsackCapacity = configParameters[1]; // W

// Prepare an array to store item objects.
// A dummy item at index 0 is added to align with 1-based indexing used in the DP algorithm.
let availableItemsList = [{ itemValue: 0, itemWeight: 0 }];

// Parse the remaining lines to populate the items list.
for (let itemCounter = 1; itemCounter <= totalItemCount; itemCounter++) {
    const itemDataPair = processInputData(inputLinesArray.shift());
    const itemValueProp = itemDataPair[0];
    const itemWeightProp = itemDataPair[1];

    // Add the item as an object with explicit properties.
    availableItemsList.push({ itemValue: itemValueProp, itemWeight: itemWeightProp });
}

// Calculate the optimal value using the knapsack function.
const finalMaximumBenefit = determineMaxBenefit(totalItemCount, knapsackCapacity, availableItemsList);

// Output the computed maximum benefit.
console.log(finalMaximumBenefit);