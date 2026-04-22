'use strict';

/**
 * Processes raw input data to calculate a specific combinatorial sum,
 * modeling a resource allocation or distribution scenario.
 * This function handles parsing, validation, and complex iterative calculations.
 * @param {string} rawInputData - A space-separated string containing numerical parameters.
 */
function ProcessInputData(rawInputData) {
    // Ensure strict mode for robust error handling and cleaner code practices.

    // 1. Input Parsing and Initial Validation
    // Split the input string into individual parts based on space.
    // The expected format is: N itemAValue itemBValue targetSum
    const inputSegments = rawInputData.trim().split(" ");

    // Basic validation: Check if the required number of parameters is present.
    if (inputSegments.length < 4) {
        console.error("Error: Insufficient input parameters provided. Expected 4 numbers.");
        // Throwing an error ensures the program terminates gracefully on invalid input.
        throw new Error("Input string must contain at least 4 space-separated numerical values.");
    }

    // Convert string segments to integer values using parseInt with radix 10.
    const maxAllocatableSlots = parseInt(inputSegments[0], 10); // Represents N from original problem
    const firstItemUnitCost = parseInt(inputSegments[1], 10);   // Represents 'red' from original
    const secondItemUnitCost = parseInt(inputSegments[2], 10);  // Represents 'blue' from original
    const desiredTotalValue = parseInt(inputSegments[3], 10);   // Represents K from original

    // 2. Derive Essential Calculation Parameters
    // Calculate the cost of a combined item (first + second).
    const combinedProductCost = firstItemUnitCost + secondItemUnitCost;

    // Identify the larger and smaller of the two individual item costs.
    // The 'smallerComponentValue' (original 'third') is not directly used as a cost
    // in the loop's 'restgb' calculation, implying a base unit cost of 1 for remaining value.
    const primaryComponentCost = Math.max(firstItemUnitCost, secondItemUnitCost);
    // Note: The original 'third' variable (Math.min(red, blue)) was unused and has been removed.

    // Initialize an accumulator for the final combinatorial count.
    let totalValidConfigurations = 0; // Renamed from 'pat'

    // 3. Helper Functions for Combinatorics

    /**
     * Computes the number of permutations P(n, r) = n! / (n-r)!.
     * This function calculates the number of ways to arrange 'r' items chosen from 'n' distinct items.
     * @param {number} totalAvailableElements - The total count of items to choose from (n).
     * @param {number} elementsToSelectAndArrange - The count of items to select and arrange (r).
     * @returns {number} The calculated permutation count. Returns 0 for invalid inputs (e.g., r > n).
     */
    const calculatePermutations = (totalAvailableElements, elementsToSelectAndArrange) => {
        // Guard clause: Invalid input parameters for permutations.
        if (elementsToSelectAndArrange < 0 || elementsToSelectAndArrange > totalAvailableElements) {
            return 0;
        }
        let currentPermutationResult = 1; // Accumulator for the product.
        // Loop 'r' times, multiplying (n-k) in each iteration.
        for (let iterationCounter = 0; iterationCounter < elementsToSelectAndArrange; iterationCounter++) {
            currentPermutationResult *= (totalAvailableElements - iterationCounter);
        }
        return currentPermutationResult;
    };

    /**
     * Computes the number of combinations C(n, r) = n! / (r! * (n-r)!).
     * This implementation leverages the permutation helper: C(n, r) = P(n, r) / P(r, r).
     * @param {number} totalAvailableElements - The total count of items (n).
     * @param {number} elementsToChoose - The count of items to select (r).
     * @returns {number} The calculated combination count. Returns 0 for invalid inputs.
     */
    const computeCombinations = (totalAvailableElements, elementsToChoose) => {
        // Guard clause: Invalid input for combinations.
        if (elementsToChoose < 0 || elementsToChoose > totalAvailableElements) {
            return 0;
        }

        // Optimization: C(n, r) is symmetric, C(n, r) == C(n, n-r).
        // Using the smaller 'r' reduces the number of multiplications needed.
        const effectiveSelectionCount = Math.min(elementsToChoose, totalAvailableElements - elementsToChoose);
        
        // Handle trivial cases for efficiency and correctness.
        if (effectiveSelectionCount === 0) {
            return 1; // C(n, 0) is always 1 (one way to choose nothing).
        }
        if (effectiveSelectionCount === 1) {
            return totalAvailableElements; // C(n, 1) is always n (n ways to choose one item).
        }

        // Calculate using the permutation function.
        const numeratorValue = calculatePermutations(totalAvailableElements, effectiveSelectionCount);
        const denominatorValue = calculatePermutations(effectiveSelectionCount, effectiveSelectionCount); // This is effectiveSelectionCount!

        // Critical check: Avoid division by zero, though it should not occur with valid inputs.
        if (denominatorValue === 0) {
            console.warn("Warning: Attempted division by zero in combinations calculation. This indicates an unexpected state.");
            return 0;
        }
        return numeratorValue / denominatorValue;
    };

    // 4. Main Iteration Logic (Nested Loops)

    // Determine the maximum possible count of combined items that can fit within the desired total value.
    const maxCombinedItemsCount = Math.floor(desiredTotalValue / combinedProductCost); // Renamed from 'greenmax'

    // Outer loop: Iterates through all possible counts of the combined item.
    // Starts from the maximum possible count and goes down to zero.
    for (let currentCombinedItemCount = maxCombinedItemsCount; currentCombinedItemCount >= 0; currentCombinedItemCount--) { // Renamed from 'i'
        // Calculate the remaining value after accounting for the combined items.
        const remainingValueAfterCombined = desiredTotalValue - (currentCombinedItemCount * combinedProductCost); // Renamed from 'restg'

        // Guard clause: If the remaining value is negative, this path is invalid; skip to the next iteration.
        if (remainingValueAfterCombined < 0) {
            continue;
        }

        // Determine the maximum possible count of the primary component item (larger of A/B)
        // that can fit within the `remainingValueAfterCombined`.
        const maxPrimaryComponentCount = Math.floor(remainingValueAfterCombined / primaryComponentCost); // Renamed from 'secondmax'

        // Inner loop: Iterates through all possible counts of the primary component item.
        // Starts from its maximum possible count and goes down to zero.
        for (let currentPrimaryComponentCount = maxPrimaryComponentCount; currentPrimaryComponentCount >= 0; currentPrimaryComponentCount--) { // Renamed from 'j'
            // Calculate the final remaining value. In the original problem's context,
            // this `restgb` value was treated as a count of 1-unit items.
            const remainingValueForBaseUnits = desiredTotalValue -
                                               (currentCombinedItemCount * combinedProductCost) -
                                               (currentPrimaryComponentCount * primaryComponentCost); // Renamed from 'restgb'

            // Guard clause: If this final remaining value is negative, it's an invalid distribution.
            if (remainingValueForBaseUnits < 0) {
                continue;
            }
            
            // Calculate the total number of items chosen for this specific combination.
            // This sum includes combined items, primary component items, and base unit items.
            const totalItemsInCurrentConfiguration = currentCombinedItemCount +
                                                     currentPrimaryComponentCount +
                                                     remainingValueForBaseUnits;

            // Check if the total number of items chosen exceeds the maximum available slots (N).
            if (totalItemsInCurrentConfiguration <= maxAllocatableSlots) {
                // This is the core combinatorial calculation, broken down for clarity (Type III).
                // First term: C(maxAllocatableSlots, totalItemsInCurrentConfiguration)
                // This selects 'totalItemsInCurrentConfiguration' slots out of 'maxAllocatableSlots'.
                const initialSlotCombinations = computeCombinations(maxAllocatableSlots, totalItemsInCurrentConfiguration);

                // Second term: C(totalItemsInCurrentConfiguration, Math.max(count1, count2, count3))
                // This determines a 'distribution factor' based on the maximum count among the three item types.
                // Replaced direct Math.max with verbose conditional logic for Type III.
                let largestIndividualItemCount = currentCombinedItemCount;
                if (currentPrimaryComponentCount > largestIndividualItemCount) {
                    largestIndividualItemCount = currentPrimaryComponentCount;
                }
                if (remainingValueForBaseUnits > largestIndividualItemCount) {
                    largestIndividualItemCount = remainingValueForBaseUnits;
                }

                let distributionCombinations = 0;
                // Guard: Ensure valid parameters for the combination calculation.
                if (totalItemsInCurrentConfiguration >= largestIndividualItemCount) {
                    distributionCombinations = computeCombinations(totalItemsInCurrentConfiguration, largestIndividualItemCount);
                } else {
                    // This scenario suggests an inconsistency in item counts,
                    // contributing zero to the overall sum.
                    distributionCombinations = 0;
                }
                
                // Add the product of the two combination terms to the running total.
                totalValidConfigurations += initialSlotCombinations * distributionCombinations;
            }
        }
    }

    // 5. Output Result and Final Checks
    // Use console.info for informational output, distinct from console.log.
    console.info(`The calculated total number of arrangements is: ${totalValidConfigurations}`);

    // Add a final warning for Type III: detecting potential issues like overflow.
    if (totalValidConfigurations < 0) {
        console.warn("Warning: The final calculated total is negative. This might indicate an arithmetic overflow or an unexpected logical path.");
    }
}

// Entry point for execution.
// This block handles reading input from /dev/stdin (standard input) and error management.
try {
    // Read the entire file content from standard input, decode as UTF-8, and trim whitespace.
    const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
    // Pass the processed input string to the main function.
    ProcessInputData(fileContent.trim());
} catch (executionError) {
    // Catch any errors that occur during file reading or during the main processing.
    console.error("An unhandled error occurred during program execution:", executionError.message);
    // Exit the process with a non-zero status code to signal an error to the operating system.
    process.exit(1);
}