const fileSystemModule = require("fs");

/**
 * Processes a grid string to calculate the maximum shortest distance
 * from any '#' character to any other reachable cell using a multi-source Breadth-First Search (BFS).
 * The final maximum distance is printed to standard output.
 *
 * @param {string} gridInputString The input string representing the grid.
 *                                 The first line contains "numRows numCols".
 *                                 Subsequent lines contain the grid characters (e.g., '.' or '#').
 */
function calculateMaxGridDistance(gridInputString) {
    const inputLines = gridInputString.split("\n");
    const dimensions = inputLines[0].split(" ");
    const totalRows = Number(dimensions[0]);
    const totalColumns = Number(dimensions[1]);

    const bfsTraversalQueue = [];
    // A 2D array to keep track of visited cells.
    // Initialized to `false`, becomes `true` when a cell is added to the queue for processing.
    const cellVisitedStatus = Array.from({ length: totalRows }, () => Array(totalColumns).fill(false));

    // Counter for cells that have not yet been reached by the BFS.
    // This helps determine when all reachable cells have been processed.
    let unvisitedCellCount = totalRows * totalColumns;

    // Initialize the BFS queue with all source '#' cells.
    // Mark these source cells as visited and decrement the unvisited count.
    for (let rowIdx = 0; rowIdx < totalRows; rowIdx++) {
        const currentRowCharacters = inputLines[rowIdx + 1].split("");
        for (let colIdx = 0; colIdx < totalColumns; colIdx++) {
            if (currentRowCharacters[colIdx] === "#") {
                bfsTraversalQueue.push({ xCoord: colIdx, yCoord: rowIdx, currentDistance: 0 });
                cellVisitedStatus[rowIdx][colIdx] = true;
                unvisitedCellCount--; // Source cells are considered "visited" from the start
            }
        }
    }

    // Guard clause: If all cells were '#' from the beginning, the maximum distance is 0.
    if (unvisitedCellCount <= 0) {
        console.log(0);
        return;
    }

    // Define the possible movements (neighbor offsets) in 4 cardinal directions.
    const movementDirections = [
        { deltaX: 1, deltaY: 0 },  // Move Right
        { deltaX: -1, deltaY: 0 }, // Move Left
        { deltaX: 0, deltaY: 1 },  // Move Down
        { deltaX: 0, deltaY: -1 }   // Move Up
    ];

    let queueReadPointer = 0; // Use a pointer for efficient queue processing (avoids `shift()` overhead)

    // Perform the Breadth-First Search traversal.
    while (queueReadPointer < bfsTraversalQueue.length) {
        const currentProcessingCell = bfsTraversalQueue[queueReadPointer++];
        const { xCoord: currentX, yCoord: currentY, currentDistance } = currentProcessingCell;

        // Explore all four neighbors of the current cell.
        for (const direction of movementDirections) {
            const nextX = currentX + direction.deltaX;
            const nextY = currentY + direction.deltaY;

            // Check if the potential neighbor is within the grid boundaries.
            const isNeighborInBounds = nextX >= 0 && nextX < totalColumns && nextY >= 0 && nextY < totalRows;

            // If the neighbor is within bounds and has not been visited yet:
            if (isNeighborInBounds && !cellVisitedStatus[nextY][nextX]) {
                cellVisitedStatus[nextY][nextX] = true; // Mark the neighbor as visited.
                bfsTraversalQueue.push({ xCoord: nextX, yCoord: nextY, currentDistance: currentDistance + 1 });
                unvisitedCellCount--; // Decrement the count of unvisited cells.

                // If all cells have now been reached, the distance of this newly enqueued cell
                // represents the maximum shortest distance from any '#' to any other cell.
                if (unvisitedCellCount <= 0) {
                    console.log(currentDistance + 1);
                    return; // Exit the function early as the answer has been found.
                }
            }
        }
    }
    // If the BFS completes and `unvisitedCellCount` is still greater than 0,
    // it implies that some cells are unreachable from any '#' source.
    // In such a scenario, the original code would not print anything, so we also do not.
}

// Read the entire content of standard input as a UTF-8 string.
const standardInputContent = fileSystemModule.readFileSync("/dev/stdin", "UTF-8");

// Call the main function to process the input and print the result.
calculateMaxGridDistance(standardInputContent);
