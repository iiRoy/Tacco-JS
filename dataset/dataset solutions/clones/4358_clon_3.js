const processConcentrationProblem = (problemInputString) => {
    // Helper function for sorting numbers in ascending order.
    // This ensures consistent ordering of generated mass combinations.
    const sortNumbersAscending = (valA, valB) => valA - valB;

    // A utility to safely convert string to integer, defaulting to 0 if invalid.
    const safeParseInt = (str) => {
        const num = parseInt(str, 10);
        return isNaN(num) ? 0 : num;
    };

    // Pre-process the raw input string: trim whitespace, split into lines,
    // then split each line by space. The first line contains the critical parameters.
    const parsedInputLines = problemInputString
        .trim()
        .split('\n')
        .map(line => line.split(' '));

    // Extract and parse initial configuration values from the first line.
    // A and B are given in grams but handled as 100-gram units internally.
    const primaryParameters = parsedInputLines[0].map(safeParseInt);

    const solventComponent1UnitWeight = primaryParameters[0] * 100; // A in 100g units
    const solventComponent2UnitWeight = primaryParameters[1] * 100; // B in 100g units
    const soluteComponent1UnitWeight = primaryParameters[2];     // C in grams
    const soluteComponent2UnitWeight = primaryParameters[3];     // D in grams
    const maxSolubilityPercentage = primaryParameters[4];        // E as percentage
    const totalSolutionCapacity = primaryParameters[5];          // F in grams

    // Basic validation: Ensure total capacity is positive.
    if (totalSolutionCapacity <= 0) {
        console.log("0 0"); // No solution possible if capacity is zero or negative
        return;
    }

    // Helper function to generate unique combinations of masses from two components.
    // It takes a maximum allowed total mass and the unit weights of two components.
    const generateUniqueMassCombinations = (maximumTotal, unit1, unit2) => {
        const generatedMasses = new Set(); // Use a Set for automatic uniqueness
        let currentUnit1Mass;

        // Iterate through possible multiples of the first component
        for (let i = 0; ; i++) {
            currentUnit1Mass = unit1 * i;
            if (currentUnit1Mass > maximumTotal) {
                break; // Exceeds total capacity
            }
            // Iterate through possible multiples of the second component
            for (let j = 0; ; j++) {
                const currentTotalMass = currentUnit1Mass + unit2 * j;
                if (currentTotalMass > maximumTotal) {
                    break; // Exceeds total capacity
                }
                if (currentTotalMass > 0) { // Only consider positive masses
                    generatedMasses.add(currentTotalMass);
                }
            }
        }
        // Convert Set to Array, sort, and return.
        return Array.from(generatedMasses).sort(sortNumbersAscending);
    };

    // Generate all possible solvent amounts (A*i + B*j) within the total capacity F.
    const possibleSolventAmounts = generateUniqueMassCombinations(
        totalSolutionCapacity,
        solventComponent1UnitWeight,
        solventComponent2UnitWeight
    );

    // Calculate the absolute maximum amount of solute that can be dissolved in a solution
    // with total mass F, given solubility E. This is derived from:
    // Solute / (Solvent + Solute) <= E / (100 + E)
    // Solute / F <= E / (100 + E)
    // Solute <= F * E / (100 + E)
    const maxSolutePossible = Math.floor(
        (totalSolutionCapacity * maxSolubilityPercentage) / (100 + maxSolubilityPercentage)
    );

    // Generate all possible solute amounts (C*i + D*j) up to the maximum possible solute.
    const possibleSoluteAmounts = generateUniqueMassCombinations(
        maxSolutePossible,
        soluteComponent1UnitWeight,
        soluteComponent2UnitWeight
    );

    // Create a boolean lookup array for efficient checking of valid solute amounts.
    // This acts as a "bitmap" where `true` at an index means that amount of solute is possible.
    const isValidSoluteAmount = new Array(maxSolutePossible + 1).fill(false);
    for (const soluteMass of possibleSoluteAmounts) {
        if (soluteMass <= maxSolutePossible) { // Ensure within bounds
            isValidSoluteAmount[soluteMass] = true;
        }
    }

    // Initialize variables to track the best solution found so far.
    let highestConcentrationRatio = 0; // Represents Solute / Solvent
    let bestSolutionMasses = [0, 0]; // [Total Mass, Solute Mass]

    // Iterate through each possible solvent amount.
    for (const currentSolventMass of possibleSolventAmounts) {
        // Calculate the upper bound for the solute mass for the current solvent.
        // It's the minimum of:
        // 1. The maximum solute that can be dissolved in `currentSolventMass` according to solubility `E`.
        //    (currentSolute / currentSolventMass) <= E / 100  => currentSolute <= currentSolventMass * E / 100
        // 2. The remaining capacity in the total solution after `currentSolventMass` is used.
        const currentSoluteUpperBound = Math.min(
            Math.floor((currentSolventMass * maxSolubilityPercentage) / 100),
            totalSolutionCapacity - currentSolventMass,
            maxSolutePossible // Also bounded by the absolute max solute possible
        );

        // If the current solvent mass already exceeds total capacity, skip it.
        if (currentSolventMass >= totalSolutionCapacity) {
            continue;
        }

        // Determine a lower bound for the solute search to optimize.
        // If we already found a solution, we only need to search for solute amounts
        // that could potentially yield a *better* or equal concentration.
        // `solute / solvent >= highestConcentrationRatio` => `solute >= solvent * highestConcentrationRatio`
        const currentSoluteLowerBound = Math.ceil(currentSolventMass * highestConcentrationRatio);

        // Iterate through possible solute amounts, from the optimized lower bound up to the upper bound.
        for (let currentSoluteMass = currentSoluteLowerBound; currentSoluteMass <= currentSoluteUpperBound; currentSoluteMass++) {
            // Check if this `currentSoluteMass` is a valid combination from C and D.
            if (isValidSoluteAmount[currentSoluteMass]) {
                // Ensure the solvent mass is not zero to avoid division by zero.
                if (currentSolventMass === 0) {
                    continue; // This case should ideally not happen if A, B > 0
                }

                const currentConcentration = currentSoluteMass / currentSolventMass;

                // If the current concentration is higher than or equal to the best found so far,
                // update the best solution. We use `>=` to prefer solutions with higher total mass
                // if concentrations are equal (as per typical competitive programming problem requirements).
                if (currentConcentration >= highestConcentrationRatio) {
                    highestConcentrationRatio = currentConcentration;
                    bestSolutionMasses[0] = currentSolventMass + currentSoluteMass; // Total mass
                    bestSolutionMasses[1] = currentSoluteMass;                   // Solute mass
                }
            }
        }
    }

    // Output the final result: total mass and solute mass of the optimal solution.
    // Rounding is applied as a safety measure for potential floating-point inaccuracies,
    // though the masses themselves should be integers.
    console.log(`${Math.round(bestSolutionMasses[0])} ${Math.round(bestSolutionMasses[1])}`);
};

// Entry point for the program: read input from stdin and pass to the main processing function.
processConcentrationProblem(require("fs").readFileSync("/dev/stdin", "utf8"));