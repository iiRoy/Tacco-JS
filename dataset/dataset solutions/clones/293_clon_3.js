// This script processes a numerical "pyramid" structure from standard input
// to find the path that yields the maximum sum from the apex (top) to any cell
// in the base (bottom row). The traversal rules are unique:
// - In the upper half of the pyramid, paths can move straight down or diagonally right-down.
// - In the lower half, paths can move diagonally left-down or straight down.
// A dynamic programming approach is employed to optimize the search, memoizing
// the maximum sum achieved to reach each cell.

/**
 * Global variable to store the ultimate maximum score found across all valid paths.
 * Initialized to zero, assuming non-negative values in the pyramid and path sums.
 */
let globalMaximumScoreKeeper = 0;

/**
 * Stores the numeric values of the pyramid, parsed from input.
 * This is a 2D array (array of arrays).
 */
let valueStructureGrid;

/**
 * A memoization table for dynamic programming.
 * `maxPathValueMatrix[r][c]` stores the maximum sum found to reach cell `(r, c)`.
 * Initialized with zeros, assuming non-negative path sums.
 */
let maxPathValueMatrix;

/**
 * Helper function to manage the potential extension of a path.
 * It checks bounds, calculates potential new sums, and makes recursive calls
 * if a more optimal path to the next cell is discovered.
 *
 * @param {number} targetRowIndex - The row index of the cell to move to.
 * @param {number} targetColIndex - The column index of the cell to move to.
 * @param {number} currentAccumulatedTotal - The sum accumulated up to the current cell (before this move).
 * @param {function(number, number, number): void} recursiveSearchFunction - The main recursive pathfinding function itself.
 */
function attemptPathExtension(targetRowIndex, targetColIndex, currentAccumulatedTotal, recursiveSearchFunction) {
    // Ensure the target column index is within the valid range for the target row.
    if (targetColIndex < 0 || targetColIndex >= valueStructureGrid[targetRowIndex].length) {
        return; // Invalid column for the next row, skip this path extension.
    }

    const valueAtNextCell = valueStructureGrid[targetRowIndex][targetColIndex];
    const newPotentialPathSum = currentAccumulatedTotal + valueAtNextCell;

    // Dynamic Programming Check:
    // If the newly calculated path sum to `(targetRowIndex, targetColIndex)`
    // is greater than any sum previously recorded for reaching that cell,
    // then this new path is more optimal. Update the memoization table
    // and continue the recursive exploration from this improved point.
    if (maxPathValueMatrix[targetRowIndex][targetColIndex] < newPotentialPathSum) {
        maxPathValueMatrix[targetRowIndex][targetColIndex] = newPotentialPathSum;
        recursiveSearchFunction(targetRowIndex, targetColIndex, newPotentialPathSum);
    }
}

/**
 * The main recursive function to explore all possible paths in the pyramid.
 * It uses dynamic programming (memoization) to avoid redundant calculations.
 *
 * @param {number} currentRow - The current row index (vertical position).
 * @param {number} currentCol - The current column index (horizontal position).
 * @param {number} currentPathTotal - The sum of values accumulated along the path to the current cell.
 */
function traversePyramidForMaxSum(currentRow, currentCol, currentPathTotal) {
    // Update the DP table for the current cell with the current path's total.
    // This is crucial for the memoization logic.
    maxPathValueMatrix[currentRow][currentCol] = currentPathTotal;

    const lastRowInPyramid = valueStructureGrid.length - 1;

    // Base Case: If the current row is the last row of the pyramid,
    // we have reached an end of a path. Update the global maximum score
    // if the current path's total is greater.
    if (currentRow === lastRowInPyramid) {
        if (currentPathTotal > globalMaximumScoreKeeper) {
            globalMaximumScoreKeeper = currentPathTotal;
        }
        return; // Terminate this recursive branch.
    }

    const nextRowToAdvance = currentRow + 1;
    // Calculate the midpoint row to determine pathing rules.
    // Paths change direction rules after roughly half the pyramid's depth.
    const transitionMidpointRow = Math.floor(lastRowInPyramid / 2);

    // Conditional path selection based on pyramid half.
    if (currentRow < transitionMidpointRow) {
        // --- Upper Half Movement Rules ---
        // Can move straight down (same column in next row).
        attemptPathExtension(nextRowToAdvance, currentCol, currentPathTotal, traversePyramidForMaxSum);
        // Can move diagonally right-down (next column in next row).
        attemptPathExtension(nextRowToAdvance, currentCol + 1, currentPathTotal, traversePyramidForMaxSum);
    } else {
        // --- Lower Half Movement Rules (including the transitionMidpointRow) ---
        // Can move diagonally left-down (previous column in next row).
        // The column boundary check is handled by 'attemptPathExtension'.
        attemptPathExtension(nextRowToAdvance, currentCol - 1, currentPathTotal, traversePyramidForMaxSum);

        // Can move straight down (same column in next row).
        // This move is additionally constrained by the current row's width.
        // The original logic `x < yx[y].length-1` is preserved here.
        if (currentCol < valueStructureGrid[currentRow].length - 1) {
            attemptPathExtension(nextRowToAdvance, currentCol, currentPathTotal, traversePyramidForMaxSum);
        }
    }
}


// --- Program Entry Point and Input Processing ---

// Use Node.js 'fs' module to read all input from standard input (file descriptor 0).
// The '/dev/stdin' path is often used in competitive programming environments.
const rawInputBuffer = require('fs').readFileSync('/dev/stdin', 'utf8');

// Pre-process the raw input: remove leading/trailing whitespace, then split into lines.
const processedInputLines = rawInputBuffer.trim().split('\n');

// --- Input Validation: Basic Checks ---
if (processedInputLines.length === 0 || processedInputLines[0].trim() === '') {
    // If no lines or the first line is empty, there's no pyramid data.
    console.error("Input Error: No valid data lines found for the pyramid structure.");
    process.exit(1);
}

// Convert input lines into the 2D array representing the pyramid's values.
valueStructureGrid = processedInputLines.map(lineText => {
    // Split each line by comma, filter out any empty string segments, and convert to numbers.
    const numericalRow = lineText.split(',').filter(segment => segment.trim() !== '').map(Number);
    
    // Validate that all conversions resulted in actual numbers.
    if (numericalRow.some(isNaN)) {
        console.error(`Input Error: Non-numeric value detected in line: "${lineText}".`);
        process.exit(1);
    }
    return numericalRow;
});

// --- Pyramid Structure Validation ---
// Ensure the pyramid is not empty.
if (valueStructureGrid.length === 0 || valueStructureGrid[0].length === 0) {
    console.error("Input Error: The parsed pyramid structure is empty or malformed.");
    process.exit(1);
}

// Initialize the dynamic programming table with zeros.
// It will have the same dimensions as the `valueStructureGrid`.
// Zeros are used as initial "minimum" values, implying path sums are expected to be non-negative.
maxPathValueMatrix = valueStructureGrid.map(row =>
    Array(row.length).fill(0)
);

// Begin the recursive pathfinding process from the very top (apex) of the pyramid.
// The starting point is (row 0, column 0), and its value is the initial path sum.
traversePyramidForMaxSum(0, 0, valueStructureGrid[0][0]);

// Output the final maximum path sum found.
console.log(globalMaximumScoreKeeper);