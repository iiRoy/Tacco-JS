// This array will hold all the incoming text strings from the input source.
let collectedInputStrings = [];

// Initialize an interface for handling input and output streams.
const inputOutputHandler = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

// Attach a listener to process each line as it's received.
inputOutputHandler.on('line', (currentTextLine) => {
    // Store the processed line into our collection.
    collectedInputStrings.push(currentTextLine);
});

// When the standard input stream signals its end, trigger the main processing logic.
process.stdin.on('end', () => {
    // Begin the primary execution flow with the gathered data.
    orchestrateExecution(collectedInputStrings);
});

// Define a small floating-point threshold for numerical comparisons.
const COMPARISON_THRESHOLD = 0.0000000001;

// Function to determine the intersection point of two line segments.
function calculateSegmentIntersection(firstSegment, secondSegment) {
    // Extract start and end coordinates for both segments.
    const startA = firstSegment[0];
    const endA = firstSegment[1];
    const startB = secondSegment[0];
    const endB = secondSegment[1];

    let ratioParameter, coordXValue, coordYValue, determinantValue;

    // Calculate the determinant to check for parallelism or collinearity.
    determinantValue = (endA.xCoord - startA.xCoord) * (endB.yCoord - startB.yCoord) - (endA.yCoord - startA.yCoord) * (endB.xCoord - startB.xCoord);

    // If the determinant is too small (near zero), segments are parallel or collinear, so no unique intersection.
    if (determinantValue < COMPARISON_THRESHOLD) {
        return null;
    }

    // Calculate the parameter 'ratioParameter' for the first segment.
    ratioParameter = ((endB.yCoord - startB.yCoord) * (startB.xCoord - startA.xCoord) - (endB.xCoord - startB.xCoord) * (startB.yCoord - startA.yCoord)) / determinantValue;

    // Compute the X and Y coordinates of the potential intersection point.
    coordXValue = startA.xCoord * (1 - ratioParameter) + endA.xCoord * ratioParameter;
    coordYValue = startA.yCoord * (1 - ratioParameter) + endA.yCoord * ratioParameter;

    // Check if the intersection point lies within the bounds of the first segment (0 < ratioParameter < 1).
    if (ratioParameter < COMPARISON_THRESHOLD || (1 - ratioParameter) < COMPARISON_THRESHOLD) {
        return null; // Intersection occurs outside the segment.
    }

    // Return the intersection point as an object.
    return { xCoord: coordXValue, yCoord: coordYValue };
}

// This function calculates the total number of unique intersection points among a given set of line segments.
function computeUniqueIntersections(segmentGeometryData) {
    let intersectionPointsCollection;
    let totalUniquePoints = 1; // Start with 1 as per problem logic (often for base cases or initial segment)
    let outerLoopIndex, innerLoopIndex, currentIntersectionResult;

    // Iterate through each segment in the provided dataset.
    for (outerLoopIndex = 0; outerLoopIndex < segmentGeometryData.length; outerLoopIndex++) {
        totalUniquePoints++; // Increment for each new segment being considered.
        intersectionPointsCollection = []; // Reset collection for intersections with the current segment.

        // Compare the current segment with all preceding segments.
        for (innerLoopIndex = 0; innerLoopIndex < outerLoopIndex; innerLoopIndex++) {
            // Attempt to find an intersection point between the two segments.
            currentIntersectionResult = calculateSegmentIntersection(segmentGeometryData[outerLoopIndex], segmentGeometryData[innerLoopIndex]);

            // If no valid intersection is found, skip to the next pair.
            if (currentIntersectionResult === null) {
                continue;
            }

            // Check if this intersection point is already in our collection to ensure uniqueness.
            const isPointAlreadyPresent = intersectionPointsCollection.some((existingPointInList) => {
                const deltaX = currentIntersectionResult.xCoord - existingPointInList.xCoord;
                const deltaY = currentIntersectionResult.yCoord - existingPointInList.yCoord;
                // Use squared distance for comparison to avoid Math.sqrt and maintain precision.
                return (Math.pow(deltaX, 2) + Math.pow(deltaY, 2) < COMPARISON_THRESHOLD * COMPARISON_THRESHOLD);
            });

            // If the point is unique, add it to the collection.
            if (!isPointAlreadyPresent) {
                intersectionPointsCollection.push(currentIntersectionResult);
            }
        }
        // Add the count of newly found unique intersection points to the total.
        totalUniquePoints += intersectionPointsCollection.length;
    }
    return totalUniquePoints; // Return the final count of all unique intersections.
}

// Main entry point for processing the raw input data.
function orchestrateExecution(rawDataStrings) {
    let numberOfGeometricSegments;
    let loopCounter;
    let coordinatePartsText;
    let processedSegmentData;

    // Continue processing data sets until a '0' is encountered, signaling the end.
    while ((numberOfGeometricSegments = +rawDataStrings.shift()) !== 0) {
        processedSegmentData = []; // Initialize an array to store the parsed segments for the current test case.

        // Loop to parse each segment's coordinates.
        for (loopCounter = 0; loopCounter < numberOfGeometricSegments; loopCounter++) {
            // Extract and split the coordinate string.
            coordinatePartsText = rawDataStrings.shift().split(' ');

            // Parse numerical coordinates and store them as segment objects.
            processedSegmentData.push([
                { xCoord: +coordinatePartsText[0], yCoord: +coordinatePartsText[1] }, // Start point of the segment
                { xCoord: +coordinatePartsText[2], yCoord: +coordinatePartsText[3] }  // End point of the segment
            ]);
        }
        // Calculate and display the result for the current set of segments.
        console.log(computeUniqueIntersections(processedSegmentData));
    }
}