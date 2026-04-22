const filesystemModule = require('fs');
let inputFileSize = filesystemModule.fstatSync(process.stdin.fd).size;
let dataReadBuffer = Buffer.alloc(inputFileSize);
let bytesTransferred = filesystemModule.readSync(process.stdin.fd, dataReadBuffer, 0, inputFileSize, 0);
let inputLineData = dataReadBuffer.toString('utf8', 0, bytesTransferred).split('\n');

processInput();

function processInput() {
    let linesProcessedCount = 0;
    while (true) {
        let dimensionDetails = inputLineData[linesProcessedCount].split(' ');
        let gridWidth = parseInt(dimensionDetails[0], 10);
        let gridHeight = parseInt(dimensionDetails[1], 10);

        if (gridWidth === 0 && gridHeight === 0) {
            break;
        }

        let sourcePoint;
        let targetPoint;
        let entityLocations = [[], [], [], [], []];
        let cellChar;
        let currentLineContent;
        let entityTypeTempCache;
        let rowIterator;
        let colIterator;

        for (rowIterator = gridHeight; rowIterator--;) {
            linesProcessedCount++;
            currentLineContent = inputLineData[linesProcessedCount];
            for (colIterator = gridWidth; colIterator--;) {
                cellChar = currentLineContent[colIterator];

                if (cellChar === '.') {
                    // Empty space, no specific action.
                } else if (cellChar >= '1' && cellChar <= '5') {
                    let entityTypeIndex = parseInt(cellChar, 10) - 1;
                    entityTypeTempCache = entityLocations[entityTypeIndex];
                    entityTypeTempCache.push(encodeCoordinates(colIterator, rowIterator));
                } else if (cellChar === 'S') {
                    sourcePoint = encodeCoordinates(colIterator, rowIterator);
                } else {
                    targetPoint = encodeCoordinates(colIterator, rowIterator);
                }
            }
        }

        const MAX_DISTANCE_VALUE = 1 << 29;
        let optimalPathStartType = -1;
        let pathLengthCandidate;
        let shortestOverallPath = MAX_DISTANCE_VALUE;
        let distanceMatrix;
        let outerLoopIndex;
        let innerLoopIndex;
        let pathSegmentIndex;
        let currentArrayLength;
        let currentTypeDistancesRef;
        let singleEntityDistanceRef;
        let nextTypeDistancesRef;
        let currentTypeEntitiesRef;
        let singleCurrentEntityRef;
        let nextTypeEntitiesRef;
        let currentTypeIndex;
        let currentTypeCount;
        let nextTypeIndex;
        let nextTypeCount;

        for (let startingEntityType = 0; startingEntityType < 5; startingEntityType++) {
            distanceMatrix = [[], [], [], [], []];

            for (outerLoopIndex = 4; outerLoopIndex--;) {
                currentArrayLength = entityLocations[outerLoopIndex].length;
                let distanceArrayRef = distanceMatrix[outerLoopIndex];
                distanceArrayRef.length = currentArrayLength;
                while (currentArrayLength--) {
                    distanceArrayRef[currentArrayLength] = MAX_DISTANCE_VALUE;
                }
            }

            currentTypeIndex = (startingEntityType + 1) % 5;
            currentTypeCount = entityLocations[currentTypeIndex].length;
            currentTypeDistancesRef = distanceMatrix[currentTypeIndex];
            currentTypeEntitiesRef = entityLocations[currentTypeIndex];

            for (outerLoopIndex = 0; outerLoopIndex < currentTypeCount; outerLoopIndex++) {
                currentTypeDistancesRef[outerLoopIndex] = calculateManhattanDistance(sourcePoint, currentTypeEntitiesRef[outerLoopIndex]);
            }

            for (pathSegmentIndex = 0; pathSegmentIndex < 3; pathSegmentIndex++) {
                nextTypeIndex = (currentTypeIndex + 1) % 5;
                nextTypeDistancesRef = distanceMatrix[nextTypeIndex];
                nextTypeEntitiesRef = entityLocations[nextTypeIndex];
                nextTypeCount = nextTypeEntitiesRef.length;
                for (outerLoopIndex = 0; outerLoopIndex < currentTypeCount; outerLoopIndex++) {
                    singleEntityDistanceRef = currentTypeDistancesRef[outerLoopIndex];
                    singleCurrentEntityRef = currentTypeEntitiesRef[outerLoopIndex];

                    if (singleEntityDistanceRef >= shortestOverallPath) {
                        continue;
                    }

                    for (innerLoopIndex = 0; innerLoopIndex < nextTypeCount; innerLoopIndex++) {
                        nextTypeDistancesRef[innerLoopIndex] = findMinimum(nextTypeDistancesRef[innerLoopIndex], singleEntityDistanceRef + calculateManhattanDistance(singleCurrentEntityRef, nextTypeEntitiesRef[innerLoopIndex]));
                    }
                }

                currentTypeIndex = nextTypeIndex;
                currentTypeDistancesRef = nextTypeDistancesRef;
                currentTypeEntitiesRef = nextTypeEntitiesRef;
                currentTypeCount = nextTypeCount;
            }

            for (outerLoopIndex = 0; outerLoopIndex < nextTypeCount; outerLoopIndex++) {
                pathLengthCandidate = nextTypeDistancesRef[outerLoopIndex] + calculateManhattanDistance(nextTypeEntitiesRef[outerLoopIndex], targetPoint);

                if (pathLengthCandidate < shortestOverallPath) {
                    shortestOverallPath = pathLengthCandidate;
                    optimalPathStartType = startingEntityType;
                }
            }
        }

        if (shortestOverallPath === MAX_DISTANCE_VALUE) {
            console.log("NA");
        } else {
            console.log((optimalPathStartType + 1) + " " + shortestOverallPath);
        }

        linesProcessedCount++;
    }
}

function calculateManhattanDistance(pointA, pointB) {
    const X_COORD_SHIFT = 11;
    const Y_COORD_MASK = 2047;

    let x1 = pointA >> X_COORD_SHIFT;
    let y1 = pointA & Y_COORD_MASK;
    let x2 = pointB >> X_COORD_SHIFT;
    let y2 = pointB & Y_COORD_MASK;

    return absoluteValue(x1 - x2) + absoluteValue(y1 - y2);
}

function findMinimum(valueA, valueB) {
    return valueB + ((valueA - valueB) & ((valueA - valueB) >> 31));
}

function encodeCoordinates(xCoord, yCoord) {
    const X_COORD_BIT_OFFSET = 11;
    return (xCoord << X_COORD_BIT_OFFSET) + yCoord;
}

function absoluteValue(numericValue) {
    let signBit = numericValue >> 31;
    return (numericValue ^ signBit) - signBit;
}