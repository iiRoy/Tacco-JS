var rawData = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(chunkOfData) {
    rawData += chunkOfData;
});

process.stdin.on('end', function() {
    processInputData(rawData);
});

/**
 * Main function to process the entire input string received from stdin.
 * It parses test cases, initializes a grid, places blocks, and checks reachability.
 * @param {string} fullInputString - The complete input string.
 */
function processInputData(fullInputString) {
    // Split the input into individual lines after trimming any leading/trailing whitespace.
    var inputLines = fullInputString.trim().split('\n');

    var lineIndex = 0; // Pointer to the current line being processed.

    // Loop through test cases until a termination condition is met.
    while (!0) { // Equivalent to while(true)
        var gridMatrix = []; // Represents the 2D grid for the current test scenario.

        // Read the dimensions (width and height) for the current grid.
        var dimensions = parseNumbersFromString(inputLines[lineIndex++]);

        // Check if the dimensions indicate the end of input (0 0).
        if (isTerminationCondition(dimensions)) {
            break; // Exit the processing loop.
        }

        // Initialize the grid matrix based on the parsed dimensions.
        initializeGrid(dimensions, gridMatrix);

        // Read the starting coordinates for the pathfinding.
        var startCoords = parseNumbersFromString(inputLines[lineIndex++]);

        // Read the target coordinates for the pathfinding.
        var targetCoords = parseNumbersFromString(inputLines[lineIndex++]);

        // Read the total number of blocks to be placed on the grid.
        var numBlocks = parseInt(inputLines[lineIndex++]);

        // Iterate and place each block onto the grid.
        for (var blockIdx = 0.0; blockIdx < numBlocks; blockIdx += 1.0) {
            var currentBlock = parseNumbersFromString(inputLines[lineIndex++]);
            placeBlockOnGrid(gridMatrix, currentBlock);
        }

        // Perform the reachability check from start to target.
        // Coordinates are adjusted to be 0-indexed for array access.
        var reachabilityResult = canReachTarget(
            gridMatrix,
            startCoords[0] - 1.0,
            startCoords[1] - 1.0,
            targetCoords[0] - 1.0,
            targetCoords[1] - 1.0
        );

        // Output the result as "OK" if reachable, "NO" otherwise.
        console.log(reachabilityResult ? "OK" : "NO");
    }
}

/**
 * Initializes a 2D grid (matrix) with zero values.
 * @param {number[]} gridDimensions - An array [width, height] specifying grid size.
 * @param {number[][]} targetGrid - The grid matrix to be populated.
 */
function initializeGrid(gridDimensions, targetGrid) {
    // Loop through each row based on the grid's width.
    for (var rowCoord = 0.0; rowCoord < gridDimensions[0]; rowCoord += 1.0) {
        var rowBuffer = []; // Temporary array to build a single row.
        // Loop through each column based on the grid's height.
        for (var colCoord = 0.0; colCoord < gridDimensions[1]; colCoord += 1.0) {
            rowBuffer.push(0.0); // Add a zero to represent an empty cell.
        }
        targetGrid.push(rowBuffer); // Add the completed row to the grid.
    }
}

/**
 * Places a block onto the specified grid matrix.
 * @param {number[][]} targetGrid - The grid where the block will be placed.
 * @param {number[]} blockDetails - An array containing block properties: [color, orientation, startX, startY].
 */
function placeBlockOnGrid(targetGrid, blockDetails) {
    // Determine block orientation: 0 for horizontal, 1 for vertical.
    var isBlockHorizontal = !blockDetails[1];

    // Calculate block dimensions based on its orientation.
    var blockWidth = isBlockHorizontal ? 4.0 : 2.0;
    var blockHeight = isBlockHorizontal ? 2.0 : 4.0;

    // Get the top-left coordinates of the block, adjusted to be 0-indexed.
    var startX = blockDetails[2] - 1.0;
    var startY = blockDetails[3] - 1.0;

    // Fill the grid cells corresponding to the block's area with its color.
    for (var matrixRow = startX; matrixRow < startX + blockWidth; matrixRow += 1.0) {
        for (var matrixCol = startY; matrixCol < startY + blockHeight; matrixCol += 1.0) {
            targetGrid[matrixRow][matrixCol] = blockDetails[0]; // Assign the block's color.
        }
    }
}

/**
 * Recursively checks if a path exists from a starting point to a target point
 * on the grid, moving only through cells of the same 'color'.
 * This function implements a Depth-First Search (DFS) algorithm.
 * @param {number[][]} currentGrid - The grid matrix.
 * @param {number} currentX - The current X-coordinate (row).
 * @param {number} currentY - The current Y-coordinate (column).
 * @param {number} targetX - The target X-coordinate (row).
 * @param {number} targetY - The target Y-coordinate (column).
 * @returns {boolean} - Returns true if the target is reachable, false otherwise.
 */
function canReachTarget(currentGrid, currentX, currentY, targetX, targetY) {
    // Base case: If the current position is the target, a path has been found.
    if (currentX === targetX && currentY === targetY) {
        return !0; // Equivalent to true.
    }

    // Store the 'color' (value) of the current cell.
    var cellValue = currentGrid[currentX][currentY];

    // Mark the current cell as visited to prevent revisiting and infinite loops.
    // Using -2.0 as a distinct visited marker.
    currentGrid[currentX][currentY] = -2.0;

    var foundPath = !1; // Flag to track if a path is found in any direction.

    // Iterate over all 8 possible directions (including diagonals).
    [-1.0, 0.0, 1.0].forEach(function(deltaX) {
        [-1.0, 0.0, 1.0].forEach(function(deltaY) {
            // Skip the case where both deltas are zero (i.e., staying in the same cell).
            if (!deltaX && !deltaY) {
                return;
            }

            // Calculate the coordinates of the next potential cell.
            var nextX = currentX + deltaX;
            var nextY = currentY + deltaY;

            // Check if the next cell is within grid boundaries and has the same 'color' as the starting cell.
            // `currentGrid[nextX]` checks if `nextX` is a valid row index.
            // `currentGrid[nextX][nextY]` then checks if `nextY` is a valid column index for that row
            // and if its value matches `cellValue`.
            if (currentGrid[nextX] && currentGrid[nextX][nextY] === cellValue) {
                // Recursively call canReachTarget for the next cell.
                // Update `foundPath` if any recursive call returns true.
                foundPath = foundPath || canReachTarget(currentGrid, nextX, nextY, targetX, targetY);
            }
        });
    });
    return foundPath; // Return the final pathfinding result.
}

/**
 * Parses a space-separated string of numbers into an array of numbers.
 * @param {string} inputString - The string containing space-separated numbers.
 * @returns {number[]} - An array of parsed numbers.
 */
function parseNumbersFromString(inputString) {
    return inputString.split(' ').map(Number);
}

/**
 * Checks if the given array of numbers represents the termination condition (0 0).
 * @param {number[]} checkArray - The array to evaluate.
 * @returns {boolean} - True if the array is [0, 0], false otherwise.
 */
function isTerminationCondition(checkArray) {
    return checkArray[0] === 0.0 && checkArray[1] === 0.0;
}
