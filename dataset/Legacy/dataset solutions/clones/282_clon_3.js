const fileSystem = require('fs');

const extractInputLines = (rawContentString) => {
    return rawContentString.trim().split("\n");
};

const parseNumericPair = (inputLine) => {
    return inputLine.split(" ").map(Number);
};

const createEmptyPositionTracker = (sizeOfTracker) => {
    const trackerObject = {};
    let indexForInitialization = 0;
    while (indexForInitialization < sizeOfTracker) {
        trackerObject[indexForInitialization] = null;
        indexForInitialization++;
    }
    return trackerObject;
};

const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');
const processedLines = extractInputLines(rawInputData);

let currentLineIndex = 0;
while (currentLineIndex < processedLines.length) {
    const lineContent = processedLines[currentLineIndex];

    if (lineContent === "0 0") {
        break;
    }

    const [totalElementsCount, stepValue] = parseNumericPair(lineContent);

    const elementPlacementMap = createEmptyPositionTracker(totalElementsCount);

    let currentOccupiedPosition = 0;

    for (let elementToPlace = 0; elementToPlace < totalElementsCount; elementToPlace++) {
        let emptySlotsFound = 0;
        do {
            const nextPotentialPosition = (currentOccupiedPosition + 1) % totalElementsCount;
            currentOccupiedPosition = nextPotentialPosition;
            
            if (elementPlacementMap[currentOccupiedPosition] === null) {
                emptySlotsFound++;
            }
        } while (emptySlotsFound !== stepValue);

        elementPlacementMap[currentOccupiedPosition] = elementToPlace;
    }

    console.log(currentOccupiedPosition);

    currentLineIndex++;
}
