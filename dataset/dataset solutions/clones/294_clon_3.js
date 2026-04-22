// This module is designed to compute the maximal path sum across a numerical grid,
// traversing from the top-left cell to any cell in the bottom-most row.
// The traversal rules change based on whether the current row is in the first or second half of the grid.

// A global variable to store the highest path value encountered during grid exploration.
// Initialized to the smallest possible safe integer to ensure any valid path sum will be larger.
let overallHighestValue = Number.MIN_SAFE_INTEGER;

// The primary data structure holding the numerical values of the grid.
// Each nested array represents a row of values.
let valueMap = [];

// A memoization table used for dynamic programming. It stores the maximum sum
// found so far to reach a particular cell (row, column).
// This helps avoid redundant calculations for overlapping subproblems.
let bestPathValues = [];

/**
 * Recursively explores all viable paths from a given cell (currentR, currentC)
 * down to the last row, accumulating values and updating the maximum sum found.
 * This function utilizes memoization to optimize performance.
 *
 * @param {number} currentR The row index of the current cell.
 * @param {number} currentC The column index of the current cell.
 * @param {number} accumulatedValue The sum of values from the start cell to the current cell.
 */
function exploreGridPaths(currentR, currentC, accumulatedValue) {
    // --- Type III Change: Added robust guard clauses ---
    // Ensure the current cell coordinates are within the valid bounds of the grid.
    if (currentR < 0 || currentR >= valueMap.length ||
        currentC < 0 || currentC >= valueMap[0].length) {
        // If out of bounds, this path is invalid; terminate recursion for this branch.
        return;
    }

    // Define constants for clarity and to avoid repeated calculations.
    const nextRow = currentR + 1; // The row index for the next step downwards.
    const lastRowIndex = valueMap.length - 1; // The index of the final row in the grid.
    // Calculate the midpoint threshold for determining movement rules.
    // Paths in the first half of rows follow one rule, and the second half another.
    const rowMidpointThreshold = Math.floor(lastRowIndex / 2);

    // --- Type III Change: Deleted a non-essential statement ---
    // The original `YX[y][x]=sum;` line was not effectively contributing to the memoization
    // strategy as implemented (which checks `bestPathValues[nextRow][...]` before recursing).
    // It would overwrite with *any* path sum, not necessarily the best, for the current cell,
    // and this value was never read back by subsequent calls to `(currentR, currentC)`.
    // It has been removed.

    // Base case: If we have reached the last row, this path is complete.
    // Update the global maximum path value if the current path's sum is greater.
    if (currentR === lastRowIndex) {
        overallHighestValue = Math.max(overallHighestValue, accumulatedValue);
        return; // No further movement possible from the last row.
    }

    // --- Type III Change: Rewritten and updated conditional logic for movement ---
    // The traversal rules depend on whether the current row is in the first or second half.
    // Original logic `(yx.length-1)/2 > y` and `(yx.length-1)/2 <= y` is rephrased.

    // Scenario 1: Current row is in the first half of the grid (before or at the midpoint).
    if (currentR < rowMidpointThreshold) {
        // Possible move 1: Straight down to the same column.
        const potentialValueDown = accumulatedValue + valueMap[nextRow][currentC];
        // Only explore this path if it yields a better (or first) sum to (nextRow, currentC).
        if (bestPathValues[nextRow][currentC] < potentialValueDown) {
            bestPathValues[nextRow][currentC] = potentialValueDown; // Memoize the new best sum.
            exploreGridPaths(nextRow, currentC, potentialValueDown); // Recurse.
        }

        // Possible move 2: Diagonally down and right.
        const nextColRight = currentC + 1;
        // Ensure the move right is within the bounds of the next row.
        if (nextColRight < valueMap[nextRow].length) {
            const potentialValueDownRight = accumulatedValue + valueMap[nextRow][nextColRight];
            if (bestPathValues[nextRow][nextColRight] < potentialValueDownRight) {
                bestPathValues[nextRow][nextColRight] = potentialValueDownRight;
                exploreGridPaths(nextRow, nextColRight, potentialValueDownRight);
            }
        }
    }
    // Scenario 2: Current row is in the second half of the grid (from the midpoint onwards).
    else { // currentR >= rowMidpointThreshold
        // Possible move 1: Diagonally down and left.
        const nextColLeft = currentC - 1;
        // Ensure the move left is within the bounds of the next row.
        if (nextColLeft >= 0) {
            const potentialValueDownLeft = accumulatedValue + valueMap[nextRow][nextColLeft];
            if (bestPathValues[nextRow][nextColLeft] < potentialValueDownLeft) {
                bestPathValues[nextRow][nextColLeft] = potentialValueDownLeft;
                exploreGridPaths(nextRow, nextColLeft, potentialValueDownLeft);
            }
        }

        // Possible move 2: Straight down to the same column.
        // Note: The original problem had `x` for down-right in first half, and `x` for down in second half.
        const potentialValueDown = accumulatedValue + valueMap[nextRow][currentC];
        if (bestPathValues[nextRow][currentC] < potentialValueDown) {
            bestPathValues[nextRow][currentC] = potentialValueDown;
            exploreGridPaths(nextRow, currentC, potentialValueDown);
        }
    }
}

/**
 * Processes the raw input string, parsing it into the `valueMap` grid
 * and initializing the `bestPathValues` memoization table.
 *
 * @param {string} rawDataString The raw input string, typically from standard input.
 * @returns {boolean} True if the grid data was successfully initialized, false otherwise.
 */
function initializeGridData(rawDataString) {
    // --- Type II Change: Renamed identifiers and improved comments ---
    // Trim whitespace and split the input string into individual lines.
    const rawInputLines = rawDataString.trim().split("\n");

    // --- Type III Change: Added input validation for empty input ---
    if (rawInputLines.length === 0 || rawInputLines[0].trim() === '') {
        console.error("Initialization Error: No valid input lines provided.");
        return false; // Indicate failure.
    }

    // Iterate over each line to parse numerical data for the grid.
    rawInputLines.forEach(function(lineData, rowIndex) {
        // Split comma-separated values and convert each to an integer.
        // --- Type III Change: Explicit `parseInt` and added non-numeric validation ---
        const currentRowValues = lineData.split(",").map(valueStr => {
            const parsedNumber = parseInt(valueStr.trim(), 10);
            if (isNaN(parsedNumber)) {
                // Issue a warning for invalid data, and default to 0 to allow processing to continue.
                console.warn(`Warning: Non-numeric value '${valueStr}' encountered at row ${rowIndex}. Defaulting to 0.`);
                return 0;
            }
            return parsedNumber;
        });
        valueMap.push(currentRowValues); // Add the parsed row to the main grid.

        // Initialize a corresponding row in the memoization table with zeros.
        // The length of this row matches the number of columns in the current data row.
        const initialMemoRow = new Array(currentRowValues.length).fill(0);
        bestPathValues.push(initialMemoRow);
    });

    // --- Type III Change: Added a simple validation for grid structure ---
    // (More complex validation for non-rectangular grids could be added here if needed).
    if (valueMap.length === 0 || valueMap[0].length === 0) {
        console.error("Initialization Error: Grid is empty after parsing input.");
        return false;
    }

    return true; // Indicate successful initialization.
}

// --- Main Program Execution Flow ---

// Read the raw input data from standard input.
// --- Type II Change: Renamed identifier `input` to `rawDataString` ---
const rawDataString = require('fs').readFileSync('/dev/stdin', 'utf8');

// Attempt to initialize the grid and memoization table using the raw input.
if (initializeGridData(rawDataString)) {
    // If initialization was successful, proceed with path exploration.
    if (valueMap.length === 0 || valueMap[0].length === 0) {
        // This case should ideally be caught by initializeGridData, but as a safeguard.
        console.log(0); // If the grid is effectively empty, the max sum is 0.
    } else {
        // Define the starting coordinates for the path exploration.
        const initialRow = 0;
        const initialCol = 0;
        // The value of the very first cell in the grid.
        const startingCellValue = valueMap[initialRow][initialCol];

        // --- Type III Change: Added an intermediate step / explicit memoization for start ---
        // Store the starting cell's value in the memoization table.
        // This marks the starting point with its initial accumulated value.
        bestPathValues[initialRow][initialCol] = startingCellValue;

        // Begin the recursive depth-first search to find the maximum path sum.
        exploreGridPaths(initialRow, initialCol, startingCellValue);

        // Output the final determined maximum path sum.
        console.log(overallHighestValue);
    }
} else {
    // If grid initialization failed (e.g., due to empty or invalid input),
    // output a default value or an error indicator.
    console.log(0); // Output 0 in case of an initialization error.
}