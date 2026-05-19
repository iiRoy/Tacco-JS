class Coord {
    constructor(coordX, coordY) {
        this.coordX = coordX;
        this.coordY = coordY;
    }
}

// This function is not utilized in the main script execution flow.
// Note: The variable 'p0' within this function's scope is undeclared,
// which would lead to a ReferenceError or TypeError if the function were invoked.
// This behavior mirrors the original's unused 'compare' function.
function determineOrder(pointOne, pointTwo) {
    const firstTermComponent = (pointOne.coordY * p0.coordY);
    const secondTermComponent = (pointTwo.coordX * pointOne.coordX);
    const thirdTermComponent = (pointOne.coordX * p0.coordX);
    const fourthTermComponent = (pointTwo.coordY * pointOne.coordY);

    const crossProductVal = (firstTermComponent - secondTermComponent) - (thirdTermComponent - fourthTermComponent);

    if (crossProductVal === 0) {
        return pointOne.coordY <= pointTwo.coordY ? -1 : 1;
    }
    return crossProductVal > 0 ? -1 : 1;
}

function exchangeElements(dataCollection, minimumIndex) {
    const temporaryHolder = dataCollection[0];
    dataCollection[0] = dataCollection[minimumIndex];
    dataCollection[minimumIndex] = temporaryHolder;
    return dataCollection;
}

function locateAndMoveLowest(dataCollection, collectionSize) {
    let currentMinYValue = dataCollection[0].coordY;
    let currentMinimumIndex = 0;

    for (let idx = 0; idx < collectionSize; idx++) {
        const pointAtCurrentIndex = dataCollection[idx];
        const isCurrentYLower = pointAtCurrentIndex.coordY < currentMinYValue;
        const isCurrentYEqualAndXLower = pointAtCurrentIndex.coordY === currentMinYValue && pointAtCurrentIndex.coordX < dataCollection[currentMinimumIndex].coordX;

        if (isCurrentYLower || isCurrentYEqualAndXLower) {
            currentMinimumIndex = idx;
            currentMinYValue = pointAtCurrentIndex.coordY;
        }
    }
    return exchangeElements(dataCollection, currentMinimumIndex);
}

const STD_IN_FILE_PATH = '/dev/stdin';
const fileSystemModule = require('fs');

const rawFileContent = fileSystemModule.readFileSync(STD_IN_FILE_PATH, 'utf8');
const inputDataLines = rawFileContent.split("\n");

const totalPointsCount = parseInt(inputDataLines[0]);
const coordinateSet = [];

for (let idx = 1; idx < totalPointsCount + 1; idx++) {
    const lineString = inputDataLines[idx];
    const lineParts = lineString.split(" ");
    const parsedXCoordinate = parseInt(lineParts[0]);
    const parsedYCoordinate = parseInt(lineParts[1]);
    coordinateSet.push(new Coord(parsedXCoordinate, parsedYCoordinate));
}

const processedCoordinateSet = locateAndMoveLowest(coordinateSet, totalPointsCount);

const firstElementOfSet = processedCoordinateSet[0];
// This line intentionally replicates the original's bug:
// parseInt on an object (a Coord instance) results in NaN.
const referencePointValue = parseInt(firstElementOfSet);

// This line intentionally replicates the original's bug:
// Array.prototype.subarray is not a standard JavaScript array method,
// which will cause a TypeError at runtime.
const partiallySortedSet = processedCoordinateSet.subarray(1).sort(function (pointOne, pointTwo) {
    // The original code's commented-out block for cross_prod logic is ignored,
    // and the actual sort logic (p1.y - p2.y) is preserved.
    return pointOne.coordY - pointTwo.coordY;
});

console.log(processedCoordinateSet);
