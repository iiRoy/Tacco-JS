function processInputData(rawInputString) {
    // Helper function for sorting numbers in ascending order
    // Uses modern arrow function syntax for conciseness
    const numericSortAsc = (valA, valB) => valA - valB;

    // --- Input Processing and Validation ---

    // Ensure input data is not empty or malformed
    if (!rawInputString || rawInputString.trim() === '') {
        // In a production environment, this might throw an error or use a default
        console.error("Error: Input data is empty or invalid.");
        return; 
    }
    
    // Split input into lines and parse the first line for parameters
    const dataLines = rawInputString.trim().split("\n");
    if (dataLines.length === 0) {
        console.error("Error: No data lines found in input.");
        return;
    }

    // Destructure parameters from the first line after parsing them as integers
    const [paramA, paramB, paramC, paramD, paramE, paramF] = dataLines[0].split(" ").map(val => parseInt(val, 10));

    // Extensive input validation for all parsed numerical parameters
    if (isNaN(paramA) || isNaN(paramB) || isNaN(paramC) || isNaN(paramD) || isNaN(paramE) || isNaN(paramF)) {
        console.error("Error: One or more input parameters are not valid numbers.");
        return;
    }
    if (paramA <= 0 || paramB <= 0 || paramC <= 0 || paramD <= 0 || paramF <= 0) {
        console.error("Error: Water/solute unit amounts (A, B, C, D) or total weight limit (F) must be positive integers.");
        return;
    }
    if (paramE < 0 || paramE > 100) {
        console.error("Error: Solubility percentage (E) must be between 0 and 100 (inclusive).");
        return;
    }

    // Scale water units by 100 as per problem specification (e.g., grams to centigrams)
    const primaryWaterUnit = paramA * 100;      // Corresponds to A * 100
    const secondaryWaterUnit = paramB * 100;    // Corresponds to B * 100
    const primarySoluteUnit = paramC;           // Corresponds to C
    const secondarySoluteUnit = paramD;         // Corresponds to D
    const maximumSolubilityPercent = paramE;    // Corresponds to E
    const totalWeightLimit = paramF;            // Corresponds to F

    // --- Generate Possible Water Amounts ---

    // Use a Set to automatically handle deduplication of water amounts
    const potentialWaterAmounts = new Set();
    let currentWaterCombinationSum;

    // Iterate through multiples of primaryWaterUnit
    for (let countPrimaryWater = 0; ; countPrimaryWater++) {
        currentWaterCombinationSum = primaryWaterUnit * countPrimaryWater;
        // Optimization: if current sum already exceeds total weight limit, no further combinations are possible
        if (currentWaterCombinationSum > totalWeightLimit) break;

        // Iterate through multiples of secondaryWaterUnit, adding to the current combination
        for (let countSecondaryWater = 0; ; countSecondaryWater++) {
            const compositeWaterAmount = currentWaterCombinationSum + secondaryWaterUnit * countSecondaryWater;
            // Optimization: if composite amount exceeds total weight limit, break inner loop
            if (compositeWaterAmount > totalWeightLimit) break;
            
            // Only add positive water amounts to avoid a zero-water scenario (unless specifically allowed)
            if (compositeWaterAmount > 0) {
                potentialWaterAmounts.add(compositeWaterAmount);
            }
        }
    }
    
    // Convert the Set to an Array and sort it numerically for ordered processing
    const sortedAvailableWaterAmounts = Array.from(potentialWaterAmounts).sort(numericSortAsc);

    // --- Calculate Maximum Allowed Solute Weight ---

    // This calculation determines the absolute maximum solute that can exist in the mixture
    // given the totalWeightLimit and maximumSolubilityPercent.
    // The formula is derived from: Solute / (Total - Solute) <= E / 100
    // => Solute <= E * Total / (100 + E)
    const absoluteMaxSoluteWeight = Math.floor(totalWeightLimit * maximumSolubilityPercent / (100 + maximumSolubilityPercent));

    // --- Generate Possible Solute Amounts ---

    // Use a Set for deduplication of solute amounts, similar to water amounts
    const potentialSoluteAmounts = new Set();
    let currentSoluteCombinationSum;

    // Iterate through multiples of primarySoluteUnit
    for (let countPrimarySolute = 0; ; countPrimarySolute++) {
        currentSoluteCombinationSum = primarySoluteUnit * countPrimarySolute;
        // Optimization: if current sum exceeds absoluteMaxSoluteWeight, break
        if (currentSoluteCombinationSum > absoluteMaxSoluteWeight) break;

        // Iterate through multiples of secondarySoluteUnit, adding to the current combination
        for (let countSecondarySolute = 0; ; countSecondarySolute++) {
            const compositeSoluteAmount = currentSoluteCombinationSum + secondarySoluteUnit * countSecondarySolute;
            // Optimization: if composite amount exceeds absoluteMaxSoluteWeight, break inner loop
            if (compositeSoluteAmount > absoluteMaxSoluteWeight) break;
            
            // Add to the set (0 solute is a valid amount)
            potentialSoluteAmounts.add(compositeSoluteAmount);
        }
    }
    
    // Convert the Set to an Array and sort it
    const sortedAvailableSoluteAmounts = Array.from(potentialSoluteAmounts).sort(numericSortAsc);

    // --- Create a Quick Lookup Map for Solute Presence ---

    // Initialize a boolean array for efficient checking if a solute amount is possible.
    // The size is absoluteMaxSoluteWeight + 1 to include 0 up to absoluteMaxSoluteWeight.
    // Using `false` as default and `true` for available amounts.
    const soluteAvailabilityMap = Array(absoluteMaxSoluteWeight + 1).fill(false);
    for (const soluteVal of sortedAvailableSoluteAmounts) {
        soluteAvailabilityMap[soluteVal] = true;
    }

    // --- Main Logic: Find Optimal Mixture ---

    // Initialize variables to track the best solution found so far
    let currentMaxDensityRatio = -1.0; // Start with a value guaranteed to be lower than any valid density
    let finalOptimalTotalWeight = 0;
    let finalOptimalSoluteWeight = 0;

    // Iterate through each possible water amount
    for (const waterMass of sortedAvailableWaterAmounts) {
        // Calculate the maximum solute that can be dissolved in `waterMass` based on solubility (E)
        // Solute / Water <= E / 100  =>  Solute <= Water * E / 100
        const maxSoluteBySolubility = Math.floor(waterMass * maximumSolubilityPercent / 100);

        // Calculate the maximum solute that can be added without exceeding the totalWeightLimit (F)
        // Water + Solute <= F  =>  Solute <= F - Water
        const maxSoluteByTotalWeightLimit = totalWeightLimit - waterMass;

        // The actual upper bound for solute for the current waterMass is the minimum of these two constraints
        const effectiveSoluteUpperBound = Math.min(maxSoluteBySolubility, maxSoluteByTotalWeightLimit);

        // Calculate the lower bound for solute. We only need to check solute amounts
        // that could potentially yield a density equal to or higher than the current best.
        // Math.floor(waterMass * currentMaxDensityRatio) gives the minimum solute needed.
        const minimumSoluteForHigherDensity = Math.floor(waterMass * currentMaxDensityRatio);
        // Ensure the lower bound is not negative
        const effectiveSoluteLowerBound = Math.max(0, minimumSoluteForHigherDensity);

        // Iterate through possible solute amounts within the determined bounds
        for (let soluteMass = effectiveSoluteLowerBound; 
             soluteMass <= effectiveSoluteUpperBound && soluteMass <= absoluteMaxSoluteWeight; 
             soluteMass++) {

            // Check if this solute amount is valid and still available (not 'consumed')
            if (soluteAvailabilityMap[soluteMass]) {
                const calculatedDensityRatio = soluteMass / waterMass;

                // If a new higher density is found, or an equal density with potentially a better total weight (due to sorted water amounts)
                // The original code uses `>=` which means if densities are equal, it takes the combination encountered last.
                // Since water amounts are sorted ascending, this implies it prefers larger water amounts for the same density.
                // However, the `soluteAvailabilityMap[soluteMass] = false;` makes this more complex: it means a solute mass is consumed.
                // Thus, for a given soluteMass, it will be paired with the *first* (smallest) waterMass that yields a candidate.
                if (calculatedDensityRatio >= currentMaxDensityRatio) {
                    currentMaxDensityRatio = calculatedDensityRatio;
                    finalOptimalTotalWeight = waterMass + soluteMass;
                    finalOptimalSoluteWeight = soluteMass;
                }
                // Mark this solute amount as 'consumed' to prevent its reuse.
                // This is a critical functional aspect of the original algorithm.
                soluteAvailabilityMap[soluteMass] = false;
            }
        }
    }

    // --- Final Output Determination ---

    // Fallback scenario: If no solute could be successfully combined to form a solution
    // (meaning finalOptimalSoluteWeight remains 0), the answer defaults to the smallest
    // possible water amount (primaryWaterUnit) with 0 solute.
    if (finalOptimalSoluteWeight === 0) {
        finalOptimalTotalWeight = primaryWaterUnit;
        finalOptimalSoluteWeight = 0;
    }

    // Output the final optimal total weight and solute weight, rounded to the nearest integer
    console.log(`${Math.round(finalOptimalTotalWeight)} ${Math.round(finalOptimalSoluteWeight)}`);
}

// Entry point for script execution: reads input from standard input and passes to the main function
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));