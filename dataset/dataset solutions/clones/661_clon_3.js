const fileSystem = require('fs');

// Read all input data from standard input.
// This data will be processed in batches, each batch representing a grid configuration.
const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');

// Split the raw input into individual lines and remove any leading/trailing whitespace from the entire block.
let inputLines = rawInputData.trim().split('\n');

// A pointer to keep track of the current line being processed from the inputLines array.
let currentLineIndex = 0;

/**
 * Parses a string containing two space-separated numbers, representing grid dimensions.
 * @param {string} dimensionString - The string to parse, e.g., "5 3".
 * @returns {{gridSize: number, numOperations: number}} An object containing the parsed grid size and number of operations.
 * @throws {Error} If the dimension string is invalid or cannot be parsed correctly.
 */
function parseGridDimensions(dimensionString) {
    const parts = dimensionString.split(' ').map(val => parseInt(val.trim(), 10)); // Ensure robust parsing
    
    // Basic validation for the parsed parts.
    if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) {
        throw new Error(`Failed to parse dimension string: "${dimensionString}". Expected two numbers.`);
    }
    return { gridSize: parts[0], numOperations: parts[1] };
}

// The main processing loop continues as long as there are lines to process
// and the "end of input" signal ("0 0") has not been encountered.
let shouldContinueProcessing = true;
while (shouldContinueProcessing) {
    // Check if we've run out of input lines prematurely.
    if (currentLineIndex >= inputLines.length) {
        console.error("Error: Unexpected end of input. Expected '0 0' or more data.");
        shouldContinueProcessing = false; // Exit gracefully
        continue;
    }

    const currentDimensionLine = inputLines[currentLineIndex++].trim();

    // The "0 0" line signals the end of all test cases.
    if (currentDimensionLine === "0 0") {
        shouldContinueProcessing = false;
        continue; // Exit the loop
    }

    let parsedDimensions;
    try {
        parsedDimensions = parseGridDimensions(currentDimensionLine);
    } catch (error) {
        console.error(`Skipping invalid dimension line: ${error.message}`);
        continue; // Skip to the next set of operations if parsing fails
    }

    const gridSize = parsedDimensions.gridSize;
    const numberOfOperations = parsedDimensions.numOperations;

    // Validate the parsed dimensions. A grid size of 0 or negative operations is invalid.
    if (gridSize <= 0 || numberOfOperations < 0) {
        console.warn(`Warning: Invalid grid size (${gridSize}) or operation count (${numberOfOperations}). Skipping this data set.`);
        // Consume the operation lines for this invalid set to avoid misalignment.
        currentLineIndex += numberOfOperations;
        continue;
    }

    // Initialize a 3D grid (cube) where each cell's state is initially 'false' (unmarked).
    // Using Array.from for a more functional and concise initialization.
    const cubeState = Array.from({ length: gridSize }, () =>
        Array.from({ length: gridSize }, () =>
            Array.from({ length: gridSize }, () => false) // 'false' indicates an unmarked cell
        )
    );

    // Process each marking operation for the current grid.
    for (let operationIndex = 0; operationIndex < numberOfOperations; operationIndex++) {
        // Ensure we don't go out of bounds when reading operation lines.
        if (currentLineIndex >= inputLines.length) {
            console.error(`Error: Ran out of operation lines for grid size ${gridSize}. Expected ${numberOfOperations} operations.`);
            break; // Stop processing operations for this grid
        }

        const operationLine = inputLines[currentLineIndex++].trim();
        const operationParts = operationLine.split(' ');
        
        const markingPlaneIdentifier = operationParts.shift(); // e.g., "xy", "xz", "yz"
        const rawCoordinates = operationParts.map(coordStr => parseInt(coordStr.trim(), 10) - 1); // Adjust to 0-based indexing

        // Extract coordinates for clarity and perform basic validation.
        const firstCoord = rawCoordinates[0];
        const secondCoord = rawCoordinates[1];

        if (isNaN(firstCoord) || isNaN(secondCoord) || 
            firstCoord < 0 || firstCoord >= gridSize || 
            secondCoord < 0 || secondCoord >= gridSize) {
            console.warn(`Warning: Invalid coordinates [${rawCoordinates}] for operation type '${markingPlaneIdentifier}'. Skipping this operation.`);
            continue; // Skip to the next operation
        }

        // Apply the marking operation based on the identifier using a switch statement.
        // Each case marks a specific line of cells in the 3D grid as 'true' (marked).
        switch (markingPlaneIdentifier) {
            case "xy": // Mark all cells along the Z-axis at a fixed (x, y)
                for (let zAxis = 0; zAxis < gridSize; zAxis++) {
                    cubeState[firstCoord][secondCoord][zAxis] = true;
                }
                break;
            case "xz": // Mark all cells along the Y-axis at a fixed (x, z)
                for (let yAxis = 0; yAxis < gridSize; yAxis++) {
                    cubeState[firstCoord][yAxis][secondCoord] = true;
                }
                break;
            case "yz": // Mark all cells along the X-axis at a fixed (y, z)
                for (let xAxis = 0; xAxis < gridSize; xAxis++) {
                    cubeState[xAxis][firstCoord][secondCoord] = true;
                }
                break;
            default:
                console.warn(`Unknown marking plane identifier encountered: '${markingPlaneIdentifier}'. Skipping operation.`);
                break;
        }
    }

    // After all operations, iterate through the entire grid to count how many cells remain unmarked.
    let totalUnmarkedCells = 0;
    
    // Guard clause for an empty grid (though gridSize > 0 is already checked, this adds robustness).
    if (gridSize === 0) {
        console.log(0);
        continue;
    }

    for (let xDimension = 0; xDimension < gridSize; xDimension++) {
        for (let yDimension = 0; yDimension < gridSize; yDimension++) {
            for (let zDimension = 0; zDimension < gridSize; zDimension++) {
                // If the cell's state is 'false', it means it has not been marked by any operation.
                if (!cubeState[xDimension][yDimension][zDimension]) {
                    totalUnmarkedCells++;
                }
            }
        }
    }

    // Output the final count of unmarked cells for the current grid configuration.
    console.log(totalUnmarkedCells);
}