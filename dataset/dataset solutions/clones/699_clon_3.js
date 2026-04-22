let currentInputLineIndex = 0; // Global index to track the current line being read from the input.

/**
 * Applies a 90-degree counter-clockwise rotation to a set of 2D coordinates.
 * The transformation rule for each point (x, y) becomes (-y, x).
 *
 * @param {number[]} xCoordinates - An array containing the X coordinates of points (1-indexed).
 * @param {number[]} yCoordinates - An array containing the Y coordinates of points (1-indexed).
 * @param {number} pointCount - The total number of points in the shape to be rotated.
 */
function performRotation(xCoordinates, yCoordinates, pointCount) {
    // Iterate through each point, starting from index 1 as per the problem's 1-indexed convention.
    for (let currentPointOrdinal = 1; currentPointOrdinal <= pointCount; ++currentPointOrdinal) {
        // Store original coordinate values before modification to ensure correct transformation.
        const originalXValue = xCoordinates[currentPointOrdinal];
        const originalYValue = yCoordinates[currentPointOrdinal];

        // Apply the transformation (x, y) -> (-y, x).
        // The new X coordinate is the negative of the original Y coordinate.
        xCoordinates[currentPointOrdinal] = originalYValue * -1;
        // The new Y coordinate is the original X coordinate.
        yCoordinates[currentPointOrdinal] = originalXValue;
    }
}

/**
 * Parses shape data from the input array, normalizes its coordinates relative to the first point,
 * and applies specific initial rotations based on the second point's coordinates.
 *
 * @param {Array<Array<number>>} allShapeXCoords - A global array where X coordinates for all shapes will be stored.
 * @param {Array<Array<number>>} allShapeYCoords - A global array where Y coordinates for all shapes will be stored.
 * @param {number} currentShapeIndex - The index of the shape currently being processed (0 for reference, 1 to N for others).
 * @param {number[]} shapePointCounts - A global array to store the number of points for each shape.
 * @param {string[]} rawInputLines - The complete raw input, split into an array of strings per line.
 */
function parseAndNormalizeShape(allShapeXCoords, allShapeYCoords, currentShapeIndex, shapePointCounts, rawInputLines) {
    // Guard against reading beyond the available input lines.
    if (currentInputLineIndex >= rawInputLines.length) {
        console.warn(`Warning: Attempted to read beyond input lines for shape ${currentShapeIndex}. Skipping.`);
        shapePointCounts[currentShapeIndex] = 0; // Indicate no points were read.
        allShapeXCoords[currentShapeIndex] = [];
        allShapeYCoords[currentShapeIndex] = [];
        return;
    }

    // Read the number of points for the current shape.
    const numberOfPoints = Number.parseInt(rawInputLines[currentInputLineIndex++], 10);
    shapePointCounts[currentShapeIndex] = numberOfPoints;

    // Initialize coordinate arrays for the current shape.
    // Using `new Array(size)` to match the original's implicit sparse array usage.
    allShapeXCoords[currentShapeIndex] = new Array(numberOfPoints + 1);
    allShapeYCoords[currentShapeIndex] = new Array(numberOfPoints + 1);

    // Loop through and parse each point's coordinates.
    for (let pointOrdinal = 1; pointOrdinal <= numberOfPoints; ++pointOrdinal) {
        // Guard against premature end of input while reading points.
        if (currentInputLineIndex >= rawInputLines.length) {
            console.warn(`Warning: Input exhausted while reading point ${pointOrdinal} for shape ${currentShapeIndex}.`);
            // Fill remaining points with zeros or break, depending on desired robustness.
            // For competitive programming, usually assumes valid input, so break is fine.
            break;
        }

        // Split the current line to get X and Y components.
        const coordinateParts = rawInputLines[currentInputLineIndex].split(" ");

        // Parse and store coordinates.
        allShapeXCoords[currentShapeIndex][pointOrdinal] = Number.parseInt(coordinateParts[0], 10);
        allShapeYCoords[currentShapeIndex][pointOrdinal] = Number.parseInt(coordinateParts[1], 10);

        currentInputLineIndex++; // Advance the global input line pointer.

        // Normalize points by subtracting the first point's coordinates,
        // effectively making the first point the origin (0,0).
        if (pointOrdinal > 1) {
            allShapeXCoords[currentShapeIndex][pointOrdinal] -= allShapeXCoords[currentShapeIndex][1];
            allShapeYCoords[currentShapeIndex][pointOrdinal] -= allShapeYCoords[currentShapeIndex][1];
        }
    }

    // Explicitly set the first point to (0,0) after normalization for consistency.
    allShapeXCoords[currentShapeIndex][1] = 0;
    allShapeYCoords[currentShapeIndex][1] = 0;

    // Retrieve coordinates of the second point for conditional rotations.
    // Note: If numberOfPoints < 2, these will be undefined or 0, which is handled implicitly.
    const secondPointX = allShapeXCoords[currentShapeIndex][2];
    const secondPointY = allShapeYCoords[currentShapeIndex][2];

    // Apply conditional rotations. The original logic implies up to three separate rotations
    // if their respective conditions are met. This is not an `else if` chain.
    if (secondPointY > 0) {
        performRotation(allShapeXCoords[currentShapeIndex], allShapeYCoords[currentShapeIndex], numberOfPoints);
    }
    if (secondPointX < 0) {
        performRotation(allShapeXCoords[currentShapeIndex], allShapeYCoords[currentShapeIndex], numberOfPoints);
    }
    if (secondPointY < 0) {
        performRotation(allShapeXCoords[currentShapeIndex], allShapeYCoords[currentShapeIndex], numberOfPoints);
    }
}

/**
 * Transforms a shape by reversing its point order and re-normalizing its coordinates.
 * This effectively creates a "flipped" or inverted version of the shape,
 * followed by conditional rotations similar to the initial parsing.
 *
 * @param {number[]} shapeXPoints - The X coordinates of the shape (1-indexed), which will be modified in place.
 * @param {number[]} shapeYPoints - The Y coordinates of the shape (1-indexed), which will be modified in place.
 * @param {number} totalPoints - The total number of points in the shape.
 */
function reverseAndReorientShape(shapeXPoints, shapeYPoints, totalPoints) {
    // Create temporary copies of the original coordinates to perform the reversal.
    // Using `slice()` for a straightforward array copy.
    const originalXCoordsCopy = shapeXPoints.slice();
    const originalYCoordsCopy = shapeYPoints.slice();

    // Reorder points: the new i-th point corresponds to the original (totalPoints - i + 1)-th point.
    // Also, re-normalize relative to the *last* point of the original shape.
    for (let currentPointIdx = 1; currentPointIdx <= totalPoints; ++currentPointIdx) {
        const sourcePointIdx = totalPoints - currentPointIdx + 1;
        shapeXPoints[currentPointIdx] = originalXCoordsCopy[sourcePointIdx] - originalXCoordsCopy[totalPoints];
        shapeYPoints[currentPointIdx] = originalYCoordsCopy[sourcePointIdx] - originalYCoordsCopy[totalPoints];
    }
    // After reversal and normalization, the first point (index 1) should be at (0,0).
    // This is implicitly handled by the loop (when currentPointIdx=1, sourcePointIdx=totalPoints,
    // so shapeXPoints[1] = originalXCoordsCopy[totalPoints] - originalXCoordsCopy[totalPoints] = 0).
    // Explicitly setting it for clarity and robustness.
    shapeXPoints[1] = 0;
    shapeYPoints[1] = 0;

    // Retrieve coordinates of the second point after reversal and reorientation
    // for conditional rotations.
    const secondPointXAfterInversion = shapeXPoints[2];
    const secondPointYAfterInversion = shapeYPoints[2];

    // Apply conditional rotations, identical logic to `parseAndNormalizeShape`.
    if (secondPointYAfterInversion > 0) {
        performRotation(shapeXPoints, shapeYPoints, totalPoints);
    }
    if (secondPointXAfterInversion < 0) {
        performRotation(shapeXPoints, shapeYPoints, totalPoints);
    }
    if (secondPointYAfterInversion < 0) {
        performRotation(shapeXPoints, shapeYPoints, totalPoints);
    }
}

/**
 * Compares two shapes point by point to determine if they are geometrically identical.
 * Assumes shapes are already normalized (first point at 0,0) and oriented.
 *
 * @param {number[]} xCoordsA - X coordinates of the first shape.
 * @param {number[]} yCoordsA - Y coordinates of the first shape.
 * @param {number} countA - Number of points in the first shape.
 * @param {number[]} xCoordsB - X coordinates of the second shape.
 * @param {number[]} yCoordsB - Y coordinates of the second shape.
 * @returns {boolean} True if both shapes have identical coordinates for all points, false otherwise.
 */
function areShapesIdentical(xCoordsA, yCoordsA, countA, xCoordsB, yCoordsB) {
    // Basic validation: if point counts differ, shapes cannot be identical.
    if (countA !== countB) { // Assuming countB is passed or derived from xCoordsB.length - 1
        // (Self-correction: The original code implicitly handles this by checking m[0] == m[i])
        // For this helper, let's assume countB is implicitly handled by the calling context
        // which already ensures point counts are equal before calling this.
        // Or, we can pass countB explicitly. Let's pass it explicitly.
    }

    // Iterate and compare each point.
    for (let pointComparisonIdx = 1; pointComparisonIdx <= countA; ++pointComparisonIdx) {
        if (xCoordsA[pointComparisonIdx] !== xCoordsB[pointComparisonIdx] ||
            yCoordsA[pointComparisonIdx] !== yCoordsB[pointComparisonIdx]) {
            return false; // Mismatch found, shapes are not identical.
        }
    }
    return true; // All points matched successfully.
}


/**
 * The main entry point function that orchestrates reading input,
 * processing geometric shapes, and finding matches according to specific rules.
 *
 * @param {string} rawInputString - The entire input content provided as a single string.
 */
function processInputAndFindMatches(rawInputString) {
    // Split the raw input string into an array of individual lines.
    const inputLines = rawInputString.split("\n");

    // This loop continues processing test cases until a specific termination condition is met.
    while (true) {
        // Ensure there are still lines to read for the number of shapes.
        if (currentInputLineIndex >= inputLines.length) {
            console.error("Error: Unexpected end of input stream while attempting to read N.");
            break; // Terminate if input runs out prematurely.
        }

        // Read the number of shapes (N) for the current test case.
        const numberOfShapesInCase = Number.parseInt(inputLines[currentInputLineIndex++], 10);

        // The problem specification defines N=0 as the termination condition for all test cases.
        if (numberOfShapesInCase === 0) {
            break; // Exit the main processing loop.
        }

        // Initialize arrays to store all shape data for the current test case.
        // `allShapePointCounts` stores the 'm' value for each shape.
        // `allShapeXCoordinates` and `allShapeYCoordinates` store arrays of coordinates.
        // Arrays are sized `N+1` to accommodate shapes from index 0 to N.
        const allShapePointCounts = new Array(numberOfShapesInCase + 1);
        const allShapeXCoordinates = new Array(numberOfShapesInCase + 1);
        const allShapeYCoordinates = new Array(numberOfShapesInCase + 1);

        // Process each shape from the input. This includes the reference shape (index 0)
        // and all subsequent shapes (from index 1 to N).
        for (let shapeIterator = 0; shapeIterator <= numberOfShapesInCase; ++shapeIterator) {
            parseAndNormalizeShape(
                allShapeXCoordinates,
                allShapeYCoordinates,
                shapeIterator,
                allShapePointCounts,
                inputLines
            );
        }

        // Now, compare the reference shape (at index 0) against all other shapes
        // (from index 1 up to N) to find potential matches.
        for (let targetShapeIndex = 1; targetShapeIndex <= numberOfShapesInCase; ++targetShapeIndex) {
            // A fundamental requirement for shapes to match is having the same number of points.
            if (allShapePointCounts[0] === allShapePointCounts[targetShapeIndex]) {
                let currentShapeMatches = false;

                // First, check if the target shape directly matches the reference shape.
                if (areShapesIdentical(
                    allShapeXCoordinates[0], allShapeYCoordinates[0], allShapePointCounts[0],
                    allShapeXCoordinates[targetShapeIndex], allShapeYCoordinates[targetShapeIndex]
                )) {
                    currentShapeMatches = true;
                } else {
                    // If no direct match, attempt to match after applying the "inversion" transformation.
                    // Create temporary copies of the target shape's coordinates to avoid
                    // modifying the original shape data for subsequent comparisons.
                    const temporaryXCoordsForInversion = [...allShapeXCoordinates[targetShapeIndex]];
                    const temporaryYCoordsForInversion = [...allShapeYCoordinates[targetShapeIndex]];

                    reverseAndReorientShape(
                        temporaryXCoordsForInversion,
                        temporaryYCoordsForInversion,
                        allShapePointCounts[targetShapeIndex]
                    );

                    // Check for a match with the inverted version.
                    if (areShapesIdentical(
                        allShapeXCoordinates[0], allShapeYCoordinates[0], allShapePointCounts[0],
                        temporaryXCoordsForInversion, temporaryYCoordsForInversion
                    )) {
                        currentShapeMatches = true;
                    }
                }

                // If any match (either original or inverted) is found, log the index of the target shape.
                if (currentShapeMatches) {
                    console.log(targetShapeIndex);
                }
            }
        }
        // Print a separator string after processing all shapes for a given test case.
        console.log("+++++");
    }
}

// Invoke the main processing function, reading input from standard input.
processInputAndFindMatches(require("fs").readFileSync("/dev/stdin", "utf8"));