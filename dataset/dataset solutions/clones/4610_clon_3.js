const solveKnapsackProblem = (inputContent) => {
    if (!inputContent || inputContent.trim().length === 0) {
        console.error("Error: Provided input is empty or invalid.");
        return;
    }

    const cleanedInputLines = inputContent
        .trim()
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean);

    if (cleanedInputLines.length === 0) {
        console.error("Error: No actionable data found after cleaning input.");
        return;
    }

    const headerLineParts = cleanedInputLines[0].split(' ');
    if (headerLineParts.length < 2) {
        console.error("Error: First line must specify item count and knapsack capacity (e.g., 'N W').");
        return;
    }

    const declaredItemCount = Number(headerLineParts[0]);
    const maximumCapacity = Number(headerLineParts[1]);

    if (isNaN(declaredItemCount) || declaredItemCount < 0) {
        console.error(`Error: Invalid item count specified: ${headerLineParts[0]}`);
        return;
    }
    if (isNaN(maximumCapacity) || maximumCapacity < 0) {
        console.error(`Error: Invalid knapsack capacity specified: ${headerLineParts[1]}`);
        return;
    }

    if (cleanedInputLines.length < declaredItemCount + 1) {
        console.warn(`Warning: Expected ${declaredItemCount} item lines but found only ${cleanedInputLines.length - 1}.`);
        // We could adjust declaredItemCount here, but for strictness, we'll proceed with the declared count
        // and let subsequent loops handle potential undefined items.
    }

    const parsedItemDetails = cleanedInputLines
        .slice(1, declaredItemCount + 1)
        .map((itemDescriptionLine, index) => {
            const valueParts = itemDescriptionLine.split(' ');
            if (valueParts.length < 2) {
                console.error(`Error: Malformed item data on line ${index + 2}: "${itemDescriptionLine}"`);
                return null;
            }
            const itemWeight = Number(valueParts[0]);
            const itemValue = Number(valueParts[1]);

            if (isNaN(itemWeight) || isNaN(itemValue)) {
                console.error(`Error: Non-numeric data for item on line ${index + 2}: "${itemDescriptionLine}"`);
                return null;
            }
            return { weight: itemWeight, value: itemValue };
        })
        .filter(item => item !== null); // Remove any items that failed parsing

    // If the number of successfully parsed items differs from the declared count,
    // we might want to adjust declaredItemCount or issue a warning/error.
    const actualItemCount = parsedItemDetails.length;
    if (actualItemCount !== declaredItemCount) {
        console.warn(`Warning: Declared ${declaredItemCount} items, but successfully parsed ${actualItemCount}. Using ${actualItemCount} for calculations.`);
    }

    // Initialize the dynamic programming table for memoization.
    // Each cell dpTable[i][j] will store the maximum value achievable
    // with the first 'i' items and a knapsack capacity of 'j'.
    const dpTable = Array.from({ length: actualItemCount + 1 }, () => {
        return new Array(maximumCapacity + 1).fill(0);
    });

    // Iterate through each item, starting from the first (index 1 in 1-based indexing)
    for (let currentItemIdx = 1; currentItemIdx <= actualItemCount; currentItemIdx++) {
        const itemInfo = parsedItemDetails[currentItemIdx - 1]; // Get item details (0-based array access)

        if (!itemInfo) { // Should not happen if filter was effective, but defensive check
            console.error(`Internal error: Missing item data for index ${currentItemIdx - 1}.`);
            continue;
        }

        const currentItemWeight = itemInfo.weight;
        const currentItemValue = itemInfo.value;

        // Iterate through all possible knapsack capacities for the current item
        for (let currentKnapsackCapacity = 0; currentKnapsackCapacity <= maximumCapacity; currentKnapsackCapacity++) {
            // Case 1: The current item is too heavy to fit into the current knapsack capacity.
            if (currentItemWeight > currentKnapsackCapacity) {
                // In this scenario, we cannot include the current item.
                // The maximum value remains the same as the maximum value achievable
                // with the previous set of items and the same capacity.
                dpTable[currentItemIdx][currentKnapsackCapacity] = dpTable[currentItemIdx - 1][currentKnapsackCapacity];
            } else {
                // Case 2: The current item can potentially fit. We have two choices:

                // Option A: Do not include the current item.
                // The value is simply the maximum value achievable with the previous set of items
                // and the same current knapsack capacity.
                const valueIfSkippingCurrentItem = dpTable[currentItemIdx - 1][currentKnapsackCapacity];

                // Option B: Include the current item.
                // The value is the current item's value plus the maximum value achievable
                // with the previous set of items and the remaining capacity after adding this item.
                const remainingCapacity = currentKnapsackCapacity - currentItemWeight;
                const valueFromPreviousStateForRemainingCapacity = dpTable[currentItemIdx - 1][remainingCapacity];
                const valueIfTakingCurrentItem = currentItemValue + valueFromPreviousStateForRemainingCapacity;

                // We choose the option that yields the maximum value.
                dpTable[currentItemIdx][currentKnapsackCapacity] = Math.max(
                    valueIfSkippingCurrentItem,
                    valueIfTakingCurrentItem
                );
            }
        }
    }

    // The final result is the maximum value that can be obtained
    // using all items up to the full knapsack capacity.
    const overallOptimalValue = dpTable[actualItemCount][maximumCapacity];
    console.log(overallOptimalValue);
};

try {
    const rawInputPayload = require('fs').readFileSync('/dev/stdin', 'utf8');
    solveKnapsackProblem(rawInputPayload);
} catch (executionError) {
    console.error("An error occurred during program execution:", executionError.message);
}