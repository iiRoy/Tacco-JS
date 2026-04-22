const concoctionFactory = (inputRecipe) => {
    const recipeLines = inputRecipe.trim().split('\n');
    const [
        firstWaterConcentration,
        secondWaterConcentration,
        firstAdditiveConcentration,
        secondAdditiveConcentration,
        maximumSolubilityPercentage,
        totalVolumeLimit
    ] = recipeLines[0].split(' ').map(Number);

    return {
        unitWaterA: firstWaterConcentration * 100,
        unitWaterB: secondWaterConcentration * 100,
        unitAdditiveC: firstAdditiveConcentration,
        unitAdditiveD: secondAdditiveConcentration,
        maxSolventRatio: maximumSolubilityPercentage,
        maxTotalVolume: totalVolumeLimit
    };
};

const synthesizeCombinations = (componentA, componentB, upperBoundary) => {
    const generatedVolumes = new Set([0]);
    let priorCount = 0;
    while (generatedVolumes.size !== priorCount) {
        priorCount = generatedVolumes.size;
        const currentBatch = Array.from(generatedVolumes);
        for (const currentBatchVolume of currentBatch) {
            if (currentBatchVolume + componentA <= upperBoundary) {
                generatedVolumes.add(currentBatchVolume + componentA);
            }
            if (currentBatchVolume + componentB <= upperBoundary) {
                generatedVolumes.add(currentBatchVolume + componentB);
            }
        }
    }
    return Array.from(generatedVolumes).sort((v1, v2) => v1 - v2);
};

const pinpointOptimalBlend = (blendParameters) => {
    const {
        unitWaterA: waterA,
        unitWaterB: waterB,
        unitAdditiveC: additiveC,
        unitAdditiveD: additiveD,
        maxSolventRatio: ratioE,
        maxTotalVolume: volumeF
    } = blendParameters;

    const allWaterVolumes = synthesizeCombinations(waterA, waterB, volumeF);
    
    const maxPermittedAdditive = Math.floor(volumeF * ratioE / (100 + ratioE));
    const allAdditiveVolumes = synthesizeCombinations(additiveC, additiveD, maxPermittedAdditive);

    let topRatio = -1;
    let finalTotal = 0;
    let finalAdditive = 0;

    const availableAdditiveUnits = new Set(allAdditiveVolumes);

    allWaterVolumes.forEach(currentWaterAmount => {
        if (currentWaterAmount === 0) return;

        const maxAdditiveBySolubility = Math.floor(currentWaterAmount * ratioE / 100);
        const maxAdditiveByTotalVolume = volumeF - currentWaterAmount;
        const effectiveAdditiveCeiling = Math.min(maxAdditiveBySolubility, maxAdditiveByTotalVolume);

        const minimumAdditiveForImprovement = Math.round(currentWaterAmount * topRatio);

        for (const currentAdditiveAmount of allAdditiveVolumes) {
            if (currentAdditiveAmount < minimumAdditiveForImprovement) continue;
            if (currentAdditiveAmount > effectiveAdditiveCeiling) break;

            if (availableAdditiveUnits.has(currentAdditiveAmount)) {
                const currentRatio = currentAdditiveAmount / currentWaterAmount;

                if (currentRatio >= topRatio) {
                    topRatio = currentRatio;
                    finalTotal = currentWaterAmount + currentAdditiveAmount;
                    finalAdditive = currentAdditiveAmount;
                }
                availableAdditiveUnits.delete(currentAdditiveAmount);
            }
        }
    });

    return [finalTotal, finalAdditive];
};

const processMixtureRequest = (rawInput) => {
    const recipeData = concoctionFactory(rawInput);
    const [resultTotal, resultAdditive] = pinpointOptimalBlend(recipeData);
    console.log(`${Math.round(resultTotal)} ${Math.round(resultAdditive)}`);
};

processMixtureRequest(require("fs").readFileSync("/dev/stdin", "utf8"));