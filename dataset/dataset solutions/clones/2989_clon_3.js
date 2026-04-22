const inputReaderUtil = require('readline');

let bufferedInputLines = []; // Stores all lines read from stdin.

// Sets up the interface for reading input line by line.
const inputSourceInterface = inputReaderUtil.createInterface({
    input: process.stdin,
    output: process.stdout, // Keeping this for readline constructor, though not used for output.
});

// Event handler for each line received from standard input.
inputSourceInterface.on('line', (currentInputLine) => {
    bufferedInputLines.push(currentInputLine);
});

// Event handler for when the input stream concludes.
inputSourceInterface.on('close', () => {
    // Define constants for clarity and potential future modifications.
    const BLACK_TILE_IDENTIFIER = '#';
    const PATH_DISTANCE_UNSET = -1; // Marker for cells not yet visited or distance not determined.

    // Retrieve and parse the grid dimensions from the first line of input.
    const gridDimensionLine = bufferedInputLines.shift();
    if (!gridDimensionLine) {
        console.error("Error: Input did not contain grid dimension information.");
        return; // Terminate if no dimension line is found.
    }

    const dimensionTokens = gridDimensionLine.split(" ");
    if (dimensionTokens.length < 2) {
        console.error("Error: Malformed dimension line. Expected two space-separated integers.");
        return;
    }

    const gridRowsCount = parseInt(dimensionTokens[0], 10);
    const gridColsCount = parseInt(dimensionTokens[1], 10);

    // Validate the parsed dimensions to ensure they are positive integers.
    if (isNaN(gridRowsCount) || gridRowsCount <= 0 || isNaN(gridColsCount) || gridColsCount <= 0) {
        console.error("Error: Grid dimensions must be positive numerical values.");
        return;
    }

    // Construct the actual character grid from the remaining input lines.
    const characterMapGrid = bufferedInputLines.map(line => line.split(''));

    // Perform validation on the constructed grid against the declared dimensions.
    if (characterMapGrid.length !== gridRowsCount) {
        console.error(`Error: Declared ${gridRowsCount} rows but found ${characterMapGrid.length} actual rows.`);
        return;
    }
    for (let rIndex = 0; rIndex < gridRowsCount; rIndex++) {
        if (characterMapGrid[rIndex].length !== gridColsCount) {
            console.error(`Error: Row ${rIndex} has ${characterMapGrid[rIndex].length} columns, expected ${gridColsCount}.`);
            return;
        }
    }

    // Initialize the collection of starting points for the multi-source BFS.
    // Each starting point is an object containing its coordinates and initial distance (0).
    const bfsStartingPoints = [];
    for (let rowIterator = 0; rowIterator < gridRowsCount; rowIterator++) {
        for (let colIterator = 0; colIterator < gridColsCount; colIterator++) {
            if (characterMapGrid[rowIterator][colIterator] === BLACK_TILE_IDENTIFIER) {
                bfsStartingPoints.push({ yCoord: rowIterator, xCoord: colIterator, currentPathLen: 0 });
            }
        }
    }

    // If no black tiles are found, the maximum distance is trivially zero.
    if (bfsStartingPoints.length === 0) {
        console.log(0);
        return;
    }

    // Invoke the BFS algorithm to compute the furthest point's distance.
    const resultantMaxDistance = calculateMaximumReach(
        bfsStartingPoints,
        gridRowsCount,
        gridColsCount,
        PATH_DISTANCE_UNSET
    );

    // Output the final computed maximum distance.
    console.log(resultantMaxDistance);
});

/**
 * Executes a Breadth-First Search (BFS) from multiple initial points to determine
 * the largest distance from any starting point to any reachable cell within the grid.
 *
 * @param {Array<Object>} initialQueue - The queue containing all starting cells,
 *                                       each as { yCoord, xCoord, currentPathLen }.
 * @param {number} totalGridRows - The total number of rows in the grid.
 * @param {number} totalGridCols - The total number of columns in the grid.
 * @param {number} unvisitedMarkerValue - The specific value used to denote unvisited cells
 *                                        in the distance tracking map.
 * @returns {number} The maximum distance recorded during the BFS traversal.
 */
function calculateMaximumReach(initialQueue, totalGridRows, totalGridCols, unvisitedMarkerValue) {
    let globalMaximumDistance = 0;

    // Create and initialize a 2D array to store the shortest distance to each cell
    // from any black tile. All cells start as unvisited.
    const distanceTrackerGrid = Array.from({ length: totalGridRows }, () =>
        Array(totalGridCols).fill(unvisitedMarkerValue)
    );

    // Define directional vectors for exploring neighbors (Up, Down, Left, Right).
    const deltaY = [-1, 1, 0, 0]; // Changes in Y-coordinate (row)
    const deltaX = [0, 0, -1, 1]; // Changes in X-coordinate (column)
    const numberOfDirections = deltaY.length;

    // Continue BFS as long as there are cells to process in the queue.
    while (initialQueue.length > 0) {
        // Dequeue the next cell to process.
        const currentCellDetails = initialQueue.shift();
        const { yCoord, xCoord, currentPathLen } = currentCellDetails;

        // If this cell has already been visited and its distance recorded,
        // it means we found a shorter path previously or it's a redundant entry.
        if (distanceTrackerGrid[yCoord][xCoord] !== unvisitedMarkerValue) {
            continue;
        }

        // Mark the current cell as visited and save its determined distance.
        distanceTrackerGrid[yCoord][xCoord] = currentPathLen;

        // Update the overall maximum distance found so far.
        globalMaximumDistance = Math.max(globalMaximumDistance, currentPathLen);

        // Iterate through all four possible neighboring cells.
        for (let dirIdx = 0; dirIdx < numberOfDirections; dirIdx++) {
            const nextY = yCoord + deltaY[dirIdx];
            const nextX = xCoord + deltaX[dirIdx];
            const newPathLength = currentPathLen + 1;

            // Check if the potential neighbor is within the grid boundaries.
            const isYValid = nextY >= 0 && nextY < totalGridRows;
            const isXValid = nextX >= 0 && nextX < totalGridCols;

            if (isYValid && isXValid) {
                // If the neighbor is valid and has not yet been visited, enqueue it.
                if (distanceTrackerGrid[nextY][nextX] === unvisitedMarkerValue) {
                    initialQueue.push({ yCoord: nextY, xCoord: nextX, currentPathLen: newPathLength });
                }
            }
        }
    }

    return globalMaximumDistance;
}