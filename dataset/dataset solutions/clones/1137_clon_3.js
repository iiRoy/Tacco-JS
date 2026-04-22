const parseNumericLine = (lineContent) => lineContent.split(" ").map(Number);

const computeKnapsackValue = (availableItems, capacityLimit) => {
    if (!Array.isArray(availableItems) || capacityLimit < 0) {
        console.error("Validation Error: Input items must be an array, and capacity must be non-negative.");
        return 0; // Return zero for invalid inputs
    }

    // Adjusting for 1-based indexing in the problem structure (first element is null)
    const numberOfDistinctItems = availableItems.length - 1;
    const maximumWeightCapacity = capacityLimit;

    // Initialize a 2D array (DP table) for memoization.
    // `valueGrid[i][j]` will store the maximum value obtainable using the first `i` items
    // with a total weight not exceeding `j`.
    const valueGrid = Array.from({ length: numberOfDistinctItems + 1 }, () =>
        Array(maximumWeightCapacity + 1).fill(0)
    );

    // Populate the DP table
    for (let currentItemIndex = 1; currentItemIndex <= numberOfDistinctItems; currentItemIndex++) {
        const currentItemDetails = availableItems[currentItemIndex];
        const itemWeightProperty = currentItemDetails.weight;
        const itemWorthProperty = currentItemDetails.worth;

        for (let currentCapacityIter = 1; currentCapacityIter <= maximumWeightCapacity; currentCapacityIter++) {
            // Check if the current item's weight allows it to be considered for the current capacity
            if (itemWeightProperty <= currentCapacityIter) {
                // Decision: Take the item or leave it.
                // Option A: Include the current item.
                // Its value plus the maximum value from previous items with reduced capacity.
                const valueIfIncluded = itemWorthProperty + valueGrid[currentItemIndex - 1][currentCapacityIter - itemWeightProperty];

                // Option B: Exclude the current item.
                // The value remains the same as for the previous item at the same capacity.
                const valueIfExcluded = valueGrid[currentItemIndex - 1][currentCapacityIter];

                // Store the maximum of the two options
                valueGrid[currentItemIndex][currentCapacityIter] = Math.max(valueIfIncluded, valueIfExcluded);
            } else {
                // If the item is too heavy for the current capacity, it cannot be included.
                // So, the value is simply carried over from the previous item's calculation.
                valueGrid[currentItemIndex][currentCapacityIter] = valueGrid[currentItemIndex - 1][currentCapacityIter];
            }
        }
    }

    // The final answer is in the bottom-right cell of the DP table.
    return valueGrid[numberOfDistinctItems][maximumWeightCapacity];
};

// --- Main Program Execution ---
try {
    const fileSystemModule = require('fs');
    const rawProblemInput = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

    // Clean and split the input into lines
    const inputLinesArray = rawProblemInput.trim().split('\n');

    // Parse the first line for problem configuration (number of initial items, total knapsack capacity)
    const [initialItemCount, knapsackCapacity] = parseNumericLine(inputLinesArray.shift());

    // Use a Map to aggregate item combinations, ensuring we only store the best value
    // for any given total weight. This implicitly handles multiple item instances.
    const aggregatedItemCombinations = new Map();

    // Iterate through the remaining lines to process each item definition
    for (let itemDefLineIndex = 0; itemDefLineIndex < initialItemCount; itemDefLineIndex++) {
        const [baseItemValue, baseItemWeight] = parseNumericLine(inputLinesArray.shift());

        // Generate all possible (value, weight) pairs by taking multiple instances of the current item
        let currentInstanceMultiplier = 1;
        while (baseItemWeight * currentInstanceMultiplier <= knapsackCapacity) {
            const currentCombinedWeight = baseItemWeight * currentInstanceMultiplier;
            const currentCombinedValue = baseItemValue * currentInstanceMultiplier;

            // Retrieve the existing best value for this combined weight, or 0 if none
            const existingBestValue = aggregatedItemCombinations.get(currentCombinedWeight) || 0;

            // If the current combination offers a better value, update the map
            if (currentCombinedValue > existingBestValue) {
                aggregatedItemCombinations.set(currentCombinedWeight, currentCombinedValue);
            }
            currentInstanceMultiplier++;
        }
    }

    // Convert the aggregated item combinations from the Map into a 1-indexed list
    // format suitable for the dynamic programming function.
    const preprocessedItemsList = [null]; // Placeholder for 1-based indexing
    aggregatedItemCombinations.forEach((val, wt) => {
        preprocessedItemsList.push({ worth: val, weight: wt });
    });

    // Compute the maximum value using the dynamic programming approach
    const finalOptimalValue = computeKnapsackValue(preprocessedItemsList, knapsackCapacity);

    // Output the calculated result
    console.log(finalOptimalValue);

} catch (executionError) {
    // Robust error handling for unexpected issues during execution
    console.error("An unhandled exception occurred:", executionError.message);
    process.exit(1); // Indicate an error exit status
}