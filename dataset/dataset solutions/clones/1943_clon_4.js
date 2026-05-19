function calculateRequiredSteps(targetValue, stepSize, currentProgress = 0, currentStepCount = 0) {
    if (currentProgress >= targetValue) {
        return currentStepCount;
    }
    return calculateRequiredSteps(targetValue, stepSize, currentProgress + stepSize, currentStepCount + 1);
}

function ProcessInput(dataSegments) {
    const primaryValue = Number(dataSegments[0]);
    const primaryIncrement = Number(dataSegments[1]);
    const secondaryValue = Number(dataSegments[2]);
    const secondaryIncrement = Number(dataSegments[3]);

    const firstScenarioSteps = calculateRequiredSteps(secondaryValue, primaryIncrement);
    const secondScenarioSteps = calculateRequiredSteps(primaryValue, secondaryIncrement);

    console.log(firstScenarioSteps <= secondScenarioSteps ? 'Yes' : 'No');
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n|\s/));
