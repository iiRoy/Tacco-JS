const lineReaderModule = require('readline'); // Import the standard readline module.

let inputBuffer = []; // A dynamic array to hold each line read from standard input.
let gridHeight, gridWidth; // Variables to store the dimensions of the grid.
let gridMatrix; // This will store the 2D array representation of the grid.

// Configure an interface to read input line by line from the process's standard input.
const interfaceInstance = lineReaderModule.createInterface({
    input: process.stdin,   // Specifies the input stream.
    output: process.stdout, // Specifies the output stream (though not directly used for reading).
});

// Attach an event handler for the 'line' event. This function executes
// every time a new line of input is received.
interfaceInstance.on('line', function (currentLineData) {
    inputBuffer.push(currentLineData); // Add the received line to our buffer.
});

// Attach an event handler for the 'close' event. This function executes
// once all input has been received and the input stream is closed.
interfaceInstance.on('close', function () {
    // Parse the grid dimensions from the very first line of input.
    // The dimensions are expected to be space-separated integers.
    const dimensions = inputBuffer[0].split(" ");
    gridHeight = Number(dimensions[0]);
    gridWidth  = Number(dimensions[1]);

    inputBuffer.shift(); // Remove the processed dimension line from the buffer.

    // Transform the remaining buffered lines into a 2D character array (the grid).
    gridMatrix = inputBuffer.map(rowString => rowString.split(""));

    // Initialize a collection of starting points for the traversal.
    // These are cells marked with '#' and their initial distance is 0.
    let initialPoints = [];
    for (let rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
        for (let colIdx = 0; colIdx < gridWidth; colIdx++) {
            if (gridMatrix[rowIdx][colIdx] === "#") {
                initialPoints.push([rowIdx, colIdx, 0]); // Store [y, x, distance].
            }
        }
    }

    // Execute the grid traversal algorithm and output the maximum calculated distance.
    console.log(traverseGrid(initialPoints));
});

/**
 * Implements a Breadth-First Search (BFS) to find the maximum distance
 * from a set of starting points within a grid.
 *
 * @param {Array<Array<number>>} processingQueue - A queue containing cells to visit,
 *   each element is an array: [y-coordinate, x-coordinate, distance_from_origin].
 * @returns {number} The greatest distance encountered from any initial point.
 */
function traverseGrid(processingQueue) {

    let maximumDistance = 0; // Tracks the largest distance found so far.
    let currentStep = 0;     // Stores the distance of the cell currently being processed.

    // Create a 2D array (visited map) to store the shortest distance to each cell
    // and to mark cells as visited. Initialized with 'null' for unvisited.
    let visitedMap = Array(gridHeight).fill(null).map(
        () => Array(gridWidth).fill(null)
    );

    // Continue the traversal as long as there are cells in the queue.
    while (processingQueue.length > 0) {
        // Dequeue the next cell's information for processing.
        const currentCellInfo = processingQueue.shift();
        const currentY = currentCellInfo[0]; // Y-coordinate of the current cell.
        const currentX = currentCellInfo[1]; // X-coordinate of the current cell.
        currentStep = currentCellInfo[2];    // Distance to the current cell from a starting point.

        // If this cell has already been visited (i.e., its distance is recorded), skip it.
        if (visitedMap[currentY][currentX] !== null) {
            continue;
        }

        // Mark the current cell as visited by storing its distance.
        visitedMap[currentY][currentX] = currentStep;
        // Update the overall maximum distance if the current cell's distance is greater.
        maximumDistance = Math.max(maximumDistance, currentStep);

        // Explore all four cardinal neighbors (down, up, right, left).
        // Add valid, unvisited neighbors to the queue with an incremented distance.

        // Check the cell directly below.
        if (currentY + 1 < gridHeight) {
            processingQueue.push([currentY + 1, currentX, currentStep + 1]);
        }
        // Check the cell directly above (ensuring the row index is greater than 1).
        // This condition implies y-coordinate must be at least 2 for (y-1) to be pushed.
        if (0 < currentY - 1) {
            processingQueue.push([currentY - 1, currentX, currentStep + 1]);
        }
        // Check the cell directly to the right.
        if (currentX + 1 < gridWidth) {
            processingQueue.push([currentY, currentX + 1, currentStep + 1]);
        }
        // Check the cell directly to the left (ensuring the column index is greater than 1).
        // This condition implies x-coordinate must be at least 2 for (x-1) to be pushed.
        if (0 < currentX - 1) {
            processingQueue.push([currentY, currentX - 1, currentStep + 1]);
        }
    }

    // Return the final maximum distance found across the grid.
    return maximumDistance;
}