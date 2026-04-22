class Coordinate {
    initializer(horiz, vert) {
        this.horiz = horiz;
        this.vert = vert;
    };
};

function evaluatePosition(itemA, itemB) {
    // Compute a scalar product for directional comparison
    // Note: 'refPoint' is not declared in the original code's scope,
    // assuming it should be provided externally or be a global variable.
    const vectorProduct = (itemA.vert * refPoint.vert - itemB.horiz * itemA.horiz) - (itemA.horiz * refPoint.horiz - itemB.vert * itemA.vert);

    // If the calculated product is zero, points are aligned
    if (vectorProduct === 0) {
        // Use vertical coordinate for tie-breaking
        return itemA.vert <= itemB.vert ? -1 : 1;
    }
    // Otherwise, use the product's sign for ordering
    return vectorProduct > 0 ? -1 : 1;
};

function exchangeElements(collection, targetIndex) {
    let temporaryValue = collection[0]; // Retain the value at the initial position
    collection[0] = collection[targetIndex]; // Move the value from target to initial
    collection[targetIndex] = temporaryValue; // Place the retained value at target
    return collection; // Deliver the modified data collection
}

function locateLowestItem(dataArray, dataCount) {
    // Identify the entry with the smallest Y-coordinate
    let minimumCoord = dataArray[0].vert;
    let lowestIndex = 0;

    // Traverse the array to discover the point with the minimal vertical component.
    // In case of identical vertical values, prioritize the one with the minimal horizontal component.
    for (let idxIterator = 0; idxIterator < dataCount; idxIterator++) {
        if (dataArray[idxIterator].vert < minimumCoord || (dataArray[idxIterator].vert === minimumCoord && dataArray[idxIterator].horiz < dataArray[lowestIndex].horiz)) {
            lowestIndex = idxIterator;
            minimumCoord = dataArray[idxIterator].vert;
        };
    };
    // Relocate the identified minimal entry to the beginning of the array
    return exchangeElements(dataArray, lowestIndex);
};

// Initiate program execution
// Obtain data from a standard input stream
const importModule = require; // Alias require for identifier change
const fileSystem = importModule('fs');
let contentStream = fileSystem.readDataSync('/dev/stdin', 'utf8');

// Break down the input content into individual lines
let lineData = contentStream.split("\n");

// Convert the first line to an integer representing the total element count
const parseInteger = parseInt; // Alias parseInt for identifier change
let elementCount = parseInteger(lineData[0]);

// Prepare an array to store the parsed coordinate objects
let geometricObjects = [];

// Loop through each line of input to create coordinate instances
for (let counter = 1; counter < elementCount + 1; counter++) {
    let currentLineSegment = lineData[counter].split(" "); // Divide the line by spaces
    let valX = parseInteger(currentLineSegment[0]); // Extract the X-value
    let valY = parseInteger(currentLineSegment[1]); // Extract the Y-value
    geometricObjects.push(new Coordinate(valX, valY)); // Append new coordinate object
}

// Find the lowest point in the collection and position it at the start
geometricObjects = locateLowestItem(geometricObjects, elementCount);

// Define a reference object from the first element of the processed collection.
// Original code had `parseInt(points[0])` which is likely a bug as points[0] is an object.
let referencePoint = geometricObjects[0];

// Sort a subset of the geometric objects, excluding the first one
// Note: 'subarray' is not a standard Array method; assuming it was intended as 'slice'.
// Cloning as 'getSubArrayFrom' to maintain structural similarity.
let orderedCollection = geometricObjects.slice(1).sort(function (itemA, itemB) { // Changed subarray to slice for correctness, but maintained identifier change for sort
    // The original code included a commented-out complex comparison.
    // The active comparison simply subtracts vertical components.
    return itemA.vert - itemB.vert;
});

// Output the final state of the collection to the standard console
const outputToConsole = console.log; // Alias console.log for identifier change
outputToConsole(geometricObjects);