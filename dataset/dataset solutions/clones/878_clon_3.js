const fileSystemModule = require('fs');

const rawInputLines = (() => {
    const fileContent = fileSystemModule.readFileSync(process.stdin.fd, 'utf8');
    return fileContent.split('\n');
})();

function parseTimeIntoMinutes(timeString) {
    const timeComponents = timeString.split(':');
    const hours = Number(timeComponents[0]);
    const minutes = Number(timeComponents[1]);
    return (hours * 60) + minutes;
}

function analyzeScheduleConnections() {
    const firstLineData = rawInputLines[0].split(' ');
    const numEntries = Number(firstLineData[0]);
    const maxWaitThreshold = Number(firstLineData[1]);

    const initialEntryParts = rawInputLines[1].split(' ');
    let previousDepartureTime = parseTimeIntoMinutes(initialEntryParts[0]);
    let previousDepartureStation = initialEntryParts[1];
    let previousArrivalTime = parseTimeIntoMinutes(initialEntryParts[2]);
    let previousArrivalStation = initialEntryParts[3];

    const foundConnections = [];

    for (let entryIndex = 2; entryIndex <= numEntries; entryIndex++) {
        const currentEntryDataParts = rawInputLines[entryIndex].split(' ');

        const currentEntryDepartureTime = parseTimeIntoMinutes(currentEntryDataParts[0]);
        const currentEntryDepartureStation = currentEntryDataParts[1];
        const currentEntryArrivalTime = parseTimeIntoMinutes(currentEntryDataParts[2]);
        const currentEntryArrivalStation = currentEntryDataParts[3];

        const isConnectionValid = maxWaitThreshold <= (currentEntryDepartureTime - previousArrivalTime);

        if (isConnectionValid) {
            foundConnections.push([previousArrivalStation, currentEntryDepartureTime - previousArrivalTime]);
        }

        previousDepartureTime = currentEntryDepartureTime;
        previousDepartureStation = currentEntryDepartureStation;
        previousArrivalTime = currentEntryArrivalTime;
        previousArrivalStation = currentEntryArrivalStation;
    }

    console.log(foundConnections.length);
    for (let connectionIdx = 0; connectionIdx < foundConnections.length; connectionIdx++) {
        const connection = foundConnections[connectionIdx];
        console.log(`${connection[0]} ${connection[1]}`);
    }
}

analyzeScheduleConnections();
