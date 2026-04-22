'use strict';

/**
 * Parses raw input string, performs geometric operations on a 2D grid,
 * and calculates the number of unmarked cells.
 * @param {string} rawInputString - The entire input read from stdin.
 */
function ProcessGeometryOperations(rawInputString) {
    /**
     * Helper function to safely parse integers from strings.
     * Includes basic validation for non-numeric inputs.
     * @param {string} str - The string to parse.
     * @returns {number} The parsed integer, or 0 if parsing fails.
     */
    const getInteger = (str) => {
        // Trim whitespace from the string before parsing.
        const val = parseInt(str.trim(), 10);
        // Guard clause: Check if the parsed value is a valid number.
        if (isNaN(val)) {
            // Log a warning for debugging purposes, then return a default value.
            console.warn(`Warning: Could not parse "${str}" as an integer. Defaulting to 0.`);
            return 0;
        }
        return val;
    };

    // Split the entire input string into individual lines, then split each line
    // by space to get an array of string tokens.
    const instructionLines = rawInputString.trim().split('\n').map(line => line.split(' '));

    // Guard clause: Ensure there is at least one line of input for configuration.
    if (instructionLines.length === 0) {
        console.error("Error: No input lines provided. Cannot proceed with operations.");
        return;
    }

    // Extract the initial configuration line (width, height, total operations).
    // The shift() method removes the first element from the array and returns it.
    const configLine = instructionLines.shift();

    // Guard clause: Validate the structure of the configuration line.
    if (!configLine || configLine.length < 3) {
        console.error("Error: Invalid configuration line format. Expected W H N.");
        return;
    }

    // Parse the canvas dimensions and the number of operations using the helper function.
    const canvasWidth = getInteger(configLine[0]);
    const canvasHeight = getInteger(configLine[1]);
    let totalOperations = getInteger(configLine[2]); // Using 'let' as it might be adjusted.

    // Guard clause: Ensure canvas dimensions are positive.
    if (canvasWidth <= 0 || canvasHeight <= 0) {
        console.error("Error: Canvas dimensions (width and height) must be positive integers.");
        return; // Terminate execution if dimensions are invalid.
    }

    // Guard clause: Adjust totalOperations if it exceeds the available instruction lines.
    // This makes the processing more robust against malformed input counts.
    if (totalOperations > instructionLines.length) {
        console.warn(`Warning: Declared operations (${totalOperations}) exceed actual available instruction lines (${instructionLines.length}). Adjusting count.`);
        totalOperations = instructionLines.length; // Limit operations to available lines.
    } else if (totalOperations < 0) {
        console.warn(`Warning: Declared operations (${totalOperations}) is negative. Setting to 0.`);
        totalOperations = 0;
    }


    // Initialize the 2D grid (canvas) where operations will be performed.
    // Each cell is initialized to 0, representing an unmarked state.
    // This uses a more modern and concise Array.from approach for initialization,
    // and correctly creates a 2D array, fixing a potential bug in the original's loop-based init.
    const currentGridState = Array.from({ length: canvasHeight }, () => new Array(canvasWidth).fill(0));

    // Iterate through each operation instruction.
    for (let operationIndex = 0; operationIndex < totalOperations; ++operationIndex) {
        // Guard clause: Ensure an instruction line exists at the current index.
        if (operationIndex >= instructionLines.length) {
            console.warn(`Warning: Attempted to process operation ${operationIndex + 1} but no more instruction lines are available. Stopping.`);
            break; // Exit loop if no more instructions.
        }

        const currentOperation = instructionLines[operationIndex];

        // Guard clause: Validate the structure of the current operation line.
        if (!currentOperation || currentOperation.length < 3) {
            console.warn(`Warning: Invalid operation line format at index ${operationIndex}. Expected X Y Type. Skipping this operation.`);
            continue; // Skip to the next operation if invalid.
        }

        // Parse the coordinates and the type of operation.
        const coordX = getInteger(currentOperation[0]);
        const coordY = getInteger(currentOperation[1]);
        const operationType = getInteger(currentOperation[2]);

        // Apply the mask based on the operation type.
        // Using an if-else if structure for logical branching, providing an alternative
        // to the original's switch statement.
        if (operationType === 1) {
            // Operation 1: Mark all cells where x < coordX
            applyMask(0, coordX, 0, canvasHeight, currentGridState);
        } else if (operationType === 2) {
            // Operation 2: Mark all cells where x > coordX
            applyMask(coordX, canvasWidth, 0, canvasHeight, currentGridState);
        } else if (operationType === 3) {
            // Operation 3: Mark all cells where y < coordY
            applyMask(0, canvasWidth, 0, coordY, currentGridState);
        } else if (operationType === 4) {
            // Operation 4: Mark all cells where y > coordY
            applyMask(0, canvasWidth, coordY, canvasHeight, currentGridState);
        } else {
            // Default case: Log a warning for any unrecognized operation type.
            console.warn(`Unknown operation type encountered: ${operationType} at line ${operationIndex + 2}. Skipping this operation.`);
        }
    }

    // After all operations, count the number of cells that remain unmarked (value 0).
    let unmarkedCellCounter = 0;
    // Using traditional nested for loops for iteration, demonstrating an alternative
    // to the `for...of` loops used in the original for counting.
    for (let rowIdx = 0; rowIdx < canvasHeight; ++rowIdx) {
        for (let colIdx = 0; colIdx < canvasWidth; ++colIdx) {
            // Increment the counter if the cell is still 0.
            if (currentGridState[rowIdx][colIdx] === 0) {
                unmarkedCellCounter++;
            }
        }
    }

    // Output the final count of unmarked cells.
    console.log(unmarkedCellCounter);
}

/**
 * Applies a mask to a specified rectangular region within a 2D grid.
 * Cells within the region are marked (set to 1).
 * This function is designed to be pure, operating only on its input parameters.
 * @param {number} startCoordX - The starting X-coordinate (inclusive) for marking.
 * @param {number} endCoordX - The ending X-coordinate (exclusive) for marking.
 * @param {number} startCoordY - The starting Y-coordinate (inclusive) for marking.
 * @param {number} endCoordY - The ending Y-coordinate (exclusive) for marking.
 * @param {Array<Array<number>>} currentGrid - The 2D array representing the grid to be modified.
 */
function applyMask(startCoordX, endCoordX, startCoordY, endCoordY, currentGrid) {
    // Determine grid dimensions for boundary checking.
    const gridHeight = currentGrid.length;
    const gridWidth = gridHeight > 0 ? currentGrid[0].length : 0;

    // Guard clause: Clamp the coordinates to ensure they stay within the grid boundaries.
    // This prevents out-of-bounds array access and makes the function more robust.
    const actualStartY = Math.max(0, startCoordY);
    const actualEndY = Math.min(gridHeight, endCoordY);
    const actualStartX = Math.max(0, startCoordX);
    const actualEndX = Math.min(gridWidth, endCoordX);

    // Only proceed with marking if the adjusted region is valid (start is less than end for both axes).
    if (actualStartY < actualEndY && actualStartX < actualEndX) {
        // Iterate through the rows within the specified Y-range.
        for (let yIterator = actualStartY; yIterator < actualEndY; ++yIterator) {
            // Iterate through the columns within the specified X-range.
            for (let xIterator = actualStartX; xIterator < actualEndX; ++xIterator) {
                // Mark the cell by setting its value to 1.
                // This is an update from `+= 1` to `= 1`, which is functionally equivalent
                // for the problem's goal of counting cells with value 0.
                currentGrid[yIterator][xIterator] = 1;
            }
        }
    } else {
        // Log a warning if the attempted mask region is invalid or entirely outside the grid.
        console.warn(`Warning: Attempted to apply mask with invalid or out-of-bounds coordinates: ` +
                     `Original X:[${startCoordX},${endCoordX}), Y:[${startCoordY},${endCoordY}) ` +
                     `on grid ${gridWidth}x${gridHeight}. Clamped to X:[${actualStartX},${actualEndX}), Y:[${actualStartY},${actualEndY}). No cells were marked.`);
    }
}

// Entry point for executing the program.
// This section handles reading input from the standard input stream.
const fileSystemModule = require('fs');
const standardInputPath = '/dev/stdin';
const encodingType = 'utf8';

// Read the entire content of the standard input file synchronously.
// Then, pass the raw string data to the main processing function.
ProcessGeometryOperations(fileSystemModule.readFileSync(standardInputPath, encodingType));