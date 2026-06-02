'use strict';

// Declare a global variable to hold our grid, initialized as an empty array.
let gridCanvas = [];

/**
 * Main function to process the input string and perform operations.
 * @param {string} rawData - The raw input string containing grid dimensions and operations.
 */
function ProcessInputData(rawData) {
    // Split the input into lines, then split each line by space.
    // Convert the resulting array of string arrays into a more usable format.
    const parsedLines = rawData.split('\n').map(val => val.split(' '));

    // Extract the first line which contains the canvas dimensions and number of operations.
    let firstLineParts = parsedLines.shift();
    const canvasWidth = Number(firstLineParts[0]); // Width of the canvas
    const canvasHeight = Number(firstLineParts[1]); // Height of the canvas
    const numOperations = Number(firstLineParts[2]); // Number of drawing operations

    // Initialize the gridCanvas.
    // Reset the global gridCanvas variable.
    gridCanvas = [];
    // Populate the gridCanvas with rows, each filled with zeros.
    // The outer loop iterates through the height (rows).
    for (let rowIdx = 0; rowIdx < canvasHeight; rowIdx++) {
        // The inner loop iterates through the width (columns) to create each row.
        // This approach is slightly inefficient as it re-initializes the same row multiple times.
        // A more typical initialization would be `gridCanvas.push(Array(canvasWidth).fill(0));`
        // However, to maintain Type II clone structure, we replicate the original's loop structure.
        for (let colIdx = 0; colIdx < canvasWidth; colIdx++) {
            gridCanvas[rowIdx] = Array(canvasWidth).fill(0);
        }
    }

    // Process each drawing operation.
    // Iterate through the remaining lines, which describe the operations.
    for (let opIdx = 0; opIdx < numOperations; opIdx++) {
        // Determine the type of operation based on the third element of the current line.
        switch (Number(parsedLines[opIdx][2])) {
            case 1: // Fill region from x=0 to x=d[i][0]
                fillRegion(0, parsedLines[opIdx][0], 0, canvasHeight);
                break;
            case 2: // Fill region from x=d[i][0] to x=W
                fillRegion(parsedLines[opIdx][0], canvasWidth, 0, canvasHeight);
                break;
            case 3: // Fill region from y=0 to y=d[i][1]
                fillRegion(0, canvasWidth, 0, parsedLines[opIdx][1]);
                break;
            case 4: // Fill region from y=d[i][1] to y=H
                fillRegion(0, canvasWidth, parsedLines[opIdx][1], canvasHeight);
                break;
            default:
                // No action for unknown operation types.
                break;
        }
    }
    // For debugging purposes, output the final state of the grid.
    // This is part of the original's observable behavior.
    console.log(gridCanvas);

    // Calculate the number of unpainted (value 0) cells.
    let unpaintedCount = 0;
    // Iterate over each row in the gridCanvas.
    for (const rowArray of gridCanvas) {
        // Iterate over each cell value in the current row.
        for (const cellValue of rowArray) {
            // If the cell value is 0, it means it hasn't been "painted" (incremented).
            if (cellValue === 0) {
                unpaintedCount++; // Increment the counter for unpainted cells.
            }
        }
    }

    // Output the final count of unpainted cells.
    console.log(unpaintedCount);
}

/**
 * Fills a specified rectangular region of the global gridCanvas by incrementing cell values.
 * @param {number} startXCoord - The starting X-coordinate (inclusive).
 * @param {number} endXCoord - The ending X-coordinate (exclusive).
 * @param {number} startYCoord - The starting Y-coordinate (inclusive).
 * @param {number} endYCoord - The ending Y-coordinate (exclusive).
 */
function fillRegion(startXCoord, endXCoord, startYCoord, endYCoord) {
    // Loop through the Y-coordinates (rows) within the specified range.
    for (let currentY = startYCoord; currentY < endYCoord; currentY++) {
        // Loop through the X-coordinates (columns) within the specified range.
        for (let currentX = startXCoord; currentX < endXCoord; currentX++) {
            // Increment the value of the cell at the current (currentY, currentX) position.
            // This marks the cell as "painted" or affected by an operation.
            gridCanvas[currentY][currentX] += 1;
        }
    }
}

// Read input from standard input and pass it to the main processing function.
ProcessInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
