const fileSystemModule = require('fs');
const MAX_ACCUMULATED_LOAD = 150;

function compareCoordinates(eventOne, eventTwo) {
    const coordinateOne = eventOne[0];
    const coordinateTwo = eventTwo[0];
    return coordinateOne - coordinateTwo;
}

let rawFileContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
let inputDataLines = rawFileContent.trim().split("\n");

while (true) {
    let currentBatchSize = Number(inputDataLines.shift());
    if (currentBatchSize === 0) {
        break;
    }

    let processedEvents = [];
    for (let lineIndex = 0; lineIndex < currentBatchSize; lineIndex++) {
        let currentLine = inputDataLines.shift();
        let numericParts = currentLine.split(" ").map(valueString => parseInt(valueString, 10));

        let objectWeight = numericParts[0];
        let startCoordinate = numericParts[1];
        let endCoordinate = numericParts[2];

        processedEvents.push([startCoordinate, objectWeight]);
        processedEvents.push([endCoordinate - 0.1, -1 * objectWeight]);
    }

    processedEvents.sort(compareCoordinates);

    let currentResultStatus = "OK";
    let runningLoadTotal = 0;

    for (let eventIndex = 0; eventIndex < processedEvents.length; eventIndex++) {
        let loadChange = processedEvents[eventIndex][1];
        runningLoadTotal += loadChange;

        if (runningLoadTotal > MAX_ACCUMULATED_LOAD) {
            currentResultStatus = "NG";
            break;
        }
    }
    console.log(currentResultStatus);
}
