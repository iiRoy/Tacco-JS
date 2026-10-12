var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var lineSegments = (rawData.trim()).split("\n");

function checkIntervalOverlap(firstStart, firstEnd, secondStart, secondEnd) {
    // Determines if two 1D intervals [firstStart, firstEnd] and [secondStart, secondEnd] overlap.
    // An overlap exists if the end of the second interval is not before the start of the first,
    // AND the start of the second interval is not after the end of the first.
    return (secondEnd >= firstStart && secondStart <= firstEnd);
}

function processCoordinateLine(currentLine) {
    var coordinateValues = currentLine.split(" ").map(Number);

    // Using array destructuring to assign individual coordinate values for clarity.
    const [
        rectA_x1, rectA_y1, rectA_x2, rectA_y2,
        rectB_x1, rectB_y1, rectB_x2, rectB_y2
    ] = coordinateValues;

    // Evaluate if the X-axis projections of the two rectangles overlap.
    const xOverlapExists = checkIntervalOverlap(rectA_x1, rectA_x2, rectB_x1, rectB_x2);

    // Evaluate if the Y-axis projections of the two rectangles overlap.
    const yOverlapExists = checkIntervalOverlap(rectA_y1, rectA_y2, rectB_y1, rectB_y2);

    // Rectangles intersect if and only if both their X and Y projections overlap.
    const doRectanglesIntersect = xOverlapExists && yOverlapExists;

    console.log(doRectanglesIntersect ? "YES" : "NO");
}

// Iterate over each line of input and process it using the defined function.
lineSegments.forEach(processCoordinateLine);
