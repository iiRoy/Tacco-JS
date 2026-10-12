var leastSteps = 1000; // Initialize the minimum path length with a large value
var gridState; // Global variable to store the grid configuration

/**
 * Processes the raw input data to set up the grid and initiate pathfinding.
 * @param {string} rawData - The raw input string from stdin.
 */
function ProcessInput(rawData) {
    // Clean up the input string by removing leading/trailing whitespace
    rawData = rawData.trim();
    // Split the input into individual lines
    let lineSegments = rawData.split("\n");

    // The first line contains grid dimensions
    let dimensions = lineSegments[0].split(" ");
    // The rest of the lines represent the grid state
    gridState = lineSegments.slice(1, lineSegments.length);

    // Convert each grid row string into an array of characters
    gridState = gridState.map(rowString => {
        return rowString.split('');
    });

    // Start the recursive path exploration from the top-left corner [0,0]
    // The target is the bottom-right corner, adjusted for 0-based indexing
    // Initial path length is 0
    explorePath([0, 0], [parseInt(dimensions[0]) - 1, parseInt(dimensions[1]) - 1], 0);

    // Output the calculated minimum path length
    console.log(leastSteps);
}

// Read input from standard input and pass it to the main processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Recursively explores possible paths from the current position to the target.
 * This function implements a depth-first search-like approach.
 * @param {number[]} currentPos - The current [y, x] coordinates.
 * @param {number[]} targetPos - The target [y, x] coordinates.
 * @param {number} pathLength - The length of the path taken so far.
 */
function explorePath(currentPos, targetPos, pathLength) {
    let currentY = currentPos[0]; // Current row index
    let currentX = currentPos[1]; // Current column index

    // If the current cell is not a '.' (empty path), it means it's an obstacle or visited cell that adds to the count.
    // Increment pathLength if the cell is not empty.
    if (gridState[currentY][currentX] !== ".") {
        pathLength++;
        // If the current path length already exceeds the known minimum, prune this branch.
        if (pathLength > leastSteps) {
            return;
        }
    }

    // Check if the target has been reached
    if (currentY === targetPos[0] && currentX === targetPos[1]) {
        // If this path is shorter than the current minimum, update the minimum.
        if (pathLength < leastSteps) {
            leastSteps = pathLength;
        }
        return; // Path found, terminate this branch.
    }
    // If not at the target, explore possible next steps.
    else if (currentY === targetPos[0]) {
        // If already in the target row, only move right.
        explorePath([currentY, currentX + 1], targetPos, pathLength);
    }
    else if (currentX === targetPos[1]) {
        // If already in the target column, only move down.
        explorePath([currentY + 1, currentX], targetPos, pathLength);
    }
    else {
        // If not in the target row or column, explore both moving right and moving down.
        explorePath([currentY, currentX + 1], targetPos, pathLength); // Try moving right
        explorePath([currentY + 1, currentX], targetPos, pathLength); // Try moving down
    }
}
