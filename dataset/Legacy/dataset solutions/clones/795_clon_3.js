var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var lineData = rawData.trim().split("\n");

const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;

function convertTimeToSeconds(timeString) {
    const timeParts = timeString.split(":").map(Number);
    const hoursAsSeconds = timeParts[0] * SECONDS_PER_HOUR;
    const minutesAsSeconds = timeParts[1] * SECONDS_PER_MINUTE;
    const totalTimeInSeconds = hoursAsSeconds + minutesAsSeconds + timeParts[2];
    return totalTimeInSeconds;
}

while (true) {
    let numEntries = parseInt(lineData.shift(), 10);

    if (numEntries === 0) {
        break;
    }

    const timeIntervals = [];

    for (let i = 0; i < numEntries; i++) {
        const timeStrings = lineData.shift().split(" ");
        const startString = timeStrings[0];
        const endString = timeStrings[1];

        const startTimeSec = convertTimeToSeconds(startString);
        const endTimeSec = convertTimeToSeconds(endString);

        timeIntervals.push([startTimeSec, endTimeSec]);
    }

    timeIntervals.sort(function(intervalA, intervalB) {
        return intervalA[0] - intervalB[0];
    });

    const availableTracks = [];
    let trackCount = 0;

    timeIntervals.forEach(function(currentInterval) {
        const currentIntervalStartTime = currentInterval[0];
        const currentIntervalEndTime = currentInterval[1];

        if (availableTracks.length === 0) {
            trackCount++;
            availableTracks.push(currentIntervalEndTime);
        } else {
            availableTracks.sort(function(trackA, trackB) {
                return trackA - trackB;
            });

            const earliestTrackFreeTime = availableTracks[0];

            if (earliestTrackFreeTime <= currentIntervalStartTime) {
                availableTracks.shift();
                availableTracks.push(currentIntervalEndTime);
            } else {
                trackCount++;
                availableTracks.push(currentIntervalEndTime);
            }
        }
    });

    console.log(trackCount);
}
