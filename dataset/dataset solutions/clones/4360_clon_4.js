function processInputContent(rawText) {
    const lines = rawText.trim().split("\n");
    const numericParameters = lines[0].split(" ").map(Number);

    const executionConfig = {
        primaryLiquidUnit: numericParameters[0] * 100,
        secondaryLiquidUnit: numericParameters[1] * 100,
        primarySolidUnit: numericParameters[2],
        secondarySolidUnit: numericParameters[3],
        maximumSolubilityPercentage: numericParameters[4],
        overallWeightLimit: numericParameters[5]
    };
    return executionConfig;
}

function calculatePossibleSums(upperBound, componentA, componentB) {
    const canFormSum = new Array(upperBound + 1).fill(false);
    canFormSum[0] = true;

    const components = [];
    if (componentA > 0) components.push(componentA);
    if (componentB > 0) components.push(componentB);

    for (const currentComponent of components) {
        for (let currentSumIndex = currentComponent; currentSumIndex <= upperBound; ++currentSumIndex) {
            if (canFormSum[currentSumIndex - currentComponent]) {
                canFormSum[currentSumIndex] = true;
            }
        }
    }

    const availableSums = [];
    for (let massValue = 0; massValue <= upperBound; ++massValue) {
        if (canFormSum[massValue]) {
            availableSums.push(massValue);
        }
    }
    return availableSums;
}

function runConcentrationSearch(inputData) {
    const params = processInputContent(inputData);

    const {
        primaryLiquidUnit,
        secondaryLiquidUnit,
        primarySolidUnit,
        secondarySolidUnit,
        maximumSolubilityPercentage,
        overallWeightLimit
    } = params;

    const absoluteMaxSolidMass = Math.floor(overallWeightLimit * maximumSolubilityPercentage / (100 + maximumSolubilityPercentage));

    const potentialLiquidMasses = calculatePossibleSums(overallWeightLimit, primaryLiquidUnit, secondaryLiquidUnit);
    const potentialSolidMasses = calculatePossibleSums(absoluteMaxSolidMass, primarySolidUnit, secondarySolidUnit);

    const usableSolidMasses = new Set(potentialSolidMasses);

    let optimalConcentrationRatio = 0;
    let finalComposition = [primaryLiquidUnit, 0];

    for (const liquidQuantity of potentialLiquidMasses) {
        if (liquidQuantity === 0) continue;

        const minimumSolidSearch = Math.round(liquidQuantity * optimalConcentrationRatio);
        const maxSolidBySolubility = Math.floor(liquidQuantity * maximumSolubilityPercentage / 100);
        const maxSolidByTotalWeight = overallWeightLimit - liquidQuantity;
        const currentSolidUpperLimit = Math.min(absoluteMaxSolidMass, maxSolidBySolubility, maxSolidByTotalWeight);

        for (let solidQuantity = minimumSolidSearch; solidQuantity <= currentSolidUpperLimit; ++solidQuantity) {
            if (usableSolidMasses.has(solidQuantity)) {
                const currentRatio = solidQuantity / liquidQuantity;

                if (currentRatio >= optimalConcentrationRatio) {
                    optimalConcentrationRatio = currentRatio;
                    finalComposition = [liquidQuantity + solidQuantity, solidQuantity];
                }
                usableSolidMasses.delete(solidQuantity);
            }
        }
    }

    console.log("%d %d", Math.round(finalComposition[0]), Math.round(finalComposition[1]));
}

runConcentrationSearch(require("fs").readFileSync("/dev/stdin", "utf8"));