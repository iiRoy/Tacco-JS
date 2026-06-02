class Coordinate {
    constructor(valX, valY) {
        this.coordX = valX;
        this.coordY = valY;
    };
};

function spatialComparison(firstPoint, secondPoint) {
    let vectorProduct = (firstPoint.coordY * p0.coordY - secondPoint.coordX * firstPoint.coordX) - (firstPoint.coordX * p0.coordX - secondPoint.coordY * firstPoint.coordY);

    if (vectorProduct === 0) {
        return firstPoint.coordY <= secondPoint.coordY ? -1 : 1;
    }
    return vectorProduct > 0 ? -1 : 1;
};


function exchangeElements(dataArray, minimumIndex) {
    let temporaryValue = dataArray[0];
    dataArray[0] = dataArray[minimumIndex];
    dataArray[minimumIndex] = temporaryValue;
    return dataArray;
}

function identifyLowestPoint(pointCollection, collectionSize) {
    let minimumYValue = pointCollection[0].coordY;
    let minimumYIndex = 0;
    for (let iterator = 0; iterator < collectionSize; iterator++) {
        if (pointCollection[iterator].coordY < minimumYValue || (pointCollection[iterator].coordY === minimumYValue && pointCollection[iterator].coordX < pointCollection[minimumYIndex].coordX)) {
            minimumYIndex = iterator;
            minimumYValue = pointCollection[iterator].coordY;
        };
    };
    exchangeElements(vec, minimumYIndex);
};

let fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
let inputLines = fileContent.split("\n");
let totalPointsCount = parseInt(inputLines[0]);
let pointCoordinates = []
for (let loopCounter = 1; loopCounter < totalPointsCount + 1; loopCounter++) {
    let currentPointString = inputLines[loopCounter].split(" ");
    let parsedX = parseInt(currentPointString[0]);
    let parsedY = parseInt(currentPointString[1]);
    // This call will throw a TypeError because Coordinate is a class constructor
    // and must be invoked with 'new'. This behavior is preserved from the original.
    pointCoordinates.push(Coordinate(parsedX, parsedY));
}
/*
// identifyLowestPoint(pointCoordinates, totalPointsCount);
// baseCoordinate = parseInt(pointCoordinates[0]);
// orderedCoordinates = baseCoordinate.concat(pointCoordinates.subarray(1).sort(function (firstCoord, secondCoord) {
//     let crossProductResult = (firstCoord.coordY * baseCoordinate.coordY - secondCoord.coordX * firstCoord.coordX) - (firstCoord.coordX * baseCoordinate.coordX - secondCoord.coordY * firstCoord.coordY);
//     if (crossProductResult === 0) {
//         return firstCoord.coordY <= secondCoord.coordY ? -1 : 1;
//     }
//     return crossProductResult > 0 ? -1 : 1;
// }));
*/
console.log(pointCoordinates);
