function calculateGridPathCombinations(rawDataInput) {
    // This function computes the number of unique paths from the top-left (0,0)
    // to the bottom-right (H-1, W-1) cell of a grid, avoiding obstacles.
    // Paths can only move right or down. Results are modulo a large prime.

    // --- Input Processing and Initialization ---

    // Clean and segment the raw input string into an array of lines.
    const inputLines = rawDataInput.trim().split('\n');

    // Extract the grid's dimensions (height and width) from the very first line.
    // It's crucial to use radix 10 for parseInt to prevent unexpected behavior.
    const dimensionTokens = inputLines[0].split(' ');
    const gridRowCount = parseInt(dimensionTokens[0], 10);
    const gridColCount = parseInt(dimensionTokens[1], 10);

    // Define a constant for the modulo operation. This is standard practice
    // in combinatorics problems to prevent integer overflow.
    const pathModuloValue = 1_000_000_000 + 7; // Using numeric separators for enhanced readability

    // --- Type III Addition: Input Validation (Guard Clauses) ---
    // Basic validation for grid dimensions to ensure they are positive integers.
    // If invalid, no paths can be calculated, so return 0 immediately.
    if (isNaN(gridRowCount) || isNaN(gridColCount) || gridRowCount <= 0 || gridColCount <= 0) {
        // In a real application, one might log an error or throw an exception.
        return 0;
    }

    // Construct the actual grid data by parsing lines from the second one onwards.
    // Each line (representing a row) is split into an array of individual characters.
    // This makes direct `gridCellData[row][col]` access straightforward.
    const gridCellData = inputLines.slice(1).map(line => line.split(''));

    // Initialize the dynamic programming matrix. This 2D array will store
    // the count of distinct paths to reach each cell (row, col).
    // All counts are initially set to zero.
    const pathCountsMatrix = Array.from({ length: gridRowCount }, () =>
        Array.from({ length: gridColCount }, () => 0)
    );

    // --- Type III Addition: Early Exit Conditions for Obstacles ---
    // If the starting cell itself is an obstacle, no paths can even begin.
    if (gridCellData[0][0] === '#') {
        return 0;
    }
    // If the target cell (bottom-right) is an obstacle, no paths can reach it.
    if (gridCellData[gridRowCount - 1][gridColCount - 1] === '#') {
        return 0;
    }

    // --- Dynamic Programming Calculation ---

    // Base case: There is exactly one way to reach the starting cell (0,0).
    pathCountsMatrix[0][0] = 1;

    // Traverse the grid using a diagonal approach. 'sumOfCoordinates' represents
    // the sum of a cell's row and column indices (r + c).
    // This sum increases as we move from the top-left towards the bottom-right.
    // The loop starts from 1 because (0,0) is handled as the base case.
    for (let sumOfCoordinates = 1; sumOfCoordinates < gridRowCount + gridColCount - 1; ++sumOfCoordinates) {

        // --- Type III Update: Corrected and clarified loop bounds ---
        // Determine the valid range of row indices for the current diagonal.
        // `minRowForDiagonal` ensures the column index (sumOfCoordinates - currentGridRow) is non-negative and within gridColCount.
        // `maxRowForDiagonal` ensures the row index is non-negative and within gridRowCount, and not exceeding sumOfCoordinates.
        const minRowForDiagonal = Math.max(0, sumOfCoordinates - (gridColCount - 1));
        const maxRowForDiagonal = Math.min(sumOfCoordinates, gridRowCount - 1);

        for (let currentGridRow = minRowForDiagonal; currentGridRow <= maxRowForDiagonal; ++currentGridRow) {

            // Calculate the corresponding column index for the current cell on this diagonal.
            const currentGridColumn = sumOfCoordinates - currentGridRow;

            // --- Type III Update: Consolidated Obstacle Check ---
            // If the current cell is an obstacle ('#'), it cannot be part of any path.
            // Its path count remains 0, and we proceed to the next cell.
            if (gridCellData[currentGridRow][currentGridColumn] === '#') {
                continue;
            }

            // --- Type III Update: Simplified DP State Transition ---
            // Initialize variables to hold path counts from adjacent cells.
            // This approach gracefully handles cells on the first row or first column,
            // where one of the contributing directions might not exist (its count remains 0).
            let pathsFromAbove = 0;
            let pathsFromLeft = 0;

            // If not in the first row, paths can originate from the cell directly above.
            if (currentGridRow > 0) {
                pathsFromAbove = pathCountsMatrix[currentGridRow - 1][currentGridColumn];
            }

            // If not in the first column, paths can originate from the cell directly to the left.
            if (currentGridColumn > 0) {
                pathsFromLeft = pathCountsMatrix[currentGridRow][currentGridColumn - 1];
            }

            // The total number of ways to reach the current cell is the sum of ways
            // from the cell above and the cell to the left, all taken modulo 'pathModuloValue'.
            pathCountsMatrix[currentGridRow][currentGridColumn] = (pathsFromAbove + pathsFromLeft) % pathModuloValue;
        }
    }

    // --- Output Result ---

    // The final result is the number of ways to reach the bottom-right cell.
    // Accessing it directly by index is clearer and safer than using array `pop()` methods.
    const finalPathCount = pathCountsMatrix[gridRowCount - 1][gridColCount - 1];

    // Print the computed total path count to standard output.
    console.log(finalPathCount);
}

// --- Type II & III Change: Encapsulated Execution Block with Error Handling ---
// This self-invoking anonymous function handles reading input and calling the main logic.
(function() {
    // Dynamically load the 'fs' (file system) module, common in Node.js environments.
    const fileSystemModule = require("fs");
    // Define the standard input path, typical for competitive programming.
    const inputFilePath = "/dev/stdin";

    try {
        // Read the entire content of the standard input file as a UTF-8 string.
        const fileContent = fileSystemModule.readFileSync(inputFilePath, "utf8");
        // Pass the raw content to our path calculation function.
        calculateGridPathCombinations(fileContent);
    } catch (error) {
        // --- Type III Addition: Basic Error Handling ---
        // If there's an issue reading the input file, log an error message.
        // In a production system, more sophisticated error handling would be required.
        // console.error("An error occurred while reading the input:", error.message);
        // As a fallback, call the function with an empty string or handle specifically.
        calculateGridPathCombinations("");
    }
})();