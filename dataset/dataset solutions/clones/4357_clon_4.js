const ingestData = (payload) => {
    const dataRows = payload.trim().split("\n");
    const numericTokens = dataRows[0].split(" ").map(Number);
    return {
        unitWaterA: numericTokens[0] * 100,
        unitWaterB: numericTokens[1] * 100,
        unitSugarC: numericTokens[2],
        unitSugarD: numericTokens[3],
        maxConcentrationPercentage: numericTokens[4],
        totalWeightLimit: numericTokens[5],
    };
};

const formMassCombinations = (firstComponent, secondComponent, upperBoundary) => {
    const massCollection = new Set();
    const firstComponentRange = Array.from({ length: Math.floor(upperBoundary / firstComponent) + 1 }, (_, idx) => idx * firstComponent);

    firstComponentRange.forEach(massA => {
        const remainingCapacity = upperBoundary - massA;
        const secondComponentRange = Array.from({ length: Math.floor(remainingCapacity / secondComponent) + 1 }, (_, idx) => idx * secondComponent);
        secondComponentRange.forEach(massB => {
            massCollection.add(massA + massB);
        });
    });
    return Array.from(massCollection).sort((val1, val2) => val1 - val2);
};

const deriveMaxSugarAllowance = (overallCap, concentrationFactor) => Math.floor(overallCap * concentrationFactor / (100 + concentrationFactor));

const evaluateMixtureOptions = (sourceData) => {
    const params = ingestData(sourceData);

    const possibleWaterAmounts = formMassCombinations(
        params.unitWaterA,
        params.unitWaterB,
        params.totalWeightLimit
    );

    const maximumSugarMass = deriveMaxSugarAllowance(
        params.totalWeightLimit,
        params.maxConcentrationPercentage
    );

    const possibleSugarAmounts = formMassCombinations(
        params.unitSugarC,
        params.unitSugarD,
        maximumSugarMass
    );

    const availableSugarRegistry = new Set(possibleSugarAmounts);

    let currentBestDensity = 0;
    let bestResultPair = [0, 0];

    possibleWaterAmounts.forEach(currentWaterMass => {
        const sugarUpperLimitForWater = Math.min(
            Math.floor(currentWaterMass * params.maxConcentrationPercentage / 100),
            params.totalWeightLimit - currentWaterMass
        );
        
        const initialSugarSearchValue = Math.ceil(currentWaterMass * currentBestDensity);

        const sugarCandidatesRange = Array.from(
            { length: Math.max(0, sugarUpperLimitForWater - initialSugarSearchValue + 1) },
            (_, offset) => initialSugarSearchValue + offset
        );

        sugarCandidatesRange.forEach(candidateSugarMass => {
            if (availableSugarRegistry.has(candidateSugarMass)) {
                const candidateDensity = candidateSugarMass / currentWaterMass;
                if (candidateDensity > currentBestDensity) {
                    currentBestDensity = candidateDensity;
                    bestResultPair[0] = currentWaterMass + candidateSugarMass;
                    bestResultPair[1] = candidateSugarMass;
                }
                availableSugarRegistry.delete(candidateSugarMass);
            }
        });
    });

    console.log("%d %d", bestResultPair[0], bestResultPair[1]);
};

evaluateMixtureOptions(require("fs").readFileSync("/dev/stdin", "utf8"));