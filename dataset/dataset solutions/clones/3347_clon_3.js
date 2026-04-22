'use strict';

/**
 * Calculates the number of ways to form a perfect matching in a bipartite graph
 * with N men and N women, given an affinity matrix.
 * Uses dynamic programming with bitmasking.
 *
 * @param {string} inputData - The raw input string from stdin.
 * @returns {number} The total number of valid matching combinations modulo 10^9 + 7.
 */
const computeMatchingCombinations = (inputData) => {
    // --- Phase 1: Input Processing and Setup ---
    let processedLines = inputData.trim().split('\n');

    // Extract the number of entities (men/women) from the first line.
    // Using parseInt for explicit type conversion and radix.
    const entityCount = parseInt(processedLines.shift(), 10);

    // Basic validation for input. If entityCount is invalid, there are no valid combinations.
    if (isNaN(entityCount) || entityCount <= 0) {
        return 0;
    }

    // Define the modulo constant for large results.
    const resultModulus = 1000000007; // 10^9 + 7

    // Calculate the total number of possible bitmasks (2^N).
    // This represents all subsets of women, from 0 to (2^N - 1).
    const totalBitmaskSize = 1 << entityCount;

    // Parse the remaining lines into the affinity grid (pairing scores).
    // Each element indicates if a pairing is possible (1) or not (0).
    const affinityGrid = processedLines.map(lineSegment =>
        lineSegment.split(/\s+/).map(valueStr => Number(valueStr))
    );

    // Further validation for the affinity grid dimensions.
    // If the grid dimensions don't match the entityCount, it's an invalid input.
    if (affinityGrid.length !== entityCount || (entityCount > 0 && affinityGrid[0].length !== entityCount)) {
        return 0;
    }

    // --- Phase 2: Pre-calculating Bitmask Groups by Population Count ---
    // This structure will store arrays of bitmasks, grouped by the number of set bits (population count).
    // `bitmasksByPopCount[k]` will contain all masks with `k+1` bits set.
    const bitmasksByPopCount = Array.from({ length: entityCount }, () => []);

    /**
     * Helper function to count the number of set bits in an integer (population count).
     * Uses Brian Kernighan's algorithm, which is efficient.
     * @param {number} value - The integer to count set bits in.
     * @returns {number} The number of set bits.
     */
    const countSetBits = (value) => {
        let bitTally = 0;
        let tempValue = value;
        while (tempValue > 0) {
            tempValue &= (tempValue - 1); // Clear the least significant set bit
            bitTally++;
        }
        return bitTally;
    };

    // Populate `bitmasksByPopCount` for all relevant masks.
    // Masks range from 1 to (2^N - 1).
    for (let currentMaskValue = 1; currentMaskValue < totalBitmaskSize; currentMaskValue++) {
        const populationCount = countSetBits(currentMaskValue);
        // Only consider masks relevant to the number of entities.
        if (populationCount > 0 && populationCount <= entityCount) {
            // Store the mask in the array corresponding to its population count (0-indexed).
            bitmasksByPopCount[populationCount - 1].push(currentMaskValue);
        }
    }

    // --- Phase 3: Dynamic Programming Calculation ---
    // `dpCache[i]` will be a Map storing results for `i` men matched.
    // `dpCache[i].get(mask)` stores the number of ways to match the first `i` men
    // with `i` women represented by `mask`.
    const dpCache = Array.from({ length: entityCount + 1 }, () => new Map());

    // Base case: 0 men matched with 0 women (empty mask). There's only 1 way to do this.
    dpCache[0].set(0, 1);

    // Iterate through the number of men being matched, from 1 to `entityCount`.
    for (let currentManIndex = 1; currentManIndex <= entityCount; currentManIndex++) {
        // The 0-indexed person we are currently considering from the affinity grid.
        const manGridRow = currentManIndex - 1;

        // Retrieve the masks that have `currentManIndex` bits set.
        // These are the target masks for the current DP state.
        const potentialWomanMasks = bitmasksByPopCount[currentManIndex - 1];

        // Skip if there are no masks with this specific population count (shouldn't happen with valid N).
        if (!potentialWomanMasks || potentialWomanMasks.length === 0) {
            continue;
        }

        // Process each target mask for the current number of men.
        for (const targetWomanMask of potentialWomanMasks) {
            // Initialize the count for this specific state to 0.
            dpCache[currentManIndex].set(targetWomanMask, 0);

            // Iterate through all possible women who could be matched with the current man.
            for (let womanGridColumn = 0; womanGridColumn < entityCount; womanGridColumn++) {
                // If the current man and woman cannot be paired, skip this combination.
                if (affinityGrid[manGridRow][womanGridColumn] === 0) {
                    continue;
                }

                // Create a bitmask for the current potential woman.
                const womanBit = (1 << womanGridColumn);

                // Check if the current potential woman is part of the `targetWomanMask`.
                // If not, she cannot be the one removed to reach the previous state.
                if (!(targetWomanMask & womanBit)) {
                    continue;
                }

                // Derive the mask for the previous state: `currentManIndex - 1` men matched
                // with `currentManIndex - 1` women (by removing the current woman).
                const previousWomanMask = targetWomanMask ^ womanBit;

                // Get the number of ways from the previous DP state.
                // Use 0 if the state hasn't been computed (e.g., impossible path).
                const waysFromPriorState = dpCache[currentManIndex - 1].get(previousWomanMask) || 0;

                // Accumulate the ways for the current state.
                let currentAccumulatedWays = dpCache[currentManIndex].get(targetWomanMask);
                currentAccumulatedWays = (currentAccumulatedWays + waysFromPriorState) % resultModulus;
                dpCache[currentManIndex].set(targetWomanMask, currentAccumulatedWays);
            }
        }
    }

    // --- Phase 4: Final Result Extraction ---
    // The final result is the number of ways to match all `entityCount` men
    // with all `entityCount` women (represented by a mask with all bits set).
    const finalMatchingMask = totalBitmaskSize - 1; // Mask with all N bits set.
    const totalCombinations = dpCache[entityCount].get(finalMatchingMask);

    // Return the result, defaulting to 0 if no combinations were found.
    return totalCombinations || 0;
};

// Execute the function with input from stdin and print the result.
console.log(computeMatchingCombinations(require('fs').readFileSync('/dev/stdin', 'utf8')));