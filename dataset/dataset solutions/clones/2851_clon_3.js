// This module processes input data to determine an optimized resource value.
function computeOptimalValue(rawInputString) {
    // Parse the incoming multi-line string into an array of individual lines.
    const lineSegments = rawInputString.split("\n");

    // Ensure we have enough lines for processing.
    if (lineSegments.length < 3) {
        console.error("Error: Insufficient input data provided. Expected at least 3 lines.");
        return; // Exit if input is malformed.
    }

    // Extract the initial resource amount from the first line.
    // This value represents the starting quantity or budget.
    const initialResourceAmount = parseInt(lineSegments[0], 10);

    // Validate the initial resource amount.
    if (isNaN(initialResourceAmount) || initialResourceAmount < 0) {
        console.error("Error: Initial resource amount is invalid or negative.");
        return;
    }

    // Parse the second line into an array of item output values (A).
    // These represent the value gained when using an item.
    const itemOutputs = lineSegments[1].split(" ").map(valStr => parseInt(valStr, 10));

    // Parse the third line into an array of item input costs (B).
    // These represent the value spent or consumed to use an item.
    const itemInputs = lineSegments[2].split(" ").map(valStr => parseInt(valStr, 10));

    // Define symbolic indices for the three item types for clarity, matching their original positions.
    const ITEM_TYPE_ZERO_IDX = 0;
    const ITEM_TYPE_ONE_IDX = 1;
    const ITEM_TYPE_TWO_IDX = 2;

    // Calculate the value-to-cost ratio for each item type.
    // This indicates the efficiency of converting input value to output value.
    // Store these ratios along with their original indices for later retrieval.
    const efficiencyDetails = [
        { index: ITEM_TYPE_ZERO_IDX, ratio: itemOutputs[ITEM_TYPE_ZERO_IDX] / itemInputs[ITEM_TYPE_ZERO_IDX] },
        { index: ITEM_TYPE_ONE_IDX, ratio: itemOutputs[ITEM_TYPE_ONE_IDX] / itemInputs[ITEM_TYPE_ONE_IDX] },
        { index: ITEM_TYPE_TWO_IDX, ratio: itemOutputs[ITEM_TYPE_TWO_IDX] / itemInputs[ITEM_TYPE_TWO_IDX] }
    ];

    // Sort items by their efficiency ratio in descending order.
    // This determines the priority for resource allocation: highest ratio first.
    efficiencyDetails.sort((a, b) => b.ratio - a.ratio);

    // Extract the original indices of the items after sorting by efficiency.
    // These will be used to access itemOutputs and itemInputs arrays.
    const firstPriorityItemIndex = efficiencyDetails[0].index;
    const secondPriorityItemIndex = efficiencyDetails[1].index;
    const thirdPriorityItemIndex = efficiencyDetails[2].index;

    // Helper function to perform a specific type of resource transformation.
    // This function is used when an item's value-to-cost ratio is less than 1.0,
    // implying a conversion strategy rather than a direct greedy purchase.
    const applyResourceTransformation = (currentAmount, outputValuePerUnit, inputValuePerUnit) => {
        // Calculate how many full transformations can occur.
        const numberOfConversions = Math.floor(currentAmount / outputValuePerUnit);
        // Calculate the resulting amount after these conversions.
        const transformedPortion = numberOfConversions * inputValuePerUnit;
        // Add any remaining amount that couldn't be fully converted.
        const unconvertibleRemainder = currentAmount % outputValuePerUnit;
        return transformedPortion + unconvertibleRemainder;
    };

    // Initialize the final accumulated value with the initial amount.
    // This variable will hold the maximized value after all operations.
    let finalAccumulatedValue = initialResourceAmount;

    // Retrieve the sorted ratios for conditional branching.
    const firstPriorityRatio = efficiencyDetails[0].ratio;
    const secondPriorityRatio = efficiencyDetails[1].ratio;
    const thirdPriorityRatio = efficiencyDetails[2].ratio;

    // Conditional logic for resource allocation based on item efficiency ratios.
    // The strategy changes significantly if items provide less value than they cost (ratio < 1.0).

    if (firstPriorityRatio >= 1.0) { // If the most efficient item yields at least its cost in value.
        if (secondPriorityRatio >= 1.0) { // And the second most efficient item also yields at least its cost.
            if (thirdPriorityRatio >= 1.0) { // And even the least efficient item yields at least its cost.
                // All items are "profitable" or neutral (ratio >= 1.0). Apply a standard greedy strategy.
                // Consume resources using the highest priority item first, then the next, and so on.
                let remainingResource = initialResourceAmount;

                const firstItemCount = Math.floor(remainingResource / itemInputs[firstPriorityItemIndex]);
                finalAccumulatedValue = firstItemCount * itemOutputs[firstPriorityItemIndex];
                remainingResource %= itemInputs[firstPriorityItemIndex];

                const secondItemCount = Math.floor(remainingResource / itemInputs[secondPriorityItemIndex]);
                finalAccumulatedValue += secondItemCount * itemOutputs[secondPriorityItemIndex];
                remainingResource %= itemInputs[secondPriorityItemIndex];

                const thirdItemCount = Math.floor(remainingResource / itemInputs[thirdPriorityItemIndex]);
                finalAccumulatedValue += thirdItemCount * itemOutputs[thirdPriorityItemIndex];
                // Add any final remaining resource that couldn't be spent on an item.
                finalAccumulatedValue += remainingResource % itemInputs[thirdPriorityItemIndex];
            } else { // Only the third priority item (thirdPriorityRatio) yields less than its cost.
                // Apply a specific transformation using the third priority item first.
                // This converts a portion of the initial resource based on the third item's properties.
                let intermediateResource = applyResourceTransformation(
                    initialResourceAmount,
                    itemOutputs[thirdPriorityItemIndex],
                    itemInputs[thirdPriorityItemIndex]
                );

                // Then, apply the greedy strategy with the first and second priority items on the transformed resource.
                const firstItemCount = Math.floor(intermediateResource / itemInputs[firstPriorityItemIndex]);
                finalAccumulatedValue = firstItemCount * itemOutputs[firstPriorityItemIndex];
                intermediateResource %= itemInputs[firstPriorityItemIndex];

                const secondItemCount = Math.floor(intermediateResource / itemInputs[secondPriorityItemIndex]);
                finalAccumulatedValue += secondItemCount * itemOutputs[secondPriorityItemIndex];
                // Add any final remaining resource from the transformed amount.
                finalAccumulatedValue += intermediateResource % itemInputs[secondPriorityItemIndex];
            }
        } else { // The second priority item (secondPriorityRatio) yields less than its cost (firstPriorityRatio >= 1.0).
            // Apply transformations using both the third and second priority items.
            // First transform using the third priority item.
            let intermediateResource = applyResourceTransformation(
                initialResourceAmount,
                itemOutputs[thirdPriorityItemIndex],
                itemInputs[thirdPriorityItemIndex]
            );
            // Then transform the result using the second priority item.
            intermediateResource = applyResourceTransformation(
                intermediateResource,
                itemOutputs[secondPriorityItemIndex],
                itemInputs[secondPriorityItemIndex]
            );

            // Finally, apply the greedy strategy with only the first priority item.
            const firstItemCount = Math.floor(intermediateResource / itemInputs[firstPriorityItemIndex]);
            finalAccumulatedValue = firstItemCount * itemOutputs[firstPriorityItemIndex];
            // Add any final remaining resource from the transformed amount.
            finalAccumulatedValue += intermediateResource % itemInputs[firstPriorityItemIndex];
        }
    } else { // The most efficient item (firstPriorityRatio) itself yields less than its cost (all ratios likely < 1.0).
        // In this scenario, all items yield less than their cost.
        // Apply transformations using all three items, starting from the least efficient.
        // This is a cascade of conversions based on their specified transformation logic.
        let intermediateResource = applyResourceTransformation(
            initialResourceAmount,
            itemOutputs[thirdPriorityItemIndex],
            itemInputs[thirdPriorityItemIndex]
        );
        intermediateResource = applyResourceTransformation(
            intermediateResource,
            itemOutputs[secondPriorityItemIndex],
            itemInputs[secondPriorityItemIndex]
        );
        intermediateResource = applyResourceTransformation(
            intermediateResource,
            itemOutputs[firstPriorityItemIndex],
            itemInputs[firstPriorityItemIndex]
        );
        finalAccumulatedValue = intermediateResource; // The final transformed value becomes the result.
    }

    // Output the calculated optimal value to the console.
    console.log(finalAccumulatedValue);
}

// This line is typically used in competitive programming environments
// to read input from standard input and execute the main logic.
// computeOptimalValue(require("fs").readFileSync("/dev/stdin", "utf8"));