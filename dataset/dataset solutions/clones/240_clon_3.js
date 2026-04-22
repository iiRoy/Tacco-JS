const fileSystemModule = require('fs');

// Reads all data from standard input as a UTF-8 string.
const rawInputDataBuffer = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

/**
 * Determines if two rectangles intersect.
 * Each rectangle is defined by its bottom-left (x1, y1) and top-right (x2, y2) corners.
 * The function ensures coordinates are robustly ordered before checking for overlap.
 *
 * @param {number} r1x1 - X-coordinate of the first rectangle's first corner.
 * @param {number} r1y1 - Y-coordinate of the first rectangle's first corner.
 * @param {number} r1x2 - X-coordinate of the first rectangle's second corner.
 * @param {number} r1y2 - Y-coordinate of the first rectangle's second corner.
 * @param {number} r2x1 - X-coordinate of the second rectangle's first corner.
 * @param {number} r2y1 - Y-coordinate of the second rectangle's first corner.
 * @param {number} r2x2 - X-coordinate of the second rectangle's second corner.
 * @param {number} r2y2 - Y-coordinate of the second rectangle's second corner.
 * @returns {boolean} True if the rectangles intersect, false otherwise.
 */
const checkRectangularAreaOverlap = (
    r1x1, r1y1, r1x2, r1y2,
    r2x1, r2y1, r2x2, r2y2
) => {
    // Normalize coordinates to ensure (min_coord, max_coord) pairs for each axis.
    // This handles cases where input might provide (x2, y2) as bottom-left and (x1, y1) as top-right.
    const rect1MinX = Math.min(r1x1, r1x2);
    const rect1MaxX = Math.max(r1x1, r1x2);
    const rect1MinY = Math.min(r1y1, r1y2);
    const rect1MaxY = Math.max(r1y1, r1y2);

    const rect2MinX = Math.min(r2x1, r2x2);
    const rect2MaxX = Math.max(r2x1, r2x2);
    const rect2MinY = Math.min(r2y1, r2y2);
    const rect2MaxY = Math.max(r2y1, r2y2);

    // Check for non-overlap along the X-axis:
    // If rect1 is entirely to the right of rect2, OR
    // If rect2 is entirely to the right of rect1.
    const isXAxisDisjoint = (rect1MinX > rect2MaxX) || (rect2MinX > rect1MaxX);

    // Check for non-overlap along the Y-axis:
    // If rect1 is entirely above rect2, OR
    // If rect2 is entirely above rect1.
    const isYAxisDisjoint = (rect1MinY > rect2MaxY) || (rect2MinY > rect1MaxY);

    // If rectangles are disjoint along either axis, they do not intersect.
    // Otherwise, they must intersect.
    return !(isXAxisDisjoint || isYAxisDisjoint);
};

// Process each line of input to determine rectangle overlap.
// First, trim any leading/trailing whitespace from the entire input, then split by newline.
const inputLineEntries = rawInputDataBuffer.trim().split('\n');

inputLineEntries.forEach(currentLineString => {
    // Skip processing if the line is empty or just whitespace.
    if (!currentLineString || currentLineString.trim().length === 0) {
        return;
    }

    // Split the current line into individual coordinate strings.
    const coordinateStringTokens = currentLineString.split(' ');

    // Implement a basic guard clause for malformed input lines.
    // We expect exactly 8 coordinate values for two rectangles.
    if (coordinateStringTokens.length !== 8) {
        console.error("Error: Malformed input line - expected 8 coordinates, got", coordinateStringTokens.length, `in "${currentLineString}". Skipping.`);
        return;
    }

    // Convert string coordinates to numbers.
    const numericalCoordinateValues = coordinateStringTokens.map(coordStr => Number(coordStr));

    // Another validation step: check if any conversion resulted in NaN.
    if (numericalCoordinateValues.some(isNaN)) {
        console.error("Error: Input line contains non-numeric values:", `"${currentLineString}". Skipping.`);
        return;
    }

    // Destructure the array of numerical coordinates into descriptive variables.
    // The order is assumed to be: RectA(x1, y1, x2, y2), RectB(x1, y1, x2, y2)
    const [
        rectangleA_X1, rectangleA_Y1, rectangleA_X2, rectangleA_Y2,
        rectangleB_X1, rectangleB_Y1, rectangleB_X2, rectangleB_Y2
    ] = numericalCoordinateValues;

    // Call the dedicated function to check for intersection.
    const intersectionExists = checkRectangularAreaOverlap(
        rectangleA_X1, rectangleA_Y1, rectangleA_X2, rectangleA_Y2,
        rectangleB_X1, rectangleB_Y1, rectangleB_X2, rectangleB_Y2
    );

    // Output the result based on the boolean outcome.
    if (intersectionExists) {
        console.log("YES");
    } else {
        console.log("NO");
    }
});