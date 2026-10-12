function ProcessData(rawData) {
    // Clean up the raw input string and parse it into an array of number arrays.
    // Each line represents an item, with its properties separated by spaces.
    let processedInputLines = rawData.trim().split("\n").map(function(lineSegment) {
        return lineSegment.split(" ");
    });

    // Extract the total number of items and the time limit from the first line.
    const itemCount = parseInt(processedInputLines[0][0], 10);
    const timeLimit = parseInt(processedInputLines[0][1], 10);

    // Initialize an array to store the item details (weight and benefit).
    let itemDetailsArray = [];
    // Populate the item details array from the input, skipping the first line.
    for (let idx = 0; idx < itemCount; idx++) {
        itemDetailsArray.push(processedInputLines[idx + 1].map(elementVal => parseInt(elementVal, 10)));
    }

    // Sort the items based on their benefit (second element) in ascending order.
    // This helps in the dynamic programming approach.
    itemDetailsArray.sort((firstEntry, secondEntry) => firstEntry[1] - secondEntry[1]);

    // Initialize the dynamic programming table.
    // `memoizationTable[i][j]` will store the maximum benefit achievable with the first `i` items
    // within a time limit of `j`.
    let memoizationTable = [];
    let currentWeight, currentBenefit;

    // Initialize the first row of the DP table.
    // This row represents the state before considering any items, so all benefits are 0.
    memoizationTable.push(Array.from({ length: timeLimit + 1 }, () => 0));

    // Iterate through each item to fill the DP table.
    for (let outerIndex = 0; outerIndex < itemCount; outerIndex++) {
        memoizationTable.push([]); // Add a new row for the current item.
        currentWeight = itemDetailsArray[outerIndex][0]; // Get the weight of the current item.
        currentBenefit = itemDetailsArray[outerIndex][1]; // Get the benefit of the current item.

        // Iterate through each possible time slot.
        for (let timeSlot = 0; timeSlot < timeLimit + 1; timeSlot++) {
            // If the current item's weight is less than or equal to the current time slot,
            // we have two choices:
            // 1. Don't include the current item: benefit is `memoizationTable[outerIndex][timeSlot]`.
            // 2. Include the current item: benefit is `memoizationTable[outerIndex][timeSlot - currentWeight] + currentBenefit`.
            // We choose the maximum of these two.
            if (currentWeight <= timeSlot) {
                if (memoizationTable[outerIndex][timeSlot] >= memoizationTable[outerIndex][timeSlot - currentWeight] + currentBenefit) {
                    memoizationTable[outerIndex + 1][timeSlot] = memoizationTable[outerIndex][timeSlot];
                } else {
                    memoizationTable[outerIndex + 1][timeSlot] = memoizationTable[outerIndex][timeSlot - currentWeight] + currentBenefit;
                }
            } else {
                // If the current item's weight is greater than the current time slot,
                // we cannot include it. So, the benefit is the same as not considering this item.
                memoizationTable[outerIndex + 1][timeSlot] = memoizationTable[outerIndex][timeSlot];
            }
        }
    }

    // Backtrack through the DP table to find items that were *not* selected
    // to achieve the maximum benefit within `timeLimit - 1`.
    let selectedItemIndices = [];
    let tempCounter = itemCount;
    let remainingTime = timeLimit - 1; // Consider the time limit minus one for the special case.

    mainProcessingLoop:
    while (remainingTime > 0) {
        while (true) {
            if (tempCounter === 0) break mainProcessingLoop; // No more items to check.

            // If the benefit is the same with and without the current item,
            // it means the current item was not chosen for this path.
            if (memoizationTable[tempCounter][remainingTime] === memoizationTable[tempCounter - 1][remainingTime]) {
                tempCounter--; // Move to the previous item.
            } else {
                // If the benefits differ, the current item was chosen.
                // Add its index to the list of selected items.
                selectedItemIndices.push(tempCounter - 1);
                // Reduce the remaining time by the weight of the selected item.
                remainingTime -= itemDetailsArray[tempCounter - 1][0];
                tempCounter--; // Move to the previous item.
                continue mainProcessingLoop; // Continue the outer loop with updated remaining time.
            }
        }
    }

    // Remove the items that were selected for the `timeLimit - 1` calculation
    // from the original `itemDetailsArray` to find the "last" item.
    for (let removedItemIndex of selectedItemIndices) {
        itemDetailsArray.splice(removedItemIndex, 1);
    }

    // Calculate the alternative result:
    // This is the maximum benefit at `timeLimit - 1` plus the benefit of the last remaining item
    // (if any) from the original sorted list. This handles a specific edge case or alternative strategy.
    let alternativeResult = 0;
    if (itemDetailsArray.length > 0) {
        alternativeResult = memoizationTable[itemCount][timeLimit - 1] + itemDetailsArray[itemDetailsArray.length - 1][1];
    }

    // The final answer is the maximum of:
    // 1. The maximum benefit achievable within the full `timeLimit`.
    // 2. The alternative result calculated for the `timeLimit - 1` case.
    console.log(Math.max(memoizationTable[itemCount][timeLimit], alternativeResult));
}

// Read input from standard input and pass it to the main processing function.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));
