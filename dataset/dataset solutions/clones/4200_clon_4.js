let programInputLines = [];
let currentInputIndex = 0;

function acquireNextInputToken() {
    if (currentInputIndex < programInputLines.length) {
        return programInputLines[currentInputIndex++];
    }
    throw new Error('End of input stream reached');
}

function processLineIntoNumbers() {
    return acquireNextInputToken().split(' ').map(Number);
}

function presentOutcome(value) {
    console.log(value);
}

const ioSystem = require('readline').createInterface({
    input: process.stdin, output: process.stdout
});

ioSystem.on('line', (dataLine) => {
    programInputLines.push(dataLine);
});

ioSystem.on('close', () => {
    initiateProcessing();
    console.error('\n↑Input ↓Output');
});

function initiateProcessing() {
    const initialParameters = processLineIntoNumbers();
    const eventQuantity = initialParameters[0];

    const chronologicalEvents = [];

    for (let eventCounter = 0; eventCounter < eventQuantity; eventCounter++) {
        const eventDetails = processLineIntoNumbers();
        const startPoint = eventDetails[0];
        const endPoint = eventDetails[1];
        const identifierCode = eventDetails[2];

        chronologicalEvents.push([startPoint - 1, identifierCode, 1]); // 1 signifies a channel starting
        chronologicalEvents.push([endPoint, identifierCode, -1]);   // -1 signifies a channel ending
    }

    chronologicalEvents.sort((eventA, eventB) => {
        if (eventA[0] !== eventB[0]) {
            return eventA[0] - eventB[0];
        }
        return eventA[2] - eventB[2]; // Process ending events before starting events at the same timestamp
    });

    let currentlyActiveIdentifiers = new Set();
    let highestSimultaneousCount = 0;

    for (const anEvent of chronologicalEvents) {
        const eventChangeType = anEvent[2];
        const eventIdentifier = anEvent[1];

        if (eventChangeType === 1) { // Channel starts
            currentlyActiveIdentifiers.add(eventIdentifier);
        } else { // Channel ends
            currentlyActiveIdentifiers.delete(eventIdentifier);
        }
        
        highestSimultaneousCount = Math.max(highestSimultaneousCount, currentlyActiveIdentifiers.size);
    }

    presentOutcome(highestSimultaneousCount);
}