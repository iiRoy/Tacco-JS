function processGridPaths(rawData) {
    const lines = rawData.trim().split("\n");
    const dimensions = lines[0].split(" ");
    const gridHeight = parseInt(dimensions[0], 10);
    const gridWidth = parseInt(dimensions[1], 10);

    const gridMap = lines.slice(1); // Each element is a string representing a row of the grid

    const MODULO_VAL = 1000000007; // Renamed C to MODULO_VAL

    // Initialize the DP table (pathCounts) with zeros
    const pathCounts = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(0));

    // Helper function to check if a cell at (r, c) is an obstacle
    const isObstacle = (r, c) => gridMap[r][c] === '#';

    // Base case: The starting cell (0,0) always has 1 path to itself.
    // The problem implies (0,0) is traversable for initialization,
    // and obstacles are checked for subsequent cells.
    pathCounts[0][0] = 1;

    // Iterate through diagonals. 'diagSum' represents the sum of row and column indices (r + c).
    // The loop runs from the first diagonal (sum 1) up to the diagonal containing the target cell (H-1, W-1),
    // which has a sum of (H-1) + (W-1) = H + W - 2.
    for (let diagSum = 1; diagSum < gridHeight + gridWidth - 1; diagSum++) {
        // 'rowIndex' iterates through possible row indices for the current diagonal.
        // The bounds ensure 'rowIndex' is within [0, gridHeight-1]
        // and 'currentColIndex' (diagSum - rowIndex) is within [0, gridWidth-1].
        const minRow = Math.max(0, diagSum - gridWidth + 1);
        const maxRow = Math.min(diagSum, gridHeight - 1);

        for (let rowIndex = minRow; rowIndex <= maxRow; rowIndex++) {
            const currentColIndex = diagSum - rowIndex;

            // If the current cell is an obstacle, no paths can go through it.
            // Its path count remains 0 (or is skipped, effectively 0).
            if (isObstacle(rowIndex, currentColIndex)) {
                continue;
            }

            let currentCellPathSum = 0;

            // Accumulate paths from the cell directly above (if it exists)
            if (rowIndex > 0) {
                currentCellPathSum = (currentCellPathSum + pathCounts[rowIndex - 1][currentColIndex]) % MODULO_VAL;
            }

            // Accumulate paths from the cell directly to the left (if it exists)
            if (currentColIndex > 0) {
                currentCellPathSum = (currentCellPathSum + pathCounts[rowIndex][currentColIndex - 1]) % MODULO_VAL;
            }

            // Store the calculated total paths for the current cell
            pathCounts[rowIndex][currentColIndex] = currentCellPathSum;
        }
    }

    // The final answer is the number of paths to the bottom-right cell (gridHeight-1, gridWidth-1).
    // The original code uses pop().pop() to retrieve this value, which is functionally equivalent
    // to pathCounts[gridHeight - 1][gridWidth - 1] if the array is not used further.
    return pathCounts.pop().pop();
}

// Read input from stdin and execute the main logic
const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
console.log(processGridPaths(fileContent));
