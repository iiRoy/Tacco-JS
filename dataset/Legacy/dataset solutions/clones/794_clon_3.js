const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 60 * SECONDS_PER_MINUTE;
const TOTAL_SECONDS_IN_DAY = 24 * SECONDS_PER_HOUR;

function convertTimeToSeconds(timeString) {
    const timeComponents = timeString.split(':').map(Number);
    const [hours, minutes, seconds] = timeComponents;
    return (hours * SECONDS_PER_HOUR) + (minutes * SECONDS_PER_MINUTE) + seconds;
}

while (true) {
    const numberOfEvents = parseInt(readline(), 10);

    if (numberOfEvents === 0) {
        break;
    }

    const timePointChanges = new Array(TOTAL_SECONDS_IN_DAY + 1).fill(0);

    for (let eventIndex = 0; eventIndex < numberOfEvents; eventIndex++) {
        const eventLine = readline();
        const timeStrings = eventLine.split(' ');

        const startTimeStr = timeStrings[0];
        const endTimeStr = timeStrings[1];

        const startTotalSeconds = convertTimeToSeconds(startTimeStr);
        const endTotalSeconds = convertTimeToSeconds(endTimeStr);

        timePointChanges[startTotalSeconds]++;
        timePointChanges[endTotalSeconds]--;
    }

    for (let currentSecondIndex = 0; currentSecondIndex < TOTAL_SECONDS_IN_DAY; currentSecondIndex++) {
        timePointChanges[currentSecondIndex + 1] += timePointChanges[currentSecondIndex];
    }

    const maxConcurrentEvents = Math.max(...timePointChanges);
    console.log(maxConcurrentEvents);
}
