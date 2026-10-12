'use strict';

function ProcessContestData(rawData) {
    const parsedLines = rawData.trim().split('\n');
    const totalDays = Number(parsedLines[0]);
    const penaltyCoefficients = parsedLines[1].split(' ').map(Number);
    const satisfactionMatrix = parsedLines
        .slice(2, 2 + totalDays)
        .map((line) => line.split(' ').map(Number));
    const dailySchedule = parsedLines.slice(-1 * totalDays).map(Number);

    const initialProcessingState = {
        overallSatisfaction: 0,
        lastOccurrenceDates: Array(26).fill(0),
    };

    Array.from({ length: totalDays }, (_, dayIndex) => dayIndex + 1)
        .reduce((currentProcessingState, currentDayNumber) => {
            const { overallSatisfaction: previousOverallSatisfaction, lastOccurrenceDates: previousLastOccurrenceDates } = currentProcessingState;

            const scheduledContestType = dailySchedule[currentDayNumber - 1] - 1;

            const updatedLastOccurrenceDates = [...previousLastOccurrenceDates];
            updatedLastOccurrenceDates[scheduledContestType] = currentDayNumber;

            const dailyContributionsPerContest = Array.from({ length: 26 }, (_, contestTypeIndex) => {
                const lastHeldDayForType = updatedLastOccurrenceDates[contestTypeIndex];
                return (lastHeldDayForType === currentDayNumber)
                    ? satisfactionMatrix[currentDayNumber - 1][contestTypeIndex]
                    : penaltyCoefficients[contestTypeIndex] * (currentDayNumber - lastHeldDayForType) * -1;
            });

            const currentDayTotalContribution = dailyContributionsPerContest.reduce((sum, contribution) => sum + contribution, 0);

            const newOverallSatisfaction = previousOverallSatisfaction + currentDayTotalContribution;

            console.log(String(newOverallSatisfaction));

            return {
                overallSatisfaction: newOverallSatisfaction,
                lastOccurrenceDates: updatedLastOccurrenceDates,
            };
        }, initialProcessingState);
}

ProcessContestData(require('fs').readFileSync('/dev/stdin', 'utf8'));
