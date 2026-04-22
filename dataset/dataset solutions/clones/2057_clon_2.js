let leastSteps = 1000; // Stores the minimum path length found
let gridState; // Holds the parsed maze configuration

/**
 * Main function to process input and initiate pathfinding.
 * @param {string} rawData - The raw input string from stdin.
 */
function ProcessData(rawData) {
    // Remove any leading or trailing whitespace from the input string.
    rawData = rawData.trim();
    // Split the input string into an array of lines.
    rawData = rawData.split("\n");

    // Parse the first line to get the target coordinates.
    // The coordinates are 0-indexed, so we subtract 1.
    const startEndCoords = rawData[0].split(" ");

    // Extract the grid rows from the input, skipping the first line.
    gridState = rawData.slice(1, rawData.length);
    // Convert each row string into an array of characters for easier access.
    gridState = gridState.map(elementRow => {
        return elementRow.split('');
    });

    // Start the recursive path exploration from the origin [0,0].
    // The target position is derived from the parsed coordinates.
    // Initial path length is 0.
    ExplorePath([0, 0], [parseInt(startEndCoords[0]) - 1, parseInt(startEndCoords[1]) - 1], 0);

    // Print the globally stored minimum number of steps.
    console.log(leastSteps);
}

// Read input from standard input and pass it to the processing function.
ProcessData(
    require("fs").readFileSync("/dev/stdin", "utf8")
);

/**
 * Recursively explores paths in the grid to find the shortest path.
 * @param {number[]} currentPos - The current [row, column] coordinates.
 * @param {number[]} targetPos - The target [row, column] coordinates.
 * @param {number} pathLength - The current length of the path taken.
 */
function ExplorePath(currentPos, targetPos, pathLength) {
    // Extract row and column for clarity.
    const rowCoord = currentPos[0];
    const colCoord = currentPos[1];

    // If the current cell is an obstacle ('#'), increment path length.
    // This problem implies '#' cells add to the count, while '.' cells do not.
    if (gridState[rowCoord][colCoord] !== ".") {
        pathLength++;
        // Pruning: if the current path length already exceeds the best found,
        // there's no need to continue this path.
        if (pathLength > leastSteps) return;
    }

    // Check if the target destination has been reached.
    if (rowCoord === targetPos[0] && colCoord === targetPos[1]) {
        // If this path is shorter than the current minimum, update it.
        if (pathLength < leastSteps) {
            leastSteps = pathLength;
        }
        return; // Path found, terminate this branch.
    }
    // If only horizontal movement is left (already at the target row).
    else if (rowCoord === targetPos[0]) {
        // Move one step to the right.
        ExplorePath([rowCoord, colCoord + 1], targetPos, pathLength);
    }
    // If only vertical movement is left (already at the target column).
    else if (colCoord === targetPos[1]) {
        // Move one step down.
        ExplorePath([rowCoord + 1, colCoord], targetPos, pathLength);
    }
    // If both horizontal and vertical movements are possible.
    else {
        // Check the state of the right and bottom neighbors.
        const neighborOne = gridState[rowCoord][colCoord + 1]; // Right neighbor
        const neighborTwo = gridState[rowCoord + 1][colCoord]; // Bottom neighbor

        // Specific handling for prioritizing paths through '.' cells.
        if (neighborOne === "#" && neighborTwo === ".") {
            // If right is '#' and bottom is '.', only go down.
            ExplorePath([rowCoord + 1, colCoord], targetPos, pathLength);
        } else if (neighborOne === "." && neighborTwo === "#") {
            // If right is '.' and bottom is '#', only go right.
            ExplorePath([rowCoord, colCoord + 1], targetPos, pathLength);
        } else {
            // If both are '.' or both are '#', explore both paths.
            ExplorePath([rowCoord, colCoord + 1], targetPos, pathLength); // Go right
            ExplorePath([rowCoord + 1, colCoord], targetPos, pathLength); // Go down
        }
    }
}