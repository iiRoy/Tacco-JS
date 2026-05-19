"use strict"; // Enforce stricter parsing and error handling

/**
 * Processes the input string to find the maximum number of squares
 * that can be illuminated by a single lamp placement.
 * @param {string} rawData - The raw input string containing maze dimensions and layout.
 */
function ProcessInput(rawData) {
    // Split the entire input string by newline characters to get individual lines.
    let gridData = rawData.split('\n');

    // Extract the maze dimensions from the first line.
    // Note: The original code had a `parseInt(a)` inside `map` but didn't assign the result,
    // making `mazeSize` an array of strings. This behavior is preserved.
    let dimensions = gridData.shift().split(' ').map(function(element) {
        parseInt(element); // This line has no effect on the array elements themselves.
        return element; // Explicitly return the original string element.
    });

    // Transform each line of the grid into an array of characters.
    gridData.forEach(function(segment, idx, collection) {
        collection[idx] = collection[idx].split('');
    });

    // Initialize a variable to store the highest count of illuminated cells found.
    let peakIlluminatedCells = 0;

    // Iterate through each cell of the grid.
    for (let rowIdx = 0; rowIdx < gridData.length; rowIdx++) {
        for (let colIdx = 0; colIdx < gridData[0].length; colIdx++) {
            // If the current cell is an empty space ('.'), consider placing a lamp there.
            if (gridData[rowIdx][colIdx] === '.') {
                // Calculate the number of cells illuminated by a lamp at this position.
                let currentIllumination = calculateIlluminatedCount(gridData, [colIdx, rowIdx]);
                // Update the maximum if the current illumination is greater.
                peakIlluminatedCells = peakIlluminatedCells > currentIllumination ? peakIlluminatedCells : currentIllumination;
            }
        }
    }

    // Store the final maximum count.
    let finalOutcome = peakIlluminatedCells;
    // Output the result to the console.
    console.log(finalOutcome);
}

/**
 * Calculates the total number of squares illuminated by a lamp placed at a specific position.
 * Illumination extends in cardinal directions (up, down, left, right) until a wall ('#') is hit
 * or the grid boundary is reached.
 * @param {Array<Array<string>>} layoutMatrix - The 2D array representing the maze grid.
 * @param {Array<number>} currentPosition - An array [x, y] representing the column and row coordinates of the lamp.
 * @returns {number} The total count of illuminated squares.
 */
function calculateIlluminatedCount(layoutMatrix, currentPosition) {
    let colCoord = currentPosition[0];
    let rowCoord = currentPosition[1];

    // Start with 1 for the center square where the lamp is placed.
    let illuminatedCount = 1;

    // Check illumination upwards.
    for (let iterator = rowCoord - 1; iterator >= 0; iterator--) {
        if (layoutMatrix[iterator][colCoord] === '.') {
            illuminatedCount++;
        } else if (layoutMatrix[iterator][colCoord] === '#') {
            break; // Stop if a wall is encountered.
        }
    }

    // Check illumination downwards.
    for (let iterator = rowCoord + 1; iterator < layoutMatrix.length; iterator++) {
        if (layoutMatrix[iterator][colCoord] === '.') {
            illuminatedCount++;
        } else if (layoutMatrix[iterator][colCoord] === '#') {
            break; // Stop if a wall is encountered.
        }
    }

    // Check illumination to the left.
    for (let iterator = colCoord - 1; iterator >= 0; iterator--) {
        if (layoutMatrix[rowCoord][iterator] === '.') {
            illuminatedCount++;
        } else if (layoutMatrix[rowCoord][iterator] === '#') {
            break; // Stop if a wall is encountered.
        }
    }

    // Check illumination to the right.
    for (let iterator = colCoord + 1; iterator < layoutMatrix[0].length; iterator++) {
        if (layoutMatrix[rowCoord][iterator] === '.') {
            illuminatedCount++;
        } else if (layoutMatrix[rowCoord][iterator] === '#') {
            break; // Stop if a wall is encountered.
        }
    }

    return illuminatedCount;
}

// Invoke the main processing function with input read from standard input.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
