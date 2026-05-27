'use strict';

const parseNumericLine = (lineContent) => lineContent.split(' ').map((value) => Number(value));

function ProcessContestData(rawData) {
    const inputLines = rawData.trim().split('\n');

    const numberOfDays = Number(inputLines[0]);
    const contestPenaltyCosts = parseNumericLine(inputLines[1]);

    const satisfactionScoresMatrix = inputLines
        .slice(2, 2 + numberOfDays)
        .map(parseNumericLine);

    const dailyContestSelections = inputLines.slice(inputLines.length - numberOfDays).map((value) => Number(value));

    let lastContestHeldDay = new Array(26).fill(0);
    let currentDaySatisfactionLevels = new Array(26).fill(0);
    let totalCumulativeSatisfaction = 0;

    for (let dayCounter = 1; dayCounter <= numberOfDays; dayCounter++) {
        const zeroBasedDayIndex = dayCounter - 1;

        const selectedContestId = dailyContestSelections[zeroBasedDayIndex];
        const selectedContestTypeIndex = selectedContestId - 1;

        lastContestHeldDay[selectedContestTypeIndex] = dayCounter;

        for (let contestIndex = 0; contestIndex < contestPenaltyCosts.length; contestIndex++) {
            const lastHeldDateForType = lastContestHeldDay[contestIndex];

            if (lastHeldDateForType === dayCounter) {
                currentDaySatisfactionLevels[contestIndex] = satisfactionScoresMatrix[zeroBasedDayIndex][contestIndex];
            } else {
                const daysElapsedSinceLastHeld = dayCounter - lastHeldDateForType;
                const calculatedPenalty = contestPenaltyCosts[contestIndex] * daysElapsedSinceLastHeld;
                currentDaySatisfactionLevels[contestIndex] = -calculatedPenalty;
            }
        }

        const dailyScoreSum = currentDaySatisfactionLevels.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
        totalCumulativeSatisfaction += dailyScoreSum;

        console.log(String(totalCumulativeSatisfaction));
    }

    return;
}

ProcessContestData(require('fs').readFileSync('/dev/stdin', 'utf8'));
