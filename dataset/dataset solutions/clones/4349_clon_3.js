function ProcessInput(rawData) {
    const parsedValues = rawData.split(" ");

    const waterUnitA = parseInt(parsedValues[0], 10);
    const waterUnitB = parseInt(parsedValues[1], 10);
    const soluteUnitC = parseInt(parsedValues[2], 10);
    const soluteUnitD = parseInt(parsedValues[3], 10);
    const solubilityFactor = parseInt(parsedValues[4], 10);
    const maxCapacity = parseInt(parsedValues[5], 10);

    let maxConcentrationRatio = 0;
    let optimalTotalWeight = 0;
    let optimalSoluteWeight = 0;

    // Pre-calculate base weights for water units
    const waterWeightPerUnitA = 100 * waterUnitA;
    const waterWeightPerUnitB = 100 * waterUnitB;

    // Helper function to update optimal values if a better concentration is found
    const checkAndOptimizeConcentration = (currentWaterMass, currentSoluteMass) => {
        const currentTotalMass = currentWaterMass + currentSoluteMass;

        // Only proceed if total mass is positive to avoid division by zero (NaN concentration)
        if (currentTotalMass > 0) {
            // Check solubility condition: solute_mass <= (water_mass / 100) * solubility_factor
            // This is equivalent to (k*c+l*d) <= (a*i+b*j)*e from the original logic
            if (currentSoluteMass <= (currentWaterMass / 100) * solubilityFactor) {
                const currentConcentration = (100 * currentSoluteMass) / currentTotalMass;
                if (currentConcentration > maxConcentrationRatio) {
                    maxConcentrationRatio = currentConcentration;
                    optimalTotalWeight = currentTotalMass;
                    optimalSoluteWeight = currentSoluteMass;
                }
            }
        }
    };

    // Initial check: If total capacity is too small to even add the smallest solute (soluteUnitC)
    // to the smallest water amount (waterWeightPerUnitA).
    // Original condition: f - 100*a < c  =>  f < 100*a + c
    const minimumFeasibleTotalWeight = waterWeightPerUnitA + soluteUnitC;
    if (maxCapacity < minimumFeasibleTotalWeight) {
        optimalTotalWeight = waterWeightPerUnitA;
        optimalSoluteWeight = 0;
    } else {
        // Iterate through combinations of water and solute
        for (let idxA = 0; ; idxA++) {
            const currentWaterMassA = idxA * waterWeightPerUnitA;
            if (currentWaterMassA > maxCapacity) { // If current water mass alone exceeds capacity, break
                break;
            }

            for (let idxB = 0; ; idxB++) {
                const currentWaterMass = currentWaterMassA + idxB * waterWeightPerUnitB;
                if (currentWaterMass > maxCapacity) { // If current total water mass exceeds capacity, break
                    break;
                }

                for (let idxC = 0; ; idxC++) {
                    const currentSoluteMassC = idxC * soluteUnitC;
                    const currentWaterAndSoluteMassC = currentWaterMass + currentSoluteMassC;
                    if (currentWaterAndSoluteMassC > maxCapacity) { // If water + solute C exceeds capacity, break
                        break;
                    }

                    for (let idxD = 0; ; idxD++) {
                        const currentSoluteMass = currentSoluteMassC + idxD * soluteUnitD;
                        const currentTotalMass = currentWaterMass + currentSoluteMass;

                        if (currentTotalMass > maxCapacity) { // If total mass exceeds capacity, break
                            break;
                        }

                        // Evaluate the current combination using the helper function
                        checkAndOptimizeConcentration(currentWaterMass, currentSoluteMass);
                    }
                }
            }
        }
    }

    console.log('%s %d', optimalTotalWeight, optimalSoluteWeight);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
