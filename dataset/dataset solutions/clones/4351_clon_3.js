'use strict';

/**
 * Orchestrates the analysis of food mixture parameters to identify
 * the most concentrated sugar solution within specified constraints.
 * This function processes raw input data, calculates all possible
 * water and sugar mass combinations, filters them based on total
 * weight and solubility, and finally determines the optimal mixture.
 *
 * @param {string} rawInputData - A string containing space-separated
 *                                 integer parameters (A B C D E F).
 */
function analyzeFoodMixture(rawInputData) {

    // Helper function to calculate the percentage concentration of sugar in a mixture.
    // Prevents division by zero in cases of no total mass.
    const calculateConcentrationPercentage = (sugarMass, totalMass) => {
        if (totalMass === 0) {
            return 0; // No total mass means no concentration.
        }
        return (sugarMass / totalMass) * 100.0;
    };

    // --- Phase 1: Input Parsing and Parameter Initialization ---
    const dataLines = rawInputData.trim().split('\n');
    const paramLine = dataLines.shift(); // Extract the primary parameter line

    // Early exit if the input line is missing or empty.
    if (!paramLine) {
        console.log('0 0');
        return;
    }

    // Parse the space-separated parameters into an array of integers.
    const parsedParams = paramLine.split(' ').map(val => Number.parseInt(val, 10));

    // Validate the number of parameters.
    if (parsedParams.length !== 6) {
        console.error("Input Error: Expected exactly 6 numerical parameters (A B C D E F). Received: " + parsedParams.length);
        console.log('0 0'); // Output default result on critical input error.
        return;
    }

    // Assign parameters to clearly named constants for readability.
    const waterUnitAWeight = parsedParams[0]; // Grams of water per unit A (multiplied by 100 later)
    const waterUnitBWeight = parsedParams[1]; // Grams of water per unit B (multiplied by 100 later)
    const sugarUnitCWeight = parsedParams[2]; // Grams of sugar per unit C
    const sugarUnitDWeight = parsedParams[3]; // Grams of sugar per unit D
    const maxSolubilityE = parsedParams[4];   // Maximum E% sugar relative to water (e.g., if E=20, 20g sugar per 100g water)
    const overallMaxWeightF = parsedParams[5]; // Maximum total weight of the mixture allowed in grams

    // Calculate the maximum allowable sugar-to-total-mixture ratio.
    // This is derived from E% sugar *to water*. So if S/W = E/100, then S/(S+W) = E/(100+E).
    const maxConcentrationRatio = (1.0 * maxSolubilityE) / (100 + maxSolubilityE);

    // --- Phase 2: Generating Potential Water and Sugar Mass Combinations ---
    // Using Sets to store unique mass values, then converting to sorted arrays.
    const generatedWaterMasses = new Set();
    const generatedSugarMasses = new Set();

    // Pre-calculate common multipliers to optimize loops.
    const waterBatchWeightA = 100 * waterUnitAWeight;
    const waterBatchWeightB = 100 * waterUnitBWeight;

    // Iterate through possible units of water A and B.
    // The upper bound for iteration is chosen to ensure `currentWaterMass` doesn't exceed `overallMaxWeightF`.
    for (let countA = 0; (countA * waterBatchWeightA) <= overallMaxWeightF; ++countA) {
        for (let countB = 0; (countB * waterBatchWeightB) <= overallMaxWeightF; ++countB) {
            const currentWaterMass = (countA * waterBatchWeightA) + (countB * waterBatchWeightB);
            // Only add positive water masses within the overall weight limit.
            if (currentWaterMass > 0 && currentWaterMass <= overallMaxWeightF) {
                generatedWaterMasses.add(currentWaterMass);
            }
        }
    }

    // Iterate through possible units of sugar C and D.
    for (let countC = 0; (countC * sugarUnitCWeight) <= overallMaxWeightF; ++countC) {
        for (let countD = 0; (countD * sugarUnitDWeight) <= overallMaxWeightF; ++countD) {
            const currentSugarMass = (countC * sugarUnitCWeight) + (countD * sugarUnitDWeight);
            // Add sugar masses within the overall weight limit. Sugar mass can be 0.
            if (currentSugarMass <= overallMaxWeightF) {
                generatedSugarMasses.add(currentSugarMass);
            }
        }
    }

    // Convert sets to sorted arrays for efficient iteration and consistency.
    const sortedWaterMasses = Array.from(generatedWaterMasses).sort((a, b) => a - b);
    const sortedSugarMasses = Array.from(generatedSugarMasses).sort((a, b) => a - b);

    // --- Phase 3: Filtering Feasible Mixtures Based on Constraints ---
    const validMixtures = []; // Stores [waterMass, sugarMass] pairs that meet criteria.

    // Iterate over all generated water and sugar amounts to form mixtures.
    for (const waterMass of sortedWaterMasses) {
        for (const sugarMass of sortedSugarMasses) {
            const totalMixtureMass = waterMass + sugarMass;

            // Constraint 1: Total mixture mass must not exceed F.
            if (totalMixtureMass > overallMaxWeightF) {
                // Since `waterMass` and `sugarMass` are sorted, we could potentially
                // break inner loops for optimization, but for clarity, we proceed.
                continue;
            }

            // Constraint 2: Sugar concentration must not exceed E%.
            // Calculate the actual ratio of sugar to total mass.
            const currentConcentrationRatio = sugarMass / totalMixtureMass;

            if (currentConcentrationRatio > maxConcentrationRatio) {
                continue; // This mixture is too concentrated.
            }

            // If both constraints are satisfied, this is a valid mixture.
            validMixtures.push([waterMass, sugarMass]);
        }
    }

    // --- Phase 4: Identifying the Optimal Mixture (Highest Concentration) ---
    // Initialize the best found mixture to a default: max water, zero sugar.
    // This handles cases where no valid sugar solutions are found, defaulting to pure water.
    let optimalMixture = [overallMaxWeightF, 0];
    let highestConcentrationAchieved = calculateConcentrationPercentage(
        optimalMixture[1],
        optimalMixture[0] + optimalMixture[1]
    );

    // If there are valid mixtures, iterate to find the one with the highest concentration.
    if (validMixtures.length > 0) {
        for (const candidatePair of validMixtures) {
            const candidateWater = candidatePair[0];
            const candidateSugar = candidatePair[1];
            const candidateTotal = candidateWater + candidateSugar;

            const candidateConcentration = calculateConcentrationPercentage(candidateSugar, candidateTotal);

            // Update the optimal mixture if the current candidate is better (higher concentration).
            if (candidateConcentration > highestConcentrationAchieved) {
                highestConcentrationAchieved = candidateConcentration;
                optimalMixture = candidatePair;
            }
        }
    }

    // --- Phase 5: Outputting the Result ---
    // The problem asks for (Total Mass) + (Sugar Mass).
    const finalTotalMass = optimalMixture[0] + optimalMixture[1];
    const finalSugarMass = optimalMixture[1];

    console.log(`${finalTotalMass} ${finalSugarMass}`);
}

// Execute the analysis function with input read from standard input.
analyzeFoodMixture(require('fs').readFileSync('/dev/stdin', 'utf8'));