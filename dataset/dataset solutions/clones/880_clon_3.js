const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
let lineBuffer = rawData.trim().split("\n");

function convertTimeToMinutes(timeString) {
    const timeParts = timeString.split(":");
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    return hours * 60 + minutes;
}

function displayEventRecords(recordsToDisplay) {
    console.log(recordsToDisplay.length);
    recordsToDisplay.forEach(recordEntry => {
        console.log(recordEntry);
    });
}

while (lineBuffer.length > 0) {
    const outputRecords = [];
    const configLine = lineBuffer.shift();
    const configParams = configLine.split(" ").map(Number);

    const eventCount = configParams[0];
    const timeThreshold = configParams[1];

    let previousEventEndTimeInMinutes = null;
    let eventNameForPreviousInterval = null;

    for (let eventIndex = 0; eventIndex < eventCount; eventIndex++) {
        const currentEventLine = lineBuffer.shift();
        const currentLineParts = currentEventLine.split(" ");

        const currentStartTimeString = currentLineParts[0];
        const currentEndTimeString = currentLineParts[2];
        const currentEventName = currentLineParts[3];

        const currentStartTimeInMinutes = convertTimeToMinutes(currentStartTimeString);
        const currentEndTimeInMinutes = convertTimeToMinutes(currentEndTimeString);

        if (eventIndex > 0) {
            const timeDifference = currentStartTimeInMinutes - previousEventEndTimeInMinutes;
            if (timeDifference >= timeThreshold) {
                outputRecords.push(`${eventNameForPreviousInterval} ${timeDifference}`);
            }
        }

        previousEventEndTimeInMinutes = currentEndTimeInMinutes;
        eventNameForPreviousInterval = currentEventName;
    }

    displayEventRecords(outputRecords);
}
