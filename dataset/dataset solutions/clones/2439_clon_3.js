function ProcessInputData(rawDataString) {
    // --- Input Processing and Initialization ---

    // Validate the raw input string to ensure it's not empty or invalid.
    if (!rawDataString || typeof rawDataString !== 'string' || rawDataString.trim() === "") {
        console.error("Input data is invalid or empty. Please provide a valid string.");
        return; // Terminate execution if input is bad.
    }

    // Prepare the raw data: trim whitespace, split into individual lines,
    // then further split each line by space to get an array of string values.
    const parsedInputLines = rawDataString.trim().split("\n").map(lineContent => lineContent.split(" "));

    // Extract the primary problem parameters: total number of items and the time constraint.
    // Utilize Number() for type conversion and provide a fallback of 0 for robustness.
    const totalItemCount = Number(parsedInputLines[0][0]) || 0;
    const timeConstraintLimit = Number(parsedInputLines[0][1]) || 0;

    // Perform a crucial check on the extracted parameters.
    // Both item count and time limit must be positive for the problem to be meaningful.
    if (totalItemCount <= 0 || timeConstraintLimit <= 0) {
        console.error("Error: The number of items or time limit must be a positive integer.");
        return;
    }

    // Initialize a collection to hold all available items. Each item is represented
    // as a pair: [cost, reward].
    const availableItemsCollection = [];
    // Iterate through the input lines, starting from the second line (index 1),
    // to populate the items collection.
    for (let currentLineIndex = 0; currentLineIndex < totalItemCount; currentLineIndex++) {
        // Parse the cost (A) and reward (B) for the current item from its respective line.
        const currentItemValues = parsedInputLines[currentLineIndex + 1].map(valStr => Number(valStr) || 0);

        // A simple validation to ensure item data is correctly formatted.
        if (currentItemValues.length >= 2) {
            availableItemsCollection.push(currentItemValues);
        } else {
            // Log a warning if any item's data seems incomplete.
            console.warn(`Warning: Item data at line ${currentLineIndex + 2} is malformed and will be skipped.`);
        }
    }

    // A critical preprocessing step: sort the items.
    // The problem's specific "alternative scenario" calculation relies on items
    // being sorted by their reward value (B) in ascending order.
    availableItemsCollection.sort((itemOne, itemTwo) => itemOne[1] - itemTwo[1]);

    // --- Dynamic Programming Table Construction ---

    // Define the dynamic programming table. `optimalRewardsTable[i][j]` will store
    // the maximum achievable reward considering the first `i` items with a total
    // cost capacity of `j`.
    // The table dimensions are (totalItemCount + 1) rows by (timeConstraintLimit + 1) columns.
    const optimalRewardsTable = [];

    // Initialize the base case: the first row (representing 0 items) is all zeros.
    // No reward can be obtained with no items, regardless of capacity.
    optimalRewardsTable.push(new Array(timeConstraintLimit + 1).fill(0));

    // Iterate through each item, from the first to the last, to incrementally build the table.
    for (let itemOrdinal = 0; itemOrdinal < totalItemCount; itemOrdinal++) {
        // Create a new row in the table for the current item being considered.
        optimalRewardsTable.push(new Array(timeConstraintLimit + 1));

        const itemCost = availableItemsCollection[itemOrdinal][0];    // A-value: time/cost to process item
        const itemReward = availableItemsCollection[itemOrdinal][1];  // B-value: reward/value from item

        // Iterate through all possible time capacities, from 0 up to the maximum limit.
        for (let currentSlotCapacity = 0; currentSlotCapacity <= timeConstraintLimit; currentSlotCapacity++) {
            // Scenario 1: The current item is NOT included.
            // The maximum reward is simply inherited from the previous item set at the same capacity.
            const rewardIfSkipped = optimalRewardsTable[itemOrdinal][currentSlotCapacity];

            let rewardIfTaken = 0; // Initialize reward if taken to zero.
            // Scenario 2: The current item IS included.
            // This is only feasible if the item's cost does not exceed the current capacity.
            if (itemCost <= currentSlotCapacity) {
                // If included, the reward is the current item's reward plus the maximum reward
                // achievable from the previous items with the remaining capacity.
                rewardIfTaken = optimalRewardsTable[itemOrdinal][currentSlotCapacity - itemCost] + itemReward;
            }

            // The cell for the current item and capacity holds the maximum of these two scenarios.
            optimalRewardsTable[itemOrdinal + 1][currentSlotCapacity] = Math.max(rewardIfSkipped, rewardIfTaken);
        }
    }

    // --- Backtracking for Items Selected at (T-1) Capacity ---
    // This section is specific to a sub-problem or an alternative scenario
    // where one "last" item is selected, and others must fit within T-1 capacity.
    // We determine which items contribute to the optimal solution at capacity `timeConstraintLimit - 1`.

    const contributingItemIndices = []; // Stores indices of items that form the T-1 optimal solution.
    let backtrackItemPointer = totalItemCount;
    let remainingCapacityForBacktrack = timeConstraintLimit - 1; // Crucially, capacity is T-1.

    // A labeled loop for clearer control flow, allowing direct jumps.
    itemSelectionTrace:
    while (remainingCapacityForBacktrack >= 0) {
        // If we've processed all items or exhausted capacity, exit the tracing process.
        if (backtrackItemPointer === 0) {
            break itemSelectionTrace;
        }

        // Compare the current DP table value with the value from the row above (without current item).
        // If they are equal, it implies the item `backtrackItemPointer - 1` was NOT included.
        if (optimalRewardsTable[backtrackItemPointer][remainingCapacityForBacktrack] ===
            optimalRewardsTable[backtrackItemPointer - 1][remainingCapacityForBacktrack]) {
            backtrackItemPointer--; // Move to consider the previous item.
        } else {
            // If values differ, it means the item `backtrackItemPointer - 1` WAS included.
            contributingItemIndices.push(backtrackItemPointer - 1); // Record its index.
            const includedItemActualCost = availableItemsCollection[backtrackItemPointer - 1][0];
            remainingCapacityForBacktrack -= includedItemActualCost; // Reduce remaining capacity.
            backtrackItemPointer--; // Move to the previous item.
            // Continue the outer loop to find more items for the now reduced capacity.
            continue itemSelectionTrace;
        }
    }

    // --- Prepare Remaining Items for Alternative Calculation ---
    // Create a mutable copy of the original sorted item list.
    const itemsRemainingForFinalConsideration = [...availableItemsCollection];

    // To safely remove multiple items using `splice`, sort the indices in descending order.
    // This prevents index shifts from affecting subsequent `splice` operations.
    contributingItemIndices.sort((idxA, idxB) => idxB - idxA);

    // Remove the items that were identified as part of the T-1 capacity solution.
    for (const indexToRemove of contributingItemIndices) {
        itemsRemainingForFinalConsideration.splice(indexToRemove, 1);
    }

    // --- Calculate the Final Optimal Reward ---

    let rewardFromAlternativePath = 0;
    // This specific problem variant considers an "alternative scenario":
    // The max reward achievable with capacity (T-1) PLUS the reward of one final,
    // "last" item chosen from the remaining items.
    if (itemsRemainingForFinalConsideration.length > 0) {
        // The last item in the *remaining* (non-selected for T-1) list.
        // This relies on the initial sort by reward (B-value).
        const lastPotentialItemReward = itemsRemainingForFinalConsideration[itemsRemainingForFinalConsideration.length - 1][1];

        // Combine the max reward for capacity T-1 (using all items) with the reward of this last item.
        // Note: The problem implies that this 'last' item effectively uses the T-th unit of time.
        rewardFromAlternativePath = optimalRewardsTable[totalItemCount][timeConstraintLimit - 1] + lastPotentialItemReward;
    }

    // The ultimate solution is the maximum of two results:
    // 1. The standard knapsack solution for the full capacity T.
    // 2. The reward derived from the specific alternative scenario.
    const overallMaximumReward = Math.max(
        optimalRewardsTable[totalItemCount][timeConstraintLimit], // Standard DP result for capacity T
        rewardFromAlternativePath                                 // Result from the alternative scenario
    );

    console.log(overallMaximumReward);
}

// Execute the main processing function by reading input from standard input.
// This setup is common in competitive programming environments.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));