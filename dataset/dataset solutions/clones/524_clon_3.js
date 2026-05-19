function determineNewMax(statsArray) {
    let highestValueFound = 0;
    let highestIndexFound = 0;
    for (let k = 0; k < statsArray.length; k++) {
        const currentStatEntry = statsArray[k];
        if (highestValueFound < currentStatEntry[0]) {
            highestValueFound = currentStatEntry[0];
            highestIndexFound = k;
        }
    }
    return [highestIndexFound, highestValueFound];
}

function compareEntryStats(statA, statB) {
    if (statA[1] === statB[1]) {
        return statA[2] - statB[2];
    }
    return statB[1] - statA[1];
}

var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var lineData = rawData.trim().split("\n");

const [numEntries, , limitVal] = lineData.shift().split(" ").map(Number);

var entryStats = Array.from({ length: numEntries }, (_, idx) => [0, 0, idx]);

var currentMax = [0, 0];
var elapsedTime = 0;

const sentinelEventString = [1, limitVal, 0].join(" ");
lineData.push(sentinelEventString);

lineData.forEach(function(currentEventLine) {
    const eventParts = currentEventLine.split(" ").map(Number);
    const targetIndex = eventParts[0] - 1;
    const eventTime = eventParts[1];
    const valueChange = eventParts[2];

    const timeDelta = eventTime - elapsedTime;
    const previousMaxEntryIndex = currentMax[0];
    entryStats[previousMaxEntryIndex][1] += timeDelta;
    elapsedTime = eventTime;

    const targetEntry = entryStats[targetIndex];
    targetEntry[0] += valueChange;

    if (valueChange > 0) {
        const currentItemValue = targetEntry[0];
        const currentMaxVal = currentMax[1];

        if (currentItemValue > currentMaxVal) {
            currentMax = [targetIndex, currentItemValue];
        } else if (currentItemValue === currentMaxVal && targetIndex <= currentMax[0]) {
            currentMax = [targetIndex, currentItemValue];
        }
    } else if (valueChange < 0 && currentMax[0] === targetIndex) {
        currentMax = determineNewMax(entryStats);
    }
});

entryStats.sort(compareEntryStats);

console.log(entryStats[0][2] + 1);
