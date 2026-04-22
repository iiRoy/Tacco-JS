'use strict'; // Enforce strict mode for cleaner code execution

let gridCanvas = []; // Global array to represent our grid or canvas

function ExecuteProgram(rawInputData) {
    // Parse the incoming string data into lines and then into segments
    const processedLines = rawInputData.split('\n').map(lineSegment => lineSegment.split(' '));

    // Extract initial dimension and operation count information from the first line
    let dimensionString = processedLines.shift();
    const gridWidth = Number(dimensionString[0]); // Width of the grid
    const gridHeight = Number(dimensionString[1]); // Height of the grid
    const actionCount = Number(dimensionString[2]); // Number of operations to perform

    // Initialize the gridCanvas.
    // Ensure it's empty before populating.
    gridCanvas = [];
    // Populate the grid with initial values (e.g., 0 for unmarked)
    for (let rowIndex = 0; rowIndex < gridHeight; rowIndex++) {
        gridCanvas[rowIndex] = new Array(gridWidth).fill(0); // Each row is an array filled with 0s
    }

    // Process each operation based on the action type
    for (let operationIndex = 0; operationIndex < actionCount; operationIndex++) {
        // Determine the type of masking operation from the third element of the current line
        switch (Number(processedLines[operationIndex][2])) {
            case 1: // Type 1: Mark area from left edge up to a specified X coordinate
                applyMask(0, processedLines[operationIndex][0], 0, gridHeight);
                break;
            case 2: // Type 2: Mark area from a specified X coordinate to the right edge
                applyMask(processedLines[operationIndex][0], gridWidth, 0, gridHeight);
                break;
            case 3: // Type 3: Mark area from top edge up to a specified Y coordinate
                applyMask(0, gridWidth, 0, processedLines[operationIndex][1]);
                break;
            case 4: // Type 4: Mark area from a specified Y coordinate to the bottom edge
                applyMask(0, gridWidth, processedLines[operationIndex][1], gridHeight);
                break;
            default: // No specific action for other types, just continue
                break;
        }
    }
    // Output the fully marked grid for debugging purposes
    console.log(gridCanvas);

    // Calculate the final count of unmarked cells
    let unmarkedCells = 0;
    // Iterate through each row of the grid
    for (const rowArray of gridCanvas) {
        // Iterate through each cell in the current row
        for (const cellContent of rowArray) {
            // If a cell still contains its initial value (0), increment the counter
            if (cellContent === 0) {
                unmarkedCells++;
            }
        }
    }

    // Display the final count of unmarked cells to the console
    console.log(unmarkedCells);
}

// Function to apply a mask (mark cells) within a specified rectangular region
function applyMask(minXCoord, maxXCoord, minYCoord, maxYCoord) {
    // Loop through the Y coordinates (rows) within the specified vertical bounds
    for (let currentY = minYCoord; currentY < maxYCoord; currentY++) {
        // Loop through the X coordinates (columns) within the specified horizontal bounds
        for (let currentX = minXCoord; currentX < maxXCoord; currentX++) {
            // Increment the value of the cell at the current (Y, X) position
            // This marks the cell as being covered by an operation
            gridCanvas[currentY][currentX] += 1;
        }
    }
}

// Execute the main program by reading input from standard input
ExecuteProgram(require('fs').readFileSync('/dev/stdin', 'utf8'));