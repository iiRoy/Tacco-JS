const solveBipartiteMatching = (rawInputString) => {
    'use strict'; // Enforce strict mode within the function scope

    /**
     * Helper function to perform addition with a modulo operation.
     * Ensures results stay within the specified modulus.
     * @param {number} term1 - The first number to add.
     * @param {number} term2 - The second number to add.
     * @param {number} modulus - The value to take the result modulo.
     * @returns {number} The modular sum of term1 and term2.
     */
    const addWithModulo = (term1, term2, modulus) => {
        return (term1 + term2) % modulus;
    };

    // --- Input Processing and Initial Setup ---

    // Split the raw input string into individual lines
    let inputLines = rawInputString.trim().split('\n');

    // Extract the number of individuals (N), which determines the problem size.
    // N represents both the number of men and the number of women.
    const numberOfIndividualsStr = inputLines.shift();
    const totalIndividuals = Number(numberOfIndividualsStr);

    // Input validation: Ensure N is a valid positive integer within reasonable bounds.
    // Assuming N is between 1 and 20 for practical bitmask DP.
    if (isNaN(totalIndividuals) || totalIndividuals < 1 || totalIndividuals > 20) {
        console.error("Error: Invalid number of individuals provided. Must be an integer between 1 and 20.");
        return 0; // Return 0 or throw an error for invalid input.
    }

    // Define the constant for modulo arithmetic, often used in combinatorics to prevent overflow.
    const MOD_CONSTANT = 10**9 + 7;

    // Calculate the bitmask that represents all women being matched.
    // (1 << N) generates 2^N, and subtracting 1 sets all N bits.
    const fullyMatchedMask = (1 << totalIndividuals) - 1;

    // Parse the remaining lines into a 2D array representing the compatibility matrix.
    // compatibilityMatrix[i][j] is 1 if man 'i' can be matched with woman 'j', else 0.
    const compatibilityMatrix = inputLines.map((lineContent, rowIndex) => {
        const parsedRow = lineContent.split(/\s+/).map(Number);
        // Validate each row's length
        if (parsedRow.length !== totalIndividuals) {
            console.error(`Error: Row ${rowIndex} in compatibility matrix has an incorrect number of elements (${parsedRow.length} instead of ${totalIndividuals}).`);
            return null; // Mark as invalid.
        }
        return parsedRow;
    });

    // Validate the total number of rows in the compatibility matrix.
    if (compatibilityMatrix.length !== totalIndividuals || compatibilityMatrix.some(row => row === null)) {
        console.error("Error: Compatibility matrix has an incorrect number of rows or contains invalid data.");
        return 0; // Return 0 for invalid input.
    }

    // Initialize the dynamic programming table.
    // `dpCounts[k][mask]` stores the number of distinct ways to match the first 'k' men
    // with the set of women represented by 'mask'.
    // The table size is `totalIndividuals + 1` to accommodate states from 0 men to `totalIndividuals` men.
    const dpCounts = Array.from({ length: totalIndividuals + 1 }, () => ({}));

    // Pre-compute bitmasks for each individual woman.
    // `womanBitmasks[j]` will have only the j-th bit set (e.g., 1, 2, 4, 8...).
    const womanBitmasks = Array.from({ length: totalIndividuals }, (_, index) => (1 << index));

    /*
     * Dynamic Programming State Definition:
     * `dpCounts[currentManIdx][matchedWomenMask]` holds the number of ways to match
     * the first `currentManIdx` men (from index 0 to `currentManIdx - 1`)
     * with the specific set of women whose indices are represented by the `matchedWomenMask`.
     *
     * Base Case:
     * Before any men are considered (currentManIdx = 0), there is exactly one way
     * to have no women matched (matchedWomenMask = 0).
     */
    dpCounts[0][0] = 1; // 0 men matched, 0 women matched, 1 valid (empty) way.

    // --- DP Table Population ---

    // Iterate through each man, from the first (index 0) up to the last (`totalIndividuals - 1`).
    // `manIndex` here represents the index of the man currently being considered for a match.
    for (let manIndex = 0; manIndex < totalIndividuals; ++manIndex) {
        // Retrieve the collection of states from the previous stage (i.e., after considering `manIndex` men).
        // This represents `dpCounts[manIndex]` in our shifted indexing.
        const statesFromPreviousStage = dpCounts[manIndex];

        // Iterate over each existing state (mask and its count) from the previous stage.
        // `previousMaskStr` is a string key, so it needs to be converted to a number.
        for (const previousMaskStr in statesFromPreviousStage) {
            const previousMaskValue = Number(previousMaskStr);
            const waysToReachThisState = statesFromPreviousStage[previousMaskValue];

            // If there are no ways to reach this state, skip it to optimize.
            if (waysToReachThisState === 0) {
                continue;
            }

            // Attempt to match the `currentManIndex` with an available woman.
            for (let womanIndex = 0; womanIndex < totalIndividuals; ++womanIndex) {
                // First check: Is this woman already matched in the `previousMaskValue`?
                // If the bit corresponding to `womanIndex` is set in `previousMaskValue`, she's taken.
                if ((previousMaskValue & womanBitmasks[womanIndex]) !== 0) {
                    continue; // Skip this woman, she is already assigned.
                }

                // Second check: Can the `manIndex` be matched with `womanIndex` according to the compatibility matrix?
                // `compatibilityMatrix[manIndex][womanIndex]` is 1 for compatible, 0 for incompatible.
                if (compatibilityMatrix[manIndex][womanIndex] === 0) {
                    continue; // Skip this woman, they are not compatible.
                }

                // If both checks pass, this is a valid potential match.
                // Create a new mask by adding the `womanBitmasks[womanIndex]` to the `previousMaskValue`.
                const newMaskAfterMatch = previousMaskValue | womanBitmasks[womanIndex];

                // Update the DP table for the next stage (`manIndex + 1`).
                // Add the `waysToReachThisState` to the count for `newMaskAfterMatch`.
                // Use the nullish coalescing operator (??) for clean initialization if the key doesn't exist yet.
                const currentCountForNewMask = dpCounts[manIndex + 1][newMaskAfterMatch] ?? 0;
                dpCounts[manIndex + 1][newMaskAfterMatch] = addWithModulo(currentCountForNewMask, waysToReachThisState, MOD_CONSTANT);
            }
        }
    }

    // --- Final Result Retrieval ---

    // The answer is the number of ways to match all `totalIndividuals` men (final stage `totalIndividuals`)
    // with all `totalIndividuals` women (represented by `fullyMatchedMask`).
    // If no such state exists, `dpCounts[totalIndividuals][fullyMatchedMask]` will be `undefined`, so default to 0.
    const finalMatchingCount = dpCounts[totalIndividuals][fullyMatchedMask] ?? 0;

    // Return the final count, ensuring it's within the modulo bounds.
    return finalMatchingCount % MOD_CONSTANT;
};

// --- Execution Entry Point ---
// This line reads input from standard input and calls the main solving function.
console.log(solveBipartiteMatching(require('fs').readFileSync('/dev/stdin', 'utf8')));