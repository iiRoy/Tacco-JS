// This module processes numerical grid data from standard input
// to find the maximum possible path sum following specific traversal rules.

(function solvePathfindingProblem() {
    // --- Configuration Constants ---
    const INPUT_FILE_PATH = '/dev/stdin';
    const MAX_GRID_ROWS_TO_PROCESS = 9; // Original code sliced to 9 rows
    const PATH_SEPARATOR = ',';
    const LINE_DELIMITER = '\n';

    // --- Global/Module-level Variables (renamed and re-ordered) ---
    let overallMaxPathSum = 0; // Stores the highest sum found across all paths
    let gridMatrix = [];       // The 2D array representing the numerical grid

    /**
     * Recursively explores paths within the grid to find the maximum sum.
     * The traversal logic expands in the first half of the grid and contracts in the second.
     *
     * @param {number} currentR - The current row index in the grid.
     * @param {number} currentC - The current column index in the grid.
     * @param {number} currentPathTotal - The accumulated sum for the path leading to (currentR, currentC).
     */
    function exploreGridPath(currentR, currentC, currentPathTotal) {
        // Base case: If we've reached the last row, update the overall maximum sum.
        if (currentR === gridMatrix.length - 1) {
            overallMaxPathSum = Math.max(overallMaxPathSum, currentPathTotal);
            return; // Path exploration for this branch ends here.
        }

        // Determine the midpoint row index for path expansion/contraction logic.
        // Paths expand in the first half (strictly less than midpoint)
        // and contract in the second half (midpoint or greater).
        const midpointRowThreshold = Math.floor((gridMatrix.length - 1) / 2);

        // Path Expansion Phase: For the first half of the grid rows.
        // From (R, C), we can move to (R+1, C) or (R+1, C+1).
        if (currentR < midpointRowThreshold) {
            const nextRowIndex = currentR + 1;
            // Branch 1: Move straight down
            exploreGridPath(nextRowIndex, currentC, currentPathTotal + gridMatrix[nextRowIndex][currentC]);
            // Branch 2: Move diagonally down-right
            exploreGridPath(nextRowIndex, currentC + 1, currentPathTotal + gridMatrix[nextRowIndex][currentC + 1]);
        }
        // Path Contraction Phase: For the second half of the grid rows.
        // From (R, C), we can move to (R+1, C-1) or (R+1, C).
        else {
            const nextRowIndex = currentR + 1;
            const targetColLeft = currentC - 1;
            const targetColStraight = currentC;

            // Check if moving diagonally down-left is a valid column index.
            if (targetColLeft >= 0) {
                exploreGridPath(nextRowIndex, targetColLeft, currentPathTotal + gridMatrix[nextRowIndex][targetColLeft]);
            }

            // Check if moving straight down is a valid column index for the next row.
            // The original code used `x < yx[y].length - 1`. This checks against the *current* row's length.
            // Assuming a triangular or pyramid-like structure where gridMatrix[R+1] has at least as many
            // elements as gridMatrix[R], this implies checking if the current column is not the very last
            // element of the current row, to allow moving to (R+1, C).
            // This is a subtle constraint, ensuring C is not the rightmost edge of the current row's segment.
            if (targetColStraight < gridMatrix[currentR].length - 1) {
                exploreGridPath(nextRowIndex, targetColStraight, currentPathTotal + gridMatrix[nextRowIndex][targetColStraight]);
            }
        }
    }

    /**
     * Reads and parses raw input data into a 2D numeric grid.
     * @param {string} rawData - The raw string content from the input source.
     * @returns {Array<Array<number>>} The parsed 2D grid.
     */
    function parseGridInput(rawData) {
        if (!rawData || rawData.trim().length === 0) {
            console.error("Error: Input data is empty.");
            return [];
        }

        const inputLineArray = rawData.trim().split(LINE_DELIMITER);
        const processedGrid = [];

        // Iterate through each line to parse numerical values.
        // Limiting to a maximum number of rows as specified by the problem.
        for (let i = 0; i < Math.min(inputLineArray.length, MAX_GRID_ROWS_TO_PROCESS); i++) {
            const singleLine = inputLineArray[i];
            // Split by separator, convert each segment to a number.
            const numericRowData = singleLine.split(PATH_SEPARATOR).map(Number);
            processedGrid.push(numericRowData);
        }
        return processedGrid;
    }

    // --- Main Execution Flow ---
    try {
        const fileContent = require('fs').readFileSync(INPUT_FILE_PATH, 'utf8');
        gridMatrix = parseGridInput(fileContent);

        // Ensure the grid is not empty before proceeding.
        if (gridMatrix.length === 0 || gridMatrix[0].length === 0) {
            console.error("Error: Grid matrix is empty or invalid after parsing.");
            return;
        }

        // Initialize the recursive path exploration from the top-left corner (0,0).
        // The initial path sum starts with the value at the very first cell.
        exploreGridPath(0, 0, gridMatrix[0][0]);

        // Output the final computed maximum path sum.
        console.log(overallMaxPathSum);

    } catch (error) {
        console.error("An error occurred during file reading or processing:", error.message);
        // Optionally, provide a default or exit gracefully.
        process.exit(1);
    }

})(); // End of IIFE