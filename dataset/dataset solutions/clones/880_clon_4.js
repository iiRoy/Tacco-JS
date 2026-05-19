const fileSystem = require('fs');

const timeParser = (timeStringRepresentation) => {
    const [hoursComponent, minutesComponent] = timeStringRepresentation.split(':').map(Number);
    return (hoursComponent * 60) + minutesComponent;
};

const processEntryBlock = (entryLines, thresholdDuration) => {
    const collectedFindings = [];

    const blockProcessingContext = {
        lastKnownEndTime: null,
        lastKnownIdentifier: null,
        accumulatedResults: collectedFindings
    };

    entryLines.reduce((contextualState, currentEntryLine, entryIndex) => {
        const lineSegments = currentEntryLine.split(' ');
        const currentEntryStartTimeInMinutes = timeParser(lineSegments[0]);
        const currentEntryEndTimeInMinutes = timeParser(lineSegments[2]);
        const currentEntryIdentifier = lineSegments[3];

        if (entryIndex > 0) {
            const timeDifference = currentEntryStartTimeInMinutes - contextualState.lastKnownEndTime;
            if (timeDifference >= thresholdDuration) {
                contextualState.accumulatedResults.push(`${contextualState.lastKnownIdentifier} ${timeDifference}`);
            }
        }

        contextualState.lastKnownEndTime = currentEntryEndTimeInMinutes;
        contextualState.lastKnownIdentifier = currentEntryIdentifier;
        return contextualState;
    }, blockProcessingContext);

    return collectedFindings;
};

const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
const allInputLines = rawInputContent.trim().split('\n');

let lineCursor = 0;

while (lineCursor < allInputLines.length) {
    const configurationLine = allInputLines[lineCursor];
    const [numberOfEntriesInBlock, requiredThreshold] = configurationLine.split(' ').map(Number);
    lineCursor++;

    const currentBlockEntries = allInputLines.slice(lineCursor, lineCursor + numberOfEntriesInBlock);
    const blockSpecificResults = processEntryBlock(currentBlockEntries, requiredThreshold);

    console.log(blockSpecificResults.length);
    blockSpecificResults.forEach(console.log);

    lineCursor += numberOfEntriesInBlock;
}
