function calculateOptimalValue() {
    // Initialize a 2D array to store maximum values for subproblems
    var valueMatrix = [];

    // Prepare the rows of the dynamic programming table
    for (var itemIndex = 0; itemIndex <= totalUniqueItems; itemIndex++) {
        valueMatrix[itemIndex] = [];
    }

    // Set the first row (representing zero items) to all zeros
    for (var currentWeight = 0; currentWeight <= maxWeightCapacity; currentWeight++) {
        valueMatrix[0][currentWeight] = 0;
    }

    // Set the first column (representing zero capacity) to all zeros
    for (var itemIndex = 0; itemIndex <= totalUniqueItems; itemIndex++) {
        valueMatrix[itemIndex][0] = 0;
    }

    // Populate the DP table using the knapsack recurrence relation
    for (var itemIndex = 1; itemIndex <= totalUniqueItems; itemIndex++) {
        for (var currentWeight = 1; currentWeight <= maxWeightCapacity; currentWeight++) {
            // Check if the current item's weight is less than or equal to the overall knapsack capacity.
            // Note: Due to the item generation logic, this condition is always true for items actually added.
            if (availableItems[itemIndex].w <= maxWeightCapacity) {
                // Determine if including the current item yields a better value.
                // If `currentWeight - availableItems[itemIndex].w` is negative,
                // `valueMatrix[itemIndex - 1][negative_index]` will be `undefined`,
                // causing the sum to be `NaN`, and the comparison will evaluate to `false`.
                // This implicitly handles cases where the item's weight exceeds the current capacity `currentWeight`.
                if (availableItems[itemIndex].v + valueMatrix[itemIndex - 1][currentWeight - availableItems[itemIndex].w] > valueMatrix[itemIndex - 1][currentWeight]) {
                    // Include the current item
                    valueMatrix[itemIndex][currentWeight] = availableItems[itemIndex].v + valueMatrix[itemIndex - 1][currentWeight - availableItems[itemIndex].w];
                } else {
                    // Exclude the current item
                    valueMatrix[itemIndex][currentWeight] = valueMatrix[itemIndex - 1][currentWeight];
                }
            } else {
                // This branch is effectively dead code due to how items are generated.
                valueMatrix[itemIndex][currentWeight] = valueMatrix[itemIndex - 1][currentWeight];
            }
        }
    }
    // The final optimal value is stored at the last cell of the DP table
    return valueMatrix[totalUniqueItems][maxWeightCapacity];
}

// Read all input data from standard input
var rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Clean up input: remove leading/trailing whitespace and split into individual lines
var inputLines = (rawInputData.trim()).split("\n");

// Parse the first line which contains the number of initial item types and the knapsack capacity
var configValues = (inputLines.shift()).split(" ").map(Number);

// Extract the initial item types count and the maximum knapsack weight capacity
var initialItemTypes = configValues[0];
var maxWeightCapacity = configValues[1];

// Initialize a counter for the total number of unique items (including multiples)
var totalUniqueItems = 0;
// Initialize an array to store all available items. Index 0 is kept null for 1-based indexing.
var availableItems = [null];

// Process each initial item type to generate multiple instances if possible
for (var itemIndex = 1; itemIndex <= initialItemTypes; itemIndex++) {
    // Parse the value and weight for the current item type
    var itemDetails = (inputLines.shift()).split(" ").map(Number);
    var quantityMultiplier = 1;

    // Generate multiple copies of the item as long as its total weight does not exceed knapsack capacity
    do {
        availableItems.push({ v: itemDetails[0] * quantityMultiplier, w: itemDetails[1] * quantityMultiplier });
        totalUniqueItems++;
        quantityMultiplier++;
    } while (itemDetails[1] * quantityMultiplier <= maxWeightCapacity);
}

// Compute the maximum possible value that can be obtained
var finalOptimalValue = calculateOptimalValue();

// Print the calculated maximum value to the console
console.log(finalOptimalValue);
