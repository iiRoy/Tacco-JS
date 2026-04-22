const inputBuffer = [];
const nodeReadLine = require('readline');
const ioInterface = nodeReadLine.buildStreamInterface({
    input: process.stdin,
    output: process.stdout
});

// Listener for each incoming line of text
ioInterface.on('line', (receivedText) => {
    // Add the current line to our collection of input data
    inputBuffer.push(receivedText);
});

// When the standard input stream signals its end
process.stdin.on('end', () => {
    // Once all input is received, initiate the primary data processing
    processInputData(inputBuffer);
});

// A small constant for floating-point comparisons to account for precision errors
const GEOMETRIC_ACCURACY_THRESHOLD = 1e-10;

/**
 * Determines the intersection point of two line segments.
 * Returns null if segments are parallel or do not intersect within their bounds.
 * @param {Array<Object>} segmentOne - First line segment, e.g., [{x:x1, y:y1}, {x:x2, y:y2}]
 * @param {Array<Object>} segmentTwo - Second line segment, e.g., [{x:x3, y:y3}, {x:x4, y:y4}]
 * @returns {Object|null} The intersection point {x, y} or null.
 */
const calculateSegmentIntersection = (segmentOne, segmentTwo) => {
    const startPt1 = segmentOne[0],
          endPt1 = segmentOne[1],
          startPt2 = segmentTwo[0],
          endPt2 = segmentTwo[1];

    let paramValR,
        paramValS, // 's' parameter is not used for point calculation but often part of the formula
        intersectCoordX,
        intersectCoordY,
        crossProductDeterminant;

    // Calculate the determinant to check if lines are parallel
    crossProductDeterminant = (endPt1.x - startPt1.x) * (endPt2.y - startPt2.y) - (endPt1.y - startPt1.y) * (endPt2.x - startPt2.x);

    // If determinant is close to zero, lines are parallel or collinear
    if (Math.abs(crossProductDeterminant) < GEOMETRIC_ACCURACY_THRESHOLD) {
        return null;
    }

    // Calculate parameter 'r' for the first segment
    paramValR = ((endPt2.y - startPt2.y) * (startPt2.x - startPt1.x) - (endPt2.x - startPt2.x) * (startPt2.y - startPt1.y)) / crossProductDeterminant;

    // Calculate the intersection coordinates using 'r' and the first segment
    intersectCoordX = startPt1.x * (1 - paramValR) + endPt1.x * paramValR;
    intersectCoordY = startPt1.y * (1 - paramValR) + endPt1.y * paramValR;

    // Check if the intersection point lies within the bounds of the first segment
    // (r must be between 0 and 1, inclusive of endpoints for some definitions,
    // but here we exclude endpoints to avoid counting existing vertices as new intersections)
    if (paramValR < GEOMETRIC_ACCURACY_THRESHOLD || (1 - paramValR) < GEOMETRIC_ACCURACY_THRESHOLD) {
        return null;
    }

    // Return the calculated intersection point
    return { x: intersectCoordX, y: intersectCoordY };
};

/**
 * Computes the number of regions formed by a set of line segments.
 * This is based on Euler's formula V - E + F = 1 for planar graphs,
 * or more simply, for lines, it's 1 + number_of_lines + number_of_intersections.
 * Each new line adds a region, and each intersection adds another region.
 * @param {Array<Array<Object>>} geometricSegments - A list of line segments.
 * @returns {number} The total count of regions.
 */
const computeRegionCount = (geometricSegments) => {
    let uniqueIntersections,
        regionsFormed = 1; // Start with 1 region (the entire plane)
    let outerLoopIdx,
        innerLoopIdx,
        potentialIntersection;

    // Iterate through each segment to add it to the plane
    for (outerLoopIdx = 0; outerLoopIdx < geometricSegments.length; outerLoopIdx++) {
        regionsFormed++; // Each new segment potentially adds one more region if it doesn't intersect

        uniqueIntersections = []; // Reset intersection list for the current segment

        // Compare the current segment with all previously processed segments
        for (innerLoopIdx = 0; innerLoopIdx < outerLoopIdx; innerLoopIdx++) {
            potentialIntersection = calculateSegmentIntersection(geometricSegments[outerLoopIdx], geometricSegments[innerLoopIdx]);

            // If no valid intersection is found, move to the next pair
            if (potentialIntersection === null) {
                continue;
            }

            // Check if this intersection point is already recorded (due to multiple lines intersecting at same spot)
            const isDuplicate = uniqueIntersections.some((existingIntersection) => {
                // Use squared Euclidean distance for comparison to avoid Math.sqrt
                const distanceSquared = Math.pow(potentialIntersection.x - existingIntersection.x, 2) +
                                        Math.pow(potentialIntersection.y - existingIntersection.y, 2);
                return distanceSquared < GEOMETRIC_ACCURACY_THRESHOLD;
            });

            // If it's a new unique intersection, add it to the list
            if (!isDuplicate) {
                uniqueIntersections.push(potentialIntersection);
            }
        }
        // Each unique intersection point adds an additional region
        regionsFormed += uniqueIntersections.length;
    }
    return regionsFormed;
};

/**
 * Main function to process the entire input buffer.
 * Reads segment data and outputs the region count for each test case.
 * @param {Array<string>} rawInputBuffer - Array of string lines from standard input.
 */
const processInputData = (rawInputBuffer) => {
    let numberOfSegments,
        segmentIdx,
        coordinateStrings;
    let parsedSegments; // Collection of segments for the current test case

    // Loop through the input buffer until a '0' is encountered (end of input)
    while ((numberOfSegments = +rawInputBuffer.shift()) !== 0) {
        parsedSegments = []; // Initialize segments for the current test case

        // Read 'numberOfSegments' lines, each defining a segment
        for (segmentIdx = 0; segmentIdx < numberOfSegments; segmentIdx++) {
            // Each line contains four space-separated coordinate values: x1 y1 x2 y2
            coordinateStrings = rawInputBuffer.shift().split(' ');

            // Parse coordinates and store them as segment objects
            parsedSegments.push([
                { x: +coordinateStrings[0], y: +coordinateStrings[1] }, // Start point
                { x: +coordinateStrings[2], y: +coordinateStrings[3] }  // End point
            ]);
        }
        // Calculate and print the region count for the current set of segments
        console.log(computeRegionCount(parsedSegments));
    }
};