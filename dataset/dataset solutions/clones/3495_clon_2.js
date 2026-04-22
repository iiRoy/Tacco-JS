'use strict' // Enforce strict parsing and error handling for cleaner code.

/**
 *  Main function to process the provided input data.
 *  It parses coordinates and heights, then searches for a central point.
 *  @param {string} rawData - The entire input as a single string.
 */
const processInputData = (rawData) => {
    // Split the raw input string into individual lines for easier processing.
    rawData = rawData.split('\n');

    // The first line contains the total number of data points.
    const numPoints = parseInt(rawData[0]);

    // Initialize arrays to store the X, Y coordinates and corresponding heights of the source points.
    let sourceXCoords = [];
    let sourceYCoords = [];
    let sourceHeights = [];

    // Iterate through the remaining lines, each representing a data point.
    // Skip the first line as it was already processed for 'numPoints'.
    rawData.slice(1, numPoints + 1).forEach((currentLine) => {
        // For each line, split it by spaces and convert parts to integers.
        let parsedValues = currentLine.split(' ').map((strVal) => parseInt(strVal));
        // Store the parsed X, Y, and H values into their respective arrays.
        sourceXCoords.push(parsedValues[0]);
        sourceYCoords.push(parsedValues[1]);
        sourceHeights.push(parsedValues[2]);
    });

    // Define the maximum coordinate value for the search grid.
    const gridExtent = 100;

    // Begin a nested loop to iterate through all possible (x, y) coordinates within the grid.
    for (let rowIdx = 0; rowIdx <= gridExtent; rowIdx++) {
        for (let colIdx = 0; colIdx <= gridExtent; colIdx++) {

            // Initialize a variable to store the required height (H) for the current (colIdx, rowIdx)
            // -1 indicates it's not yet determined, -2 indicates an invalid candidate.
            let candidateHeight = -1;

            // First pass: Check points with known heights (H > 0).
            // These points provide constraints on the candidateHeight.
            for (let pointIdx = 0; pointIdx < numPoints; pointIdx++) {
                if (sourceHeights[pointIdx] > 0) {
                    // Calculate the potential height based on the current point and its known height.
                    // H_center = H_point + |X_point - X_center| + |Y_point - Y_center|
                    let calculatedHeight =
                        sourceHeights[pointIdx] +
                        Math.abs(sourceYCoords[pointIdx] - rowIdx) +
                        Math.abs(sourceXCoords[pointIdx] - colIdx);

                    // If this is the first valid point found, set the candidateHeight.
                    if (candidateHeight === -1) {
                        candidateHeight = calculatedHeight;
                    }
                    // If a previous point suggested a different height, this (colIdx, rowIdx) is invalid.
                    else if (candidateHeight !== calculatedHeight) {
                        candidateHeight = -2; // Mark as invalid.
                        break; // No need to check further points for this (colIdx, rowIdx).
                    }
                }
            }

            // If the candidate height was marked as invalid, skip to the next (colIdx, rowIdx).
            if (candidateHeight === -2) continue;

            // Second pass: Check points with zero height (H = 0).
            // These points indicate that the center cannot be too close.
            for (let pointIdx = 0; pointIdx < numPoints; pointIdx++) {
                if (sourceHeights[pointIdx] === 0) {
                    // Calculate the Manhattan distance from the current (colIdx, rowIdx) to the point.
                    let manhattanDistance =
                        Math.abs(sourceYCoords[pointIdx] - rowIdx) +
                        Math.abs(sourceXCoords[pointIdx] - colIdx);

                    // If the candidateHeight is greater than this distance, it means
                    // the center would be "visible" from a point where H=0, which is a contradiction.
                    if (candidateHeight > manhattanDistance) {
                        candidateHeight = -2; // Mark as invalid.
                        break; // No need to check further points for this (colIdx, rowIdx).
                    }
                }
            }

            // If after the second pass, the candidate height is still valid (not -2),
            // then this (colIdx, rowIdx, candidateHeight) is a possible center.
            if (candidateHeight === -2) continue;

            // Output the found central coordinates and its height.
            // There should be only one such unique solution.
            console.log('%d %d %d', colIdx, rowIdx, candidateHeight);
        }
    }
};

// Read input from standard input, decode it as UTF-8, and pass it to the processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf-8'));