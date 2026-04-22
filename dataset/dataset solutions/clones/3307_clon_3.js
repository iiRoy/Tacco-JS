function ProcessProblemInput(sourceData) {
    // Stage 1: Input parsing and initial data structuring.
    // Break down the raw input string into individual lines.
    const dataLines = sourceData.split("\n");

    // A utility function to safely convert string values to integers,
    // ensuring a base-10 conversion and handling potential non-numeric inputs.
    const parseIntegerSafely = (strValue) => {
        // Attempt to parse the string into an integer.
        const parsedNumber = parseInt(strValue, 10);
        // Include a check for NaN (Not-a-Number) which can occur if parsing fails.
        // While competitive programming usually guarantees valid input, this adds robustness.
        if (isNaN(parsedNumber)) {
            // In a real-world scenario, one might throw an error or log a warning.
            // For this context, a default of 0 is returned, assuming valid input is expected.
            return 0;
        }
        return parsedNumber;
    };

    // Extract the primary problem parameters from the first line:
    // the total count of items and the maximum weight the knapsack can hold.
    const [numItems, maxCapacity] = dataLines[0].split(' ').map(parseIntegerSafely);

    // Implementing a guard clause for basic input validation.
    // If the number of items is non-positive or capacity is negative, it's an invalid problem setup.
    if (numItems <= 0 || maxCapacity < 0) {
        console.error("Error: Invalid problem parameters detected. Ensure item count is positive and capacity non-negative.");
        // Depending on requirements, could throw an exception or exit. Returning 0 as a placeholder.
        return 0;
    }

    // Initialize a collection to store the weight and value for each item.
    // Each element will be an array: [itemWeight, itemValue].
    const goodsCatalog = [];
    // Accumulators for the total weight and total value of all items.
    // These sums are useful for defining the dimensions of the dynamic programming table.
    let cumulativeWeightOfAllItems = 0;
    let maximumPossibleValueSum = 0;

    // Loop through the remaining data lines to populate the goods catalog.
    // Each subsequent line (after the first) describes an item.
    for (let currentItemIndex = 0; currentItemIndex < numItems; currentItemIndex++) {
        const itemDescriptionLine = dataLines[currentItemIndex + 1]; // +1 because first line is parameters
        // Parse the weight and value for the current item.
        const [itemWeight, itemValue] = itemDescriptionLine.split(' ').map(parseIntegerSafely);

        // Add the parsed item details to our catalog.
        goodsCatalog.push([itemWeight, itemValue]);

        // Update the cumulative sums.
        cumulativeWeightOfAllItems += itemWeight;
        maximumPossibleValueSum += itemValue;
    }

    // Stage 2: Invoke the core algorithm to solve the knapsack problem.
    // Pass all necessary parsed and structured data to the solver function.
    const finalOptimalKnapsackValue = calculateMaxKnapsackValue(
        numItems,
        maxCapacity,
        goodsCatalog,
        cumulativeWeightOfAllItems, // This parameter is passed as per original structure, though not strictly used in this DP variant.
        maximumPossibleValueSum
    );

    // Stage 3: Output the computed result.
    console.log(finalOptimalKnapsackValue);
}

// Renamed and refactored the knapsack solver function.
function calculateMaxKnapsackValue(
    itemCount,
    knapsackCapacity,
    itemCollection,
    totalWeightSum, // Parameter retained for clone fidelity, but not directly used in the DP logic here.
    maxAchievableValueDimension // Represents the sum of all item values, used for DP table sizing.
) {
    let optimalValueFound = 0; // Variable to store the highest value achievable within capacity.

    // Define a value representing an impossible or excessively large weight.
    // Any weight exceeding the knapsackCapacity is considered 'impossible' for valid solutions.
    const IMPOSSIBLE_WEIGHT_THRESHOLD = knapsackCapacity + 1; // A simple 'infinity' for weights.

    // Initialize the dynamic programming table.
    // `minWeightForValue[i][v]` will store the minimum weight required to obtain a total value `v`,
    // considering items from index `i` up to `itemCount - 1`.
    // The table has `itemCount + 1` rows (for items 0 to `itemCount`, where `itemCount` is a base case for "no items left").
    // It has `maxAchievableValueDimension + 1` columns (for values 0 to `maxAchievableValueDimension`).
    const minWeightForValue = Array.from({ length: itemCount + 1 }, () =>
        Array(maxAchievableValueDimension + 1).fill(IMPOSSIBLE_WEIGHT_THRESHOLD)
    );

    // Base case initialization for the DP table:
    // To achieve a value of 0, a weight of 0 is always required, regardless of which items are considered.
    // This applies to all rows of the DP table.
    for (let rowIdx = 0; rowIdx <= itemCount; rowIdx++) {
        minWeightForValue[rowIdx][0] = 0;
    }

    // Populate the DP table using a bottom-up approach (or rather, "items-backwards" approach).
    // Iterate through items from the last one down to the first.
    // `itemIndex` refers to the current item being evaluated (from `itemCollection`).
    for (let itemIndex = itemCount - 1; itemIndex >= 0; itemIndex--) {
        // Extract the weight and value of the current item.
        const currentItemWeight = itemCollection[itemIndex][0];
        const currentItemValue = itemCollection[itemIndex][1];

        // Iterate through all possible target values, from 1 up to the maximum possible sum of values.
        for (let targetValue = 1; targetValue <= maxAchievableValueDimension; targetValue++) {
            // Option 1: Do NOT include the current item in the knapsack.
            // The minimum weight required to achieve `targetValue` is simply what was needed
            // when considering only the items after the current one (i.e., from `itemIndex + 1` onwards).
            const weightIfCurrentItemSkipped = minWeightForValue[itemIndex + 1][targetValue];

            // Option 2: Potentially INCLUDE the current item in the knapsack.
            let weightIfCurrentItemTaken = IMPOSSIBLE_WEIGHT_THRESHOLD; // Initialize as impossible.

            // Check if it's logically possible to include the current item for the `targetValue`.
            // This means the `targetValue` must be at least as large as the `currentItemValue`.
            if (targetValue >= currentItemValue) {
                // Calculate the remaining value that would need to be achieved by other items
                // if the current item is taken.
                const remainingValueRequired = targetValue - currentItemValue;
                // Find the minimum weight needed for this `remainingValueRequired` from items after the current one.
                const minWeightForRemainingValue = minWeightForValue[itemIndex + 1][remainingValueRequired];

                // If it was possible to achieve the `remainingValueRequired` with previous items,
                // then we can calculate the total weight if the current item is included.
                if (minWeightForRemainingValue !== IMPOSSIBLE_WEIGHT_THRESHOLD) {
                    weightIfCurrentItemTaken = minWeightForRemainingValue + currentItemWeight;
                }
            }

            // The minimum weight for `targetValue` considering items from `itemIndex` onwards
            // is the lesser of the two options (skipped or taken).
            minWeightForValue[itemIndex][targetValue] = Math.min(
                weightIfCurrentItemSkipped,
                weightIfCurrentItemTaken
            );
        }
    }

    // After the DP table is fully populated, extract the final answer.
    // We look at the first row (`minWeightForValue[0]`), which represents considering all items.
    // We want the largest `currentValue` for which the `requiredWeight` is within `knapsackCapacity`.
    // Iterate downwards from the maximum possible value to find the highest achievable value efficiently.
    for (let currentValue = maxAchievableValueDimension; currentValue >= 0; currentValue--) {
        const requiredWeight = minWeightForValue[0][currentValue];

        // If the weight needed for `currentValue` is within the knapsack's limit,
        // this `currentValue` is the highest possible value we can achieve.
        if (requiredWeight <= knapsackCapacity) {
            optimalValueFound = currentValue; // Assign and break, as we're iterating downwards.
            break;
        }
    }

    return optimalValueFound;
}

// Standard competitive programming entry point for Node.js.
// This self-executing function ensures the problem processing begins when the script runs.
(function() {
    // Read the entire standard input as a UTF-8 string.
    const stdInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
    // Pass the content to the main processing function.
    ProcessProblemInput(stdInputContent);
})();