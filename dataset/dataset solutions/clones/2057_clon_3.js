const INITIAL_HIGH_COST = 999999999;
const OBSTACLE_SYMBOL = '#';
const PATH_SYMBOL = '.';

let globalMinCost = INITIAL_HIGH_COST;
let gridMatrix;
let numRows;
let numCols;

/**
 * Orchestrates the entire process: reads raw input, parses it to initialize the grid,
 * and then initiates the recursive pathfinding algorithm. Finally, it outputs the result.
 * @param {string} rawInputData - The complete input string from stdin.
 */
function processInputAndSolve(rawInputData) {
    // Pre-process the raw input: remove leading/trailing whitespace and split into lines.
    const inputLines = rawInputData.trim().split('\n');

    // The first line contains the grid dimensions (rows and columns).
    const dimensionStrings = inputLines[0].split(' ');
    numRows = parseInt(dimensionStrings[0], 10); // Ensure base 10 for parsing.
    numCols = parseInt(dimensionStrings[1], 10);

    // The subsequent lines represent the grid layout.
    // Each line is mapped to an array of characters, forming the 2D grid matrix.
    gridMatrix = inputLines.slice(1).map(rowString => rowString.split(''));

    // Start the pathfinding exploration from the top-left cell (0,0)
    // to the bottom-right cell (numRows-1, numCols-1), with an initial accumulated cost of 0.
    explorePathRecursive(0, 0, numRows - 1, numCols - 1, 0);

    // After all possible paths have been explored, print the minimum cost found.
    console.log(globalMinCost);
}

/**
 * A recursive function that performs a depth-first search (DFS) to find the minimum cost path
 * from a starting point to a target point on a grid. Costs are incurred when passing through obstacles.
 *
 * @param {number} currentRow - The current row index in the grid.
 * @param {number} currentCol - The current column index in the grid.
 * @param {number} targetRow - The row index of the destination.
 * @param {number} targetCol - The column index of the destination.
 * @param {number} currentPathCostAccumulator - The accumulated cost to reach the (currentRow, currentCol) from the start.
 */
function explorePathRecursive(
    currentRow,
    currentCol,
    targetRow,
    targetCol,
    currentPathCostAccumulator
) {
    // Guard clause: If the current position is outside the grid boundaries, this path is invalid.
    if (currentRow < 0 || currentRow >= numRows || currentCol < 0 || currentCol >= numCols) {
        return;
    }

    // Calculate the adjusted cost for reaching the current cell.
    // An obstacle cell (defined by OBSTACLE_SYMBOL) adds 1 to the path cost.
    let adjustedPathCost = currentPathCostAccumulator;
    if (gridMatrix[currentRow][currentCol] === OBSTACLE_SYMBOL) {
        adjustedPathCost++;
    }

    // Pruning optimization: If the current path's adjusted cost is already greater than or equal to
    // the best minimum cost found so far, then this path cannot be optimal. Terminate this branch.
    if (adjustedPathCost >= globalMinCost) {
        return;
    }

    // Base Case: If the current position is the target destination.
    if (currentRow === targetRow && currentCol === targetCol) {
        // Update the global minimum cost if this path is more efficient.
        globalMinCost = Math.min(globalMinCost, adjustedPathCost);
        return; // Path found, no further exploration needed from this point.
    }

    // Determine if it's possible to move right or down without going out of bounds.
    const canAttemptMoveRight = currentCol + 1 < numCols;
    const canAttemptMoveDown = currentRow + 1 < numRows;

    // Retrieve the cell types of the potential next steps (right and down), if they are within bounds.
    const rightAdjacentCellType = canAttemptMoveRight ? gridMatrix[currentRow][currentCol + 1] : null;
    const downAdjacentCellType = canAttemptMoveDown ? gridMatrix[currentRow + 1][currentCol] : null;

    // Determine if the adjacent cells are obstacles.
    const isRightCellAnObstacle = rightAdjacentCellType === OBSTACLE_SYMBOL;
    const isDownCellAnObstacle = downAdjacentCellType === OBSTACLE_SYMBOL;

    // Logic for deciding the next moves based on current position and adjacent cell types.
    // This structure rephrases the original conditional logic for clarity and robustness.

    if (currentRow === targetRow) {
        // If we are already on the target row, we can only move right towards the target column.
        if (canAttemptMoveRight) {
            explorePathRecursive(currentRow, currentCol + 1, targetRow, targetCol, adjustedPathCost);
        }
    } else if (currentCol === targetCol) {
        // If we are already on the target column, we can only move down towards the target row.
        if (canAttemptMoveDown) {
            explorePathRecursive(currentRow + 1, currentCol, targetRow, targetCol, adjustedPathCost);
        }
    } else {
        // If neither the target row nor target column has been reached, both right and down moves are generally possible.
        // We evaluate the 'clearness' (not an obstacle AND in bounds) of each potential move.
        const rightPathIsClear = canAttemptMoveRight && !isRightCellAnObstacle;
        const downPathIsClear = canAttemptMoveDown && !isDownCellAnObstacle;

        if (!rightPathIsClear && downPathIsClear) {
            // If moving right is blocked (either by boundary or obstacle), but moving down is clear:
            explorePathRecursive(currentRow + 1, currentCol, targetRow, targetCol, adjustedPathCost);
        } else if (rightPathIsClear && !downPathIsClear) {
            // If moving down is blocked, but moving right is clear:
            explorePathRecursive(currentRow, currentCol + 1, targetRow, targetCol, adjustedPathCost);
        } else if (rightPathIsClear && downPathIsClear) {
            // If both right and down paths are clear, explore both possibilities recursively.
            explorePathRecursive(currentRow, currentCol + 1, targetRow, targetCol, adjustedPathCost);
            explorePathRecursive(currentRow + 1, currentCol, targetRow, targetCol, adjustedPathCost);
        }
        // If neither rightPathIsClear nor downPathIsClear (meaning both are blocked by obstacles or boundaries),
        // no recursive calls are made, effectively terminating this path branch.
    }
}

// The main execution starts by reading input from standard input
// and passing it to the processing function.
processInputAndSolve(require('fs').readFileSync('/dev/stdin', 'utf8'));