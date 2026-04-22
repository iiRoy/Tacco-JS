'use strict'; // Enforce strict parsing and error handling at runtime

// This is an Immediately-Invoked Function Expression (IIFE)
// It encapsulates the code to prevent global variable pollution.
// The raw data from standard input is passed as an argument.
(function(rawInputData) {

    // Step 1: Parse and prepare the input data.
    // - Trim leading/trailing whitespace from the raw string.
    // - Split the string into an array of tokens using any whitespace as a delimiter.
    // - Filter out any empty string tokens that might result from multiple spaces.
    // - Convert each token from a string to a numeric value.
    const processedNumericTokens = rawInputData
        .trim()
        .split(/\s+/)
        .filter(token => token.length > 0)
        .map(stringValue => Number(stringValue));

    // The very first number in the input represents the total count of items.
    const overallItemCapacity = processedNumericTokens.shift();

    // Perform basic validation on the overall item capacity.
    // If it's not a positive integer, log an error and terminate execution.
    if (overallItemCapacity <= 0 || !Number.isInteger(overallItemCapacity)) {
        console.error("Runtime Error: The overall item capacity must be a positive integer.");
        return;
    }

    // Initialize a frequency counter array for different item types.
    // This array will store how many items of each type (1, 2, or 3) are present.
    // Index 0 is intentionally left unused to align with 1-based item types.
    const typeFrequencies = [0, 0, 0, 0];

    // Iterate through the remaining numeric tokens (which represent individual item types)
    // and increment their respective counters in the frequency array.
    for (const currentItemType of processedNumericTokens) {
        // Validate that the item type falls within the expected range (1 to 3).
        if (currentItemType >= 1 && currentItemType <= 3) {
            typeFrequencies[currentItemType]++;
        } else {
            // A warning could be logged here for unexpected item types,
            // but for a clone, we maintain similar silent handling.
            // console.warn(`Warning: Encountered an unexpected item type: ${currentItemType}`);
        }
    }

    // Extract the initial counts for each item type for clarity in later DP access.
    const initialCountType1 = typeFrequencies[1];
    const initialCountType2 = typeFrequencies[2];
    const initialCountType3 = typeFrequencies[3];

    // Define the maximum dimension size for the dynamic programming table.
    // It's `overallItemCapacity + 1` to accommodate counts from 0 up to `overallItemCapacity`.
    const DP_TABLE_DIMENSION = overallItemCapacity + 1;

    // Initialize a 3D array (memoization table) to store computed expected values.
    // `expectedOutcomeTable[c1][c2][c3]` will hold the expected number of operations
    // to reach a state of zero items, starting with `c1` items of type 1,
    // `c2` of type 2, and `c3` of type 3.
    const expectedOutcomeTable = Array.from({ length: DP_TABLE_DIMENSION }, () =>
        Array.from({ length: DP_TABLE_DIMENSION }, () =>
            new Array(DP_TABLE_DIMENSION).fill(0) // Initialize all entries to zero
        )
    );

    // Begin the Dynamic Programming computation.
    // The loops iterate through all possible combinations of item counts (c1, c2, c3).
    // The iteration order (increasing counts) is crucial because the calculation for
    // a given state `(c1, c2, c3)` depends on previously computed states like
    // `(c1-1, c2, c3)`, `(c1, c2-1, c3)`, etc.
    for (let currentC1 = 0; currentC1 <= overallItemCapacity; currentC1++) {
        for (let currentC2 = 0; currentC2 <= overallItemCapacity; currentC2++) {
            for (let currentC3 = 0; currentC3 <= overallItemCapacity; currentC3++) {

                const sumOfCurrentItems = currentC1 + currentC2 + currentC3;

                // Base Case: If there are no items remaining, zero further operations are expected.
                if (sumOfCurrentItems === 0) {
                    expectedOutcomeTable[currentC1][currentC2][currentC3] = 0;
                    continue; // Skip to the next iteration
                }

                // Guard Clause: If the total number of items in the current state exceeds
                // the `overallItemCapacity`, this state is invalid or unreachable.
                if (sumOfCurrentItems > overallItemCapacity) {
                    continue; // Skip this invalid state
                }

                // Initialize the expected value for the current state.
                // The formula used here is for calculating the expected number of turns to clear items.
                // It's derived from `E = 1 + P1*E(c1-1) + P2*E(c2-1) + P3*E(c3-1) + P0*E`,
                // where P0 is the probability of hitting an empty slot.
                // Rearranging gives: E = (1 + P1*E(c1-1) + P2*E(c2-1) + P3*E(c3-1)) / (1 - P0)
                // And (1 - P0) = (c1+c2+c3) / N.
                // So, E = (N / (c1+c2+c3)) * (1 + (c1/N)*E(c1-1) + (c2/N)*E(c2-1) + (c3/N)*E(c3-1))
                // E = (N / (c1+c2+c3)) + (c1 / (c1+c2+c3))*E(c1-1) + ...
                let currentExpectedCalculation = overallItemCapacity / sumOfCurrentItems;

                // Add contributions from previous states where one item of type 1 was consumed.
                if (currentC1 > 0) {
                    currentExpectedCalculation += (currentC1 / sumOfCurrentItems) * expectedOutcomeTable[currentC1 - 1][currentC2][currentC3];
                }
                // Add contributions from previous states where one item of type 2 was consumed.
                if (currentC2 > 0) {
                    currentExpectedCalculation += (currentC2 / sumOfCurrentItems) * expectedOutcomeTable[currentC1][currentC2 - 1][currentC3];
                }
                // Add contributions from previous states where one item of type 3 was consumed.
                if (currentC3 > 0) {
                    currentExpectedCalculation += (currentC3 / sumOfCurrentItems) * expectedOutcomeTable[currentC1][currentC2][currentC3 - 1];
                }

                // Store the final computed expected value for the current state.
                expectedOutcomeTable[currentC1][currentC2][currentC3] = currentExpectedCalculation;
            }
        }
    }

    // The original code did not output the final result, so this clone also omits it.
    // If output were desired, it would typically be:
    // console.log(expectedOutcomeTable[initialCountType1][initialCountType2][initialCountType3]);

})(require('fs').readFileSync('/dev/stdin', 'utf8')); // Use Node.js 'fs' module to read synchronous input from stdin