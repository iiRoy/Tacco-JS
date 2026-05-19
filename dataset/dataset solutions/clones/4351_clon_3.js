'use strict';

// Helper function to calculate sugar concentration as a percentage.
// Returns 0 if totalMass is zero to prevent NaN, as a mixture with 0 total mass
// cannot have a meaningful concentration and is typically invalid in this context.
const calculateSugarConcentration = (sugarMass, totalMass) => {
    if (totalMass === 0) {
        return 0;
    }
    return (sugarMass / totalMass) * 100;
};

// Main function to process the input data and find the optimal mixture.
function processInputData(rawData) {
    const inputLines = rawData.split('\n');

    // Parse the six parameters from the first line using destructuring and Number conversion.
    const [paramA, paramB, paramC, paramD, paramE, paramF] = inputLines.shift().split(' ').map(Number);

    // --- Step 1: Generate all possible water and sugar amounts based on scoop combinations ---
    // Using Sets to automatically store only unique amounts, then converting to sorted arrays.
    const generatedWaterAmounts = new Set();
    const generatedSugarAmounts = new Set();

    // The maximum number of scoops for A/C and B/D is limited by the total capacity F.
    // The original code uses F as a loose upper bound for loop counters, which is preserved.
    const maxScoopIndex = paramF;

    for (let scoopA_count = 0; scoopA_count <= maxScoopIndex; scoopA_count++) {
        for (let scoopB_count = 0; scoopB_count <= maxScoopIndex; scoopB_count++) {
            // Calculate current water volume (in grams, 100g per unit A/B)
            const currentWaterVolume = (paramA * scoopA_count + paramB * scoopB_count) * 100;
            // Add to set if within total capacity and non-negative
            if (currentWaterVolume <= paramF && currentWaterVolume >= 0) {
                generatedWaterAmounts.add(currentWaterVolume);
            }

            // Calculate current sugar mass (in grams, C/D grams per unit)
            const currentSugarMass = paramC * scoopA_count + paramD * scoopB_count;
            // Add to set if within total capacity and non-negative
            if (currentSugarMass <= paramF && currentSugarMass >= 0) {
                generatedSugarAmounts.add(currentSugarMass);
            }
        }
    }

    // Convert sets to sorted arrays for consistent iteration order and potential efficiency.
    const possibleWaterVolumes = Array.from(generatedWaterAmounts).sort((a, b) => a - b);
    const possibleSugarMasses = Array.from(generatedSugarAmounts).sort((a, b) => a - b);

    // --- Step 2: Filter for valid mixtures based on total mass and solubility limit ---
    // Pre-calculate the maximum allowed sugar concentration ratio.
    const maxSolubilityRatio = (paramE * 100) / (100 + paramE);

    // Helper function to check if a given water and sugar combination forms a valid mixture.
    const isValidMixture = (waterAmount, sugarAmount, totalCapacity, maxConcentration) => {
        const totalMixtureMass = waterAmount + sugarAmount;
        // A mixture with zero total mass is not considered valid for concentration calculation.
        if (totalMixtureMass === 0) {
            return false;
        }
        // Check if total mass exceeds the container capacity.
        if (totalMixtureMass > totalCapacity) {
            return false;
        }

        // Calculate the current sugar concentration and check against the solubility limit.
        const currentConcentration = calculateSugarConcentration(sugarAmount, totalMixtureMass);
        return currentConcentration <= maxConcentration;
    };

    const candidateMixtures = [];
    // Iterate through all possible water and sugar combinations.
    for (const waterVol of possibleWaterVolumes) {
        for (const sugarMass of possibleSugarMasses) {
            if (isValidMixture(waterVol, sugarMass, paramF, maxSolubilityRatio)) {
                candidateMixtures.push([waterVol, sugarMass]);
            }
        }
    }

    // --- Step 3: Find the best mixture (highest sugar concentration) ---
    // Initialize the optimal mixture. The problem implies that [F, 0] (max water, 0 sugar)
    // is a valid default if no other mixtures are found or if it's the best.
    let optimalMixture = [paramF, 0];

    // If there are valid candidate mixtures, use Array.prototype.reduce to find the one
    // with the highest sugar concentration.
    if (candidateMixtures.length > 0) {
        optimalMixture = candidateMixtures.reduce((currentBest, nextCandidate) => {
            const [currentBestWater, currentBestSugar] = currentBest;
            const [nextCandidateWater, nextCandidateSugar] = nextCandidate;

            // Calculate concentrations for both the current best and the next candidate.
            const currentBestConcentration = calculateSugarConcentration(currentBestSugar, currentBestWater + currentBestSugar);
            const nextCandidateConcentration = calculateSugarConcentration(nextCandidateSugar, nextCandidateWater + nextCandidateSugar);

            // If the next candidate has a strictly higher concentration, it becomes the new best.
            // If concentrations are equal, the earlier one (currentBest) is retained, preserving original behavior.
            if (nextCandidateConcentration > currentBestConcentration) {
                return nextCandidate;
            } else {
                return currentBest;
            }
        }, optimalMixture); // Start reduction with the initial optimalMixture.
    }

    // --- Final Output ---
    // Output the total mass (water + sugar) and the sugar mass of the optimal mixture.
    const finalTotalMass = optimalMixture[0] + optimalMixture[1];
    const finalSugarMass = optimalMixture[1];
    console.log(`${finalTotalMass} ${finalSugarMass}`);
}

// Read input from stdin and pass it to the processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
