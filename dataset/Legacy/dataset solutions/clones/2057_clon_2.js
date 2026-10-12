var minimumPathCost = 1000; // Stores the minimum cost found so far
var gridState; // Represents the grid or map with cell states

/**
 * Main function to process input and initiate the pathfinding algorithm.
 * @param {string} rawData - The raw input string from stdin.
 */
function ProcessInputAndSolve(rawData) {
    // Trim leading/trailing whitespace from the input
    rawData = rawData.trim();
    // Split the input into an array of lines
    let inputLines = rawData.split("\n");

    // The first line contains grid dimensions
    let dimensions = inputLines[0].split(" ");
    // The rest of the lines represent the grid state
    gridState = inputLines.slice(1, inputLines.length);

    // Convert each grid line string into an array of characters
    gridState = gridState.map(rowStr => {
        return rowStr.split('');
    });

    // Start the recursive path exploration from [0,0] to the bottom-right corner
    // The target position is (rows-1, cols-1)
    ExplorePath(
        [0, 0], // Starting coordinates (row, column)
        [parseInt(dimensions[0]) - 1, parseInt(dimensions[1]) - 1], // Target coordinates
        0 // Initial cost
    );

    // Output the final minimum cost found
    console.log(minimumPathCost);
}

// Read input from standard input and pass it to the main processing function
ProcessInputAndSolve(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Recursively explores paths from the current position to the target position.
 * @param {number[]} currentPosition - The current [row, column] coordinates.
 * @param {number[]} targetPosition - The target [row, column] coordinates.
 * @param {number} currentCost - The accumulated cost to reach the current position.
 */
function ExplorePath(currentPosition, targetPosition, currentCost) {
    let currentRow = currentPosition[0]; // Current row index
    let currentCol = currentPosition[1]; // Current column index

    // If the current cell is a '#' (obstacle), increment the cost
    if (gridState[currentRow][currentCol] !== ".") {
        currentCost++;
        // If the current cost already exceeds the minimum found, prune this path
        if (currentCost > minimumPathCost) {
            return;
        }
    }

    // Check if the target has been reached
    if (currentRow === targetPosition[0] && currentCol === targetPosition[1]) {
        // If this path's cost is less than the current minimum, update it
        if (currentCost < minimumPathCost) {
            minimumPathCost = currentCost;
        }
        return; // Path found, return
    }
    // If not at the target, determine the next move
    else if (currentRow === targetPosition[0]) {
        // If already in the target row, only move right
        ExplorePath([currentRow, currentCol + 1], targetPosition, currentCost);
    }
    else if (currentCol === targetPosition[1]) {
        // If already in the target column, only move down
        ExplorePath([currentRow + 1, currentCol], targetPosition, currentCost);
    }
    else {
        // If not in the target row or column, check both right and down paths
        let rightCellContent = gridState[currentRow][currentCol + 1];
        let downCellContent = gridState[currentRow + 1][currentCol];

        // Prioritize moving down if right is an obstacle and down is clear
        if (rightCellContent === "#" && downCellContent === ".") {
            ExplorePath([currentRow + 1, currentCol], targetPosition, currentCost);
        }
        // Prioritize moving right if down is an obstacle and right is clear
        else if (rightCellContent === "." && downCellContent === "#") {
            ExplorePath([currentRow, currentCol + 1], targetPosition, currentCost);
        }
        // If both are clear, or both are obstacles, explore both paths
        else {
            ExplorePath([currentRow, currentCol + 1], targetPosition, currentCost); // Move right
            ExplorePath([currentRow + 1, currentCol], targetPosition, currentCost); // Move down
        }
    }
}
