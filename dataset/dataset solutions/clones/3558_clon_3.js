'use strict';

/**
 * Safely parses a string into a positive integer.
 * Returns a default value if parsing fails or the number is not positive.
 * @param {string} valueString - The string to parse.
 * @param {number} [defaultValue=0] - The value to return on failure.
 * @returns {number} The parsed positive integer or the default value.
 */
const parsePositiveInt = (valueString, defaultValue = 0) => {
    const parsedValue = Number(valueString); // Use Number for type conversion
    // Validate if it's an integer and greater than zero.
    return (Number.isInteger(parsedValue) && parsedValue > 0) ? parsedValue : defaultValue;
};

/**
 * Processes the input string to perform a specific grid manipulation task.
 * The task involves identifying odd-valued cells and moving their 'oddness'
 * to an adjacent cell (preferring right, then down) until no more moves are possible.
 *
 * @param {string} rawInputData - The raw input string containing grid dimensions and values.
 */
const processInputGrid = (rawInputData) => {

    // Break down the raw input into individual lines for easier processing.
    const inputLines = rawInputData.trim().split('\n');

    // Extract grid dimensions (number of rows and columns) from the very first line.
    const dimensionStrings = inputLines[0].split(' ');
    const numRows = parsePositiveInt(dimensionStrings[0]); // Renamed H from original
    const numCols = parsePositiveInt(dimensionStrings[1]); // Renamed W from original

    // Initialize the 2D array (matrix) to store the grid's cell values.
    const cellValuesMatrix = []; // Renamed 'a' from original

    // Populate the grid matrix with integer values from the subsequent input lines.
    for (let rIdx = 0; rIdx < numRows; rIdx++) { // Iterating through rows, 'rIdx' instead of 'y'
        const currentLineValues = inputLines[rIdx + 1].split(' '); // Renamed 'l' from original
        const rowData = []; // An intermediate array to build the current row.
        for (let cIdx = 0; cIdx < numCols; cIdx++) { // Iterating through columns, 'cIdx' instead of 'x'
            // Ensure each cell value is parsed as a positive integer.
            rowData.push(parsePositiveInt(currentLineValues[cIdx]));
        }
        cellValuesMatrix.push(rowData); // Add the fully parsed row to the matrix.
    }

    // This array will store a log of all transfer operations performed.
    const transferOperations = []; // Renamed 'log' from original

    /**
     * Executes a value transfer from a source cell to a destination cell in the grid.
     * Decrements the source cell's value and increments the destination cell's value.
     * Records the transfer operation using 1-based indexing for output.
     *
     * @param {number} srcCol - Source column index (0-based).
     * @param {number} srcRow - Source row index (0-based).
     * @param {number} destCol - Destination column index (0-based).
     * @param {number} destRow - Destination row index (0-based).
     */
    const performTransfer = (srcCol, srcRow, destCol, destRow) => { // Renamed 'move' from original

        // Defensive check: If the source cell has no value, no transfer can occur.
        // (Though in this problem's logic, we only call this for odd, non-zero values.)
        if (cellValuesMatrix[srcRow][srcCol] === 0) {
            return;
        }

        // Record the move using 1-based indexing for output, formatted as a string.
        transferOperations.push(`${srcRow + 1} ${srcCol + 1} ${destRow + 1} ${destCol + 1}`);

        // Update the cell values: increment destination, decrement source.
        cellValuesMatrix[destRow][destCol] += 1;
        cellValuesMatrix[srcRow][srcCol] -= 1;
    };

    // Main loop: Iterate through each cell of the grid to identify and resolve odd-valued cells.
    // The problem strategy is to move any 'oddness' to an adjacent cell (right or down).
    for (let r = 0; r < numRows; r++) { // Row index, 'r' instead of 'y'
        for (let c = 0; c < numCols; c++) { // Column index, 'c' instead of 'x'

            let currentCellValue = cellValuesMatrix[r][c]; // Helper variable for readability.

            // Check if the current cell's value is odd.
            if (currentCellValue % 2 !== 0) {
                // If the value is odd, we need to transfer its 'oddness'.
                let transferAttempted = false; // Flag to indicate if a transfer was initiated.

                // Priority 1: Attempt to move the value to the cell immediately to the right.
                if (c + 1 < numCols) { // Check if a right neighbor exists within grid bounds.
                    performTransfer(c, r, c + 1, r); // Call the transfer function.
                    transferAttempted = true;
                }
                // Priority 2: If moving right is not possible, attempt to move down.
                else if (r + 1 < numRows) { // Check if a bottom neighbor exists.
                    performTransfer(c, r, c, r + 1); // Call the transfer function.
                    transferAttempted = true;
                }

                // This block is an example of adding an extra validation/debug fragment (Type III).
                // In a typical problem, an odd number at the very last cell might be an edge case.
                if (!transferAttempted && r === numRows - 1 && c === numCols - 1) {
                    // console.warn(`Note: Odd value detected at the bottom-rightmost cell (${r+1},${c+1}) with no available transfer path.`);
                    // For this problem, it's expected that any remaining oddness will be at the very end
                    // and cannot be moved further, so no action is strictly necessary here.
                }
            }
        }
    }

    // Output the total number of transfer operations performed.
    console.log(transferOperations.length);
    // Output each transfer operation, with each on a new line.
    console.log(transferOperations.join('\n'));
    // Add an extra newline at the end, consistent with original behavior.
    console.log('');
};

// --- Execution Environment Setup ---
// A flag to easily switch between development (test) and production (live input) modes.
const isDevelopmentMode = false; // Renamed 'isTest' from original

// An Immediately Invoked Function Expression (IIFE) to encapsulate the execution logic.
(function runSolution() {
    if (isDevelopmentMode) {
        // In development mode, use predefined test cases.
        const sampleInputCase = '2 3\n1 2 3\n0 1 1\n';
        // You could add more test cases here for comprehensive testing.
        processInputGrid(sampleInputCase);
    } else {
        // In production mode, read input from standard input (/dev/stdin).
        try {
            const productionInput = require('fs').readFileSync('/dev/stdin', 'utf8');
            processInputGrid(productionInput);
        } catch (error) {
            // Robust error handling for file reading failures.
            console.error("Error: Failed to read input from /dev/stdin. Details:", error.message);
            process.exit(1); // Exit with a non-zero code to indicate an error.
        }
    }
})(); // Execute the IIFE.