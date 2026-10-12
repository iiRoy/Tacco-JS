function processSolution(inputString) {
    const [initialA, initialB, initialC, initialD, initialE, initialF] = inputString.trim().split("\n")[0].split(" ").map(Number);

    const waterUnitA = initialA * 100;
    const waterUnitB = initialB * 100;
    const sugarUnitC = initialC;
    const sugarUnitD = initialD;
    const maxConcentrationRatio = initialE / 100;
    const maxTotalWeight = initialF;

    function* generateCombinations(unit1, unit2, limit) {
        for (let i = 0; ; ++i) {
            const currentAmount1 = unit1 * i;
            if (currentAmount1 > limit) break;
            for (let j = 0; ; ++j) {
                const currentTotalAmount = currentAmount1 + unit2 * j;
                if (currentTotalAmount > limit) break;
                yield currentTotalAmount;
            }
        }
    }

    const possibleWaterAmounts = Array.from(new Set(generateCombinations(waterUnitA, waterUnitB, maxTotalWeight)))
                                      .sort((x, y) => x - y);

    const maxSugarAllowedByConcentration = Math.floor(maxTotalWeight * maxConcentrationRatio / (1 + maxConcentrationRatio));

    const availableSugarAmounts = new Set(generateCombinations(sugarUnitC, sugarUnitD, maxSugarAllowedByConcentration));

    const optimalSolution = possibleWaterAmounts.reduce((accumulator, currentWaterWeight) => {
        const upperSugarBound = Math.min(
            Math.floor(currentWaterWeight * maxConcentrationRatio),
            maxTotalWeight - currentWaterWeight
        );

        const lowerSugarBound = Math.round(currentWaterWeight * accumulator.bestDensity);

        for (let currentSugarWeight = lowerSugarBound; currentSugarWeight <= upperSugarBound; ++currentSugarWeight) {
            if (availableSugarAmounts.has(currentSugarWeight)) {
                const currentDensity = currentSugarWeight / currentWaterWeight;

                if (currentDensity >= accumulator.bestDensity) {
                    accumulator.bestDensity = currentDensity;
                    accumulator.totalWeight = currentWaterWeight + currentSugarWeight;
                    accumulator.sugarWeight = currentSugarWeight;
                }
                availableSugarAmounts.delete(currentSugarWeight);
            }
        }
        return accumulator;
    }, { bestDensity: 0, totalWeight: 0, sugarWeight: 0 });

    console.log("%d %d", Math.round(optimalSolution.totalWeight), Math.round(optimalSolution.sugarWeight));
}

processSolution(require("fs").readFileSync("/dev/stdin", "utf8"));
