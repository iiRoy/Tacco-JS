// This module defines a function to simulate a propagation process
// across a 2D grid, similar to a multi-source Breadth-First Search (BFS).
// It determines the number of steps required for the propagation to complete.

function gridExpansionSimulator(rawInputText) {
    // Basic input validation: ensure the input is a non-empty string.
    if (typeof rawInputText !== 'string' || rawInputText.trim() === '') {
        console.error("Error: Input data is either missing or not a valid string.");
        // Returning a specific error code or value could be useful for external callers.
        return -1;
    }

    const inputLinesArray = rawInputText.split('\n');

    // Parse grid dimensions from the first line of input.
    // Using Array.prototype.map for direct number conversion.
    const dimensionParts = inputLinesArray[0].split(' ').map(Number);
    const gridRows = dimensionParts[0]; // Represents H (height)
    const gridCols = dimensionParts[1]; // Represents W (width)

    // Additional validation for parsed dimensions.
    if (isNaN(gridRows) || isNaN(gridCols) || gridRows <= 0 || gridCols <= 0) {
        console.error(`Error: Invalid grid dimensions provided: ${inputLinesArray[0]}. Both must be positive numbers.`);
        return -1;
    }

    // Initialize the grid matrix and the queue for initially active cells.
    // Using Array.from for a more explicit 2D array creation.
    const gridMatrix = Array.from({ length: gridRows }, () => Array(gridCols).fill(null));
    let currentPropagationFrontier = []; // Holds [row, col] coordinates of cells active in the current step.

    // Populate the grid and identify all starting points ('#').
    // The actual grid data starts from the second line of input.
    for (let rowIndex = 0; rowIndex < gridRows; rowIndex++) {
        // Ensure we have enough input lines for the specified grid height.
        if (rowIndex + 1 >= inputLinesArray.length) {
            console.error(`Error: Incomplete grid data. Expected ${gridRows} rows, but only found ${rowIndex} data rows.`);
            return -1;
        }
        const rowContentChars = inputLinesArray[rowIndex + 1].split('');
        if (rowContentChars.length < gridCols) {
             console.error(`Error: Row ${rowIndex} has fewer columns (${rowContentChars.length}) than expected (${gridCols}).`);
             return -1;
        }

        for (let colIndex = 0; colIndex < gridCols; colIndex++) {
            const cellCharacter = rowContentChars[colIndex];
            gridMatrix[rowIndex][colIndex] = cellCharacter;
            if (cellCharacter === '#') {
                currentPropagationFrontier.push([rowIndex, colIndex]);
            }
        }
    }

    let expansionCycleCount = 0; // Tracks the number of propagation steps (layers).

    // Define relative offsets for checking neighboring cells (Up, Down, Left, Right).
    const directionOffsets = [
        { deltaRow: -1, deltaCol: 0 }, // North
        { deltaRow: 1, deltaCol: 0 },  // South
        { deltaRow: 0, deltaCol: -1 }, // West
        { deltaRow: 0, deltaCol: 1 }   // East
    ];

    // Main propagation loop: continues as long as there are cells to expand from.
    while (currentPropagationFrontier.length > 0) {
        expansionCycleCount++; // Increment the step counter for each layer.

        // Prepare the queue for the next layer's propagation.
        // Using spread syntax for a cleaner shallow copy of the current frontier.
        const cellsToProcessInThisCycle = [...currentPropagationFrontier];
        currentPropagationFrontier = []; // Reset current frontier to collect new active cells.

        // Process each cell that was active in the previous cycle.
        for (const currentCellCoordinates of cellsToProcessInThisCycle) {
            // Destructure coordinates for easier access.
            const [currentCellRow, currentCellCol] = currentCellCoordinates;

            // Explore all four cardinal neighbors of the current cell.
            for (const offset of directionOffsets) {
                const neighborRow = currentCellRow + offset.deltaRow;
                const neighborCol = currentCellCol + offset.deltaCol;

                // Check if the neighbor cell is within grid boundaries.
                const isWithinBounds =
                    neighborRow >= 0 && neighborRow < gridRows &&
                    neighborCol >= 0 && neighborCol < gridCols;

                if (isWithinBounds) {
                    // If the neighbor is an 'empty' cell ('.'), it gets filled ('#')
                    // and added to the queue for the next propagation cycle.
                    if (gridMatrix[neighborRow][neighborCol] === '.') {
                        gridMatrix[neighborRow][neighborCol] = '#'; // Mark as filled.
                        currentPropagationFrontier.push([neighborRow, neighborCol]);
                    }
                }
            }
        }
    }

    // The problem typically asks for the number of steps *after* the initial state.
    // If 'expansionCycleCount' is 1, it means only the initial state was processed (0 steps taken).
    // If 'expansionCycleCount' is 0, it means no '#' cells were found initially.
    const finalResult = expansionCycleCount - 1;
    console.log(finalResult);
    return finalResult; // Return the calculated value.
}

// --- Execution Entry Point ---
// This part handles reading input from stdin and invoking the simulator.
// It's structured to be robust against file system errors.

const standardInputPath = "/dev/stdin";
const fileSystemHandler = require("fs"); // Import Node.js File System module.

try {
    // Read the entire content of the standard input file as a UTF-8 string.
    const fullInputContent = fileSystemHandler.readFileSync(standardInputPath, "utf8");
    gridExpansionSimulator(fullInputContent); // Call the main processing function.
} catch (ioError) {
    // Log any errors that occur during file reading.
    console.error(`An I/O error occurred while reading input from ${standardInputPath}: ${ioError.message}`);
    // A non-zero exit code indicates an error to the shell.
    process.exit(1);
}