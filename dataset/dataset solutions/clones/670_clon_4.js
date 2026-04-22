const outputResult = (dataContent) => {
    console.log(dataContent);
};

const parseNumericSequence = (textData) => {
    return textData.trim().split(/\s+/).map(Number);
};

const assessActivities = (activitiesList) => {
    const orderedActivities = activitiesList.slice().sort((a, b) => a[1] - b[1]);

    const feasibilityCheck = orderedActivities.reduce(
        (currentStatus, currentActivity) => {
            const [activityDuration, activityDeadline] = currentActivity;
            const [isPossible, accumulatedDuration] = currentStatus;

            if (!isPossible) {
                return [false, 0];
            }

            const nextAccumulatedDuration = accumulatedDuration + activityDuration;
            const currentActivityPossible = nextAccumulatedDuration <= activityDeadline;

            return [currentActivityPossible, nextAccumulatedDuration];
        },
        [true, 0]
    );

    return feasibilityCheck[0] ? "Yes" : "No";
};

let collectedInputData = '';

process.stdin.on('data', (incomingData) => {
    collectedInputData += incomingData;
});

process.stdin.on('end', () => {
    const numericTokens = parseNumericSequence(collectedInputData);
    let currentTokenPosition = 0;
    const allOutcomes = [];

    while (currentTokenPosition < numericTokens.length) {
        const numberOfActivities = numericTokens[currentTokenPosition++];
        if (isNaN(numberOfActivities) || numberOfActivities <= 0) {
            break;
        }

        const currentCaseActivities = [];
        for (let i = 0; i < numberOfActivities; i++) {
            const duration = numericTokens[currentTokenPosition++];
            const deadline = numericTokens[currentTokenPosition++];
            currentCaseActivities.push([duration, deadline]);
        }
        allOutcomes.push(assessActivities(currentCaseActivities));
    }

    allOutcomes.forEach(resultString => outputResult(resultString));
});

process.stdin.resume();
process.stdin.setEncoding('utf8');