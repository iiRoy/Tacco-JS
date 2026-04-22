// This script processes raw input data to determine the optimal mixture of water and sugar.
// The goal is to maximize the sugar concentration while adhering to total weight capacity
// and a maximum allowed concentration percentage.

/**
 * Main entry point for the solution.
 * Reads input, performs calculations, and prints the result.
 * @param {string} rawInputText - The raw string input from the environment.
 */
function solveWaterSugarProblem(rawInputText) {
    // Helper function to generate sorted, unique combinations of two units up to a limit.
    // Ensures all generated amounts are positive.
    /**
     * Generates a sorted array of unique positive sums of `component1Unit * i + component2Unit * j`
     * up to a specified `limitWeight`.
     * @param {number} limitWeight - The maximum allowed total weight for combinations.
     * @param {number} component1Unit - The unit weight for the first component.
     * @param {number} component2Unit - The unit weight for the second component.
     * @returns {number[]} A sorted array of unique positive combination weights.
     */
    const createSortedUniqueCombinations = (limitWeight, component1Unit, component2Unit) => {
        const combinationsSet = new Set();
        // Loop for the first component's multiples
        for (let mult1 = 0; ; mult1++) {
            const currentVal1 = component1Unit * mult1;
            if (currentVal1 > limitWeight) break; // Exceeds total limit

            // Loop for the second component's multiples
            for (let mult2 = 0; ; mult2++) {
                const currentSum = currentVal1 + component2Unit * mult2;
                if (currentSum > limitWeight) break; // Exceeds total limit

                // Only consider positive amounts, as 0 water or 0 sugar is usually not a 'mixture'
                // in the context of concentration problems, though 0 sugar is a valid solution.
                if (currentSum > 0) {
                    combinationsSet.add(currentSum);
                }
            }
        }
        return Array.from(combinationsSet).sort((a, b) => a - b);
    };

    // 1. Input Parsing and Configuration Setup
    // Trim whitespace, split by newlines, and parse the first line of space-separated numbers.
    const [configValues] = rawInputText
        .trim()
        .split('\n')
        .map(line => line.split(' ').map(Number));

    // Destructure the parsed configuration values into meaningful variable names.
    // A and B are solvent units (water), C and D are solute units (sugar).
    // E is the maximum concentration percentage. F is the total capacity limit.
    const [
        baseWaterA,          // Base unit for water type A (e.g., 100g)
        baseWaterB,          // Base unit for water type B (e.g., 200g)
        baseSugarC,          // Base unit for sugar type C (e.g., 10g)
        baseSugarD,          // Base unit for sugar type D (e.g., 20g)
        maxConcentrationRate, // Maximum allowed sugar concentration in percent (e.g., 15 for 15%)
        totalCapacityLimit   // Total maximum weight of the solution (water + sugar)
    ] = configValues;

    // Scale water units by 100 as per problem specification (e.g., 100g water for 1 unit A)
    const scaledWaterUnitA = baseWaterA * 100;
    const scaledWaterUnitB = baseWaterB * 100;

    // 2. Generate all possible water amounts
    // These are combinations of scaledWaterUnitA and scaledWaterUnitB, not exceeding totalCapacityLimit.
    const possibleWaterAmounts = createSortedUniqueCombinations(
        totalCapacityLimit,
        scaledWaterUnitA,
        scaledWaterUnitB
    );

    // 3. Determine the maximum allowed sugar weight based on concentration limit and total capacity.
    // The formula is (F * E) / (100 + E). This is derived from:
    // sugar / (water + sugar) <= E / 100
    // sugar / total_weight <= E / 100
    // sugar <= total_weight * E / 100
    // Also, total_weight = water + sugar. Max sugar is when total_weight is max, and water is min.
    // max_sugar = max_water * E / 100
    // max_sugar + max_water = F
    // max_sugar + (max_sugar * 100 / E) = F
    // max_sugar * (1 + 100/E) = F
    // max_sugar * ((E+100)/E) = F
    // max_sugar = F * E / (100 + E)
    const maxAllowableSoluteWeight = Math.floor(
        totalCapacityLimit * maxConcentrationRate / (100 + maxConcentrationRate)
    );

    // 4. Generate all possible sugar amounts
    // These are combinations of baseSugarC and baseSugarD, not exceeding maxAllowableSoluteWeight.
    const possibleSoluteAmounts = createSortedUniqueCombinations(
        maxAllowableSoluteWeight,
        baseSugarC,
        baseSugarD
    );

    // 5. Create a boolean array (bitmap) for quick lookup of valid sugar amounts.
    // This allows O(1) checking if a specific sugar weight is constructible.
    const solutePresenceTracker = new Array(maxAllowableSoluteWeight + 1).fill(false);
    for (const sugarMass of possibleSoluteAmounts) {
        solutePresenceTracker[sugarMass] = true;
    }

    // 6. Initialize variables to track the best solution found so far.
    // We want to maximize concentration (sugar / water).
    let currentHighestConcentration = -1; // Initialize to -1 to ensure any valid solution (even 0% concentration) is picked.
    let bestOverallTotalWeight = 0;       // Total weight of the optimal solution (water + sugar).
    let bestOverallSoluteWeight = 0;      // Sugar weight of the optimal solution.

    // If no water amounts can be formed (e.g., totalCapacityLimit is too small),
    // the output should be 0 0. Otherwise, initialize with the smallest water amount and 0 sugar.
    if (possibleWaterAmounts.length > 0) {
        bestOverallTotalWeight = possibleWaterAmounts[0]; // Smallest possible water amount
        bestOverallSoluteWeight = 0;                      // With 0 sugar
        currentHighestConcentration = 0;                  // 0 concentration for 0 sugar
    }
    // If possibleWaterAmounts is empty, bestOverallTotalWeight and bestOverallSoluteWeight remain 0,
    // and currentHighestConcentration remains -1, leading to "0 0" output if no valid water is found.

    // 7. Iterate through all possible water amounts to find the optimal solution.
    for (const waterMass of possibleWaterAmounts) {
        // Calculate the maximum sugar mass that can be added to this `waterMass`.
        // This is limited by both the maximum concentration rate and the total capacity.
        const maxSugarForThisWater = Math.min(
            Math.floor(waterMass * maxConcentrationRate / 100), // Concentration limit
            totalCapacityLimit - waterMass                     // Total capacity limit
        );

        // If this water mass alone exceeds the total capacity, skip (should already be filtered by createSortedUniqueCombinations, but good guard).
        if (waterMass > totalCapacityLimit) continue;
        // If maxSugarForThisWater is negative, it means even 0 sugar exceeds capacity or concentration, so skip.
        if (maxSugarForThisWater < 0) continue;

        // Iterate through possible sugar amounts (sMass) from 0 up to `maxSugarForThisWater`.
        // This loop effectively searches for the best sugar amount for the current `waterMass`.
        for (let sMass = 0; sMass <= maxSugarForThisWater; sMass++) {
            // Check if this `sMass` is a valid, constructible sugar amount (using C and D units)
            // and if it hasn't been 'consumed' by a previous optimal solution (optimization from original problem).
            if (solutePresenceTracker[sMass]) {
                // Calculate the concentration for the current (waterMass, sMass) pair.
                const potentialConcentration = sMass / waterMass;

                // If this solution yields a higher concentration than the current best, update.
                if (potentialConcentration > currentHighestConcentration) {
                    currentHighestConcentration = potentialConcentration;
                    bestOverallTotalWeight = waterMass + sMass;
                    bestOverallSoluteWeight = sMass;
                    // Optimization: Once a sugar amount contributes to a new global best concentration,
                    // mark it as 'consumed'. This prevents it from being considered again if it
                    // would only form a less optimal solution with other water amounts later.
                    solutePresenceTracker[sMass] = false;
                }
            }
        }
    }

    // 8. Output the final optimal total weight and sugar weight.
    console.log(`${bestOverallTotalWeight} ${bestOverallSoluteWeight}`);
}

// Entry point for execution: Read input from standard input and pass to the solver.
// This assumes a Node.js environment or similar where 'fs' and 'readFileSync' are available.
solveWaterSugarProblem(require("fs").readFileSync("/dev/stdin", "utf8"));