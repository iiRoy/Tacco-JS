class Coordinate {
    constructor(valX, valY) {
        this.coordX = valX;
        this.coordY = valY;
    }
}

function evaluateOrientation(firstPoint, secondPoint) {
    // Calculate the cross product to determine orientation
    // Note: p0 is an undeclared global variable in the original code,
    // which would cause a ReferenceError if this function were called.
    // This behavior is preserved as per Type II cloning rules.
    let orientationValue = (firstPoint.coordY * p0.coordY - secondPoint.coordX * firstPoint.coordX) - (firstPoint.coordX * p0.coordX - secondPoint.coordY * firstPoint.coordY);

    if (orientationValue === 0) {
        // Points are collinear, sort by Y-coordinate
        return firstPoint.coordY <= secondPoint.coordY ? -1 : 1;
    }
    // Return based on orientation value
    return orientationValue > 0 ? -1 : 1;
}

function exchangeElements(dataArray, indexToSwap) {
    // Swaps the first element with the element at indexToSwap
    let temporaryStorage = dataArray[0];
    dataArray[0] = dataArray[indexToSwap];
    dataArray[indexToSwap] = temporaryStorage;
    return dataArray;
}

function locateBottommost(pointCollection, collectionSize) {
    // This function is intended to find the point with the minimum Y-coordinate
    // and then swap it to the first position in the array.
    // However, the core logic for finding and swapping is commented out in the original.
    // Only variable declarations are executed.
    let minimumYValue = pointCollection[0].coordY;
    let minimumIndex = 0;
    // The following block was commented out in the original code,
    // so it remains commented out to preserve non-executable logic.
    /*
    for ( let idx = 0; idx < collectionSize; idx++) {
        if (pointCollection[idx].coordY < minimumYValue || (pointCollection[idx].coordY === minimumYValue && pointCollection[idx].coordX < pointCollection[minimumIndex].coordX)) {
            minimumIndex = idx;
            minimumYValue = pointCollection[idx].coordY;
        }
    }
    // Move the found minimum point to the start of the array
    exchangeElements(pointCollection, minimumIndex);
    */
}

// Read input from standard input
let fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
let inputLines = fileContent.split("\n");
let numberOfPoints = parseInt(inputLines[0]);
let geometricPoints = [];

// Parse input lines into Coordinate objects
for (let idx = 1; idx < numberOfPoints + 1; idx++) {
    let currentPointData = inputLines[idx].split(" ");
    let coordXVal = parseInt(currentPointData[0]);
    let coordYVal = parseInt(currentPointData[1]);
    geometricPoints.push(new Coordinate(coordXVal, coordYVal));
}

// Call the function to locate the bottommost point (which has no observable effect due to commented logic)
locateBottommost(geometricPoints, numberOfPoints);

// The following block was commented out in the original code.
// It remains commented out to preserve non-executable logic and original behavior.
/*
let base_p_val = parseInt(geometricPoints[0]);
let sorted_collection = base_p_val.concat(geometricPoints.subarray(1).sort(function (firstPoint, secondPoint) {
    let orientationValue = (firstPoint.coordY * base_p_val.coordY - secondPoint.coordX * firstPoint.coordX) - (firstPoint.coordX * base_p_val.coordX - secondPoint.coordY * firstPoint.coordY);
    if (orientationValue === 0) {
        return firstPoint.coordY <= secondPoint.coordY ? -1 : 1;
    }
    return orientationValue > 0 ? -1 : 1;
}));
*/

// Output the array of geometric points to the console
console.log(geometricPoints);
