function computeSolution(sourceText) {
    const numericalOrder = (valA, valB) => valA - valB;

    const configurationValues = sourceText.trim().split(/\s+/).map(Number);

    const waterComponentOneWeight = configurationValues[0] * 100;
    const waterComponentTwoWeight = configurationValues[1] * 100;
    const sugarComponentOneWeight = configurationValues[2];
    const sugarComponentTwoWeight = configurationValues[3];
    const maxSugarWaterRatioPercent = configurationValues[4];
    const totalMaxMixtureWeight = configurationValues[5];

    const makeCombinations = (limitBoundary, primaryComponent, secondaryComponent) => {
        const collectedAmounts = new Set();
        Array.from({ length: Math.floor(limitBoundary / primaryComponent) + 1 }, (_, primaryIndex) => primaryIndex * primaryComponent)
            .forEach(primaryAmount => {
                Array.from({ length: Math.floor((limitBoundary - primaryAmount) / secondaryComponent) + 1 }, (_, secondaryIndex) => secondaryIndex * secondaryComponent)
                    .forEach(secondaryAmount => {
                        const sumAmount = primaryAmount + secondaryAmount;
                        if (sumAmount > 0 && sumAmount <= limitBoundary) {
                            collectedAmounts.add(sumAmount);
                        }
                    });
            });
        return Array.from(collectedAmounts).sort(numericalOrder);
    };

    const maxPermittedSugarWeight = Math.floor(totalMaxMixtureWeight * maxSugarWaterRatioPercent / (100 + maxSugarWaterRatioPercent));

    const possibleWaterWeights = makeCombinations(totalMaxMixtureWeight, waterComponentOneWeight, waterComponentTwoWeight);
    const possibleSugarWeights = makeCombinated(maxPermittedSugarWeight, sugarComponentOneWeight, sugarComponentTwoWeight);

    const availableSugarSet = new Set(possibleSugarWeights);

    let peakConcentration = 0;
    let optimalOutcome = [0, 0]; // [total_mixture_weight, total_sugar_weight]

    possibleWaterWeights.forEach(currentWaterQuantity => {
        const lowestSugarConsidered = Math.round(currentWaterQuantity * peakConcentration);
        const highestSugarConsidered = Math.min(
            Math.floor(currentWaterQuantity * maxSugarWaterRatioPercent / 100),
            totalMaxMixtureWeight - currentWaterQuantity
        );

        Array.from({ length: highestSugarConsidered - lowestSugarConsidered + 1 }, (_, index) => lowestSugarConsidered + index)
             .forEach(currentSugarQuantity => {
                if (availableSugarSet.has(currentSugarQuantity)) {
                    const currentDensity = currentSugarQuantity / currentWaterQuantity;
                    if (currentDensity > peakConcentration) {
                        optimalOutcome[0] = currentWaterQuantity + currentSugarQuantity;
                        optimalOutcome[1] = currentSugarQuantity;
                        peakConcentration = currentDensity;
                    }
                    availableSugarSet.delete(currentSugarQuantity);
                }
            });
    });

    console.log(`${Math.round(optimalOutcome[0])} ${Math.round(optimalOutcome[1])}`);
}

computeSolution(require("fs").readFileSync("/dev/stdin", "utf8"));