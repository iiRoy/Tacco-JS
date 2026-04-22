/*
 * This file processes a grid of characters to find distinct clusters
 * defined by specific symbols and counts them.
 * It uses a recursive flood-fill-like algorithm.
 */

// Global counter to prevent excessive recursion depth.
// This acts as a safeguard for very large or complex grids.
var recursionDepthCounter = 0;

/**
 * Recursively propagates an effect (marks cells as visited)
 * starting from a given coordinate if they match a target value.
 * @param {number} rowCoord - The current row coordinate.
 * @param {number} colCoord - The current column coordinate.
 * @param {string} targetValue - The character value to match and propagate.
 */
function propagateEffect( rowCoord , colCoord , targetValue ) {
    // Increment the recursion depth counter.
    // This helps in limiting stack overflow issues for deep recursion.
    recursionDepthCounter++;

    // Base case: If recursion depth exceeds a threshold, stop.
    // This is a common technique to prevent infinite recursion or stack overflow.
    if (recursionDepthCounter > 50) return;

    // Define offsets for 4-directional movement (up, down, left, right).
    // These arrays store the change in row and column for each direction.
    const rowOffsets = [ 0, 0, -1, 1 ]; // Changes for rows: no change, no change, up, down
    const colOffsets = [ -1, 1, 0, 0 ]; // Changes for columns: left, right, no change, no change

    // Iterate through all four possible directions.
    for (let directionIndex = 0; directionIndex < 4; directionIndex++) {
        // Calculate the coordinates of the next cell in the current direction.
        const nextRow = rowCoord + rowOffsets[directionIndex];
        const nextCol = colCoord + colOffsets[directionIndex];

        // Check if the next cell is within the grid boundaries.
        // gridDimensions[0] is the number of rows, gridDimensions[1] is the number of columns.
        if ( nextRow < 0 || nextRow >= gridDimensions[0] ||
             nextCol < 0 || nextCol >= gridDimensions[1] )
        {
            // If out of bounds, skip to the next direction.
            continue;
        }

        // Check if the content of the next cell matches the target value.
        if ( targetValue == gridMap[nextRow][nextCol] ) {
            // If it matches, mark the cell as visited (change its value to 'm').
            gridMap[nextRow][nextCol] = 'm';
            // Recursively call propagateEffect for the newly visited cell.
            propagateEffect( nextRow, nextCol, targetValue );
        }
    }
}

// Read the entire input from stdin.
const rawDataInput = require('fs').readFileSync('/dev/stdin', 'utf8');

// Split the input into an array of lines, after trimming any leading/trailing whitespace.
let inputLines = rawDataInput.trim().split("\n");

// Main processing loop: continues until a specific termination condition is met.
while (true) {
    // Extract the grid dimensions from the first line of the current input block.
    // It's expected to be two numbers separated by a space.
    let gridDimensions = (inputLines.shift()).split(" ").map(Number);

    // Termination condition: if both dimensions are 0, exit the loop.
    if (gridDimensions[0] === 0 && gridDimensions[1] === 0) break;

    // Initialize an empty array to store the grid map for the current test case.
    let gridMap = [];

    // Populate the grid map with character data from subsequent input lines.
    for (let currentGridRow = 0; currentGridRow < gridDimensions[0]; currentGridRow++) {
        // Each line represents a row of characters.
        let currentRowChars = (inputLines.shift()).split("");
        gridMap.push(currentRowChars);
    }

    // Initialize a counter for distinct clusters found in the current grid.
    let distinctClusterCount = 0;

    // Reset the recursion depth counter for each new grid.
    recursionDepthCounter = 0;

    // Iterate through each cell of the grid to find starting points for clusters.
    for (let currentScanRow = 0; currentScanRow < gridDimensions[0]; currentScanRow++) {
        for (let currentScanCol = 0; currentScanCol < gridDimensions[1]; currentScanCol++) {
            // Get the content of the current cell.
            let cellContent = gridMap[currentScanRow][currentScanCol];

            // Check if the cell content is one of the target cluster symbols.
            // '@', '#', or '*' indicate the start of a cluster.
            if ( cellContent === "@" || cellContent === "#" || cellContent === "*" ) {
                // If a cluster symbol is found, increment the distinct cluster count.
                distinctClusterCount++;
                // Mark the current cell as 'm' (marked/visited) to prevent re-counting.
                gridMap[currentScanRow][currentScanCol] = "m";
                // Initiate the propagation effect from this cell to mark all connected cells.
                propagateEffect(currentScanRow, currentScanCol, cellContent);
            }
        }
    }

    // Output the total number of distinct clusters found for the current grid.
    console.log(distinctClusterCount);
}