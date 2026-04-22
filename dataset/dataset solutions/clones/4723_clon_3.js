// Enforce strict mode for cleaner code execution and prevent common errors.
'use strict';

// Define an extremely large value to represent an unreachable or infinite cost.
// This ensures any valid calculated cost will be smaller.
const UNATTAINABLE_COST_MARKER = 1000000007; // A large prime, effectively infinity for this problem.

/**
 * Safely parses a string into an integer. Throws an error if parsing fails.
 * @param {string} inputString - The string to parse.
 * @returns {number} The parsed integer.
 */
const parseNumericValue = (inputString) => {
    const value = parseInt(inputString, 10);
    if (isNaN(value)) {
        // This is a robust error handling for unexpected input formats.
        console.error(`Error: Could not parse "${inputString}" as a number.`);
        process.exit(1); // Exit with an error code.
    }
    return value;
};

// --- Input Processing ---

// Read all incoming data from standard input, decode as UTF-8,
// remove leading/trailing whitespace, and split into an array of lines.
const rawInputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

// The first line contains global parameters:
// totalCompounds: The total number of unique compounds available.
// targetComponentA: The desired ratio component A.
// targetComponentB: The desired ratio component B.
const globalParameters = rawInputLines[0].split(' ');
const totalCompounds = parseNumericValue(globalParameters[0]);
const targetComponentA = parseNumericValue(globalParameters[1]);
const targetComponentB = parseNumericValue(globalParameters[2]);

// Process the remaining lines, each representing a compound's properties.
// Each compound is stored as an object for clarity.
const compoundDetails = rawInputLines.slice(1).map(lineContent => {
    const propertyValues = lineContent.split(' ').map(parseNumericValue);
    return {
        aVal: propertyValues[0], // Component A value
        bVal: propertyValues[1], // Component B value
        unitPrice: propertyValues[2] // Cost of this compound
    };
});

// --- Dynamic Programming Setup ---

// Define maximum possible values for individual compound components and price.
// These are problem constraints used to set DP table dimensions.
const MAX_A_PER_COMPOUND = 10;
const MAX_B_PER_COMPOUND = 10;
// const MAX_PRICE_PER_COMPOUND = 100; // Not directly used for dimensions, but good to know.

// Calculate the maximum possible accumulated A and B values.
// This defines the upper bounds for our DP table dimensions.
// It's the sum if all 'totalCompounds' had the maximum 'A' or 'B' value.
const maxPossibleSumA = totalCompounds * MAX_A_PER_COMPOUND;
const maxPossibleSumB = totalCompounds * MAX_B_PER_COMPOUND;

// Initialize a 3D dynamic programming table.
// `minCostsDP[i][a][b]` will store the minimum cost to achieve a total
// of `a` for component A and `b` for component B, using only the first `i` compounds.
// Dimensions: (totalCompounds + 1) for compound count (0 to totalCompounds),
// (maxPossibleSumA + 1) for accumulated A (0 to maxPossibleSumA),
// (maxPossibleSumB + 1) for accumulated B (0 to maxPossibleSumB).
const minCostsDP = Array.from({ length: totalCompounds + 1 }, () =>
    Array.from({ length: maxPossibleSumA + 1 }, () =>
        Array.from({ length: maxPossibleSumB + 1 }, () => UNATTAINABLE_COST_MARKER)
    )
);

// Base case for the DP: It costs 0 to achieve 0 A and 0 B by using no compounds.
minCostsDP[0][0][0] = 0;

// --- Dynamic Programming Calculation ---

// Iterate through each compound, from the first (index 0) up to `totalCompounds - 1`.
for (let currentCompoundIndex = 0; currentCompoundIndex < totalCompounds; currentCompoundIndex++) {
    // Extract properties of the current compound for easier access.
    const { aVal: currentAComponent, bVal: currentBComponent, unitPrice: currentCompoundPrice } = compoundDetails[currentCompoundIndex];

    // Reference to the DP row representing states *after* considering this compound.
    const currentStateRow = minCostsDP[currentCompoundIndex + 1];
    // Reference to the DP row representing states *before* considering this compound.
    const previousStateRow = minCostsDP[currentCompoundIndex];

    // Iterate through all possible accumulated A values.
    for (let currentAccumulatedA = 0; currentAccumulatedA <= maxPossibleSumA; currentAccumulatedA++) {
        // Iterate through all possible accumulated B values.
        for (let currentAccumulatedB = 0; currentAccumulatedB <= maxPossibleSumB; currentAccumulatedB++) {

            // Scenario 1: Do NOT include the current compound.
            // The minimum cost for `(currentAccumulatedA, currentAccumulatedB)`
            // is inherited from the state before considering this compound.
            currentStateRow[currentAccumulatedA][currentAccumulatedB] = previousStateRow[currentAccumulatedA][currentAccumulatedB];

            // Scenario 2: ATTEMPT to include the current compound.
            // This is only possible if the current accumulated A and B values
            // are large enough to 'contain' the components of the current compound.
            if (currentAccumulatedA >= currentAComponent && currentAccumulatedB >= currentBComponent) {
                // Calculate the A and B values that would have existed *before* adding this compound.
                const remainingA = currentAccumulatedA - currentAComponent;
                const remainingB = currentAccumulatedB - currentBComponent;

                // Get the cost to reach `(remainingA, remainingB)` using previous compounds.
                const costBeforeAddingCompound = previousStateRow[remainingA][remainingB];

                // If the state `(remainingA, remainingB)` was reachable, then adding
                // the current compound is a valid option.
                if (costBeforeAddingCompound !== UNATTAINABLE_COST_MARKER) {
                    const costWithCurrentCompound = costBeforeAddingCompound + currentCompoundPrice;
                    // Update the current state with the minimum of not including and including the compound.
                    currentStateRow[currentAccumulatedA][currentAccumulatedB] = Math.min(
                        currentStateRow[currentAccumulatedA][currentAccumulatedB],
                        costWithCurrentCompound
                    );
                }
            }
        }
    }
}

// --- Final Result Extraction ---

// Initialize the optimal cost to the unreachable marker.
let finalOptimalCost = UNATTAINABLE_COST_MARKER;

// Guard clause: Ensure target ratios are positive to avoid division by zero or illogical states.
// Assuming problem constraints guarantee positive ratios, but good for robustness.
if (targetComponentA <= 0 || targetComponentB <= 0) {
    console.log(-1);
    // In a function, one would return here. For a script, exit or just print.
} else {
    // The final row of the DP table contains all solutions after considering all compounds.
    const solutionsAfterAllCompounds = minCostsDP[totalCompounds];

    // Iterate through possible multiples `k` to find (k * targetComponentA, k * targetComponentB).
    let ratioMultiplier = 1;
    let currentTotalA = targetComponentA;
    let currentTotalB = targetComponentB;

    // Continue checking as long as the calculated total A and B values are within our DP table bounds.
    while (currentTotalA <= maxPossibleSumA && currentTotalB <= maxPossibleSumB) {
        const costForThisRatio = solutionsAfterAllCompounds[currentTotalA][currentTotalB];

        // If this specific (A, B) combination is reachable, update the overall optimal cost.
        if (costForThisRatio !== UNATTAINABLE_COST_MARKER) {
            finalOptimalCost = Math.min(finalOptimalCost, costForThisRatio);
        }

        // Increment the multiplier and calculate the next set of (A, B) values to check.
        ratioMultiplier++;
        currentTotalA = ratioMultiplier * targetComponentA;
        currentTotalB = ratioMultiplier * targetComponentB;
    }
}

// Output the final result. If no valid combination was found, print -1.
if (finalOptimalCost === UNATTAINABLE_COST_MARKER) {
    console.log(-1);
} else {
    console.log(finalOptimalCost);
}