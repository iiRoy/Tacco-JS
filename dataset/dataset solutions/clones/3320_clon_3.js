'use strict';

/**
 * Orchestrates the calculation of unique path counts through a grid,
 * avoiding specified obstacles, and prints the final result.
 * @param {string} rawInputData - The complete string input containing
 *                                grid dimensions and the grid layout itself.
 */
function calculateGridPaths(rawInputData) {
    // Input validation: Check for null, undefined, or empty raw input.
    if (!rawInputData || rawInputData.trim() === '') {
        console.log(0); // No input means no possible paths.
        return;
    }

    // Split the raw input into individual lines and filter out any blank lines.
    const inputSegments = rawInputData.split('\n').filter(lineContent => lineContent.trim() !== '');

    // Ensure there's at least one line for grid dimensions.
    if (inputSegments.length < 1) {
        console.log(0);
        return;
    }

    // Extract the first line which contains grid dimensions.
    // Using splice to remove the element while getting its value.
    const gridDimsArr = inputSegments.splice(0, 1)[0]
                                   .split(' ')
                                   .map(dimStr => Number.parseInt(dimStr, 10));

    // Destructure dimensions and perform validation for positive integers.
    const [rowsCount, colsCount] = gridDimsArr;
    if (isNaN(rowsCount) || isNaN(colsCount) || rowsCount <= 0 || colsCount <= 0) {
        console.log(0); // Invalid dimensions (e.g., non-numeric, zero, or negative).
        return;
    }

    // Construct the grid layout from the remaining input segments.
    // Each segment represents a row, split into individual characters (cells).
    const gridLayout = inputSegments.map(rowString => rowString.split(''));

    // Validate if the parsed grid's actual dimensions match the declared dimensions.
    // This catches cases where grid data is missing or malformed.
    if (gridLayout.length !== rowsCount || (rowsCount > 0 && gridLayout[0].length !== colsCount)) {
        console.log(0); // Mismatch between declared and actual grid dimensions.
        return;
    }

    // Define the modulus value for handling large numbers.
    const MODULUS_VALUE = 1000000007;

    /**
     * Helper function to determine if a specific cell in the grid is an obstacle.
     * Includes basic boundary checks for robustness, although loop conditions typically prevent out-of-bounds access.
     * @param {number} r - The row index of the cell.
     * @param {number} c - The column index of the cell.
     * @returns {boolean} - True if the cell is an obstacle ('#') or out of bounds, false otherwise.
     */
    const isCellObstacle = (r, c) => {
        // Treat out-of-bounds cells as obstacles.
        if (r < 0 || r >= rowsCount || c < 0 || c >= colsCount) {
            return true;
        }
        return gridLayout[r][c] === '#';
    };

    // Early exit condition: If the start or end cell is an obstacle, no paths exist.
    if (isCellObstacle(0, 0) || isCellObstacle(rowsCount - 1, colsCount - 1)) {
        console.log(0);
        return;
    }

    // Initialize the memoization table (DP table) with zeros.
    // This table will store the number of ways to reach each cell.
    const memoizationTable = Array.from({ length: rowsCount }, () => new Array(colsCount).fill(0));

    // Base case: There is one way to reach the starting cell (0,0).
    memoizationTable[0][0] = 1;

    // Populate the memoization table using dynamic programming.
    // Iterate through each cell of the grid.
    for (let r = 0; r < rowsCount; r++) {
        for (let c = 0; c < colsCount; c++) {
            // Skip the starting cell as its value is already set.
            if (r === 0 && c === 0) {
                continue;
            }

            // If the current cell itself is an obstacle, no paths can go through it.
            // Its path count remains 0 (already initialized as such).
            if (isCellObstacle(r, c)) {
                // memoizationTable[r][c] = 0; // Already 0, explicit assignment for clarity
                continue;
            }

            let currentCellPaths = 0; // Accumulator for paths to the current cell.

            // Consider paths coming from the cell directly above.
            if (r > 0) {
                // Only add paths if the cell above is not an obstacle.
                if (!isCellObstacle(r - 1, c)) {
                    currentCellPaths = (currentCellPaths + memoizationTable[r - 1][c]) % MODULUS_VALUE;
                }
            }

            // Consider paths coming from the cell directly to the left.
            if (c > 0) {
                // Only add paths if the cell to the left is not an obstacle.
                if (!isCellObstacle(r, c - 1)) {
                    currentCellPaths = (currentCellPaths + memoizationTable[r][c - 1]) % MODULUS_VALUE;
                }
            }

            // Store the total number of paths to the current cell.
            memoizationTable[r][c] = currentCellPaths;
        }
    }

    // The final result is the value in the bottom-right cell of the memoization table.
    const finalPathResult = memoizationTable[rowsCount - 1][colsCount - 1];

    // Output the calculated number of paths. The modulo operation has been applied throughout.
    console.log(finalPathResult);
}

// Entry point: Read input from standard input and pass it to the main calculation function.
calculateGridPaths(require('fs').readFileSync('/dev/stdin', 'utf8'));