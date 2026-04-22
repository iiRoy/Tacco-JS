/**
 * Global storage for memoized expected values.
 * The structure is a 3D array: expectedStepsCache[countOfZeros][countOfOnes][countOfTwos].
 * The third dimension (countOfThrees) is implicitly determined by the total number of items
 * and the counts of 0s, 1s, and 2s.
 */
let expectedStepsCache;

/**
 * Stores the total initial number of items (N) provided in the input.
 * This value remains constant throughout the calculation.
 */
let totalInitialItemsCount;

/**
 * Stores the initial sum of counts for items of value 1, 2, and 3.
 * In the original code, this was 'allCount'. It's used in the denominator
 * of the expected value calculation formula.
 */
let initialValuableItemsSum;

/**
 * Parses the raw input data and initiates the calculation of expected steps
 * for a specific item transformation problem.
 *
 * @param {string} rawInputData - The raw input string, typically read from stdin.
 */
function initiateExpectedValueCalculation(rawInputData) {
    // Trim whitespace, split into lines, and then split each line by space.
    const processedLines = rawInputData.trim().split("\n").map(line => line.split(" "));

    // Extract the total number of items (N) from the first element of the first line.
    totalInitialItemsCount = parseInt(processedLines[0][0], 10);

    // Parse the item types from the second line, converting each string to an integer.
    const initialItemStates = processedLines[1].map(strVal => parseInt(strVal, 10));

    // Initialize an array to store the distribution of item counts:
    // index 0: count of items with value 0
    // index 1: count of items with value 1
    // index 2: count of items with value 2
    // index 3: count of items with value 3
    const itemDistribution = [0, 0, 0, 0];

    // Populate the item distribution array based on the initial item states.
    // Initial items are expected to be of type 1, 2, or 3.
    for (let i = 0; i < totalInitialItemsCount; i++) {
        const itemType = initialItemStates[i];
        // A basic validation check: if an item type is outside the expected range,
        // it's treated as a '0' for robustness, though problem constraints usually prevent this.
        if (itemType >= 0 && itemType <= 3) {
            itemDistribution[itemType]++;
        } else {
            // Fallback for unexpected data, treating it as a non-valuable item.
            itemDistribution[0]++;
        }
    }

    // Calculate the initial sum of valuable items (types 1, 2, and 3).
    // This value is crucial for the calculation formula within `calculateExpectedSteps`.
    initialValuableItemsSum = itemDistribution[1] + itemDistribution[2] + itemDistribution[3];

    // Initialize the memoization table. It's an array whose size accommodates
    // the maximum possible count for any item type (which is `totalInitialItemsCount`).
    expectedStepsCache = new Array(totalInitialItemsCount + 1);

    // Start the dynamic programming calculation with the initial item distribution
    // and print the final expected number of steps.
    console.log(calculateExpectedSteps(itemDistribution));
}

/**
 * A utility function to determine which item types (0, 1, 2, or 3) currently
 * have a count greater than zero.
 *
 * @param {number[]} counts - An array representing the current item counts [c0, c1, c2, c3].
 * @returns {number[]} An array containing the indices (item types) that have a non-zero count.
 */
function retrievePresentItemValueTypes(counts) {
    const activeItemValueTypes = [];
    for (let i = 0; i < counts.length; i++) {
        if (counts[i] > 0) {
            activeItemValueTypes.push(i);
        }
    }
    return activeItemValueTypes;
}

/**
 * Recursively calculates the expected number of steps using dynamic programming.
 * This function models a process where consuming an item of type 'k' (1, 2, or 3)
 * transforms it into an item of type 'k-1'. Type 0 items are removed from play.
 *
 * @param {number[]} currentItemCounts - The current state of item counts [c0, c1, c2, c3].
 * @returns {number} The expected number of steps from this specific item count state.
 */
function calculateExpectedSteps(currentItemCounts) {
    // Destructure item counts for clearer variable names.
    const zeroCount = currentItemCounts[0];
    const oneCount = currentItemCounts[1];
    const twoCount = currentItemCounts[2];
    const threeCount = currentItemCounts[3];

    // Calculate the sum of valuable items (types 1, 2, 3) in the current state.
    const currentValuableItems = oneCount + twoCount + threeCount;

    // Base case: If no valuable items remain, the process is complete, and 0 more steps are needed.
    if (currentValuableItems === 0) {
        return 0;
    }

    // Dynamically initialize parts of the memoization table if they don't exist yet.
    // This ensures that `expectedStepsCache[zeroCount][oneCount][twoCount]` can be accessed safely.
    if (expectedStepsCache[zeroCount] === undefined) {
        expectedStepsCache[zeroCount] = [];
    }
    if (expectedStepsCache[zeroCount][oneCount] === undefined) {
        expectedStepsCache[zeroCount][oneCount] = [];
    }

    // Check if the expected value for the current state has already been computed and memoized.
    if (expectedStepsCache[zeroCount][oneCount][twoCount] !== undefined) {
        return expectedStepsCache[zeroCount][oneCount][twoCount];
    }

    let sumOfNextStateExpectedValues = 0; // Accumulates weighted expected values from possible next states.

    // Identify which item types (1, 2, or 3) are currently present and can be consumed.
    const activeItemTypesForTransition = retrievePresentItemValueTypes(currentItemCounts);

    // Iterate through the types of items that can be "eaten" (i.e., types 1, 2, or 3).
    for (const itemValueType of activeItemTypesForTransition) {
        // Items of type 0, if present, are "eaten" but don't lead to a productive
        // state change in terms of valuable items. Their effect is accounted for
        // in the final division factor. So, we skip them here.
        if (itemValueType === 0) {
            continue;
        }

        // Create a copy of the current item counts to represent the state after
        // consuming an item of `itemValueType`.
        const nextStateItemCounts = [...currentItemCounts];
        nextStateItemCounts[itemValueType]--;         // Decrement the count of the consumed item type.
        nextStateItemCounts[itemValueType - 1]++;     // Increment the count of the transformed item type.

        // Add the expected steps from this next state, weighted by the count of
        // the current `itemValueType`. This forms part of the numerator of the formula.
        sumOfNextStateExpectedValues += calculateExpectedSteps(nextStateItemCounts) * currentItemCounts[itemValueType];
    }

    // Calculate the numerator for the expected value formula, which is
    // `(sum of weighted DP results) + (current sum of valuable items)`.
    // This directly translates to `S + allCount` from the original code's underlying formula.
    const numeratorTerm = sumOfNextStateExpectedValues + currentValuableItems;

    // Calculate the denominator for the expected value formula, which is
    // `(current sum of valuable items) - (count of zeros)`.
    // This directly translates to `allCount - countEach[0]` from the original code.
    const denominatorTerm = currentValuableItems - zeroCount;

    // Guard clause: Handle cases where the denominator becomes zero or negative.
    // In many expected value problems, this implies an infinite or undefined
    // expected number of steps, or an unreachable state under normal conditions.
    // We return `Infinity` as a representation of such scenarios, maintaining the original code's behavior.
    if (denominatorTerm <= 0) {
        // If the numerator is also 0 (meaning no valuable items and no steps accumulated),
        // the expected value is 0 (e.g., state [N,0,0,0]). Otherwise, it's Infinity.
        return numeratorTerm === 0 ? 0 : Infinity;
    }

    // Compute the final expected value for the current state.
    const finalExpectedValue = numeratorTerm / denominatorTerm;

    // Store the calculated value in the memoization table before returning it.
    expectedStepsCache[zeroCount][oneCount][twoCount] = finalExpectedValue;
    return finalExpectedValue;
}

// The entry point for the program: reads input from standard input
// (common in competitive programming environments) and begins the calculation.
initiateExpectedValueCalculation(require("fs").readFileSync("/dev/stdin", "utf8"));