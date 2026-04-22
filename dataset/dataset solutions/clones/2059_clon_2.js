/*
 * This script processes a grid-based map to determine the minimum number of
 * 'difficult' cells encountered when traversing from a starting point to an
 * end point. It employs a recursive depth-first search algorithm.
 */

// A global variable to hold the lowest recorded cost (number of difficult cells)
// to reach the destination. Initialized with a hexadecimal value representing 1000,
// ensuring any valid path will result in a lower cost.
var leastObstacles = 0x3E8;

// Another global variable that will store the parsed two-dimensional grid layout.
// This array of arrays will represent the terrain and its characteristics.
var terrainLayout;

/**
 * The primary entry point function responsible for handling the input data,
 * preparing the grid, and initiating the pathfinding operation.
 * @param {string} receivedData - The raw string input from the source,
 *                                containing grid dimensions and the map itself.
 */
function ProcessInput(receivedData) {
    // First, remove any extraneous whitespace from the beginning or end of the input.
    receivedData = receivedData.trim();

    // Split the entire input string into an array of individual lines.
    receivedData = receivedData.split("\n");

    // The very first line of the input contains the grid's height and width,
    // separated by a space. Parse these dimensions.
    var gridSizeInfo = receivedData[0].split(" ");

    // Extract the actual map data, which starts from the second line (index 1)
    // up to the end of the received data.
    terrainLayout = receivedData.slice(1, receivedData.length);

    // Transform each line of the map data into an array of characters.
    // This converts the array of strings into a 2D array (grid) of characters.
    terrainLayout = terrainLayout.map(
        (lineSegment) => {
            return lineSegment.split('');
        }
    );

    // Initiate the recursive grid navigation. The starting point is [0,0],
    // the target is derived from the parsed dimensions (adjusted for 0-indexing),
    // and the initial path cost is zero.
    NavigateGrid(
        [0, 0],
        [parseInt(gridSizeInfo[0]) - 1, parseInt(gridSizeInfo[1]) - 1],
        0
    );

    // After the entire exploration, print the final minimum obstacle count found
    // to the console.
    console.log(leastObstacles);
}

// Execute the main processing function by reading input from the standard input stream.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * A recursive helper function that explores possible paths across the grid.
 * It determines the cost of reaching the destination by moving only right or down.
 * @param {number[]} currentPoint - An array `[y, x]` indicating the current row and column coordinates.
 * @param {number[]} destinationPoint - An array `[y, x]` indicating the target row and column coordinates.
 * @param {number} pathCost - The accumulated cost (number of obstacles) to reach `currentPoint`.
 */
function NavigateGrid(currentPoint, destinationPoint, pathCost) {
    // Deconstruct the current coordinates for easier manipulation.
    var rowCoordinate = currentPoint[0];
    var colCoordinate = currentPoint[1];

    // Check if the current cell is considered an 'obstacle'.
    // A cell is an obstacle if it's not represented by a dot (ASCII 46).
    if (terrainLayout[rowCoordinate][colCoordinate] !== String.fromCharCode(46)) {
        // If it's an obstacle, increment the cost for this path.
        pathCost++;
        // Pruning step: If the current path's cost already exceeds the globally
        // recorded minimum, there's no point in continuing this path; it won't
        // lead to a better solution.
        if (pathCost > leastObstacles) {
            return;
        }
    }

    // Base case: If the current position is the same as the destination.
    if (rowCoordinate === destinationPoint[0] && colCoordinate === destinationPoint[1]) {
        // If the cost of this completed path is less than the current minimum,
        // update the global minimum cost.
        if (pathCost < leastObstacles) {
            leastObstacles = pathCost;
        }
        return; // This path has reached its end.
    }
    // Optimized path: If already in the destination row, only allow movement to the right.
    else if (rowCoordinate === destinationPoint[0]) {
        NavigateGrid([rowCoordinate, colCoordinate + 1], destinationPoint, pathCost);
    }
    // Optimized path: If already in the destination column, only allow movement downwards.
    else if (colCoordinate === destinationPoint[1]) {
        NavigateGrid([rowCoordinate + 1, colCoordinate], destinationPoint, pathCost);
    }
    // General case: If not at the edge of the grid relative to the destination,
    // explore both possible movements: right and down.
    else {
        // Attempt to move one step to the right.
        NavigateGrid([rowCoordinate, colCoordinate + 1], destinationPoint, pathCost);
        // Attempt to move one step downwards.
        NavigateGrid([rowCoordinate + 1, colCoordinate], destinationPoint, pathCost);
    }
}