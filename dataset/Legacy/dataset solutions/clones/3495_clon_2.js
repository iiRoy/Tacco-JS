'use strict'; // Enforce strict mode for cleaner code execution

/**
 * Main function to process the input data and find the central point and height.
 * @param {string} rawData - The raw input string from stdin.
 */
const processInput = (rawData) => {
    // Split the input string into an array of lines
    const parsedLines = rawData.split('\n');

    // The first line contains the number of points
    const countPoints = parseInt(parsedLines[0], 10);

    // Initialize arrays to store X, Y coordinates and Z heights of the points
    let coordX = [];
    let coordY = [];
    let heights = [];

    // Iterate through the subsequent lines to populate the coordinate and height arrays
    // The slice method extracts lines from index 1 up to countPoints (inclusive)
    parsedLines.slice(1, countPoints + 1).forEach(lineStr => {
        // Split each line by space and parse values as integers
        let coordsAndHeight = lineStr.split(' ').map(valStr => parseInt(valStr, 10));
        coordX.push(coordsAndHeight[0]);
        coordY.push(coordsAndHeight[1]);
        heights.push(coordsAndHeight[2]);
    });

    // Define the maximum coordinate value for the search grid
    const gridLimit = 100;

    // Iterate through all possible Y coordinates in the grid
    for (let currentY = 0; currentY <= gridLimit; currentY++) {
        // Iterate through all possible X coordinates in the grid
        for (let currentX = 0; currentX <= gridLimit; currentX++) {
            // Initialize a variable to store the candidate height for the current (x, y)
            // -1 indicates no height determined yet, -2 indicates an inconsistency
            let candidateHeight = -1;

            // First pass: Check points with known heights (Z[i] > 0)
            for (let pointIndex = 0; pointIndex < countPoints; pointIndex++) {
                if (heights[pointIndex] > 0) {
                    // Calculate the expected height at (currentX, currentY) based on the current point
                    let calculatedHeight = heights[pointIndex] + Math.abs(coordY[pointIndex] - currentY) + Math.abs(coordX[pointIndex] - currentX);

                    // If this is the first point with a known height, set the candidate height
                    if (candidateHeight === -1) {
                        candidateHeight = calculatedHeight;
                    }
                    // If a different height is calculated, it's inconsistent, mark as -2 and break
                    else if (candidateHeight !== calculatedHeight) {
                        candidateHeight = -2;
                        break;
                    }
                }
            }

            // If an inconsistency was found, skip to the next (x, y) pair
            if (candidateHeight === -2) {
                continue;
            }

            // Second pass: Check points with zero height (Z[i] === 0)
            for (let pointIndex = 0; pointIndex < countPoints; pointIndex++) {
                if (heights[pointIndex] === 0) {
                    // Calculate the Manhattan distance from the current (x, y) to this point
                    let distanceToPoint = Math.abs(coordY[pointIndex] - currentY) + Math.abs(coordX[pointIndex] - currentX);

                    // If the candidate height is greater than the distance to a point with Z=0,
                    // it means this point should have a height > 0, which contradicts Z=0.
                    // Mark as inconsistent and break.
                    if (candidateHeight > distanceToPoint) {
                        candidateHeight = -2;
                        break;
                    }
                }
            }

            // If after both passes, no inconsistency was found, print the result
            if (candidateHeight === -2) {
                continue;
            }
            // Output the coordinates and the determined height
            console.log('%d %d %d', currentX, currentY, candidateHeight);
        }
    }
};

// Read the input from stdin and pass it to the main processing function
processInput(require('fs').readFileSync('/dev/stdin', 'utf-8'));
