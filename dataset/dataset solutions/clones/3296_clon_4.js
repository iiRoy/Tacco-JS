function parseJourneyDescription(textualInput) {
    const sections = textualInput.split("\n");
    const firstLineValues = sections[0].split(" ").map(Number);
    const stepElevationProfile = sections[1].split(" ").map(Number);

    return {
        totalStages: firstLineValues[0],
        maxStepDistance: firstLineValues[1],
        heightsAtStages: stepElevationProfile
    };
}

function calculateMinimalEffort(stageIndex, stageHeights, maximumJump, effortCache) {
    if (stageIndex === 0) {
        return 0;
    }
    if (effortCache[stageIndex] !== undefined) {
        return effortCache[stageIndex];
    }

    let leastEffort = Infinity;

    for (let jumpBack = 1; jumpBack <= maximumJump; jumpBack++) {
        const previousStageIndex = stageIndex - jumpBack;
        if (previousStageIndex >= 0) {
            const effortToPrev = calculateMinimalEffort(previousStageIndex, stageHeights, maximumJump, effortCache);
            const currentJumpCost = Math.abs(stageHeights[stageIndex] - stageHeights[previousStageIndex]);
            leastEffort = Math.min(leastEffort, effortToPrev + currentJumpCost);
        } else {
            break;
        }
    }

    effortCache[stageIndex] = leastEffort;
    return leastEffort;
}

function processExpeditionPlan(expeditionData) {
    const expeditionDetails = parseJourneyDescription(expeditionData);
    const memo = {};

    const finalStageIndex = expeditionDetails.totalStages - 1;
    const finalEffort = calculateMinimalEffort(
        finalStageIndex,
        expeditionDetails.heightsAtStages,
        expeditionDetails.maxStepDistance,
        memo
    );

    console.log(finalEffort);
}

processExpeditionPlan(require("fs").readFileSync("/dev/stdin", "utf8"));