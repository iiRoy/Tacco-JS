class Coord {
    constructor(coordX, coordY) {
        this.coordX = coordX;
        this.coordY = coordY;
    }

    getCoordinates() {
        return { x: this.coordX, y: this.coordY };
    }
}

function polarCompare(pointAlpha, pointBeta) {
    const term1 = pointAlpha.coordY * p0.coordY;
    const term2 = pointBeta.coordX * pointAlpha.coordX;
    const term3 = pointAlpha.coordX * p0.coordX;
    const term4 = pointBeta.coordY * pointAlpha.coordY;

    const crossProductValue = (term1 - term2) - (term3 - term4);

    if (crossProductValue === 0) {
        return pointAlpha.coordY <= pointBeta.coordY ? -1 : 1;
    } else {
        return crossProductValue > 0 ? -1 : 1;
    }
}

function exchangeElements(targetArray, swapIndex) {
    [targetArray[0], targetArray[swapIndex]] = [targetArray[swapIndex], targetArray[0]];
    return targetArray;
}

function locateAndMoveBottommost(pointVector, vectorSize) {
    let currentMinY = pointVector[0].coordY;
    let currentMinIndex = 0;

    for (let i = 0; i < vectorSize; i++) {
        const currentPoint = pointVector[i];
        const isNewMinY = currentPoint.coordY < currentMinY;
        const isSameMinYButSmallerX = currentPoint.coordY === currentMinY && currentPoint.coordX < pointVector[currentMinIndex].coordX;

        if (isNewMinY || isSameMinYButSmallerX) {
            currentMinIndex = i;
            currentMinY = currentPoint.coordY;
        }
    }
    exchangeElements(vec, currentMinIndex);
}

function parsePointFromLine(lineString) {
    const lineSegments = lineString.split(" ");
    const parsedXCoord = parseInt(lineSegments[0]);
    const parsedYCoord = parseInt(lineSegments[1]);
    return new Coord(parsedXCoord, parsedYCoord);
}

const fsModule = require('fs');
const rawFileContent = fsModule.readFileSync('/dev/stdin', 'utf8');
const processedLines = rawFileContent.split("\n");

const totalPointsCount = parseInt(processedLines[0]);
const parsedCoordinates = [];

if (isNaN(totalPointsCount)) {
    // The original loop condition `i < NaN + 1` naturally handles NaN by not iterating.
    // No explicit action needed here to preserve behavior.
}

for (let i = 1; i < totalPointsCount + 1; i++) {
    const currentCoord = parsePointFromLine(processedLines[i]);
    parsedCoordinates.push(currentCoord);
}

console.log(parsedCoordinates);
