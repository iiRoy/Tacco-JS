// Import the Node.js file system module for input operations.
const fileSystemHandler = require('fs');

// Define a constant for the coordinate scaling factor.
const COORDINATE_SCALE_MULTIPLIER = 100000;

/**
 * Determines if two line segments are parallel based on their coordinates.
 * This function handles both horizontal, non-vertical, and vertical segments.
 *
 * @param {number} x1 - X-coordinate of the first point of segment 1.
 * @param {number} y1 - Y-coordinate of the first point of segment 1.
 * @param {number} x2 - X-coordinate of the second point of segment 1.
 * @param {number} y2 - Y-coordinate of the second point of segment 1.
 * @param {number} x3 - X-coordinate of the first point of segment 2.
 * @param {number} y3 - Y-coordinate of the first point of segment 2.
 * @param {number} x4 - X-coordinate of the second point of segment 2.
 * @param {number} y4 - Y-coordinate of the second point of segment 2.
 * @returns {boolean} True if the segments are parallel, false otherwise.
 */
function determineSegmentParallelism(x1, y1, x2, y2, x3, y3, x4, y4) {
    // Calculate the difference in X-coordinates for each segment to check for verticality.
    const deltaX_segment1 = x2 - x1;
    const deltaX_segment2 = x4 - x3;

    // Check if the first segment is perfectly vertical.
    const isSegment1Vertical = (deltaX_segment1 === 0);
    // Check if the second segment is perfectly vertical.
    const isSegment2Vertical = (deltaX_segment2 === 0);

    // Scenario 1: Both segments are vertical.
    // Vertical lines are considered parallel to each other.
    if (isSegment1Vertical && isSegment2Vertical) {
        return true;
    }

    // Scenario 2: One segment is vertical, and the other is not.
    // A vertical line cannot be parallel to a non-vertical line.
    if (isSegment1Vertical !== isSegment2Vertical) {
        return false;
    }

    // Scenario 3: Neither segment is vertical (both have defined, finite slopes).
    // In this case, we can safely calculate and compare their slopes.
    const slopeOfFirstSegment = (y2 - y1) / deltaX_segment1;
    const slopeOfSecondSegment = (y4 - y3) / deltaX_segment2;

    // Compare the calculated slopes. Direct equality check is used as per the original problem's implicit assumption,
    // though for general floating-point comparisons, a small epsilon threshold is often safer.
    return slopeOfFirstSegment === slopeOfSecondSegment;
}

// Read the entire input content from standard input, using UTF-8 encoding.
const rawInputContent = fileSystemHandler.readFileSync('/dev/stdin', 'utf8');

// Remove any leading or trailing whitespace from the input string.
const cleanedInputContent = rawInputContent.trim();

// Split the cleaned input into an array of strings, where each string is a line.
let lineDataCollection = cleanedInputContent.split('\n');

// The original problem structure implies the first line might be a count or header,
// which is then discarded without being used. We explicitly remove it here.
const discardedHeaderLine = lineDataCollection.shift();

// Optional: Add a check for an empty input file after header removal.
if (lineDataCollection.length === 0) {
    // If no data lines remain, there's nothing further to process.
    // In a real application, one might log this or exit gracefully.
    process.exit(0);
}

// Iterate over each remaining line, which represents a pair of line segments for analysis.
for (const currentLineSegmentDefinition of lineDataCollection) {
    // Parse the space-separated values on the current line into an array of numbers.
    const numericalCoordinates = currentLineSegmentDefinition.split(' ').map(Number);

    // Implement a guard clause for input validation: each line should contain 8 coordinates.
    if (numericalCoordinates.length !== 8) {
        console.error(`Invalid input format: Line "${currentLineSegmentDefinition}" does not contain 8 coordinates. Skipping.`);
        continue; // Move to the next line if the current one is malformed.
    }

    // Apply the problem-specific scaling factor to all numerical coordinates.
    // This transforms the coordinates as required by the original logic.
    const transformedCoordinates = numericalCoordinates.map(value => value * COORDINATE_SCALE_MULTIPLIER);

    // Destructure the transformed coordinates into more descriptive variables.
    // This improves readability by explicitly naming each coordinate for the two segments.
    // Segment 1 points: (A_x, A_y) and (B_x, B_y)
    const segment1_point_A_x = transformedCoordinates[0];
    const segment1_point_A_y = transformedCoordinates[1];
    const segment1_point_B_x = transformedCoordinates[2];
    const segment1_point_B_y = transformedCoordinates[3];

    // Segment 2 points: (C_x, C_y) and (D_x, D_y)
    const segment2_point_C_x = transformedCoordinates[4];
    const segment2_point_C_y = transformedCoordinates[5];
    const segment2_point_D_x = transformedCoordinates[6];
    const segment2_point_D_y = transformedCoordinates[7];

    // Utilize the helper function to determine if the current pair of segments are parallel.
    const areTheCurrentSegmentsParallel = determineSegmentParallelism(
        segment1_point_A_x, segment1_point_A_y,
        segment1_point_B_x, segment1_point_B_y,
        segment2_point_C_x, segment2_point_C_y,
        segment2_point_D_x, segment2_point_D_y
    );

    // Output the result as "YES" if parallel, otherwise "NO".
    console.log(areTheCurrentSegmentsParallel ? "YES" : "NO");
}