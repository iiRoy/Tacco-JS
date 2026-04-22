const fs = require('fs'); // Import the Node.js file system module for input operations.

// A global variable to store the highest path sum found across all diamond traversals.
// It's initialized to zero, assuming path sums are non-negative or we're looking for a maximum.
let globalMaximumPathSum = 0;

/**
 * Updates the global maximum path sum if the provided candidate sum is greater.
 * This helper function centralizes the logic for maintaining the highest sum found.
 * @param {number} candidateSum - The sum of a completed path to evaluate against the global maximum.
 */
function updateOverallMaximum(candidateSum) {
    if (candidateSum > globalMaximumPathSum) {
        globalMaximumPathSum = candidateSum;
    }
}

/**
 * Recursively explores all possible paths within a diamond-shaped grid to find the maximum sum.
 * This function navigates through the 'diamondData' structure, accumulating values along each path.
 * It intelligently branches based on whether it's in the expanding (upper) or contracting (lower) phase of the diamond.
 *
 * @param {number} currentRowIndex - The zero-based index of the current row being processed.
 * @param {number} currentColIndex - The zero-based index of the current column within the current row.
 * @param {number} currentAccumulatedPathValue - The sum of values from the starting point up to (but not including) the current cell.
 * @param {Array<Array<number>>} diamondDataStructure - The 2D array representing the diamond-shaped grid.
 * @param {number} midRowThresholdIndex - The row index that separates the expanding phase from the contracting phase.
 */
function exploreDiamondPaths(currentRowIndex, currentColIndex, currentAccumulatedPathValue, diamondDataStructure, midRowThresholdIndex) {
    // Basic validation: Ensure current coordinates are within the bounds of the grid.
    // This acts as a defensive guard, though typical calls should prevent out-of-bounds access.
    if (currentRowIndex < 0 || currentRowIndex >= diamondDataStructure.length ||
        currentColIndex < 0 || currentColIndex >= diamondDataStructure[currentRowIndex].length) {
        return;
    }

    // Calculate the total path sum including the value of the current cell.
    const newPathTotal = currentAccumulatedPathValue + diamondDataStructure[currentRowIndex][currentColIndex];

    // Base case: If we've reached the final row of the diamond, this path is complete.
    // Update the global maximum with the sum of this completed path.
    if (currentRowIndex === diamondDataStructure.length - 1) {
        updateOverallMaximum(newPathTotal);
        return; // Terminate this recursive branch.
    }

    // Determine if the current row is in the "expanding" (upper) or "contracting" (lower) phase of the diamond.
    // The midRowThresholdIndex defines this transition.
    const isExpandingPhase = currentRowIndex < midRowThresholdIndex;

    if (isExpandingPhase) {
        // In the expanding phase, paths typically extend to two adjacent cells in the next row:
        // directly below (same column index) and diagonally down-right (next column index).
        // For a diamond, the next row is wider or equal, so these moves are generally valid.
        exploreDiamondPaths(currentRowIndex + 1, currentColIndex, newPathTotal, diamondDataStructure, midRowThresholdIndex); // Move to (r+1, c)
        exploreDiamondPaths(currentRowIndex + 1, currentColIndex + 1, newPathTotal, diamondDataStructure, midRowThresholdIndex); // Move to (r+1, c+1)
    } else {
        // In the contracting phase, paths typically extend to two adjacent cells in the next row:
        // diagonally down-left (previous column index) and directly below (same column index).
        // Explicit boundary checks are crucial here as the next row is narrower.
        const nextTargetRowIndex = currentRowIndex + 1;
        const nextTargetRowData = diamondDataStructure[nextTargetRowIndex];
        const nextTargetRowLength = nextTargetRowData ? nextTargetRowData.length : 0;

        // Option 1: Move down-left (relative to the current row's perspective).
        const potentialNextColLeft = currentColIndex - 1;
        if (potentialNextColLeft >= 0) { // Ensure the target column index is valid (non-negative).
            exploreDiamondPaths(nextTargetRowIndex, potentialNextColLeft, newPathTotal, diamondDataStructure, midRowThresholdIndex);
        }

        // Option 2: Move down-straight (relative to the current row's perspective).
        const potentialNextColStraight = currentColIndex;
        // Ensure the target column index is valid for the *next* (narrower) row.
        // The original logic `x < yx[y].length - 1` implies checking against the length of the *current* row.
        // However, for a contracting diamond, `yx[y+1].length` is `yx[y].length - 1`.
        // So, `x < yx[y].length - 1` is equivalent to `x < yx[y+1].length`.
        if (potentialNextColStraight < nextTargetRowLength) {
            exploreDiamondPaths(nextTargetRowIndex, potentialNextColStraight, newPathTotal, diamondDataStructure, midRowThresholdIndex);
        }
    }
}

/**
 * Reads data from standard input, parses it into a 2D array of numbers,
 * representing the diamond structure, and returns it.
 * Each line is expected to be a comma-separated list of numbers.
 *
 * @returns {Array<Array<number>>} The parsed diamond structure, or an empty array if input is invalid.
 */
function readAndParseDiamondInput() {
    // Read the entire file content from stdin as a string.
    const rawInputContent = fs.readFileSync('/dev/stdin', 'utf8');

    // Remove any leading/trailing whitespace and split the content into an array of lines.
    const individualLines = rawInputContent.trim().split('\n');

    const parsedDiamondStructure = [];

    // Iterate through each line to parse it into a row of numbers.
    for (const lineText of individualLines) {
        // For each line, split by comma, then convert each string part to a number.
        const numericRow = lineText.split(',').map(value => Number(value));
        parsedDiamondStructure.push(numericRow);
    }

    return parsedDiamondStructure;
}

// --- Main Program Execution Flow ---

// 1. Read and parse the diamond structure from standard input.
const diamondGridData = readAndParseDiamondInput();

// 2. Initial validation: Check if the parsed grid data is empty or invalid.
if (!diamondGridData || diamondGridData.length === 0) {
    console.error("Error: The input data for the diamond structure is empty or invalid.");
    process.exit(1); // Exit with an error code.
}

// 3. Calculate the mid-point row index. This is crucial for distinguishing
//    between the expanding and contracting phases of the diamond traversal.
//    For N rows, the mid-point is floor((N-1)/2). Rows < mid are expanding, rows >= mid are contracting.
const midRowTransitionIndex = Math.floor((diamondGridData.length - 1) / 2);

// 4. Initiate the recursive path exploration.
//    Start from the top-most element (row 0, column 0).
//    The initial accumulated path value is 0, as the first cell's value will be added inside the function.
exploreDiamondPaths(0, 0, 0, diamondGridData, midRowTransitionIndex);

// 5. Output the final maximum path sum found after exploring all paths.
console.log(globalMaximumPathSum);