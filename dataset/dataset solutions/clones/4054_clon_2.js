// This section declares core global variables for managing input and grid data.
let inputDataCollection = []; // A dynamic array to hold each line read from the standard input.
let gridSize, valueMatrix;    // 'gridSize' stores the dimension of the square grid; 'valueMatrix' will be the 2D array of parsed numbers.

// Load the 'readline' module, which provides an interface for reading data from a readable stream line by line.
const inputReader = require('readline');

// Set up the interface manager for handling console input/output operations.
const interfaceManager = inputReader.createInterface({
    input:  process.stdin,  // Directs input to come from the standard input stream.
    output: process.stdout, // Directs output to go to the standard output stream (though not directly used for printing here).
});

// Attach an event handler to process each line as it's received from the input stream.
interfaceManager.on('line', (currentLineContent) => {
    // Add the textual content of the current line to our collection.
    inputDataCollection.push(currentLineContent);
});

// Attach an event handler to execute when the input stream has finished.
interfaceManager.on('close', () => {
    // Parse the first entry in the collection to determine the grid's dimension.
    gridSize = parseInt(inputDataCollection[0], 10);
    // Remove the first entry from the collection as it has been processed.
    inputDataCollection.splice(0, 1);

    // Transform the remaining textual input lines into a 2D array of integer values.
    valueMatrix = inputDataCollection.map(currentEntry =>
        currentEntry.split(" ").map(valString => parseInt(valString, 10))
    );

    // Initialize a processing queue for the pathfinding algorithm.
    // Each element in the queue represents a state: [current_row, current_column, accumulated_path_sum_to_this_point].
    let processingQueue = [[0, 0, 0]];

    // Display the final result, which is the maximum path sum computed by the algorithm.
    console.log(calculateMaxPathSum(processingQueue));
});

/**
 * Computes the maximum possible sum of values along a path from the starting point (0,0)
 * to any reachable cell, moving only right or down. This uses a Breadth-First Search (BFS) approach.
 * @param {Array<Array<number>>} startQueue - The initial queue containing the starting node(s) for the search.
 * @returns {number} The greatest sum found among all possible paths.
 */
function calculateMaxPathSum(startQueue) {
    let maximumSumFound = 0;      // Variable to keep track of the highest path sum discovered.
    let currentPathSum = 0;       // Temporary variable to hold the sum for the path currently being evaluated.

    // Continue iterating as long as there are nodes (path states) in the queue to be examined.
    while (startQueue.length > 0) {
        // Retrieve and remove the next path node from the front of the queue.
        const currentPathNode = startQueue.shift();

        // Extract the row, column, and sum accumulated up to the previous node from the current path node.
        const rowPosition = currentPathNode[0];
        const colPosition = currentPathNode[1];
        currentPathSum = currentPathNode[2] + valueMatrix[rowPosition][colPosition]; // Add the value of the current cell.

        // Update the global maximum sum if the current path's sum is greater.
        maximumSumFound = Math.max(maximumSumFound, currentPathSum);

        // Check if moving one step to the right is a valid move (within grid boundaries).
        if (colPosition + 1 < gridSize) {
            // If valid, add the new path state to the queue.
            startQueue.push([rowPosition, colPosition + 1, currentPathSum]);
        }

        // Check if moving one step down is a valid move (within the fixed two-row boundary of the problem).
        if (rowPosition + 1 < 2) { // The '2' here signifies a hardcoded limit of two rows for downward movement.
            // If valid, add the new path state to the queue.
            startQueue.push([rowPosition + 1, colPosition, currentPathSum]);
        }
    }

    // Return the final maximum path sum found after exploring all reachable paths.
    return (maximumSumFound);
}