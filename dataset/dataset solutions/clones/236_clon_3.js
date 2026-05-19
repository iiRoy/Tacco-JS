var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var lineSegmentsData = (rawData.trim()).split("\n");

// Helper function to calculate the slope of a line segment given its delta X and delta Y.
// Returns Infinity for vertical lines.
function determineLineSlope(deltaX, deltaY) {
    const ZERO_DELTA_THRESHOLD = 0; // Defines what is considered a zero difference for coordinate deltas.

    // If the change in X is zero (or very close to it), the line is vertical.
    if (Math.abs(deltaX) <= ZERO_DELTA_THRESHOLD) {
        return Infinity;
    }
    // Otherwise, calculate the slope as rise over run.
    return deltaY / deltaX;
}

// Main processing function that checks if two line segments are perpendicular.
// It takes eight arguments representing the coordinates of two points for each segment.
function processSegmentPerpendicularity(p1x, p1y, p2x, p2y, p3x, p3y, p4x, p4y) {
    const EPSILON_FOR_FLOAT_COMPARISON = 1.0e-8; // A small value used for floating-point comparisons to account for precision issues.

    // Calculate the change in X and Y for the first line segment (from P1 to P2).
    const deltaX_segmentA = p2x - p1x;
    const deltaY_segmentA = p2y - p1y;

    // Calculate the change in X and Y for the second line segment (from P3 to P4).
    const deltaX_segmentB = p4x - p3x;
    const deltaY_segmentB = p4y - p3y;

    // Determine the slopes of both line segments using the helper function.
    const slopeOfLineA = determineLineSlope(deltaX_segmentA, deltaY_segmentA);
    const slopeOfLineB = determineLineSlope(deltaX_segmentB, deltaY_segmentB);

    let perpendicularStatus = "NO"; // Initialize the result as "NO" (not perpendicular).

    // Evaluate conditions for perpendicularity.

    // Condition 1: One line is perfectly horizontal (slope 0) and the other is perfectly vertical (slope Infinity).
    const isLineAHorizontal = (slopeOfLineA === 0);
    const isLineAVertical = (slopeOfLineA === Infinity);
    const isLineBHorizontal = (slopeOfLineB === 0);
    const isLineBVertical = (slopeOfLineB === Infinity);

    if ((isLineAHorizontal && isLineBVertical) || (isLineAVertical && isLineBHorizontal)) {
        perpendicularStatus = "YES";
    } else if (slopeOfLineA !== Infinity && slopeOfLineB !== Infinity) {
        // Condition 2: Neither line is vertical. Check if the product of their slopes is -1 (within a small epsilon).
        const productOfSlopes = slopeOfLineA * slopeOfLineB;
        if (Math.abs(productOfSlopes + 1) < EPSILON_FOR_FLOAT_COMPARISON) {
            perpendicularStatus = "YES";
        }
    }

    // Output the determined status.
    console.log(perpendicularStatus);
}

// Iterate through each line of the input data.
for (let lineIndex = 0; lineIndex < lineSegmentsData.length; lineIndex++) {
    // Parse the current line, splitting by space and converting each part to a number.
    const currentSegmentCoords = lineSegmentsData[lineIndex].split(" ").map(Number);

    // Call the processing function with the parsed coordinates.
    // The 'apply' method is used to pass the array elements as individual arguments.
    processSegmentPerpendicularity.apply(null, currentSegmentCoords);
}
