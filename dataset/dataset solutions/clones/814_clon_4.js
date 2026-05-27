const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const rawLines = fileContent.trim().split('\n');

let currentLineIndex = 0;

function processPropagationScenario(inputLines, startingIndex) {
    const headerData = inputLines[startingIndex].split(' ').map(Number);
    const totalNodes = headerData[0];
    const totalEvents = headerData[1];

    if (totalNodes === 0 && totalEvents === 0) {
        return { outcome: null, nextReadIndex: startingIndex + 1 };
    }

    const affectedNodes = new Set([0]); // Node 0 is initially affected

    const timedEvents = [];
    for (let k = 0; k < totalEvents; k++) {
        const eventDetails = inputLines[startingIndex + 1 + k].split(' ').map(Number);
        timedEvents.push({
            eventTime: eventDetails[0],
            sourceNode: eventDetails[1] - 1,
            destinationNode: eventDetails[2] - 1
        });
    }

    timedEvents.sort((a, b) => a.eventTime - b.eventTime);

    for (const currentEvent of timedEvents) {
        if (affectedNodes.has(currentEvent.sourceNode)) {
            affectedNodes.add(currentEvent.destinationNode);
        }
    }

    return { outcome: affectedNodes.size, nextReadIndex: startingIndex + 1 + totalEvents };
}

const collectedResults = [];
while (true) {
    const scenarioResult = processPropagationScenario(rawLines, currentLineIndex);
    if (scenarioResult.outcome === null) {
        break;
    }
    collectedResults.push(scenarioResult.outcome);
    currentLineIndex = scenarioResult.nextReadIndex;
}

collectedResults.forEach(finalCount => console.log(finalCount));
