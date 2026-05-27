var inputData = []; // Stores all input lines from standard input.
var initialBlackCount, gridMap, gridHeight, gridWidth; // Variables for grid dimensions and black cell count.

// Import the 'readline' module to handle input/output operations.
var lineReader = require('readline');

// Create an interface for reading lines from standard input and writing to standard output.
var interfaceInstance = lineReader.createInterface({
    input: process.stdin,  // Read from standard input.
    output: process.stdout, // Write to standard output (though not used directly for output in this script).
});

// Event listener for each line received from standard input.
interfaceInstance.on('line', function (currentLine) {
    inputData.push(currentLine); // Add the current line to our array of input data.
});

// Event listener for when the input stream closes (all lines have been read).
interfaceInstance.on('close', function () {
    // Parse grid dimensions from the first line of input.
    gridHeight = Number(inputData[0].split(" ")[0]); // First number is height.
    gridWidth = Number(inputData[0].split(" ")[1]);   // Second number is width.

    inputData.shift(); // Remove the first line as it's already processed.

    // Convert remaining input lines into a 2D array (gridMap) of characters.
    gridMap = inputData.map(rowStr => rowStr.split(""));

    // Initialize a counter for black cells and a queue for BFS.
    initialBlackCount = 0;
    var bfsQueue = [];

    // Iterate through the grid to find all initial black cells ('#').
    for (var rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
        for (var colIdx = 0; colIdx < gridWidth; colIdx++) {
            if (gridMap[rowIdx][colIdx] === "#") {
                bfsQueue.push([rowIdx, colIdx]); // Add black cell coordinates to the queue.
                initialBlackCount++;             // Increment the count of black cells.
            }
        }
    }

    // Execute the Breadth-First Search (BFS) and print the result.
    console.log(exploreConnectedComponents(bfsQueue));
});

/**
 * Performs a Breadth-First Search (BFS) to explore connected black cells.
 *
 * @param {Array<Array<number>>} bfsQueue - The initial queue of black cell coordinates.
 * @returns {string} "Yes" if all initial black cells are connected, "No" otherwise.
 */
function exploreConnectedComponents(bfsQueue) {
    var visitedBlackCells = 0; // Counter for black cells visited during BFS.
    var resultString = "No";   // Default result.

    // Continue BFS as long as there are cells in the queue.
    while (bfsQueue.length > 0) {
        var currentCellCoords = bfsQueue.shift(); // Dequeue the next cell to process.
        var currentY = currentCellCoords[0];      // Y-coordinate of the current cell.
        var currentX = currentCellCoords[1];      // X-coordinate of the current cell.

        // Check the right neighbor.
        if (currentX + 1 < gridWidth) { // Ensure within horizontal bounds.
            if (gridMap[currentY][currentX + 1] === "#") { // If it's a black cell.
                gridMap[currentY][currentX + 1] = ".";     // Mark as visited (change to '.').
                visitedBlackCells++;                        // Increment visited count.
                bfsQueue.push([currentY, currentX + 1]);    // Enqueue for further exploration.
            }
        }

        // Check the left neighbor.
        if (currentX - 1 >= 0) { // Ensure within horizontal bounds.
            if (gridMap[currentY][currentX - 1] === "#") { // If it's a black cell.
                gridMap[currentY][currentX - 1] = ".";     // Mark as visited.
                visitedBlackCells++;                        // Increment visited count.
                bfsQueue.push([currentY, currentX - 1]);    // Enqueue.
            }
        }

        // Check the bottom neighbor.
        if (currentY + 1 < gridHeight) { // Ensure within vertical bounds.
            if (gridMap[currentY + 1][currentX] === "#") { // If it's a black cell.
                gridMap[currentY + 1][currentX] = ".";     // Mark as visited.
                visitedBlackCells++;                        // Increment visited count.
                bfsQueue.push([currentY + 1, currentX]);    // Enqueue.
            }
        }

        // Check the top neighbor.
        if (currentY - 1 >= 0) { // Ensure within vertical bounds.
            if (gridMap[currentY - 1][currentX] === "#") { // If it's a black cell.
                gridMap[currentY - 1][currentX] = ".";     // Mark as visited.
                visitedBlackCells++;                        // Increment visited count.
                bfsQueue.push([currentY - 1, currentX]);    // Enqueue.
            }
        }
    }

    // If all initially black cells were visited during BFS, they are connected.
    if (visitedBlackCells === initialBlackCount) {
        resultString = "Yes";
    }

    return resultString; // Return the final determination.
}
