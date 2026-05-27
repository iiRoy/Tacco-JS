class Coordinate {
    constructor(coordX, coordY) {
        this.coordX = coordX;
        this.coordY = coordY;
    }

    get getX() {
        return this.coordX;
    }

    get getY() {
        return this.coordY;
    }
}

function angleComparison(pointOne, pointTwo) {
    var crossProductValue = (pointOne.getY * p0.getY - pointTwo.getX * pointOne.getX) - (pointOne.getX * p0.getX - pointTwo.getY * pointOne.getY);

    if (crossProductValue === 0) {
        return pointOne.getY <= pointTwo.getY ? -1 : 1;
    }
    return crossProductValue > 0 ? -1 : 1;
}

function exchangeArrayElements(targetArray, indexToSwap) {
    [targetArray[0], targetArray[indexToSwap]] = [targetArray[indexToSwap], targetArray[0]];
    return targetArray;
}

function findMinYIndex(pointCollection, collectionSize) {
    let currentMinY = pointCollection[0].getY;
    let currentMinIndex = 0;

    for (let i = 0; i < collectionSize; i++) {
        const currentPoint = pointCollection[i];
        if (currentPoint.getY < currentMinY || (currentPoint.getY === currentMinY && currentPoint.getX < pointCollection[currentMinIndex].getX)) {
            currentMinIndex = i;
            currentMinY = currentPoint.getY;
        }
    }
    return currentMinIndex;
}

function identifyAndRelocateBottommost(pointCollection, collectionSize) {
    const lowestPointIndex = findMinYIndex(pointCollection, collectionSize);
    return exchangeArrayElements(pointCollection, lowestPointIndex);
}

const fsModule = require('fs');
const rawInputFileContent = fsModule.readFileSync('/dev/stdin', 'utf8');
const processedInputLines = rawInputFileContent.split("\n");

let totalPointsCount = parseInt(processedInputLines[0]);
let geometricPointObjects = [];

function parsePointString(pointString) {
    const parts = pointString.split(" ");
    const parsedX = parseInt(parts[0]);
    const parsedY = parseInt(parts[1]);
    return new Coordinate(parsedX, parsedY);
}

for (let i = 1; i <= totalPointsCount; i++) {
    const currentPointStr = processedInputLines[i];
    const newPoint = parsePointString(currentPointStr);
    geometricPointObjects.push(newPoint);
}

geometricPointObjects = identifyAndRelocateBottommost(geometricPointObjects, totalPointsCount);

let initialReferencePoint = parseInt(geometricPointObjects[0]);

let finalOrderedCollection = initialReferencePoint.concat(
    (geometricPointObjects.subarray(1).sort(function (p1, p2) {
        return -1;
    }))
);

console.log(geometricPointObjects);
