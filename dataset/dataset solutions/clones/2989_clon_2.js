var inputLines = [], gridData;
var gridHeight, gridWidth;

// Import the necessary module for handling input/output operations.
var ioModule = require('readline');

// Configure the interface for reading input from standard input
// and writing output to standard output.
var inputHandler = ioModule.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// Event listener: When a new line of input is received,
// append it to our collection of input lines.
inputHandler.on('line', function (currentLine) {
    inputLines.push(currentLine);
});

// Event listener: When the input stream is closed (end of input),
// process the collected data.
inputHandler.on('close', function () {
    // Parse the grid dimensions from the first line of input.
    gridHeight = Number(inputLines[0].split(" ")[0]);
    gridWidth = Number(inputLines[0].split(" ")[1]);

    // Remove the dimension line from the input array,
    // as it has already been processed.
    inputLines.shift();

    // Convert the remaining input lines into a 2D array (gridData),
    // where each character is an element.
    gridData = inputLines.map(lineStr => lineStr.split(""));

    // Initialize an array to store the starting points (black cells)
    // for the breadth-first search.
    var initialSources = [];

    // Iterate through the grid to find all black cells ('#').
    for (var rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
        for (var colIdx = 0; colIdx < gridWidth; colIdx++) {
            // If a black cell is found, add its coordinates and an initial
            // distance of 0 to the initialSources queue.
            if (gridData[rowIdx][colIdx] === "#") {
                initialSources.push([rowIdx, colIdx, 0]);
            }
        }
    }

    // Call the BFS function with the initial black cells and print the
    // maximum distance found.
    console.log(calculateMaxDistance(initialSources));
});

/**
 * Performs a Breadth-First Search (BFS) to find the maximum distance
 * from any initial source cell to any other reachable cell in the grid.
 *
 * @param {Array<Array<number>>} processingQueue - A queue of cells to process,
 *   each element is [row, col, distance].
 * @returns {number} The greatest distance found from any source cell.
 */
function calculateMaxDistance(processingQueue) {
    // Initialize variables to track the maximum distance and the current cell's distance.
    var greatestDistance = 0;
    var currentDistance = 0;

    // Create a 2D array (distanceMap) to store the shortest distance
    // to each cell from any source. Initialize all cells with -1 (unvisited).
    var distanceMap = Array(gridHeight).fill(-1).map(
        () => Array(gridWidth).fill(-1)
    );

    // Continue BFS as long as there are cells in the queue to process.
    while (processingQueue.length > 0) {
        // Dequeue the next cell to process.
        var currentCellInfo = processingQueue.shift();
        var cellRow = currentCellInfo[0];
        var cellCol = currentCellInfo[1];
        currentDistance = currentCellInfo[2];

        // If this cell has already been visited (distance calculated), skip it.
        if (distanceMap[cellRow][cellCol] !== -1) {
            continue;
        }

        // Mark the current cell as visited and record its distance.
        distanceMap[cellRow][cellCol] = currentDistance;
        // Update the overall maximum distance found so far.
        greatestDistance = Math.max(greatestDistance, currentDistance);

        // Explore neighbors: Add unvisited valid neighbors to the queue
        // with an incremented distance.

        // Check cell below
        if (cellRow + 1 < gridHeight) {
            processingQueue.push([cellRow + 1, cellCol, currentDistance + 1]);
        }
        // Check cell above
        if (0 < cellRow - 1 || cellRow - 1 === 0) { // Equivalent to cellRow - 1 >= 0
            processingQueue.push([cellRow - 1, cellCol, currentDistance + 1]);
        }
        // Check cell to the right
        if (cellCol + 1 < gridWidth) {
            processingQueue.push([cellRow, cellCol + 1, currentDistance + 1]);
        }
        // Check cell to the left
        if (0 < cellCol - 1 || cellCol - 1 === 0) { // Equivalent to cellCol - 1 >= 0
            processingQueue.push([cellRow, cellCol - 1, currentDistance + 1]);
        }
    }

    // Return the maximum distance found during the BFS traversal.
    return greatestDistance;
}
