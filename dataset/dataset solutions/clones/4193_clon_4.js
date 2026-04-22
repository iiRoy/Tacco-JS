const inputSystem = require('readline');
let accumulatedInput = [];

const inputManager = inputSystem.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

inputManager.on('line', (currentLine) => {
    accumulatedInput.push(currentLine);
});

inputManager.on('close', () => {
    orchestrateProcessing(accumulatedInput);
});

function orchestrateProcessing(sourceData) {
    const participantCount = Number(sourceData[0]);

    const activityMatrices = Array.from({ length: participantCount }, (_, participantIndex) => {
        const individualScheduleTokens = sourceData[1 + participantIndex].split(' ');
        return individualScheduleTokens.map(Number);
    });

    const rewardStructures = Array.from({ length: participantCount }, (_, participantIndex) => {
        const individualRewardTokens = sourceData[1 + participantCount + participantIndex].split(' ');
        return individualRewardTokens.map(Number);
    });

    let maximalBenefit = Number.MIN_SAFE_INTEGER;

    const assessConfiguration = (intervalMask) => {
        if (intervalMask === 0) return Number.MIN_SAFE_INTEGER;

        return activityMatrices.reduce((cumulativeValue, currentParticipantSchedule, participantIdentifier) => {
            const sharedIntervals = currentParticipantSchedule.reduce((count, scheduleStatus, intervalIdentifier) => {
                const isIntervalActive = (intervalMask >> intervalIdentifier & 1) === 1;
                return count + (isIntervalActive && scheduleStatus > 0 ? 1 : 0);
            }, 0);
            return cumulativeValue + rewardStructures[participantIdentifier][sharedIntervals];
        }, 0);
    };

    const exploreIntervals = (currentMask, intervalIndex) => {
        if (intervalIndex === 10) {
            const configurationResult = assessConfiguration(currentMask);
            if (configurationResult > maximalBenefit) {
                maximalBenefit = configurationResult;
            }
            return;
        }

        exploreIntervals(currentMask, intervalIndex + 1);

        exploreIntervals(currentMask | (1 << intervalIndex), intervalIndex + 1);
    };

    exploreIntervals(0, 0);

    console.log(maximalBenefit);
}