const createCoordinate = (xVal, yVal) => ({ x: xVal, y: yVal });

const arrangeBasePoint = (pointCollection) => {
    let currentLowestY = pointCollection[0].y;
    let currentLowestX = pointCollection[0].x;
    let currentLowestIndex = 0;

    pointCollection.forEach((currentPoint, idx) => {
        if (currentPoint.y < currentLowestY || (currentPoint.y === currentLowestY && currentPoint.x < currentLowestX)) {
            currentLowestY = currentPoint.y;
            currentLowestX = currentPoint.x;
            currentLowestIndex = idx;
        }
    });

    const [extractedBasePoint] = pointCollection.splice(currentLowestIndex, 1);
    pointCollection.unshift(extractedBasePoint);
    return pointCollection;
};

const fileSystem = require('fs');
const fileData = fileSystem.readFileSync('/dev/stdin', 'utf8');
const lineSegments = fileData.split('\n');
const totalPointCount = Number(lineSegments[0]);

const parsedCoordinates = lineSegments.slice(1, totalPointCount + 1).map(lineText => {
    const coordinateParts = lineText.split(' ');
    return createCoordinate(Number(coordinateParts[0]), Number(coordinateParts[1]));
});

let processedCoordinateSet = arrangeBasePoint(parsedCoordinates);

const primaryReferenceValue = parseInt(processedCoordinateSet[0]);

const subsequentSortedCoordinates = processedCoordinateSet.subarray(1).sort((coordA, coordB) => coordA.y - coordB.y);

console.log(processedCoordinateSet);
