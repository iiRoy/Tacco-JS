let inputLineCursor = 0;

/**
 * Adjusts the orientation of a set of 2D coordinates by applying a specific rotation.
 * This transformation effectively rotates points by -90 degrees (clockwise),
 * mapping (x, y) to (-y, x). The operation modifies the coordinate arrays in place.
 *
 * @param {number[]} xCoordinates - Array containing the X-coordinates for the shape's points.
 * @param {number[]} yCoordinates - Array containing the Y-coordinates for the shape's points.
 * @param {number} numberOfPoints - The total number of points in the shape to transform, starting from index 1.
 */
function adjustShapeOrientation(xCoordinates, yCoordinates, numberOfPoints) {
    // Iterate through each point, typically starting from index 1 (as index 0 might be unused or a placeholder).
    for (let pointIdx = 1; pointIdx <= numberOfPoints; pointIdx++) {
        // Temporarily store the original X-coordinate before it gets overwritten.
        const originalX = xCoordinates[pointIdx];

        // The new X-coordinate becomes the negated Y-coordinate.
        xCoordinates[pointIdx] = yCoordinates[pointIdx] * -1;

        // The new Y-coordinate becomes the original X-coordinate.
        yCoordinates[pointIdx] = originalX;
    }
}

/**
 * A helper function to apply a series of specific conditional rotations to a shape.
 * These rotations are determined by the coordinates of the second point (index 2)
 * and are applied sequentially. Each rotation modifies the shape's coordinates,
 * potentially influencing the outcome of subsequent conditional checks.
 *
 * @param {number[]} shapeXCoords - The X-coordinates of the shape to be rotated.
 * @param {number[]} shapeYCoords - The Y-coordinates of the shape to be rotated.
 * @param {number} shapeSize - The number of points in the shape.
 */
function applyInitialShapeRotations(shapeXCoords, shapeYCoords, shapeSize) {
    // First, check the Y-coordinate of the second point. If positive, apply one rotation.
    if (shapeYCoords[2] > 0) {
        adjustShapeOrientation(shapeXCoords, shapeYCoords, shapeSize);
    }
    // Next, check the (potentially modified) X-coordinate of the second point. If negative, apply another rotation.
    if (shapeXCoords[2] < 0) {
        adjustShapeOrientation(shapeXCoords, shapeYCoords, shapeSize);
    }
    // Finally, check the (potentially modified) Y-coordinate of the second point. If negative, apply a third rotation.
    if (shapeYCoords[2] < 0) {
        adjustShapeOrientation(shapeXCoords, shapeYCoords, shapeSize);
    }
}

/**
 * Reads and processes the coordinate data for a single shape from the raw input lines.
 * This involves parsing the number of points, individual point coordinates, normalizing them
 * relative to the first point (shifting the first point to the origin), and applying
 * a sequence of initial orientation adjustments.
 *
 * @param {number[][]} allShapesXCoordinates - A 2D array to store X-coordinates for all shapes.
 * @param {number[][]} allShapesYCoordinates - A 2D array to store Y-coordinates for all shapes.
 * @param {number[]} shapePointCountsArray - An array to store the number of points for each shape.
 * @param {number} currentShapeIdentifier - The index representing the shape currently being processed (e.g., 0 for reference, 1 for first comparison shape, etc.).
 * @param {string[]} rawInputLines - The array of raw string input lines from which data is read.
 * @returns {void}
 */
function ingestAndProcessShapeData(
    allShapesXCoordinates,
    allShapesYCoordinates,
    shapePointCountsArray,
    currentShapeIdentifier,
    rawInputLines
) {
    // Parse the number of points for the current shape from the input lines.
    // The global `inputLineCursor` is incremented after this line is read.
    const numberOfPointsInShape = Number.parseInt(rawInputLines[inputLineCursor++], 10);
    // Store this count in the dedicated array at the shape's identifier index.
    shapePointCountsArray[currentShapeIdentifier] = numberOfPointsInShape;

    // Initialize the coordinate arrays for the current shape.
    // We use `Array(length).fill(0)` to ensure that indices from 1 to `numberOfPointsInShape` are valid and initialized.
    allShapesXCoordinates[currentShapeIdentifier] = Array(numberOfPointsInShape + 1).fill(0);
    allShapesYCoordinates[currentShapeIdentifier] = Array(numberOfPointsInShape + 1).fill(0);

    // The original algorithm uses the point count of the first shape (index 0) as the upper bound
    // for processing points for all subsequent shapes. This implies that only points up to this
    // count are considered for comparison, even if a shape has more points.
    const comparisonPointLimit = shapePointCountsArray[0];

    // Loop through each point (from index 1 up to the `comparisonPointLimit`).
    for (let pointIndex = 1; pointIndex <= comparisonPointLimit; pointIndex++) {
        // Split the current input line (pointed to by `inputLineCursor`) into X and Y string parts.
        const coordinateParts = rawInputLines[inputLineCursor].split(" ");

        // Parse the X and Y coordinates as integers.
        const currentX = Number.parseInt(coordinateParts[0], 10);
        const currentY = Number.parseInt(coordinateParts[1], 10);

        // Store the parsed coordinates in their respective arrays for the current shape.
        allShapesXCoordinates[currentShapeIdentifier][pointIndex] = currentX;
        allShapesYCoordinates[currentShapeIdentifier][pointIndex] = currentY;

        // Increment the global input cursor to move to the next line of input.
        inputLineCursor++;

        // For all points after the first one, normalize their coordinates.
        // This means adjusting them relative to the first point of the current shape.
        // This effectively moves the first point of the shape to the origin (0,0).
        if (pointIndex > 1) {
            allShapesXCoordinates[currentShapeIdentifier][pointIndex] -= allShapesXCoordinates[currentShapeIdentifier][1];
            allShapesYCoordinates[currentShapeIdentifier][pointIndex] -= allShapesYCoordinates[currentShapeIdentifier][1];
        }
    }

    // After normalizing all other points, explicitly set the first point's coordinates to (0,0).
    // This ensures that the shape's first point is consistently at the origin.
    allShapesXCoordinates[currentShapeIdentifier][1] = 0;
    allShapesYCoordinates[currentShapeIdentifier][1] = 0;

    // Apply specific initial rotations to the shape based on the second point's coordinates.
    // This step is crucial for standardizing the shape's orientation for later comparisons.
    applyInitialShapeRotations(
        allShapesXCoordinates[currentShapeIdentifier],
        allShapesYCoordinates[currentShapeIdentifier],
        numberOfPointsInShape
    );
}

/**
 * Creates an "inverted" version of a shape by reversing its point order,
 * re-normalizing its position relative to its new first point (which was the original last point),
 * and then applying standard orientation adjustments. This is used to check for mirrored or reverse-ordered matches.
 * The input coordinate arrays are modified in place.
 *
 * @param {number[]} currentShapeXCoords - The X-coordinates of the shape to be inverted (modified in place).
 * @param {number[]} currentShapeYCoords - The Y-coordinates of the shape to be inverted (modified in place).
 * @param {number} shapePointsCount - The total number of points in the shape.
 */
function createInvertedShape(currentShapeXCoords, currentShapeYCoords, shapePointsCount) {
    // Create temporary snapshots of the original coordinates.
    // These copies are essential because the `currentShapeXCoords` and `currentShapeYCoords`
    // arrays will be directly modified during the inversion process.
    const originalXSnapshot = Array(shapePointsCount + 1).fill(0);
    const originalYSnapshot = Array(shapePointsCount + 1).fill(0);

    // Copy the original points (from index 1 to `shapePointsCount`) into the snapshots.
    for (let pointIdx = 1; pointIdx <= shapePointsCount; pointIdx++) {
        originalXSnapshot[pointIdx] = currentShapeXCoords[pointIdx];
        originalYSnapshot[pointIdx] = currentShapeYCoords[pointIdx];
    }

    // Perform the inversion and re-normalization.
    // For each point, its new position is derived from a reversed order of original points,
    // and then shifted relative to what was originally the last point (`originalXSnapshot[shapePointsCount]`, `originalYSnapshot[shapePointsCount]`).
    for (let pointIdx = 1; pointIdx <= shapePointsCount; pointIdx++) {
        currentShapeXCoords[pointIdx] = originalXSnapshot[shapePointsCount - pointIdx + 1] - originalXSnapshot[shapePointsCount];
        currentShapeYCoords[pointIdx] = originalYSnapshot[shapePointsCount - pointIdx + 1] - originalYSnapshot[shapePointsCount];
    }

    // After inversion and re-normalization, apply the standard initial orientation adjustments
    // to ensure consistency for comparison.
    applyInitialShapeRotations(currentShapeXCoords, currentShapeYCoords, shapePointsCount);
}

/**
 * Compares two shapes point by point to determine if their normalized coordinates are identical.
 * This comparison is performed for a specified number of points.
 *
 * @param {number[]} shape1X - The X-coordinates of the first shape.
 * @param {number[]} shape1Y - The Y-coordinates of the first shape.
 * @param {number[]} shape2X - The X-coordinates of the second shape.
 * @param {number[]} shape2Y - The Y-coordinates of the second shape.
 * @param {number} commonPointCount - The number of points to compare (assumed to be the same for both shapes).
 * @returns {boolean} True if all corresponding points (X and Y) are identical, false otherwise.
 */
function areShapesIdentical(shape1X, shape1Y, shape2X, shape2Y, commonPointCount) {
    // Iterate from the first meaningful point index (typically 1) up to the common point count.
    for (let pointIdx = 1; pointIdx <= commonPointCount; pointIdx++) {
        // If any X or Y coordinate pair does not match, the shapes are not identical.
        if (shape1X[pointIdx] !== shape2X[pointIdx] || shape1Y[pointIdx] !== shape2Y[pointIdx]) {
            return false; // Mismatch found, shapes are different.
        }
    }
    return true; // All points matched, shapes are identical.
}

/**
 * Main function to execute the geometric analysis problem.
 * It reads multiple sets of shape data, normalizes each shape,
 * and identifies subsequent shapes that are identical (either directly or when inverted)
 * to a primary reference shape (the first shape in the set).
 *
 * @param {string} rawInputText - The entire input provided as a single string.
 */
function executeGeometricAnalysis(rawInputText) {
    // Split the raw input string into an array of individual lines for easier processing.
    const inputLines = rawInputText.split("\n");

    // The problem implies an infinite loop for test cases, terminating when a specific input is encountered.
    for (; ; ) {
        // Read the number of shapes expected in the current test case set.
        // `inputLineCursor` is a global index tracking the current position in `inputLines`.
        const numberOfShapesInCurrentSet = Number.parseInt(inputLines[inputLineCursor++], 10);

        // A value of 0 for `numberOfShapesInCurrentSet` indicates the end of all input.
        if (numberOfShapesInCurrentSet === 0) {
            break; // Exit the main processing loop.
        }

        // Initialize data structures to hold all shape information for this set of test cases.
        // Arrays are sized `numberOfShapesInCurrentSet + 1` to use 1-based indexing for shapes if desired,
        // but the main loop processes from 0 to N.
        const shapePointCounts = Array(numberOfShapesInCurrentSet + 1).fill(0);
        const allShapesXCoordinates = Array(numberOfShapesInCurrentSet + 1);
        const allShapesYCoordinates = Array(numberOfShapesInCurrentSet + 1);

        // Process each shape, including the reference shape (index 0) and all subsequent comparison shapes.
        for (let currentShapeIdx = 0; currentShapeIdx <= numberOfShapesInCurrentSet; currentShapeIdx++) {
            ingestAndProcessShapeData(
                allShapesXCoordinates,
                allShapesYCoordinates,
                shapePointCounts,
                currentShapeIdx,
                inputLines
            );
        }

        // Now, compare each subsequent shape (starting from index 1) against the reference shape (index 0).
        for (let targetShapeIdx = 1; targetShapeIdx <= numberOfShapesInCurrentSet; targetShapeIdx++) {
            // A preliminary check: shapes can only be identical if they have the same number of points.
            // The comparison is also limited by the point count of the reference shape (shape 0).
            if (shapePointCounts[0] === shapePointCounts[targetShapeIdx]) {
                const commonPointsCount = shapePointCounts[0]; // Number of points to compare.

                // First, attempt to find a direct match between the reference shape and the target shape.
                let isDirectMatch = areShapesIdentical(
                    allShapesXCoordinates[0], allShapesYCoordinates[0],
                    allShapesXCoordinates[targetShapeIdx], allShapesYCoordinates[targetShapeIdx],
                    commonPointsCount
                );

                if (isDirectMatch) {
                    // If a direct match is found, output the index of the target shape.
                    console.log(targetShapeIdx);
                } else {
                    // If no direct match, prepare an "inverted" version of the target shape.
                    // The `createInvertedShape` function modifies the target shape's coordinates in place.
                    createInvertedShape(
                        allShapesXCoordinates[targetShapeIdx],
                        allShapesYCoordinates[targetShapeIdx],
                        shapePointCounts[targetShapeIdx] // Use the actual point count of the target shape for inversion.
                    );

                    // After inversion, check again for a match against the reference shape.
                    let isInverseMatch = areShapesIdentical(
                        allShapesXCoordinates[0], allShapesYCoordinates[0],
                        allShapesXCoordinates[targetShapeIdx], allShapesYCoordinates[targetShapeIdx],
                        commonPointsCount
                    );

                    if (isInverseMatch) {
                        // If an inverted match is found, output the index of the target shape.
                        console.log(targetShapeIdx);
                    }
                }
            }
        }
        // After processing all shapes for the current set, print a separator line.
        console.log("+++++");
    }
}

// Initiate the geometric analysis process by reading input from standard input.
executeGeometricAnalysis(require("fs").readFileSync("/dev/stdin", "utf8"));