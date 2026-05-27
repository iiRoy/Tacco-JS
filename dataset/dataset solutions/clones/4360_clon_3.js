function solveProblem(inputData) {
    const lines = inputData.trim().split("\n").map(lineStr => lineStr.split(" "));
    const firstLineParams = lines[0].map(val => parseInt(val, 10));

    const waterAUnit = firstLineParams[0] * 100;
    const waterBUnit = firstLineParams[1] * 100;
    const sugarCUnit = firstLineParams[2];
    const sugarDUnit = firstLineParams[3];
    const maxConcentrationRatio = firstLineParams[4];
    const maxTotalWeightLimit = firstLineParams[5];

    function generateUniqueCombinations(unitOneSize, unitTwoSize, overallLimit) {
        const generatedAmounts = new Set();
        
        for (let countOne = 0; ; countOne++) {
            const currentAmountOne = unitOneSize * countOne;
            if (currentAmountOne > overallLimit) {
                break;
            }

            for (let countTwo = 0; ; countTwo++) {
                const currentAmountTwo = unitTwoSize * countTwo;
                const totalCombinedAmount = currentAmountOne + currentAmountTwo;
                
                if (totalCombinedAmount > overallLimit) {
                    break;
                }

                if (totalCombinedAmount > 0) {
                    generatedAmounts.add(totalCombinedAmount);
                }
            }
        }
        return Array.from(generatedAmounts).sort((a, b) => a - b);
    }

    const possibleWaterAmounts = generateUniqueCombinations(waterAUnit, waterBUnit, maxTotalWeightLimit);

    const maxSugarAllowedByConcentration = Math.floor(maxTotalWeightLimit * maxConcentrationRatio / (100 + maxConcentrationRatio));

    const possibleSugarAmounts = generateUniqueCombinations(sugarCUnit, sugarDUnit, maxSugarAllowedByConcentration);

    const sugarAvailabilityMap = Array(maxSugarAllowedByConcentration + 1).fill(0);
    for (const sugarVal of possibleSugarAmounts) {
        sugarAvailabilityMap[sugarVal] = 1;
    }

    let currentHighestDensity = 0;
    let bestSolution = [0, 0]; // [totalWeight, sugarWeight]

    for (const currentWaterWeight of possibleWaterAmounts) {
        const minSugarForCurrentDensity = Math.round(currentWaterWeight * currentHighestDensity);
        
        const maxSugarForCurrentWater = Math.min(
            Math.floor(currentWaterWeight * maxConcentrationRatio / 100),
            maxTotalWeightLimit - currentWaterWeight
        );

        for (let currentSugarWeight = minSugarForCurrentDensity; currentSugarWeight <= maxSugarForCurrentWater; currentSugarWeight++) {
            if (currentSugarWeight >= 0 && currentSugarWeight <= maxSugarAllowedByConcentration && sugarAvailabilityMap[currentSugarWeight] === 1) {
                const calculatedDensity = currentSugarWeight / currentWaterWeight;

                if (calculatedDensity >= currentHighestDensity) {
                    bestSolution[0] = currentWaterWeight + currentSugarWeight;
                    bestSolution[1] = currentSugarWeight;
                    currentHighestDensity = calculatedDensity;
                }
                sugarAvailabilityMap[currentSugarWeight] = 0;
            }
        }
    }

    if (bestSolution[1] === 0) {
        bestSolution[0] = waterAUnit;
    }

    console.log("%d %d", Math.round(bestSolution[0]), Math.round(bestSolution[1]));
}

solveProblem(require("fs").readFileSync("/dev/stdin", "utf8"));
