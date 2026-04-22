const displayOutput = console.log;

// Check if running in a Node.js environment to handle input
if (typeof process !== "undefined" && typeof process.stdin !== "undefined") {
    let collectedInputData = "";
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', function(dataChunk) {
        collectedInputData += dataChunk;
    });

    process.stdin.on('end', function() {
        const inputLinesArray = collectedInputData.split("\n");
        processGridData(inputLinesArray);
    });
}

/**
 * Determines if a second coordinate is strictly to the right of the first.
 * @param {number[]} coordA - The reference coordinate [row, column].
 * @param {number[]} coordB - The coordinate to check [row, column].
 * @returns {boolean} True if coordB's column is greater than coordA's column.
 */
function isHorizontallyBeyond(coordA, coordB) {
    return coordA[1] < coordB[1];
}

/**
 * Determines if a second coordinate is strictly below the first.
 * @param {number[]} coordA - The reference coordinate [row, column].
 * @param {number[]} coordB - The coordinate to check [row, column].
 * @returns {boolean} True if coordB's row is greater than coordA's row.
 */
function isVerticallyBeyond(coordA, coordB) {
    return coordA[0] < coordB[0];
}

/**
 * Calculates a new coordinate one step to the right from the given coordinate.
 * @param {number[]} currentCoord - The base coordinate [row, column].
 * @returns {number[]} A new coordinate [row, column + 1].
 */
function shiftRight(currentCoord) {
    return [currentCoord[0], currentCoord[1] + 1];
}

/**
 * Calculates a new coordinate one step down from the given coordinate.
 * @param {number[]} currentCoord - The base coordinate [row, column].
 * @returns {number[]} A new coordinate [row + 1, column].
 */
function shiftDown(currentCoord) {
    return [currentCoord[0] + 1, currentCoord[1]];
}

/**
 * Checks if a target coordinate is 'obstructed' by any point in a list of potential obstructions.
 * An obstruction occurs if a 'potentialObstruction' is further down in the same column,
 * or further right in the same row as the 'targetCoord'.
 * @param {number[]} targetCoord - The coordinate to check for obstruction.
 * @param {Array<number[]>} obstructionList - A list of coordinates that might obstruct.
 * @returns {boolean} True if targetCoord is obstructed by any point in the list.
 */
function isObstructedByDominantPoint(targetCoord, obstructionList) {
    // We use .some() for efficiency, as we only need to find one obstructing point.
    return obstructionList.some(potentialObstruction => {
        // If they share the same column, check if the potentialObstruction is vertically below the target.
        if (targetCoord[1] === potentialObstruction[1]) {
            return isVerticallyBeyond(potentialObstruction, targetCoord);
        }
        // If they share the same row, check if the potentialObstruction is horizontally to the right of the target.
        if (targetCoord[0] === potentialObstruction[0]) {
            return isHorizontallyBeyond(potentialObstruction, targetCoord);
        }
        // This potentialObstruction does not dominate the targetCoord in either dimension.
        return false;
    });
}

/**
 * The main function to process grid data and find the largest rectangle of zeros.
 * @param {string[]} gridInputRows - An array of strings, each representing a row of the grid.
 */
function processGridData(gridInputRows) {
    // Parse the input strings into a numeric 2D array.
    const numericGridMatrix = gridInputRows.map(rowStr =>
        rowStr.split(" ").map(Number)
    );

    // Extract grid dimensions from the first line.
    const gridDimensions = numericGridMatrix.shift();
    const gridHeight = gridDimensions[0];
    const gridWidth = gridDimensions[1];

    let largestRectangleArea = 0; // Initialize the maximum area found.

    // Initialize 2D arrays to store derived properties for each cell.
    // lastZeroRow[r][c]: The row index of the "last zero" encountered upwards from (r,c) to form a rectangle.
    const lastZeroRow = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(-1));
    // lastZeroCol[r][c]: The column index of the "last zero" encountered leftwards from (r,c) to form a rectangle.
    const lastZeroCol = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(-1));
    // boundaryMarkersMatrix[r][c]: A list of coordinates representing "dominant" points
    // that define the boundaries of possible rectangles ending at (r,c).
    const boundaryMarkersMatrix = Array.from({ length: gridHeight }, () => Array.from({ length: gridWidth }, () => []));

    // Iterate through each cell of the grid.
    for (let rowIndex = 0; rowIndex < gridHeight; rowIndex++) {
        for (let colIndex = 0; colIndex < gridWidth; colIndex++) {
            const currentCellValue = numericGridMatrix[rowIndex][colIndex];

            let upperZeroRow = -1; // Default if at top edge.
            if (rowIndex > 0) {
                upperZeroRow = lastZeroRow[rowIndex - 1][colIndex];
            }

            let leftZeroCol = -1; // Default if at left edge.
            if (colIndex > 0) {
                leftZeroCol = lastZeroCol[rowIndex][colIndex - 1];
            }

            // Inherit boundary markers from the top-left diagonal cell.
            // This is crucial for propagating information about rectangle boundaries.
            const inheritedBoundaryMarkers = (rowIndex === 0 || colIndex === 0) ?
                [] : boundaryMarkersMatrix[rowIndex - 1][colIndex - 1];

            let currentBoundaryMarkers = [];

            if (currentCellValue === 0) {
                // If the current cell is a zero, it can extend existing rectangles.
                const horizontalBlockEndMarker = [upperZeroRow, colIndex]; // Represents the 'x' coordinate of the block.
                const verticalBlockEndMarker = [rowIndex, leftZeroCol];   // Represents the 'y' coordinate of the block.

                // Transform inherited boundary markers based on current cell's position.
                currentBoundaryMarkers = inheritedBoundaryMarkers.map(prevMarker => {
                    // If the previous marker is not horizontally beyond the 'verticalBlockEndMarker' (i.e., it's to the left or same column),
                    // adjust its column to be one more than the 'leftZeroCol' (effectively extending the rectangle rightwards).
                    if (!isHorizontallyBeyond(verticalBlockEndMarker, prevMarker)) {
                        return [prevMarker[0], leftZeroCol + 1];
                    }
                    // If the previous marker is not vertically beyond the 'horizontalBlockEndMarker' (i.e., it's above or same row),
                    // adjust its row to be one more than the 'upperZeroRow' (effectively extending the rectangle downwards).
                    if (!isVerticallyBeyond(horizontalBlockEndMarker, prevMarker)) {
                        return [upperZeroRow + 1, prevMarker[1]];
                    }
                    return prevMarker; // Otherwise, the marker remains unchanged.
                });

                // Add new boundary markers originating from this cell.
                currentBoundaryMarkers.push(shiftRight(verticalBlockEndMarker));
                currentBoundaryMarkers.push(shiftDown(horizontalBlockEndMarker));

                // Filter out any markers that are 'obstructed' by others in the list.
                // An obstructed marker means it's not truly a boundary defining a maximal rectangle.
                currentBoundaryMarkers = currentBoundaryMarkers.filter(
                    marker => !isObstructedByDominantPoint(marker, currentBoundaryMarkers)
                );

                // Remove duplicate boundary markers.
                // Using a Set for efficient de-duplication.
                const uniqueCoordStrings = new Set();
                currentBoundaryMarkers = currentBoundaryMarkers.filter(coordPair => {
                    const stringifiedCoord = `${coordPair[0]},${coordPair[1]}`;
                    if (uniqueCoordStrings.has(stringifiedCoord)) {
                        return false; // This is a duplicate.
                    }
                    uniqueCoordStrings.add(stringifiedCoord);
                    return true; // Keep this unique coordinate.
                });

            } else {
                // If the current cell is a '1', it breaks any continuous block of zeros.
                // Reset the 'last zero' coordinates and clear boundary markers for this cell.
                upperZeroRow = rowIndex;
                leftZeroCol = colIndex;
                currentBoundaryMarkers = [];
            }

            // Store the calculated values for the current cell.
            boundaryMarkersMatrix[rowIndex][colIndex] = currentBoundaryMarkers;
            lastZeroRow[rowIndex][colIndex] = upperZeroRow;
            lastZeroCol[rowIndex][colIndex] = leftZeroCol;

            // Calculate potential rectangle areas ending at the current cell.
            const candidateAreas = currentBoundaryMarkers.map(marker => {
                const rectangleHeight = rowIndex - marker[0] + 1;
                const rectangleWidth = colIndex - marker[1] + 1;
                return rectangleHeight * rectangleWidth;
            });

            // Find the maximum area among the candidates for this cell.
            // If no candidate areas, assume 0 (a single '1' cell, or an invalid rectangle).
            const localMaxArea = candidateAreas.length > 0 ? Math.max(...candidateAreas) : 0;

            // Update the global largest rectangle area if a new maximum is found.
            if (localMaxArea > largestRectangleArea) {
                largestRectangleArea = localMaxArea;
            }
        }
    }
    // Output the final result.
    displayOutput(largestRectangleArea);
}