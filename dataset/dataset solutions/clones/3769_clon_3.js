/**
 * This module provides a solution to find the minimum number of specific
 * power-based elements (denominations) required to sum up to a target value.
 * It's a variation of the classic change-making problem, utilizing a recursive
 * depth-first search approach with pruning and memoization for efficiency.
 */

/**
 * Processes the raw input string, validates it, and then initiates the
 * recursive search to find the minimum element count for the target sum.
 * The final minimum count is printed to the console.
 *
 * @param {string} rawInputString - The raw string input, expected to be a number.
 */
function ProcessAndResolveSum(rawInputString) {
    // Sanitize and parse the input string into an integer.
    // The original code used `s |= 0;` for type coercion. `parseInt` is more explicit.
    const targetNumericalSum = parseInt(rawInputString.trim(), 10);

    // Input validation: Ensure the target sum is a valid, positive integer.
    if (isNaN(targetNumericalSum) || targetNumericalSum < 0) {
        // For invalid or negative inputs, it's impossible to form a sum.
        // Or, if targetNumericalSum is 0, the answer is 0 elements.
        // The original code would output 0 for target 0, but for negative it would search.
        // Let's explicitly handle 0 as 0 elements.
        if (targetNumericalSum === 0) {
            console.log(0);
        } else {
            // For other invalid inputs or negative sums, indicate an error or an impossible state.
            // Returning -1 is a common convention for "impossible" in some contexts.
            console.log(-1);
        }
        return;
    }

    // This array defines the specific set of "coins" or "denominations" available.
    // It's a mix of powers of 3 and 6, specifically:
    // 3^0, 6^1, 3^2, 6^2, 3^4, 6^3, 3^6, 6^4, 3^8, 6^5, 6^6, 3^10.
    // The array is pre-sorted in ascending order.
    const availableComponentValues = [
        1,       // 3^0
        6,       // 6^1
        9,       // 3^2
        36,      // 6^2
        81,      // 3^4
        216,     // 6^3
        729,     // 3^6
        1296,    // 6^4
        6561,    // 3^8
        7776,    // 6^5
        46656,   // 6^6
        59049    // 3^10
    ];

    // `minimumAttainedElementCount` stores the best result found so far.
    // Initialized to `Infinity` to ensure any valid count will be smaller.
    // The original code used `1 << 29` (a large integer).
    let minimumAttainedElementCount = Infinity;

    // A memoization cache to store the minimum `currentCount` required to reach a specific
    // `remainingValue` using elements up to `currentMaxIndex`.
    // This helps prune redundant recursive calls by avoiding re-computation for states
    // already visited with an equal or better path.
    // Map<remainingValue, Map<currentMaxIndex, minElementsUsed>>
    const pathMemoizationCache = new Map();

    /**
     * Recursive function to explore different combinations of `availableComponentValues`
     * to reach the `targetNumericalSum` using the minimum number of elements.
     *
     * @param {number} currentElementsCount - The number of components used in the current path.
     * @param {number} currentRemainingSum - The sum that still needs to be achieved.
     * @param {number} currentMaxIndex - The highest index in `availableComponentValues` that can be considered.
     */
    function exploreSumCombinations(currentElementsCount, currentRemainingSum, currentMaxIndex) {
        // Pruning 1: If the current path has already used more elements than the best solution found,
        // or if the remaining sum becomes negative (meaning we've overshot the target),
        // then this path cannot lead to a better solution. Terminate early.
        if (currentElementsCount >= minimumAttainedElementCount || currentRemainingSum < 0) {
            return;
        }

        // Memoization check:
        // Before proceeding, check if this state (`currentRemainingSum`, `currentMaxIndex`)
        // has been visited before with an equal or better `currentElementsCount`.
        if (pathMemoizationCache.has(currentRemainingSum)) {
            const indexSpecificCache = pathMemoizationCache.get(currentRemainingSum);
            if (indexSpecificCache.has(currentMaxIndex)) {
                if (indexSpecificCache.get(currentMaxIndex) <= currentElementsCount) {
                    return; // A path to this state with fewer or equal elements already exists.
                }
            }
        }

        // Update memoization cache for the current state.
        // We record the current `currentElementsCount` as the best known way to reach this state.
        if (!pathMemoizationCache.has(currentRemainingSum)) {
            pathMemoizationCache.set(currentRemainingSum, new Map());
        }
        pathMemoizationCache.get(currentRemainingSum).set(currentMaxIndex, currentElementsCount);

        // Base case: If the `currentRemainingSum` is exactly zero, we have successfully
        // formed the target sum with `currentElementsCount` elements.
        if (currentRemainingSum === 0) {
            // Update the global minimum if this path is better.
            if (currentElementsCount < minimumAttainedElementCount) {
                minimumAttainedElementCount = currentElementsCount;
            }
            return; // Terminate this recursive branch.
        }

        // Find the largest available denomination that is less than or equal to `currentRemainingSum`.
        // The `while` loop from the original code handles this adjustment of the index.
        let effectiveDenomIndex = currentMaxIndex;
        while (effectiveDenomIndex >= 0 && availableComponentValues[effectiveDenomIndex] > currentRemainingSum) {
            effectiveDenomIndex--;
        }

        // If after adjustment, `effectiveDenomIndex` is negative, it means no suitable
        // denomination can be found to reduce the `currentRemainingSum` further.
        // Since `currentRemainingSum` is > 0 (checked above), this path is invalid.
        if (effectiveDenomIndex < 0) {
            return;
        }

        // Store the value of the largest suitable denomination for clarity.
        const largestSuitableDenomination = availableComponentValues[effectiveDenomIndex];

        // Recursive Branch 1:
        // Explore the path where we include the `largestSuitableDenomination`.
        // We increment the element count, subtract the denomination value from the sum,
        // and allow this same denomination (or smaller ones) to be considered again
        // by keeping `effectiveDenomIndex`.
        exploreSumCombinations(
            currentElementsCount + 1,
            currentRemainingSum - largestSuitableDenomination,
            effectiveDenomIndex
        );

        // Recursive Branch 2:
        // The original code includes a second branch: if there's a next smaller distinct
        // denomination (i.e., `effectiveDenomIndex` is not 0 or 1), try a path where
        // we use that next smaller denomination instead of the current largest one.
        // This specific condition (`index > 1`) is preserved from the original logic.
        if (effectiveDenomIndex > 1) {
            const nextSmallerDenomination = availableComponentValues[effectiveDenomIndex - 1];
            exploreSumCombinations(
                currentElementsCount + 1,
                currentRemainingSum - nextSmallerDenomination,
                effectiveDenomIndex - 1 // We move to consider elements up to this smaller index
            );
        }
    }

    // Initiate the recursive search process.
    // Start with 0 elements used, the full target sum, and the highest possible index
    // in the `availableComponentValues` array.
    exploreSumCombinations(0, targetNumericalSum, availableComponentValues.length - 1);

    // Output the final minimum count found.
    // If no combination was found (e.g., target sum is unachievable with given denominations,
    // though for 1 as a denomination, all positive integers are achievable), it will output Infinity.
    console.log(minimumAttainedElementCount);
}

// Read the input from standard input, typically used in competitive programming environments.
// The `.trim()` method is added for robustness against leading/trailing whitespace.
ProcessAndResolveSum(require("fs").readFileSync("/dev/stdin", "utf8").trim());