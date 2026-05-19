function exploreGrid() {
    // This object keeps track of cells that have already been processed
    // to avoid redundant computations and infinite loops in the search.
    let visitedCells = {};
    // This variable will store the length of the shortest path found.
    // It's initialized to "NA" (Not Available) if no path is found.
    let resultPathLength = "NA";
    // This queue holds the states to explore, following a Breadth-First Search (BFS) pattern.
    // Each element in the queue is an array: [current_row, current_column, steps_taken].
    let queueOfPaths = [[0, 0, 0], [1, 0, 0]];

    // The main loop for the BFS algorithm. It continues as long as there are paths to explore.
    while (true) {
        // If the queue is empty, it means all reachable paths have been explored,
        // and no solution was found (or the best one has already been recorded).
        if (queueOfPaths.length === 0) {
            break;
        }

        // Dequeue the next state to process from the front of the queue.
        let currentPathInfo = queueOfPaths.shift();
        let currentRow = currentPathInfo[0];
        let currentCol = currentPathInfo[1];

        // A unique string key is created for the current cell's coordinates.
        let cellKey = currentRow + "," + currentCol;

        // Check if this cell has already been visited. If so, skip it to prevent cycles
        // and re-processing paths that are not shorter.
        if (visitedCells.hasOwnProperty(cellKey)) {
            continue;
        } else {
            // Mark the current cell as visited.
            visitedCells[cellKey] = true;
        }

        // Extract the number of steps taken to reach this cell.
        let pathSteps = currentPathInfo[2];

        // Check if the current cell is the target destination.
        // The target is the last column (gridSize - 1) and the cell value must not be 2,
        // as a '2' would force a backward movement, not a completion.
        if (currentCol === gridSize - 1 && gridData[currentRow][currentCol] !== 2) {
            resultPathLength = pathSteps; // A path to the destination is found.
            break; // Since it's BFS, this is the shortest path, so we can stop.
        }

        // Get the value from the grid at the current cell's coordinates.
        let cellValue = gridData[currentRow][currentCol];

        // Logic to determine the next possible movements based on the cell's value.
        if (cellValue === 1) {
            // If the cell value is 1, the movement is forward until a non-1 cell is encountered
            // or the end of the row is reached.
            let reachedEnd = false;
            while (true) {
                currentCol++; // Move one column to the right.
                if (currentCol === gridSize - 1) {
                    reachedEnd = true; // Reached the final column.
                    break;
                }
                // If the next cell is not '1', then the forward movement stops.
                if (gridData[currentRow][currentCol] !== 1) {
                    currentCol--; // Step back one column as the current one is not '1'.
                    break;
                }
            }
            // If the movement reached the very end of the row, this path segment is complete,
            // and no further moves from this point are needed in this iteration.
            if (reachedEnd) {
                continue;
            }
        } else if (cellValue === 2) {
            // If the cell value is 2, the movement is backward until a non-2 cell is encountered.
            while (true) {
                currentCol--; // Move one column to the left.
                // If the previous cell is not '2', then the backward movement stops.
                if (gridData[currentRow][currentCol] !== 2) {
                    break;
                }
            }
        }

        // After determining the effective current column (currentCol) based on cell values,
        // add the next possible states to the queue.
        // This involves switching rows (1 - currentRow) and exploring three adjacent columns:
        // currentCol, currentCol + 1, and currentCol + 2.
        for (let idx = 0; idx <= 2; idx++) {
            queueOfPaths.push([1 - currentRow, currentCol + idx, pathSteps + 1]);
        }
    }
    // Return the final path length found.
    return resultPathLength;
}

// Read all input data from standard input.
let rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
// Process the raw input: trim whitespace and split into an array of lines.
let inputLines = rawData.trim().split("\n");

// Loop through each test case provided in the input.
while (true) {
    // Extract the grid size for the current test case.
    // The `- 0` converts the string to a number.
    let gridSize = inputLines.shift() - 0;

    // A gridSize of 0 indicates the end of input.
    if (gridSize === 0) {
        break;
    }

    // Initialize the 2D array to store the grid data.
    let gridData = [];
    // Read the first row of grid data: split by space and convert to numbers.
    gridData[0] = inputLines.shift().split(" ").map(Number);
    // Read the second row of grid data: split by space and convert to numbers.
    gridData[1] = inputLines.shift().split(" ").map(Number);

    // Call the pathfinding function for the current grid and print the result to console.
    console.log(exploreGrid());
}
