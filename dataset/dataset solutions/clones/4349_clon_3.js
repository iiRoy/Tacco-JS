function ProcessMixtureOptimization(rawInputString) {
    // This function aims to find the optimal mixture of water and sugar components
    // to achieve the highest possible sugar concentration within a given budget
    // and solubility limit.

    // 1. Initial parsing and setup of input parameters.
    // The raw input string is split by spaces to extract individual numeric values.
    const parameterTokens = rawInputString.split(" ");

    // For robustness, one might add a check here for parameterTokens.length < 6
    // and handle potential errors or provide default values if input is malformed.
    // For this problem, we assume valid input is always provided.

    // Parse the input values, converting them to base-10 integers.
    // These represent unit costs/weights and various limits for the mixture.
    const waterComponentAUnitCost = parseInt(parameterTokens[0], 10); // Cost per unit of water type A
    const waterComponentBUnitCost = parseInt(parameterTokens[1], 10); // Cost per unit of water type B
    const sugarComponentCUnitCost = parseInt(parameterTokens[2], 10); // Cost per unit of sugar type C
    const sugarComponentDUnitCost = parseInt(parameterTokens[3], 10); // Cost per unit of sugar type D
    const maxPermissibleSolubilityRatio = parseInt(parameterTokens[4], 10); // Max sugar/water ratio (e.g., 15 for 15g sugar per 100g water)
    const totalFiscalBudget = parseInt(parameterTokens[5], 10); // The maximum total cost/weight allowed for the mixture

    // Pre-calculate scaled costs for water components.
    // Water components are typically measured in units that are 100 times their base cost for calculation.
    const scaledCostWaterA = waterComponentAUnitCost * 100;
    const scaledCostWaterB = waterComponentBUnitCost * 100;

    // Initialize variables to store the best solution found during the optimization process.
    // 'peakConcentrationPercentage' will hold the highest sugar concentration achieved.
    // 'finalTotalWeight' will store the total weight of the mixture corresponding to the peak concentration.
    // 'finalSugarWeight' will store the total sugar weight corresponding to the peak concentration.
    let peakConcentrationPercentage = 0;
    let finalTotalWeight = 0;
    let finalSugarWeight = 0;

    // Type III: Re-evaluating the initial condition from the original code.
    // The original code had a special case: `if (f - 100*a < c) { s1=100*a; s2=0; }`
    // This implies setting a default solution where only water component A is used, and no sugar,
    // if the budget is too constrained to even consider adding sugar component C to component A.
    // We integrate this by setting an initial default solution:
    // If at least one unit of water component A can be afforded, it serves as a baseline mixture (0% sugar).
    if (totalFiscalBudget >= scaledCostWaterA) {
        finalTotalWeight = scaledCostWaterA;
        finalSugarWeight = 0;
        // peakConcentrationPercentage remains 0, as there's no sugar.
    } else {
        // If even the smallest scaled water component A cannot be afforded,
        // it means no valid mixture can be formed, so the result defaults to 0 0.
        finalTotalWeight = 0;
        finalSugarWeight = 0;
    }

    // Type III: Introducing a helper function for clarity and to encapsulate calculation logic.
    // This function computes the sugar concentration as a percentage.
    const computeConcentration = (currentSugarMass, currentTotalMass) => {
        // Prevent division by zero if the total mixture mass is zero.
        // In such a case, the concentration is effectively zero.
        if (currentTotalMass === 0) {
            return 0;
        }
        return (currentSugarMass / currentTotalMass) * 100;
    };

    // Begin iterating through all possible combinations of component quantities.
    // The loops explore varying amounts of water components (i and j)
    // and sugar components (k and l) to find the optimal mixture.

    // Loop for units of water component A.
    for (let countWaterA = 0; ; countWaterA++) {
        const currentCostWaterA = countWaterA * scaledCostWaterA;
        // Optimization: Break early if adding more of water A exceeds the total budget.
        if (currentCostWaterA > totalFiscalBudget) break;

        // Loop for units of water component B.
        for (let countWaterB = 0; ; countWaterB++) {
            const currentCostWaterB = countWaterB * scaledCostWaterB;
            const currentCombinedWaterCost = currentCostWaterA + currentCostWaterB;

            // Optimization: Break early if adding more of water B (to water A) exceeds the budget.
            if (currentCombinedWaterCost > totalFiscalBudget) break;

            // Type III: Intermediate variable for clarity in solubility constraint.
            // This represents the "volume" of water, used in the solubility ratio.
            const totalWaterVolumeEquivalent = (countWaterA * waterComponentAUnitCost) + (countWaterB * waterComponentBUnitCost);

            // Loop for units of sugar component C.
            for (let countSugarC = 0; ; countSugarC++) {
                const currentCostSugarC = countSugarC * sugarComponentCUnitCost;
                const currentWaterAndSugarCCost = currentCombinedWaterCost + currentCostSugarC;
                // Optimization: Break early if current cost already exceeds budget.
                if (currentWaterAndSugarCCost > totalFiscalBudget) break;

                // Loop for units of sugar component D.
                for (let countSugarD = 0; ; countSugarD++) {
                    const currentCostSugarD = countSugarD * sugarComponentDUnitCost;
                    const currentTotalMixtureCost = currentWaterAndSugarCCost + currentCostSugarD;

                    // Final budget check for the entire mixture.
                    if (currentTotalMixtureCost > totalFiscalBudget) break;

                    // Calculate the total sugar weight and total mixture weight for this specific combination.
                    const currentSugarMass = currentCostSugarC + currentCostSugarD;
                    const currentTotalMass = currentTotalMixtureCost;

                    // Type III: Add a guard clause for an edge case.
                    // If there's no water (totalWaterVolumeEquivalent is 0) but there is sugar (currentSugarMass > 0),
                    // this represents an invalid state for solubility or a non-practical mixture.
                    // The problem implies sugar needs water to dissolve up to a limit.
                    if (totalWaterVolumeEquivalent === 0 && currentSugarMass > 0) {
                        continue; // Skip this combination, as it violates the context.
                    }

                    // Apply the solubility constraint: total sugar mass must not exceed
                    // the maximum permissible ratio multiplied by the total water volume equivalent.
                    // Original logic: `(k*c+l*d) <= (a*i+b*j)*e`
                    if (currentSugarMass <= (totalWaterVolumeEquivalent * maxPermissibleSolubilityRatio)) {
                        // Type III: Utilize the helper function to calculate concentration.
                        const currentMixtureConcentration = computeConcentration(currentSugarMass, currentTotalMass);

                        // If the current mixture's concentration is higher than the best found so far,
                        // update the optimal solution variables.
                        if (currentMixtureConcentration > peakConcentrationPercentage) {
                            peakConcentrationPercentage = currentMixtureConcentration;
                            finalTotalWeight = currentTotalMass;
                            finalSugarWeight = currentSugarMass;
                        }
                        // Note: If multiple combinations yield the same peak concentration,
                        // this logic (using `>`) will keep the first one encountered or the one
                        // that resulted in the current `peakConcentrationPercentage`.
                        // The original code behaves similarly.
                    }
                }
            }
        }
    }

    // Output the results in the specified format: total optimal weight and optimal sugar weight.
    console.log('%d %d', finalTotalWeight, finalSugarWeight);
}

// Type II: Renamed the function call and source of input data.
// Reads input from standard input (e.g., piped file or user input).
ProcessMixtureOptimization(require("fs").readFileSync("/dev/stdin", "utf8"));