const numericSort = (a, b) => a - b;

function* generateCombinations(unitOne, unitTwo, upperLimit) {
    for (let indexA = 0; ; ++indexA) {
        const currentSumA = unitOne * indexA;
        if (currentSumA > upperLimit) break;
        for (let indexB = 0; ; ++indexB) {
            const currentTotal = currentSumA + unitTwo * indexB;
            if (currentTotal > upperLimit) break;
            yield currentTotal;
        }
    }
}

function calculateOptimalMixture(inputData) {
    const dataLines = inputData.trim().split("\n");
    const initialParameters = dataLines[0].split(" ").map(Number);

    const waterComponentA = initialParameters[0] * 100;
    const waterComponentB = initialParameters[1] * 100;
    const sugarComponentC = initialParameters[2];
    const sugarComponentD = initialParameters[3];
    const maxConcentrationRatio = initialParameters[4];
    const overallCapacity = initialParameters[5];

    const potentialWaterAmounts = new Set();
    for (const amount of generateCombinations(waterComponentA, waterComponentB, overallCapacity)) {
        potentialWaterAmounts.add(amount);
    }
    const sortedWaterAmounts = Array.from(potentialWaterAmounts).sort(numericSort);

    const maxSugarPossible = Math.floor(overallCapacity * maxConcentrationRatio / (100 + maxConcentrationRatio));

    const availableSugarOptions = new Set();
    for (const amount of generateCombinations(sugarComponentC, sugarComponentD, maxSugarPossible)) {
        availableSugarOptions.add(amount);
    }

    let highestAchievedDensity = 0;
    let finalTotalWeight = 0;
    let finalSugarWeight = 0;

    for (const currentWaterQuantity of sortedWaterAmounts) {
        const upperSugarBound = Math.min(
            Math.floor(currentWaterQuantity * maxConcentrationRatio / 100),
            overallCapacity - currentWaterQuantity
        );

        const lowerSugarBound = Math.round(currentWaterQuantity * highestAchievedDensity);

        for (let currentSugarQuantity = lowerSugarBound; currentSugarQuantity <= upperSugarBound; ++currentSugarQuantity) {
            if (availableSugarOptions.has(currentSugarQuantity)) {
                const computedDensity = currentWaterQuantity === 0 ? NaN : (currentSugarQuantity / currentWaterQuantity);

                if (computedDensity >= highestAchievedDensity) {
                    finalTotalWeight = currentWaterQuantity + currentSugarQuantity;
                    finalSugarWeight = currentSugarQuantity;
                    highestAchievedDensity = computedDensity;
                }
                availableSugarOptions.delete(currentSugarQuantity);
            }
        }
    }

    if (finalSugarWeight === 0) {
        finalTotalWeight = waterComponentA;
    }

    console.log("%d %d", Math.round(finalTotalWeight), Math.round(finalSugarWeight));
}

calculateOptimalMixture(require("fs").readFileSync("/dev/stdin", "utf8"));
