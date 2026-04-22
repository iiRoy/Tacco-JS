let processingOffset = 0;

/**
 * Adjusts the orientation of a set of coordinates by rotating them.
 * This function effectively performs a 90-degree rotation or a reflection,
 * depending on the specific coordinate values.
 *
 * @param {number[]} horizontalCoords  - Array of horizontal (X) coordinates.
 * @param {number[]} verticalCoords    - Array of vertical (Y) coordinates.
 * @param {number}   pointQuantity     - The number of points to process in the arrays.
 */
function adjustOrientation(horizontalCoords, verticalCoords, pointQuantity) {
    // Iterate through each coordinate pair from the first element up to the pointQuantity.
    for (let currentPoint = 1; currentPoint <= pointQuantity; currentPoint++) {
        // Store the current X coordinate temporarily.
        const currentXValue = horizontalCoords[currentPoint];
        // Calculate the new Y coordinate: if the original Y is zero, it remains zero;
        // otherwise, it becomes its negative value.
        const transformedYValue = (verticalCoords[currentPoint] === 0) ? 0 : (verticalCoords[currentPoint] * -1);

        // Update the X coordinate with the transformed Y value.
        horizontalCoords[currentPoint] = transformedYValue;
        // Update the Y coordinate with the previously stored X value.
        verticalCoords[currentPoint] = currentXValue;
    }
}


/**
 * Parses and loads a segment of geometric shape data from the raw input.
 * It initializes coordinate arrays and applies relative positioning.
 *
 * @param {Array<number[]>} xCoordSet    - Collection of X coordinate arrays for various shapes.
 * @param {Array<number[]>} yCoordSet    - Collection of Y coordinate arrays for various shapes.
 * @param {number}          shapeIdentifier - Index identifying the current shape being processed.
 * @param {number[]}        sizeManifest    - Array storing the number of points for each shape.
 * @param {string[]}        sourceData      - Raw input data, line by line.
 */
function parseInputSegment(xCoordSet, yCoordSet, shapeIdentifier, sizeManifest, sourceData) {

    // Extract the number of points for the current shape from the input and store it.
    sizeManifest[shapeIdentifier] = parseInt(sourceData[processingOffset++], 10);
    // Initialize empty arrays for X and Y coordinates for the current shape.
    xCoordSet[shapeIdentifier] = [];
    yCoordSet[shapeIdentifier] = [];

    // Loop through each point defined for the current shape.
    for (let pointIterator = 1; pointIterator <= sizeManifest[shapeIdentifier]; pointIterator++) {
        // Split the current line of input (which contains X and Y for a point) by space.
        const pointCoordinates = sourceData[processingOffset].split(" ");
        // Parse the X coordinate.
        xCoordSet[shapeIdentifier][pointIterator] = parseInt(pointCoordinates[0], 10);
        // Parse the Y coordinate and then increment the global input offset.
        yCoordSet[shapeIdentifier][pointIterator] = parseInt(pointCoordinates[1], 10);
        processingOffset++; // Increment after using the line

        // For all points after the first, make their coordinates relative to the first point.
        if (pointIterator > 1) {
            xCoordSet[shapeIdentifier][pointIterator] -= xCoordSet[shapeIdentifier][1];
            yCoordSet[shapeIdentifier][pointIterator] -= yCoordSet[shapeIdentifier][1];
        }
    }
    // Set the first point's coordinates to (0,0) as a reference or origin.
    xCoordSet[shapeIdentifier][1] = 0;
    yCoordSet[shapeIdentifier][1] = 0;

    // Apply specific rotations based on the second point's Y coordinate.
    // These conditions ensure specific transformations are applied if the shape's orientation needs adjustment.
    if (yCoordSet[shapeIdentifier][2] > 0) {
        adjustOrientation(xCoordSet[shapeIdentifier], yCoordSet[shapeIdentifier], sizeManifest[shapeIdentifier]);
    }
    if (xCoordSet[shapeIdentifier][2] < 0) {
        adjustOrientation(xCoordSet[shapeIdentifier], yCoordSet[shapeIdentifier], sizeManifest[shapeIdentifier]);
    }
    if (yCoordSet[shapeIdentifier][2] < 0) {
        adjustOrientation(xCoordSet[shapeIdentifier], yCoordSet[shapeIdentifier], sizeManifest[shapeIdentifier]);
    }
}

/**
 * Inverts or mirrors the coordinates of a given shape.
 * This transformation is often used to check for symmetry or inverted matches.
 *
 * @param {number[]} currentXCoordinates - The X coordinates of the shape.
 * @param {number[]} currentYCoordinates - The Y coordinates of the shape.
 * @param {number}   countOfPoints       - The total number of points in the shape.
 */
function reverseGeometry(currentXCoordinates, currentYCoordinates, countOfPoints) {
    // Create temporary arrays to hold the original coordinates.
    const tempXBuffer = [];
    const tempYBuffer = [];
    // Copy original coordinates to temporary buffers.
    for (let coordIterator = 1; coordIterator <= countOfPoints; coordIterator++) {
        tempXBuffer[coordIterator] = currentXCoordinates[coordIterator];
        tempYBuffer[coordIterator] = currentYCoordinates[coordIterator];
    }

    // Transform the original arrays by reversing and shifting coordinates.
    // Each point is re-calculated relative to the last point of the original sequence.
    for (let coordIterator = 1; coordIterator <= countOfPoints; coordIterator++) {
        currentXCoordinates[coordIterator] = tempXBuffer[countOfPoints - coordIterator + 1] - tempXBuffer[countOfPoints];
        currentYCoordinates[coordIterator] = tempYBuffer[countOfPoints - coordIterator + 1] - tempYBuffer[countOfPoints];
    }

    // Apply orientation adjustments based on the second point's new Y coordinate.
    if (currentYCoordinates[2] > 0) {
        adjustOrientation(currentXCoordinates, currentYCoordinates, countOfPoints);
    }
    if (currentXCoordinates[2] < 0) {
        adjustOrientation(currentXCoordinates, currentYCoordinates, countOfPoints);
    }
    if (currentYCoordinates[2] < 0) {
        adjustOrientation(currentXCoordinates, currentYCoordinates, countOfPoints);
    }
}

/**
 * Main entry point for the program. Reads input, processes shape data,
 * and identifies matching or inverted shapes.
 *
 * @param {string} programInput - The raw string input containing all shape definitions.
 */
function mainExecutionFlow(programInput) {
    // Split the entire input string into an array of lines.
    programInput = programInput.split("\n");

    // Loop indefinitely until a termination condition is met.
    while (true) {
        // Read the number of shapes for the current test case.
        // Increment the global offset after reading.
        const numberOfShapes = parseInt(programInput[processingOffset++], 10);
        // If the number of shapes is zero, terminate the program loop.
        if (numberOfShapes === 0) {
            break;
        }

        // Initialize arrays to store the number of points per shape,
        // and nested arrays for X and Y coordinates of all shapes.
        const shapePointCounts = [];
        const xCoordinateSets = [];
        const yCoordinateSets = [];

        // Process each shape's data.
        for (let currentShapeIdx = 0; currentShapeIdx <= numberOfShapes; currentShapeIdx++) {
            parseInputSegment(xCoordinateSets, yCoordinateSets, currentShapeIdx, shapePointCounts, programInput);
        }

        // Compare the first shape (index 0) with all subsequent shapes.
        for (let comparisonShapeIdx = 1; comparisonShapeIdx <= numberOfShapes; comparisonShapeIdx++) {
            // Check if the number of points in the first shape matches the current comparison shape.
            if (shapePointCounts[0] === shapePointCounts[comparisonShapeIdx]) {
                let isDirectMatch = true; // Assume a direct match initially.
                // Compare each point of the first shape with the current comparison shape.
                for (let pointCompareIdx = 1; pointCompareIdx <= shapePointCounts[0]; pointCompareIdx++) {
                    // If any coordinate pair does not match, it's not a direct match.
                    if (xCoordinateSets[0][pointCompareIdx] !== xCoordinateSets[comparisonShapeIdx][pointCompareIdx] ||
                        yCoordinateSets[0][pointCompareIdx] !== yCoordinateSets[comparisonShapeIdx][pointCompareIdx]) {
                        isDirectMatch = false; // Mark as not a direct match.
                        break;                  // Exit inner loop early.
                    }
                }
                // If a direct match is found, print its index.
                if (isDirectMatch) {
                    console.log(comparisonShapeIdx);
                } else {
                    // If not a direct match, try comparing after inverting the comparison shape.
                    reverseGeometry(xCoordinateSets[comparisonShapeIdx], yCoordinateSets[comparisonShapeIdx], shapePointCounts[comparisonShapeIdx]);
                    let isInvertedMatch = true; // Assume an inverted match initially.
                    // Compare each point of the first shape with the now-inverted comparison shape.
                    for (let pointCompareIdx = 1; pointCompareIdx <= shapePointCounts[0]; pointCompareIdx++) {
                        // If any coordinate pair does not match, it's not an inverted match.
                        if (xCoordinateSets[0][pointCompareIdx] !== xCoordinateSets[comparisonShapeIdx][pointCompareIdx] ||
                            yCoordinateSets[0][pointCompareIdx] !== yCoordinateSets[comparisonShapeIdx][pointCompareIdx]) {
                            isInvertedMatch = false; // Mark as not an inverted match.
                            break;                   // Exit inner loop early.
                        }
                    }
                    // If an inverted match is found, print its index.
                    if (isInvertedMatch) {
                        console.log(comparisonShapeIdx);
                    }
                }
            }
        }
        // Print a separator after processing each set of shapes.
        console.log("-----");
    }
}

// Execute the main program flow by reading input from standard input.
mainExecutionFlow(require("fs").readFileSync("/dev/stdin", "utf8"));