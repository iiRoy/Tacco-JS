const handleInput = (sourceText) => {
    const linesOfData = sourceText.trim().split('\n');
    const parameters = linesOfData[0].split(' ').map(Number);
    const stoneCount = parameters[0];
    const maxJumpDistance = parameters[1];
    const elevationLevels = linesOfData[1].split(' ').map(Number);

    const memoizedCosts = new Array(stoneCount).fill(null);

    const computeJourneyCost = (currentIdx) => {
        if (currentIdx === 0) {
            return 0;
        }

        if (memoizedCosts[currentIdx] !== null) {
            return memoizedCosts[currentIdx];
        }

        let minAchievableCost = Infinity;

        for (let backStep = 1; backStep <= maxJumpDistance; backStep++) {
            const priorIdx = currentIdx - backStep;

            if (priorIdx >= 0) {
                const costFromPrior = computeJourneyCost(priorIdx) +
                                      Math.abs(elevationLevels[priorIdx] - elevationLevels[currentIdx]);
                minAchievableCost = Math.min(minAchievableCost, costFromPrior);
            } else {
                break;
            }
        }

        memoizedCosts[currentIdx] = minAchievableCost;
        return minAchievableCost;
    };

    const finalResult = computeJourneyCost(stoneCount - 1);
    console.log(finalResult);
};

handleInput(require("fs").readFileSync("/dev/stdin", "utf8"));