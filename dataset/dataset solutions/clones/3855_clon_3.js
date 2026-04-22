const ioModule = require('readline');

let inputDataLines = [];

let gridHeight;
let gridWidth;
let gridMatrix;

let initialHashCount = 0;

const interfaceHandler = ioModule.createInterface({
    input: process.stdin,
    output: process.stdout,
});

interfaceHandler.on('line', (currentLineContent) => {
    inputDataLines.push(currentLineContent);
});

interfaceHandler.on('close', () => {
    // Basic validation: ensure input exists.
    if (inputDataLines.length === 0) {
        console.error("Input processing error: No data lines were provided.");
        return;
    }

    // Parse grid dimensions from the first line.
    const dimensionLine = inputDataLines[0];
    const dimensionTokens = dimensionLine.split(" ");

    // Verify dimension tokens are valid numbers.
    if (dimensionTokens.length < 2 || isNaN(Number(dimensionTokens[0])) || isNaN(Number(dimensionTokens[1]))) {
        console.error("Input parsing error: Grid dimensions are missing or invalid.");
        return;
    }

    gridHeight = parseInt(dimensionTokens[0], 10);
    gridWidth = parseInt(dimensionTokens[1], 10);

    // Validate parsed dimensions.
    if (gridHeight <= 0 || gridWidth <= 0 || !Number.isInteger(gridHeight) || !Number.isInteger(gridWidth)) {
        console.error(`Dimension validation error: Invalid grid dimensions H=${gridHeight}, W=${gridWidth}.`);
        return;
    }

    // Extract raw grid rows, excluding the dimension line.
    const rawGridRows = inputDataLines.slice(1);

    // Verify the number of grid rows matches the declared height.
    if (rawGridRows.length !== gridHeight) {
        console.error(`Grid data error: Expected ${gridHeight} rows, but received ${rawGridRows.length}.`);
        return;
    }

    // Transform raw string rows into a 2D character array.
    gridMatrix = rawGridRows.map(rowContent => rowContent.split(""));

    // Prepare the initial queue for the Breadth-First Search.
    const bfsInitialQueue = [];

    // Populate the queue with coordinates of all '#' cells and count them.
    for (let r = 0; r < gridHeight; ++r) {
        for (let c = 0; c < gridWidth; ++c) {
            if (gridMatrix[r][c] === '#') {
                bfsInitialQueue.push([r, c]);
                initialHashCount++;
            }
        }
    }

    // Handle the edge case where no '#' cells are present.
    if (initialHashCount === 0) {
        console.log("Yes");
        return;
    }

    // Execute the BFS to count all connected '#' cells.
    const totalVisitedHashes = exploreConnectedComponents(bfsInitialQueue);

    // Compare visited count with initial count to determine connectivity.
    if (totalVisitedHashes === initialHashCount) {
        console.log("Yes");
    } else {
        console.log("No");
    }
});

/**
 * Performs a Breadth-First Search (BFS) on the grid to count connected '#' cells.
 * This function modifies the global `gridMatrix` by marking visited '#' cells as '.'.
 *
 * @param {Array<Array<number>>} startingNodesQueue - An array of [row, col] coordinates
 *                                                    representing initial '#' cells to start the BFS from.
 * @returns {number} The total number of unique '#' cells visited during the traversal.
 */
function exploreConnectedComponents(startingNodesQueue) {
    let visitedComponentCount = 0;
    const processingQueue = [...startingNodesQueue]; // Use spread to create a shallow copy.

    // Define relative movement offsets for 4-directional adjacency.
    const deltaRows = [-1, 1, 0, 0]; // Up, Down
    const deltaCols = [0, 0, -1, 1]; // Left, Right
    const numDirections = deltaRows.length;

    /**
     * Checks if a given coordinate is within the valid bounds of the grid.
     * @param {number} r - The row index to check.
     * @param {number} c - The column index to check.
     * @returns {boolean} True if the coordinate is valid, false otherwise.
     */
    const isValidCoordinate = (r, c) => {
        return r >= 0 && r < gridHeight && c >= 0 && c < gridWidth;
    };

    // The main BFS loop continues as long as there are cells to process.
    while (processingQueue.length > 0) {
        const currentCoordinates = processingQueue.shift(); // Dequeue the next cell.
        const currentRow = currentCoordinates[0];
        const currentCol = currentCoordinates[1];

        // Process the current cell only if it hasn't been visited yet (still '#').
        if (gridMatrix[currentRow][currentCol] === '#') {
            gridMatrix[currentRow][currentCol] = '.'; // Mark as visited.
            visitedComponentCount++; // Increment the count of visited '#' cells.

            // Explore all four neighbors.
            for (let i = 0; i < numDirections; ++i) {
                const neighborRow = currentRow + deltaRows[i];
                const neighborCol = currentCol + deltaCols[i];

                // If the neighbor is valid and is an unvisited '#' cell, enqueue it.
                if (isValidCoordinate(neighborRow, neighborCol) && gridMatrix[neighborRow][neighborCol] === '#') {
                    processingQueue.push([neighborRow, neighborCol]);
                }
            }
        }
    }

    return visitedComponentCount;
}