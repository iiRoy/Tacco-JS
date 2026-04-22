const MAXIMUM_ITEM_VALUE_THRESHOLD = 1000;

const parsePositiveInteger = (str, defaultValue = 0) => {
    const numericValue = Number(str);
    return isNaN(numericValue) || numericValue < 0 ? defaultValue : Math.floor(numericValue);
};

(function solveOptimalKnapsack() {
    let rawDataString;
    try {
        rawDataString = require('fs').readFileSync('/dev/stdin', 'utf8');
    } catch (readError) {
        console.error("Failed to acquire input data:", readError.message);
        // Fallback for local testing or error demonstration
        rawDataString = "3 8\n3 4\n2 5\n4 3"; // Example: 3 items, capacity 8. Items: (val 3, wt 4), (val 2, wt 5), (val 4, wt 3)
        // process.exit(1); // Consider exiting in a production environment
    }

    const lineFragments = rawDataString.trim().split('\n');

    if (lineFragments.length === 0) {
        console.error("Input data is empty or malformed.");
        return;
    }

    const firstLineData = lineFragments[0].split(' ');
    const itemCount = parsePositiveInteger(firstLineData[0]);
    const weightCapacity = parsePositiveInteger(firstLineData[1]);

    if (itemCount <= 0 || weightCapacity <= 0) {
        // If there are no items or no capacity, the maximum value is 0.
        console.log(0);
        return;
    }

    // Process all subsequent lines to construct a collection of knapsack items.
    // Each item is represented as an object with 'value' and 'weight' properties.
    const knapsackItems = lineFragments.slice(1, itemCount + 1).map(itemDescription => {
        const itemMetrics = itemDescription.split(' ').map(s => parsePositiveInteger(s, 0));
        if (itemMetrics.length < 2) {
            console.warn(`Invalid item entry encountered: "${itemDescription}". Skipping.`);
            return null; // Will be filtered out
        }
        return { itemValue: itemMetrics[0], itemWeight: itemMetrics[1] };
    }).filter(item => item !== null); // Retain only valid item objects

    // Ensure that the number of successfully parsed items matches the declared itemCount.
    if (knapsackItems.length !== itemCount) {
        console.error(`Input mismatch: Declared ${itemCount} items, but found ${knapsackItems.length} valid entries.`);
        return;
    }

    // Determine the maximum possible cumulative value, used to size the DP table's value dimension.
    const overallMaximumValueSum = itemCount * MAXIMUM_ITEM_VALUE_THRESHOLD;

    // Initialize our dynamic programming memoization table.
    // `minWeightForValue[k][v]` will store the minimum aggregate weight needed to achieve
    // a total value of `v` using the first `k` available items.
    const minWeightForValue = Array.from({ length: itemCount + 1 }, () =>
        new Array(overallMaximumValueSum + 1).fill(Infinity)
    );

    // Base condition: A total value of 0 can always be achieved with 0 weight,
    // irrespective of how many items are considered.
    minWeightForValue[0][0] = 0;

    // Iterate through each item to progressively build up the DP table.
    for (let currentItemIdx = 0; currentItemIdx < itemCount; currentItemIdx++) {
        const currentItemObject = knapsackItems[currentItemIdx];
        const itemVal = currentItemObject.itemValue;
        const itemWt = currentItemObject.itemWeight;

        // For each item, iterate through all possible target value sums.
        for (let targetValueSum = 0; targetValueSum <= overallMaximumValueSum; targetValueSum++) {
            // Scenario 1: The current item is NOT included in the selection.
            // The minimum weight remains what it was before considering this item.
            const weightIfSkipped = minWeightForValue[currentItemIdx][targetValueSum];

            // Scenario 2: The current item IS included in the selection.
            // This is only feasible if the target value sum is at least the item's value.
            let weightIfIncluded = Infinity;
            if (targetValueSum >= itemVal) {
                // To achieve `targetValueSum` by including the current item,
                // we must have achieved `targetValueSum - itemVal` with previous items,
                // and then add the current item's weight.
                const weightForPreviousState = minWeightForValue[currentItemIdx][targetValueSum - itemVal];
                if (weightForPreviousState !== Infinity) { // Only valid if previous state was reachable
                    weightIfIncluded = weightForPreviousState + itemWt;
                }
            }

            // Update the DP table for the next item state (currentItemIdx + 1).
            // We select the minimum weight between including or not including the current item.
            minWeightForValue[currentItemIdx + 1][targetValueSum] = Math.min(
                weightIfSkipped,
                weightIfIncluded
            );
        }
    }

    // After populating the entire DP table, we determine the highest achievable value.
    // This involves scanning the last row of the table (after considering all items)
    // to find the largest value whose corresponding minimum weight does not exceed the knapsack's capacity.
    let maximumAchievedValue = 0;

    // We iterate downwards from the maximum possible value sum to find the largest value efficiently.
    for (let valueIndex = overallMaximumValueSum; valueIndex >= 0; valueIndex--) {
        // If the minimum weight required for `valueIndex` is within our `weightCapacity`,
        // then `valueIndex` is a possible achievable value.
        if (minWeightForValue[itemCount][valueIndex] <= weightCapacity) {
            maximumAchievedValue = valueIndex;
            break; // Found the largest value, no need to check smaller ones.
        }
    }

    // Output the final result: the maximum total value that can be placed in the knapsack.
    console.log(maximumAchievedValue);

})(); // The entire logic is encapsulated within an Immediately-Invoked Function Expression (IIFE).