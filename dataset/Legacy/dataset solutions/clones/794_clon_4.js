const inputReader = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

let storedLines = [];
inputReader.on('line', (currentLine) => {
    storedLines.push(currentLine);
});

inputReader.on('close', () => {
    processAllEntries(storedLines);
});

function processAllEntries(allInputLines) {
    let currentLineIndex = 0;
    const totalDaySeconds = 24 * 60 * 60;

    const convertTimeToSeconds = (timeString) => {
        const [hourStr, minuteStr, secondStr] = timeString.split(':');
        return parseInt(hourStr) * 3600 + parseInt(minuteStr) * 60 + parseInt(secondStr);
    };

    while (true) {
        const numberOfActivities = parseInt(allInputLines[currentLineIndex++]);
        if (numberOfActivities === 0) {
            break;
        }

        let activityEvents = [];

        for (let activityIndex = 0; activityIndex < numberOfActivities; activityIndex++) {
            const [startString, endString] = allInputLines[currentLineIndex++].split(' ');
            const startSecond = convertTimeToSeconds(startString);
            const endSecond = convertTimeToSeconds(endString);

            activityEvents.push({ moment: startSecond, type: 1 });
            activityEvents.push({ moment: endSecond, type: -1 });
        }

        activityEvents.sort((eventA, eventB) => {
            if (eventA.moment !== eventB.moment) {
                return eventA.moment - eventB.moment;
            }
            return eventB.type - eventA.type;
        });

        let currentConcurrentCount = 0;
        let maximumConcurrentCount = 0;

        for (const eventItem of activityEvents) {
            currentConcurrentCount += eventItem.type;
            if (currentConcurrentCount > maximumConcurrentCount) {
                maximumConcurrentCount = currentConcurrentCount;
            }
        }
        console.log(maximumConcurrentCount);
    }
}
