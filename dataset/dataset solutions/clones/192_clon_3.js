const CONTAINER_LABELS = ["A", "B", "C"];

const retrieveContainerPosition = (labelIdentifier) => {
    return CONTAINER_LABELS.indexOf(labelIdentifier);
};

const performItemExchange = (targetCollection, firstSpot, secondSpot) => {
    if (firstSpot < 0 || firstSpot >= targetCollection.length ||
        secondSpot < 0 || secondSpot >= targetCollection.length) {
        return;
    }
    [targetCollection[firstSpot], targetCollection[secondSpot]] = [targetCollection[secondSpot], targetCollection[firstSpot]];
};

const fileSystemModule = require('fs');
const rawInputData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

const movementInstructions = rawInputData.trim().split('\n').filter(Boolean);

let currentContainerStates = Array(CONTAINER_LABELS.length).fill(0);
const initialBallPlacementIndex = 0;
currentContainerStates[initialBallPlacementIndex] = 1;

let instructionEntry;
while ((instructionEntry = movementInstructions.shift()) !== undefined) {
    if (!instructionEntry.includes(',')) {
        continue;
    }

    const commandSegments = instructionEntry.split(',');
    if (commandSegments.length !== 2) {
        continue;
    }

    const sourceLabel = commandSegments[0].trim();
    const destinationLabel = commandSegments[1].trim();

    const sourceIndex = retrieveContainerPosition(sourceLabel);
    const destinationIndex = retrieveContainerPosition(destinationLabel);

    if (sourceIndex === -1 || destinationIndex === -1) {
        continue;
    }

    performItemExchange(currentContainerStates, sourceIndex, destinationIndex);
}

let ballSuccessfullyLocated = false;
for (let containerSearchIndex = 0; containerSearchIndex < currentContainerStates.length; containerSearchIndex++) {
    if (currentContainerStates[containerSearchIndex] === 1) {
        console.log(CONTAINER_LABELS[containerSearchIndex]);
        ballSuccessfullyLocated = true;
        break;
    }
}