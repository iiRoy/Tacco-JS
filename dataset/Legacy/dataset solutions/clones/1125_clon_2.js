class Coord {
    constructor(horiz, vert) {
        this.horiz = horiz; // Assign the horizontal coordinate
        this.vert = vert;   // Assign the vertical coordinate
    }
}

// This function is intended for comparing two points, but it's not actually used in the main logic.
// It contains a reference to an undefined variable 'p0', which would cause a ReferenceError if invoked.
function sortPoints(ptA, ptB) {
    // The calculation below uses 'p0', which is not defined within this scope.
    // This bug from the original code is intentionally preserved.
    let crossProductVal = (ptA.vert * p0.vert - ptB.horiz * ptA.horiz) - (ptA.horiz * p0.horiz - ptB.vert * ptA.horiz);

    if (crossProductVal === 0) {
        // If points are collinear, compare based on their vertical coordinates.
        return ptA.vert <= ptB.vert ? -1 : 1;
    }
    // Otherwise, compare based on the cross product value.
    return crossProductVal > 0 ? -1 : 1;
}

// Helper function to swap the element at the first position with an element at a specified index.
function exchangeElements(pointArray, minimumIndex) {
    let temporaryHolder = pointArray[0]; // Temporarily store the first element.
    pointArray[0] = pointArray[minimumIndex]; // Move the element from minimumIndex to the start.
    pointArray[minimumIndex] = temporaryHolder; // Place the original first element at minimumIndex.
    return pointArray; // Return the modified array.
}

// Function to identify the point with the lowest Y-coordinate (and lowest X if Ys are equal)
// and then move this identified point to the very first position in the array.
function locateLowestPoint(pointArray, collectionSize) {
    let minYValue = pointArray[0].vert; // Initialize minimum Y with the first point's Y.
    let minimumIndex = 0; // Initialize minimum index to the first point's index.

    // Iterate through the array to find the point with the absolute lowest Y-coordinate.
    for (let idx = 0; idx < collectionSize; idx++) {
        // Check if the current point has a lower Y, or if Ys are equal, a lower X.
        if (pointArray[idx].vert < minYValue || (pointArray[idx].vert === minYValue && pointArray[idx].horiz < pointArray[minimumIndex].horiz)) {
            minimumIndex = idx; // Update the index of the minimum point found so far.
            minYValue = pointArray[idx].vert; // Update the minimum Y value.
        }
    }
    // After finding the lowest point, swap it with the element at the array's beginning.
    return exchangeElements(pointArray, minimumIndex);
}

// Read the entire content of standard input as a UTF-8 string.
const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
// Split the input content into an array of lines.
const inputLines = fileContent.split("\n");

// Parse the first line to determine the total number of points.
const collectionSize = parseInt(inputLines[0]);
// Initialize an empty array to store the parsed coordinate objects.
const coordinateSet = [];

// Loop through the input lines, starting from the second line, to parse each point.
for (let idx = 1; idx < collectionSize + 1; idx++) {
    // Split each line by space to separate the X and Y string components.
    let currentPointStr = inputLines[idx].split(" ");
    // Parse the X coordinate as an integer.
    let xCoord = parseInt(currentPointStr[0]);
    // Parse the Y coordinate as an integer.
    let yCoord = parseInt(currentPointStr[1]);
    // Create a new Coord object and add it to our collection.
    coordinateSet.push(new Coord(xCoord, yCoord));
}

// Call the function to find the lowest point and move it to the front of the array.
coordinateSet = locateLowestPoint(coordinateSet, collectionSize);

// Attempt to parse the first point object (which is a Coord instance) as an integer.
// This operation will result in 'NaN' because a Coord object cannot be directly parsed into an integer.
const basePointRef = parseInt(coordinateSet[0]);

// Attempt to concatenate 'basePointRef' (which is NaN) with a sorted sub-array.
// The original code uses 'subarray', which is not a standard JavaScript Array method.
// This will cause a TypeError: coordinateSet.subarray is not a function, preserving the original error behavior.
// The anonymous sort function provided here always returns -1, making the sort order effectively arbitrary or reversed.
const orderedCoordinates = basePointRef.concat((coordinateSet.subarray(1).sort(function (ptA, ptB) {
    // The following lines were commented out in the original code, indicating they were not active.
    // let crossProductVal = (ptA.vert * basePointRef.vert - ptB.horiz * ptA.horiz) - (ptA.horiz * basePointRef.horiz - ptB.vert * ptA.horiz);
    // if (crossProductVal === 0) {
    //     return ptA.vert <= ptB.vert ? -1 : 1;
    // }
    // return crossProductVal > 0 ? -1 : 1;
    return -1; // This constant return value means the sort will not order elements meaningfully.
})));

// Log the coordinate set to the console.
// Due to the TypeError from 'subarray', this line will likely not be reached during execution.
console.log(coordinateSet);
