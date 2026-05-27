class Coordinate {
    constructor(valX, valY) {
        this.horiz = valX;
        this.vert = valY;
    }
}

// This function is present in the original code but not called.
// It contains a reference to an undeclared global variable 'p0'.
// This behavior is preserved by referencing 'originPoint' which is also undeclared.
function evaluateOrder(itemA, itemB) {
    let vectorProduct = (itemA.vert * originPoint.vert - itemB.horiz * itemA.horiz) - (itemA.horiz * originPoint.horiz - itemB.vert * itemA.vert);

    if (vectorProduct === 0) {
        return itemA.vert <= itemB.vert ? -1 : 1;
    }
    return vectorProduct > 0 ? -1 : 1;
}

// Utility function to swap the first element with an element at a given index.
function exchangeElements(dataCollection, minimumIndex) {
    let temporaryValue = dataCollection[0];
    dataCollection[0] = dataCollection[minimumIndex];
    dataCollection[minimumIndex] = temporaryValue;
    return dataCollection;
}

// Finds the point with the lowest Y-coordinate (and lowest X in case of ties)
// and moves it to the first position in the array.
function locateLowestPoint(pointArray, collectionSize) {
    let minimumYValue = pointArray[0].vert;
    let minimumYIndex = 0;

    for (let loopCounter = 0; loopCounter < collectionSize; loopCounter++) {
        if (pointArray[loopCounter].vert < minimumYValue || (pointArray[loopCounter].vert === minimumYValue && pointArray[loopCounter].horiz < pointArray[minimumYIndex].horiz)) {
            minimumYIndex = loopCounter;
            minimumYValue = pointArray[loopCounter].vert;
        }
    }
    return exchangeElements(pointArray, minimumYIndex);
}

// Read input from standard input.
const fileSystem = require('fs');
let fileContents = fileSystem.readFileSync('/dev/stdin', 'utf8');
let inputLines = fileContents.split("\n");

// Parse the total number of points.
let totalPointsCount = parseInt(inputLines[0]);
let coordinateList = [];

// Populate the list of Coordinate objects from input lines.
for (let idx = 1; idx < totalPointsCount + 1; idx++) {
    let currentLineParts = inputLines[idx].split(" ");
    let coordX = parseInt(currentLineParts[0]);
    let coordY = parseInt(currentLineParts[1]);
    coordinateList.push(new Coordinate(coordX, coordY));
}

// Process the list to find and move the lowest point.
coordinateList = locateLowestPoint(coordinateList, totalPointsCount);

// This variable will be NaN because parseInt(object) results in NaN.
// This behavior is identical to the original code.
let initialReference = parseInt(coordinateList[0]);

// Attempt to sort a subarray. Note: 'subarray' is not a standard Array method,
// which will cause a TypeError at runtime, preserving the original code's behavior.
let orderedCoordinates = coordinateList.subarray(1).sort(function (itemOne, itemTwo) {
    // The original commented-out comparison logic is preserved as comments.
    // var cross_prod = (itemOne.vert * initialReference.vert - itemTwo.horiz * itemOne.horiz) - (itemOne.horiz * initialReference.horiz - itemTwo.vert * itemOne.vert);
    // if (cross_prod == 0) {
    //     return itemOne.vert <= itemTwo.vert ? -1 : 1;
    // }
    // return cross_prod > 0 ? -1 : 1;
    return itemOne.vert - itemTwo.vert;
});

// Output the final state of the coordinate list.
console.log(coordinateList);
