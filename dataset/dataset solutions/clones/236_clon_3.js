const fileSystemModule = require('fs');

// Define a small constant for floating-point comparisons.
// This tolerance helps account for precision errors when checking if a value is effectively zero.
const FLOATING_POINT_EPSILON = 1.0e-8;

/**
 * Computes the slope of a line segment defined by two points.
 * Handles special cases for vertical and horizontal lines.
 *
 * @param {number} pointAX - The x-coordinate of the first point.
 * @param {number} pointAY - The y-coordinate of the first point.
 * @param {number} pointBX - The x-coordinate of the second point.
 * @param {number} pointBY - The y-coordinate of the second point.
 * @returns {number} The slope of the segment. Returns Number.POSITIVE_INFINITY for vertical lines.
 */
function calculateSegmentSlope(pointAX, pointAY, pointBX, pointBY) {
    const changeInX = pointBX - pointAX;
    const changeInY = pointBY - pointAY;

    // If the horizontal change is zero, the line is vertical.
    if (changeInX === 0) {
        return Number.POSITIVE_INFINITY;
    }
    // If the vertical change is zero, the line is horizontal, and its slope is 0.
    if (changeInY === 0) {
        return 0;
    }

    // For all other cases, calculate the standard slope.
    return changeInY / changeInX;
}

/**
 * Determines if two line segments are perpendicular based on their slopes.
 * This function considers horizontal/vertical cases and uses a tolerance for floating-point arithmetic.
 *
 * @param {number} slopeValue1 - The slope of the first segment.
 * @param {number} slopeValue2 - The slope of the second segment.
 * @returns {boolean} True if the segments are perpendicular, false otherwise.
 */
function checkOrthogonality(slopeValue1, slopeValue2) {
    // Condition 1: One segment is horizontal (slope 0) and the other is vertical (slope Infinity).
    // This is a special case for perpendicularity.
    const isOneHorizontalAndOtherVertical =
        (slopeValue1 === 0 && slopeValue2 === Number.POSITIVE_INFINITY) ||
        (slopeValue2 === 0 && slopeValue1 === Number.POSITIVE_INFINITY);

    if (isOneHorizontalAndOtherVertical) {
        return true;
    }

    // Condition 2: For non-special cases, two lines are perpendicular if the product of their slopes is -1.
    // We use a small epsilon to account for potential floating-point inaccuracies.
    const productOfSlopesPlusOne = slopeValue1 * slopeValue2 + 1;
    if (Math.abs(productOfSlopesPlusOne) < FLOATING_POINT_EPSILON) {
        return true;
    }

    // If neither condition is met, the segments are not perpendicular.
    return false;
}

// Read all input data from standard input.
// The data is expected to be a series of lines, each containing 8 space-separated numbers.
const rawDataString = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

// Pre-process the input: remove leading/trailing whitespace from the entire block,
// then split it into an array of individual lines.
const processedInputLines = rawDataString.trim().split('\n');

// Iterate through each line of the input to process the coordinate data.
processedInputLines.forEach((currentInputLine, lineProcessingIndex) => {
    // Implement a guard clause to skip any empty or purely whitespace lines.
    // This prevents errors from trying to parse non-existent data.
    if (!currentInputLine || currentInputLine.trim().length === 0) {
        // Optionally, one could log a warning here for debugging purposes.
        // console.warn(`Skipping empty or invalid line at index ${lineProcessingIndex}: "${currentInputLine}"`);
        return;
    }

    // Parse the numeric values from the current line.
    // Each line should contain 8 numbers representing coordinates.
    const numericCoordinates = currentInputLine.split(' ').map(parseFloat);

    // Perform validation: ensure the correct number of coordinate values is present.
    const EXPECTED_COORDINATE_COUNT = 8; // (x1, y1, x2, y2, x3, y3, x4, y4)
    if (numericCoordinates.length !== EXPECTED_COORDINATE_COUNT) {
        console.error(`Data Error: Line ${lineProcessingIndex + 1} contains ${numericCoordinates.length} values, but ${EXPECTED_COORDINATE_COUNT} were expected. Skipping this line.`);
        return; // Skip processing this malformed line.
    }

    // Use destructuring assignment to extract the eight coordinate values into clearly named variables.
    const [
        segmentOne_PointA_X, segmentOne_PointA_Y,
        segmentOne_PointB_X, segmentOne_PointB_Y,
        segmentTwo_PointC_X, segmentTwo_PointC_Y,
        segmentTwo_PointD_X, segmentTwo_PointD_Y
    ] = numericCoordinates;

    // Calculate the slope for the first line segment (from Point A to Point B).
    const slopeOfFirstLine = calculateSegmentSlope(
        segmentOne_PointA_X, segmentOne_PointA_Y,
        segmentOne_PointB_X, segmentOne_PointB_Y
    );

    // Calculate the slope for the second line segment (from Point C to Point D).
    const slopeOfSecondLine = calculateSegmentSlope(
        segmentTwo_PointC_X, segmentTwo_PointC_Y,
        segmentTwo_PointD_X, segmentTwo_PointD_Y
    );

    // Determine if the two line segments are orthogonal (perpendicular) using the helper function.
    const areTheSegmentsPerpendicular = checkOrthogonality(slopeOfFirstLine, slopeOfSecondLine);

    // Output the result as "YES" or "NO" to standard output.
    console.log(areTheSegmentsPerpendicular ? "YES" : "NO");
});