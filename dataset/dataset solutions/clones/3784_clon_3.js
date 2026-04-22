'use strict';

// The primary function to solve the pattern generation problem.
function solvePatternProblem(inputString) {
    // A utility function to parse a space-separated string of numbers.
    // This function includes robust validation for numeric inputs.
    const parseNumericInput = (textLine) => {
        // Ensure input is a string and not empty before splitting and mapping.
        if (typeof textLine !== 'string' || textLine.trim() === '') {
            throw new Error("Input data error: The provided input line must be a non-empty string.");
        }
        return textLine.split(' ').map(value => {
            const num = Number(value);
            // Basic validation for numbers: ensure they are non-negative integers.
            if (isNaN(num) || !Number.isInteger(num) || num < 0) {
                throw new Error(`Input data error: All values must be non-negative integers. Detected invalid value: '${value}'.`);
            }
            return num;
        });
    };

    let parsedNumericValues;
    try {
        // Attempt to parse the input string into an array of numbers.
        parsedNumericValues = parseNumericInput(inputString);
    } catch (e) {
        // If parsing fails, log the error and terminate the execution.
        console.error("Input processing failed:", e.message);
        return;
    }

    // Deconstruct and rename input variables for enhanced clarity and semantic meaning.
    // Original variable names were: N, red, blue, K.
    const totalAvailableSlots = parsedNumericValues[0];      // Represents N: The maximum number of items allowed.
    const primaryComponentQuantity = parsedNumericValues[1]; // Represents 'red': The quantity of the first component.
    const secondaryComponentQuantity = parsedNumericValues[2]; // Represents 'blue': The quantity of the second component.
    const overallCapacityLimit = parsedNumericValues[3];    // Represents K: The total capacity or budget.

    // Derived values from the input components, representing composite structures or specific component types.
    // A composite unit is formed by combining one primary and one secondary component.
    const compositeUnitSize = primaryComponentQuantity + secondaryComponentQuantity; // Original 'green' (red + blue)
    // Identify the size of the larger of the two individual components.
    const largerIndividualComponentSize = Math.max(primaryComponentQuantity, secondaryComponentQuantity); // Original 'second'
    // The smaller individual component (original 'third') is conceptually present but its size is not
    // directly needed as a separate variable for calculations, as its count is derived from remaining capacity.

    // Initialize the counter for all valid arrangements found.
    let countOfValidArrangements = 0; // Original 'pat'

    /**
     * Calculates the number of combinations (nCk).
     * This function is optimized for numerical stability by avoiding large intermediate factorials.
     * @param {number} n The total number of items available to choose from.
     * @param {number} k The number of items to choose.
     * @returns {number} The combination count. Returns 0 for invalid or impossible combinations.
     */
    function calculateCombinations(n, k) {
        // Handle edge cases and invalid inputs for combinations.
        if (k < 0 || k > n) {
            return 0; // It's impossible to choose a negative number of items or more items than available.
        }
        if (k === 0 || k === n) {
            return 1; // There's only one way to choose zero items (choose nothing) or all items.
        }
        // Apply the symmetry property C(n, k) = C(n, n-k) to reduce computation for larger k.
        if (k > n / 2) {
            k = n - k;
        }

        let combinationResult = 1;
        // Iteratively compute C(n, k) = (n * (n-1) * ... * (n-k+1)) / (k * (k-1) * ... * 1)
        // This method ensures that divisions are performed at each step, keeping the numbers smaller.
        for (let i = 1; i <= k; i++) {
            combinationResult = (combinationResult * (n - i + 1)) / i;
        }
        return combinationResult;
    }

    // Determine the maximum possible count of composite units that can fit within the overall capacity.
    // Added a check for compositeUnitSize being zero to prevent division by zero or infinite loops
    // in cases where components might have zero size (though usually problem constraints prevent this).
    const maxCompositeUnitsPossible = (compositeUnitSize === 0) ? (overallCapacityLimit >= 0 ? Infinity : 0) : Math.floor(overallCapacityLimit / compositeUnitSize);

    // Outer loop: Iterate through all possible counts of composite units (e.g., 'green' items).
    // 'currentCompositeUnits' denotes the count of the composite unit in the current iteration.
    for (let currentCompositeUnits = maxCompositeUnitsPossible; currentCompositeUnits >= 0; currentCompositeUnits--) {
        // Calculate the remaining capacity after placing the current number of composite units.
        const capacityAfterComposite = overallCapacityLimit - (currentCompositeUnits * compositeUnitSize);

        // If remaining capacity is negative, this combination is physically impossible, so skip to the next.
        if (capacityAfterComposite < 0) {
            continue;
        }

        // Determine the maximum possible count of larger individual components
        // that can fit into the currently remaining capacity.
        // Similar check for largerIndividualComponentSize being zero.
        const maxLargerComponentsPossible = (largerIndividualComponentSize === 0) ? (capacityAfterComposite >= 0 ? Infinity : 0) : Math.floor(capacityAfterComposite / largerIndividualComponentSize);

        // Inner loop: Iterate through all possible counts of larger individual components (e.g., 'red' or 'blue' if larger).
        // 'currentLargerComponents' denotes the count of the larger individual component.
        for (let currentLargerComponents = maxLargerComponentsPossible; currentLargerComponents >= 0; currentLargerComponents--) {
            // Calculate the final capacity left after accounting for both composite and larger components.
            const finalRemainingCapacity = overallCapacityLimit -
                                           (currentCompositeUnits * compositeUnitSize) -
                                           (currentLargerComponents * largerIndividualComponentSize);

            // This 'finalRemainingCapacity' effectively represents the count of the smaller individual component
            // (e.g., 'blue' or 'red' if smaller, or 'third' in original context) that would fill the remaining space.
            const smallerComponentCount = finalRemainingCapacity; // Original 'restgb'

            // If the count of smaller components is negative, this combination is not valid.
            if (smallerComponentCount < 0) {
                continue;
            }

            // Calculate the total number of items (composite, larger, and smaller) in the current arrangement.
            const currentTotalItems = currentCompositeUnits + currentLargerComponents + smallerComponentCount;

            // Check if the total items in this specific arrangement do not exceed the overall allowed slots (N).
            if (currentTotalItems <= totalAvailableSlots) {
                // The problem's specific counting formula involves two combination steps.
                // Part 1: Calculate the number of ways to choose 'currentTotalItems' positions
                // from the 'totalAvailableSlots' available.
                const combinationPart1 = calculateCombinations(totalAvailableSlots, currentTotalItems);

                // Part 2: From the 'currentTotalItems' chosen positions,
                // choose a subgroup whose size is equal to the maximum count among the three component types
                // (composite, larger individual, smaller individual). This is a unique problem constraint.
                const largestComponentGroupSize = Math.max(currentCompositeUnits, currentLargerComponents, smallerComponentCount);
                const combinationPart2 = calculateCombinations(currentTotalItems, largestComponentGroupSize);

                // Add the product of these two combination terms to the running total of valid arrangements.
                countOfValidArrangements += combinationPart1 * combinationPart2;
            }
        }
    }

    // Output the final computed count of valid arrangements.
    console.log(countOfValidArrangements);
}

// Main execution block: Handles reading input from standard input and invoking the solver function.
// This structure enhances modularity, reusability, and provides basic error handling for input operations.
try {
    // Use the 'fs' (file system) module to synchronously read input from /dev/stdin.
    // The .trim() method removes any leading or trailing whitespace from the input string.
    const rawInputContent = require("fs").readFileSync("/dev/stdin", "utf8").trim();
    solvePatternProblem(rawInputContent);
} catch (executionError) {
    // If any error occurs during file reading or problem solving, log it to the console.
    console.error("An operational error occurred during program execution:", executionError.message);
    // Exit the process with a non-zero status code to indicate that the program terminated abnormally.
    process.exit(1);
}