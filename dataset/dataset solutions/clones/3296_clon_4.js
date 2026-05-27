function Main(rawData) {
    const lineData = rawData.split("\n");
    const [totalStepsStr, maxJumpStr] = lineData[0].split(" ");
    const totalSteps = Number.parseInt(totalStepsStr);
    const maxJump = Number.parseInt(maxJumpStr);
    const elevationPoints = lineData[1].split(" ").map(Number.parseInt);

    const costCache = new Array(totalSteps).fill(null);

    const calculateMinimumPathCost = (currentStepIndex) => {
        if (currentStepIndex === 0) {
            return 0;
        }
        if (currentStepIndex === 1) {
            return Math.abs(elevationPoints[1] - elevationPoints[0]);
        }

        if (costCache[currentStepIndex] !== null) {
            return costCache[currentStepIndex];
        }

        let minimumOption = Infinity;

        for (let jumpDistance = 1; jumpDistance <= maxJump; jumpDistance++) {
            const priorStepIndex = currentStepIndex - jumpDistance;

            if (priorStepIndex >= 0) {
                const costFromPrior = calculateMinimumPathCost(priorStepIndex) +
                                      Math.abs(elevationPoints[currentStepIndex] - elevationPoints[priorStepIndex]);
                minimumOption = Math.min(minimumOption, costFromPrior);
            } else {
                break;
            }
        }

        costCache[currentStepIndex] = minimumOption;
        return minimumOption;
    };

    console.log(calculateMinimumPathCost(totalSteps - 1));
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
