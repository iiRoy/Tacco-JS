var inputData = []; // Stores all lines read from standard input.
var gridSize, matrixValues; // Global variables for grid size and matrix data.

// Import the 'readline' module to handle input/output.
var readline = require('readline');

// Create an interface for reading input line by line.
var inputHandler = readline.createInterface({
    input: process.stdin,  // Read from standard input.
    output: process.stdout, // Write to standard output (not used for direct output here).
});

// Event listener for each line received from input.
inputHandler.on('line', function (currentLine) {
    inputData.push(currentLine); // Add the current line to our collection.
});

// Event listener for when the input stream closes.
inputHandler.on('close', function () {
    // Parse the first line to get the grid size.
    gridSize = Number(inputData[0]);
    inputData.shift(); // Remove the first line as it's processed.

    // Parse the remaining lines into a 2D array of numbers.
    matrixValues = inputData.map(item => item.split(" ").map(item => Number(item)));

    // Initialize the processing queue with the starting point [row, col, current_sum].
    var processingQueue = [[0, 0, 0]];
    // Call the breadth-first search function and print its result.
    console.log(calculateMaxPathSum(processingQueue));
});

/**
 * Performs a breadth-first search to find the maximum path sum in the matrix.
 * Paths can move right (x+1) or down (y+1).
 * The matrix is assumed to have 2 rows.
 * @param {Array<Array<number>>} processingQueue - The queue of nodes to visit, each node is [row, col, current_sum].
 * @returns {number} The maximum path sum found.
 */
function calculateMaxPathSum(processingQueue) {
    var maximumSum = 0; // Stores the maximum sum found so far.
    var currentPathSum = 0; // Stores the sum for the current path being explored.

    // Continue as long as there are nodes in the queue to process.
    while (processingQueue.length) {
        var currentNode = processingQueue.shift(); // Get the next node from the front of the queue.
        var rowCoord = currentNode[0]; // Extract the row coordinate.
        var colCoord = currentNode[1]; // Extract the column coordinate.
        // Calculate the sum for the current path by adding the current cell's value.
        currentPathSum = currentNode[2] + matrixValues[rowCoord][colCoord];

        // Update the overall maximum sum if the current path sum is greater.
        maximumSum = Math.max(maximumSum, currentPathSum);

        // Check if moving right is a valid option.
        if (colCoord + 1 < gridSize) {
            processingQueue.push([rowCoord, colCoord + 1, currentPathSum]); // Add the right neighbor to the queue.
        }
        // Check if moving down is a valid option (matrix has 2 rows, so y can be 0 or 1).
        if (rowCoord + 1 < 2) {
            processingQueue.push([rowCoord + 1, colCoord, currentPathSum]); // Add the down neighbor to the queue.
        }
    }

    return (maximumSum); // Return the final maximum path sum.
}
