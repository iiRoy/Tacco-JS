'use strict';

function processEventLog(rawData) {
    const inputLines = rawData.trim().split('\n');
    const eventCount = Number(inputLines[0]);
    const penaltyFactors = inputLines[1].split(' ').map(Number);
    const performanceScores = inputLines.slice(2, 2 + eventCount).map(line => line.split(' ').map(Number));
    const scheduledEvents = inputLines.slice(-1 * eventCount).map(Number);

    const initialStatus = {
        totalAccumulatedValue: 0,
        lastKnownOccurrences: Array(penaltyFactors.length).fill(0)
    };

    const finalReport = Array.from({ length: eventCount }, (_, dayOffset) => dayOffset + 1)
        .reduce((currentAggregate, currentDayNumber) => {
            const designatedEventCategory = scheduledEvents[currentDayNumber - 1] - 1;

            const updatedLastKnownOccurrences = [...currentAggregate.lastKnownOccurrences];
            updatedLastKnownOccurrences[designatedEventCategory] = currentDayNumber;

            const dailyValuations = Array.from({ length: penaltyFactors.length }, (_, categoryIndex) => {
                const lastAppearanceDay = updatedLastKnownOccurrences[categoryIndex];
                if (lastAppearanceDay === currentDayNumber) {
                    return performanceScores[currentDayNumber - 1][categoryIndex];
                } else {
                    return penaltyFactors[categoryIndex] * (currentDayNumber - lastAppearanceDay) * -1;
                }
            });

            const sumForThisDay = dailyValuations.reduce((sum, value) => sum + value, 0);

            const newTotalAccumulatedValue = currentAggregate.totalAccumulatedValue + sumForThisDay;

            console.log(String(newTotalAccumulatedValue));

            return {
                totalAccumulatedValue: newTotalAccumulatedValue,
                lastKnownOccurrences: updatedLastKnownOccurrences
            };
        }, initialStatus);
}

processEventLog(require('fs').readFileSync('/dev/stdin', 'utf8'));