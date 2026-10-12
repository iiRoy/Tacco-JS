const fileSystemModule = require('fs');

const parseInteger = (strValue) => Number(strValue);

const readInitialInput = () => {
    const inputBufferLength = fileSystemModule.fstatSync(process.stdin.fd).size;
    const dataBuffer = Buffer.alloc(inputBufferLength);
    const actualBytesRead = fileSystemModule.readSync(process.stdin.fd, dataBuffer, 0, inputBufferLength, 0);
    return dataBuffer.toString('utf8', 0, actualBytesRead).split('\n');
};

const rawInputLines = readInitialInput();

processGameData();

function calculateManhattanDistance(fromCoord, toCoord) {
    const fromX = fromCoord >> 11;
    const fromY = fromCoord & 2047;
    const toX = toCoord >> 11;
    const toY = toCoord & 2047;

    return absoluteValue(fromX - toX) + absoluteValue(fromY - toY);
}

function findMinimum(valA, valB) {
    return valB + ((valA - valB) & ((valA - valB) >> 31));
}

function encodeCoordinates(xCoord, yCoord) {
    return (xCoord << 11) + yCoord;
}

function absoluteValue(value) {
    const mask = value >> 31;
    return (value ^ mask) - mask;
}

function processGameData() {
    let currentLineIndex = 0;
    const NUM_ELEMENT_TYPES = 5;

    while (true) {
        const dimensionData = rawInputLines[currentLineIndex].split(' ');
        const gridWidth = parseInteger(dimensionData[0]);
        const gridHeight = parseInteger(dimensionData[1]);

        if (!gridWidth && !gridHeight) {
            break;
        }

        let startPosition;
        let goalPosition;
        const elementLocations = Array.from({ length: NUM_ELEMENT_TYPES }, () => []);

        const processGridCharacter = (charValue, col, row) => {
            if (charValue === '.') {
                // No action needed for empty space
            } else if (charValue >= '1' && charValue <= '5') {
                const attributeIndex = parseInteger(charValue) - 1;
                elementLocations[attributeIndex].push(encodeCoordinates(col, row));
            } else if (charValue === 'S') {
                startPosition = encodeCoordinates(col, row);
            } else if (charValue === 'G') {
                goalPosition = encodeCoordinates(col, row);
            }
        };

        for (let rowIterator = gridHeight - 1; rowIterator >= 0; rowIterator--) {
            currentLineIndex++;
            const currentGridRow = rawInputLines[currentLineIndex];
            for (let colIterator = gridWidth - 1; colIterator >= 0; colIterator--) {
                processGridCharacter(currentGridRow[colIterator], colIterator, rowIterator);
            }
        }

        const infinityValue = 1 << 30;
        let optimalStartingElement = -1;
        let minimumTotalDistance = infinityValue;

        let distanceMatrix;

        for (let initialAttributeChoice = 0; initialAttributeChoice < NUM_ELEMENT_TYPES; initialAttributeChoice++) {
            distanceMatrix = Array.from({ length: NUM_ELEMENT_TYPES }, () => []);
            for (let attrIdx = 0; attrIdx < NUM_ELEMENT_TYPES; attrIdx++) {
                const currentElementCount = elementLocations[attrIdx].length;
                distanceMatrix[attrIdx] = new Array(currentElementCount).fill(infinityValue);
            }

            const firstAttributeInSequence = (initialAttributeChoice + 1) % NUM_ELEMENT_TYPES;
            let currentAttributeIndex = firstAttributeInSequence;
            let currentAttributeCount = elementLocations[currentAttributeIndex].length;
            let currentDpRow = distanceMatrix[currentAttributeIndex];
            let currentElementRow = elementLocations[currentAttributeIndex];

            for (let outerLoopIndex = 0; outerLoopIndex < currentAttributeCount; outerLoopIndex++) {
                currentDpRow[outerLoopIndex] = calculateManhattanDistance(startPosition, currentElementRow[outerLoopIndex]);
            }

            for (let pathSegmentIndex = 0; pathSegmentIndex < NUM_ELEMENT_TYPES - 2; pathSegmentIndex++) {
                const nextAttributeIndex = (currentAttributeIndex + 1) % NUM_ELEMENT_TYPES;
                const nextDpRow = distanceMatrix[nextAttributeIndex];
                const nextElementRow = elementLocations[nextAttributeIndex];
                const nextAttributeCount = nextElementRow.length;

                if (currentAttributeCount === 0) {
                    currentAttributeIndex = nextAttributeIndex;
                    currentDpRow = nextDpRow;
                    currentElementRow = nextElementRow;
                    currentAttributeCount = nextAttributeCount;
                    continue;
                }

                for (let outerLoopIndex = 0; outerLoopIndex < currentAttributeCount; outerLoopIndex++) {
                    const currentDpValue = currentDpRow[outerLoopIndex];
                    const currentElementPosition = currentElementRow[outerLoopIndex];

                    if (currentDpValue >= minimumTotalDistance) {
                        continue;
                    }

                    for (let innerLoopIndex = 0; innerLoopIndex < nextAttributeCount; innerLoopIndex++) {
                        const distanceToNextElement = calculateManhattanDistance(currentElementPosition, nextElementRow[innerLoopIndex]);
                        nextDpRow[innerLoopIndex] = findMinimum(nextDpRow[innerLoopIndex], currentDpValue + distanceToNextElement);
                    }
                }

                currentAttributeIndex = nextAttributeIndex;
                currentDpRow = nextDpRow;
                currentElementRow = nextElementRow;
                currentAttributeCount = nextAttributeCount;
            }

            for (let outerLoopIndex = 0; outerLoopIndex < currentAttributeCount; outerLoopIndex++) {
                const currentPathDistance = currentDpRow[outerLoopIndex] + calculateManhattanDistance(currentElementRow[outerLoopIndex], goalPosition);

                if (currentPathDistance < minimumTotalDistance) {
                    minimumTotalDistance = currentPathDistance;
                    optimalStartingElement = initialAttributeChoice;
                }
            }
        }

        if (minimumTotalDistance === infinityValue) {
            console.log("NA");
        } else {
            console.log((optimalStartingElement + 1) + " " + minimumTotalDistance);
        }

        currentLineIndex++;
    }
}
