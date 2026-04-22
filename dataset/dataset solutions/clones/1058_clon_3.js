// This program generates a Koch fractal curve, displaying its vertices at a specified recursion depth.
// It retrieves the fractal's complexity (number of iterations) from a configured input source.

// --- Application Configuration ---
// Defines settings for input and output handling.
const applicationSettings = {
    inputFilePath: '/dev/stdin', // Default path for reading input (e.g., standard input on Unix-like systems)
    outputLineDelimiter: '\n'    // Standard newline character for console output
};

// --- Core Data Structures & Utilities ---

/**
 * Represents a two-dimensional point.
 * @typedef {object} Point2D
 * @property {number} x - The horizontal coordinate.
 * @property {number} y - The vertical coordinate.
 */

/**
 * Factory function to create a new Point2D object.
 * @param {number} xCoordinate - The x-value of the point.
 * @param {number} yCoordinate - The y-value of the point.
 * @returns {Point2D} A new point instance.
 */
const createPoint = (xCoordinate, yCoordinate) => ({ x: xCoordinate, y: yCoordinate });

/**
 * Computes a point located at a specific fraction along a line segment.
 * @param {Point2D} startPoint - The beginning of the segment.
 * @param {Point2D} endPoint - The end of the segment.
 * @param {number} fraction - The fractional distance from the startPoint (e.g., 0.33 for one-third).
 * @returns {Point2D} The interpolated point.
 */
const getFractionalPoint = (startPoint, endPoint, fraction) =>
    createPoint(
        startPoint.x + (endPoint.x - startPoint.x) * fraction,
        startPoint.y + (endPoint.y - startPoint.y) * fraction
    );

/**
 * Determines the midpoint between two given points.
 * @param {Point2D} pointOne - The first point.
 * @param {Point2D} pointTwo - The second point.
 * @returns {Point2D} The midpoint.
 */
const calculateMidpoint = (pointOne, pointTwo) =>
    createPoint((pointOne.x + pointTwo.x) / 2, (pointOne.y + pointTwo.y) / 2);

// --- Mathematical Constant ---
// This coefficient is used to determine the height of the equilateral triangle
// formed on each segment during the Koch curve generation.
// It's derived from (height of equilateral triangle) / (base length of segment / 3) = sqrt(3) / 6.
const FRACTAL_PEAK_HEIGHT_SCALAR = Math.sqrt(3) / 6;

// --- Input Processing ---
let fractalRecursionDepth = 0; // Stores the number of iterations for the fractal generation

try {
    const fileSystemHandler = require('fs');
    const rawInputContent = fileSystemHandler.readFileSync(applicationSettings.inputFilePath, 'utf8');
    fractalRecursionDepth = parseInt(rawInputContent.trim(), 10);
} catch (dataReadError) {
    console.error(`ERROR: Could not read fractal depth from input source: ${dataReadError.message}`);
    process.exit(1); // Exit if input file cannot be processed
}

// --- Input Validation (Guard Clause) ---
// Ensures that the parsed recursion depth is a valid non-negative integer.
if (isNaN(fractalRecursionDepth) || fractalRecursionDepth < 0) {
    console.error("ERROR: Invalid recursion depth provided. Please ensure it's a non-negative integer.");
    process.exit(1);
}

// --- Fractal Generation Core Logic ---

/**
 * Subdivides a single line segment into four new points according to the Koch curve rule.
 * These points are: the original start, the 1/3 point, the peak of the equilateral triangle, and the 2/3 point.
 * @param {Point2D} currentSegmentStart - The starting point of the segment to be subdivided.
 * @param {Point2D} currentSegmentEnd - The ending point of the segment to be subdivided.
 * @returns {Point2D[]} An array containing the four generated points.
 */
function generateKochSubdivisionPoints(currentSegmentStart, currentSegmentEnd) {
    // Determine the points one-third and two-thirds along the segment
    const pointOneThird = getFractionalPoint(currentSegmentStart, currentSegmentEnd, 1/3);
    const pointTwoThirds = getFractionalPoint(currentSegmentStart, currentSegmentEnd, 2/3);

    // Calculate the vector components of the segment
    const segmentVectorX = currentSegmentEnd.x - currentSegmentStart.x;
    const segmentVectorY = currentSegmentEnd.y - currentSegmentStart.y;

    // Find the center point of the current segment
    const segmentCenterPoint = calculateMidpoint(currentSegmentStart, currentSegmentEnd);

    // Compute a vector perpendicular to the segment, scaled by the fractal height coefficient.
    // This perpendicular vector points towards the "peak" of the new equilateral triangle.
    // The rotation is 90 degrees clockwise from the segment vector (x,y) -> (y, -x) or (-y, x).
    // Original: SCALE*(p1[1]-p2[1]) and SCALE*(p2[0]-p1[0])
    // Which is SCALE*(-segmentVectorY) and SCALE*(segmentVectorX)
    const perpendicularX_component = FRACTAL_PEAK_HEIGHT_SCALAR * (-segmentVectorY);
    const perpendicularY_component = FRACTAL_PEAK_HEIGHT_SCALAR * (segmentVectorX);

    // The peak point (often denoted 'U') is the segment's midpoint offset by the perpendicular vector.
    const peakPointU = createPoint(
        segmentCenterPoint.x + perpendicularX_component,
        segmentCenterPoint.y + perpendicularY_component
    );

    // Return the sequence of points that replace the original segment
    return [currentSegmentStart, pointOneThird, peakPointU, pointTwoThirds];
}

// --- Initial State of the Fractal ---
// The fractal begins as a simple horizontal line segment.
let currentFractalVertices = [
    createPoint(0, 0),
    createPoint(100, 0)
];

// --- Main Iteration Loop ---
// This loop applies the Koch subdivision rule repeatedly for the specified depth.
for (let iterationCounter = 0; iterationCounter < fractalRecursionDepth; ++iterationCounter) {
    const nextIterationVerticesCollection = []; // Stores points for the next level of detail
    const totalSegmentsInCurrentLevel = currentFractalVertices.length - 1;

    // Iterate through each segment in the current fractal path
    for (let segmentIterator = 0; segmentIterator < totalSegmentsInCurrentLevel; ++segmentIterator) {
        const segmentStartVertex = currentFractalVertices[segmentIterator];
        const segmentEndVertex = currentFractalVertices[segmentIterator + 1];

        // Generate the four new points for the current segment's subdivision
        const subdividedPointsForSegment = generateKochSubdivisionPoints(segmentStartVertex, segmentEndVertex);

        // Add these new points to the collection for the next iteration.
        // The spread operator (...) efficiently adds all elements from the array.
        nextIterationVerticesCollection.push(...subdividedPointsForSegment);
    }
    // The very last point of the original line segment is not produced by the subdivision
    // function for the final segment. It must be explicitly added to complete the curve.
    nextIterationVerticesCollection.push(currentFractalVertices[currentFractalVertices.length - 1]);

    // Update the fractal's vertices to the newly generated set for the next iteration
    currentFractalVertices = nextIterationVerticesCollection;
}

// --- Final Output ---
// Prints the coordinates of all points in the final fractal curve.
// Each point's x and y coordinates are space-separated on a new line.
for (const vertex of currentFractalVertices) {
    console.log(`${vertex.x} ${vertex.y}`);
}