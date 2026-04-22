const fileSystemUtility = require('fs');

// Define the standard input file path.
const stdinFilePath = '/dev/stdin';

/**
 * Reads all incoming data from the specified input path,
 * decoding it as a UTF-8 string.
 */
let rawInputContent = fileSystemUtility.readFileSync(stdinFilePath, 'utf8');

// --- Main Processing Loop ---

/**
 * Processes the raw input:
 * 1. Trims any leading/trailing whitespace from the entire input block.
 * 2. Splits the input into individual lines based on newline characters.
 */
let listOfInputLines = rawInputContent.trim().split('\n');

/**
 * Helper function to determine if two 2D rectangles intersect.
 * Rectangles are defined by their minimum (top-left) and maximum (bottom-right)
 * X and Y coordinates.
 *
 * @param {number} rAX1 - X-coordinate of rectangle A's first corner.
 * @param {number} rAY1 - Y-coordinate of rectangle A's first corner.
 * @param {number} rAX2 - X-coordinate of rectangle A's second corner.
 * @param {number} rAY2 - Y-coordinate of rectangle A's second corner.
 * @param {number} rBX1 - X-coordinate of rectangle B's first corner.
 * @param {number} rBY1 - Y-coordinate of rectangle B's first corner.
 * @param {number} rBX2 - X-coordinate of rectangle B's second corner.
 * @param {number} rBY2 - Y-coordinate of rectangle B's second corner.
 * @returns {boolean} True if the rectangles overlap, false otherwise.
 */
function determineRectangleOverlap(rAX1, rAY1, rAX2, rAY2, rBX1, rBY1, rBX2, rBY2) {
    // Normalize coordinates to ensure (minX, minY) and (maxX, maxY) for each rectangle.
    // This makes the intersection logic robust to input coordinate order.
    const rectALeft   = Math.min(rAX1, rAX2);
    const rectARight  = Math.max(rAX1, rAX2);
    const rectATop    = Math.min(rAY1, rAY2);
    const rectABottom = Math.max(rAY1, rAY2);

    const rectBLeft   = Math.min(rBX1, rBX2);
    const rectBRight  = Math.max(rBX1, rBX2);
    const rectBTop    = Math.min(rBY1, rBY2);
    const rectBBottom = Math.max(rBY1, rBY2);

    // Check for non-overlap conditions along the X-axis.
    // If rectangle A is entirely to the left of B, OR B is entirely to the left of A.
    const isNoXOverlap = (rectARight < rectBLeft) || (rectBRight < rectALeft);

    // Check for non-overlap conditions along the Y-axis.
    // If rectangle A is entirely below B, OR B is entirely below A.
    const isNoYOverlap = (rectABottom < rectBTop) || (rectBBottom < rectATop);

    // If there is no overlap in either the X or Y dimension, then the rectangles do not intersect.
    // Therefore, they intersect if and only if both X and Y dimensions *do* overlap.
    const overallNonOverlap = isNoXOverlap || isNoYOverlap;

    return !overallNonOverlap;
}

// Iterate through each line of the input data.
listOfInputLines.forEach(function(currentInputRow) {
    // Skip processing empty lines to prevent errors.
    if (currentInputRow.trim().length === 0) {
        return;
    }

    // Convert the string line into an array of numeric coordinate values.
    // Includes a basic validation step for each parsed number.
    let parsedNumericValues = currentInputRow.split(' ').map(coordStr => {
        let valueAsNumber = parseFloat(coordStr);
        // If parsing results in NaN, log a warning and return a sentinel value.
        if (isNaN(valueAsNumber)) {
            console.warn(`Warning: Invalid numeric coordinate '${coordStr}' found in line: '${currentInputRow}'. This value will be ignored.`);
            return null; // Sentinel for invalid data.
        }
        return valueAsNumber;
    });

    // Remove any nulls that resulted from invalid number parsing.
    parsedNumericValues = parsedNumericValues.filter(val => val !== null);

    // Define the expected number of coordinates for two rectangles (8 total).
    const REQUIRED_COORDINATE_COUNT = 8;

    // Implement a guard clause to ensure the correct number of coordinates.
    if (parsedNumericValues.length !== REQUIRED_COORDINATE_COUNT) {
        console.error(`Error: Each line must contain exactly ${REQUIRED_COORDINATE_COUNT} coordinates. Received ${parsedNumericValues.length} in line: '${currentInputRow}'. Skipping.`);
        return; // Move to the next input row.
    }

    // Use array destructuring to assign coordinates to descriptive variables.
    // This improves readability over using array indices directly or 'arguments' object.
    const [
        rectA_corner1X, rectA_corner1Y, rectA_corner2X, rectA_corner2Y,
        rectB_corner1X, rectB_corner1Y, rectB_corner2X, rectB_corner2Y
    ] = parsedNumericValues;

    // Execute the intersection check using the dedicated function.
    const intersectionResult = determineRectangleOverlap(
        rectA_corner1X, rectA_corner1Y, rectA_corner2X, rectA_corner2Y,
        rectB_corner1X, rectB_corner1Y, rectB_corner2X, rectB_corner2Y
    );

    // Prepare the output string based on the result.
    const finalOutputString = intersectionResult ? "YES" : "NO";

    // Write the result to standard output, followed by a newline.
    // Using process.stdout.write for direct stream output.
    process.stdout.write(finalOutputString + '\n');
});