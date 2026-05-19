var rawData = '';
process.stdin.resume(); // Continue processing standard input
process.stdin.setEncoding('utf8'); // Set character encoding for input stream
process.stdin.on('data', function(chunkOfData) {
    // Append incoming data chunks to the rawData buffer
    rawData += chunkOfData;
});
process.stdin.on('end', function() {
    // Once all input is received, process it
    processInputData(rawData);
});

/**
 * Main function to process the entire input string.
 * @param {string} dataString - The complete input data as a single string.
 */
function processInputData(dataString){
    // Split the input string into an array of lines and remove leading/trailing whitespace
    var inputLines = dataString.trim().split('\n');

    var lineIndex = 0; // Pointer to the current line being processed
    // Loop indefinitely until a termination condition is met
    while(true) {
        var areaLayout = []; // Initialize an empty array to represent the grid/map
        // Read the width and height for the current grid
        var dimensions = parseNumbersFromString(inputLines[lineIndex++]);
        // Check if the current dimensions signify the end of input
        if(checkTerminationCondition(dimensions)) {
            break; // Exit the loop if termination condition is met
        }
        // Initialize the grid with the given dimensions
        initializeGrid(dimensions, areaLayout);

        // Read starting and goal coordinates
        var initialPosition = parseNumbersFromString(inputLines[lineIndex++]);
        var finalDestination = parseNumbersFromString(inputLines[lineIndex++]);

        // Read the number of blocks/obstacles
        var numBlocks = parseInt(inputLines[lineIndex++]);
        // Loop to place each block on the grid
        for(var k = 0; k < numBlocks; k += 1){
            var obstacleDetails = parseNumbersFromString(inputLines[lineIndex++]);
            placeObstacle(areaLayout, obstacleDetails);
        }

        // Determine if the goal is reachable from the start position
        // Adjust coordinates to be 0-indexed
        var canReach = canTraverse(areaLayout, initialPosition[0]-1, initialPosition[1]-1, finalDestination[0]-1, finalDestination[1]-1);
        // Output the result
        console.log(canReach ? "OK" : "NO");
    }
}

/**
 * Initializes a 2D grid (map) with zeros based on provided width and height.
 * @param {number[]} gridDims - An array containing [width, height].
 * @param {number[][]} layoutMatrix - The 2D array to be initialized as the grid.
 */
function initializeGrid(gridDims, layoutMatrix){
    // Iterate through rows (x-coordinate)
    for(var r = 0; r < gridDims[0]; r += 1){
        var rowBuffer = []; // Temporary array for the current row
        // Iterate through columns (y-coordinate)
        for(var c = 0; c < gridDims[1]; c += 1){
            rowBuffer.push(0); // Fill with default value (0)
        }
        layoutMatrix.push(rowBuffer); // Add the completed row to the grid
    }
}

/**
 * Places a block (obstacle) onto the grid.
 * @param {number[][]} targetGrid - The 2D grid where the block will be placed.
 * @param {number[]} obstacleInfo - An array containing block details: [block_id, orientation, x_coord, y_coord].
 */
function placeObstacle(targetGrid, obstacleInfo){
    // Determine if the block is horizontal (orientation 0) or vertical (orientation 1)
    var isHorizontallyOriented = !obstacleInfo[1];
    // Set block dimensions based on orientation
    var blockWidth = isHorizontallyOriented ? 4 : 2;
    var blockHeight = isHorizontallyOriented ? 2 : 4;
    // Adjust block's top-left coordinates to be 0-indexed
    var startXCoord = obstacleInfo[2]-1;
    var startYCoord = obstacleInfo[3]-1;

    // Iterate over the area covered by the block
    for(var matrixX = startXCoord; matrixX < startXCoord + blockWidth; matrixX += 1){
        for(var matrixY = startYCoord; matrixY < startYCoord + blockHeight; matrixY += 1){
            // Assign the block's ID to the corresponding cells in the grid
            targetGrid[matrixX][matrixY] = obstacleInfo[0];
        }
    }
}

/**
 * Recursively checks if a path exists from a starting point to a goal point on the grid.
 * Uses a depth-first search approach.
 * @param {number[][]} currentGrid - The 2D grid representing the area.
 * @param {number} currX - Current X-coordinate.
 * @param {number} currY - Current Y-coordinate.
 * @param {number} destX - Goal X-coordinate.
 * @param {number} destY - Goal Y-coordinate.
 * @returns {boolean} - True if the goal is reachable, false otherwise.
 */
function canTraverse(currentGrid, currX, currY, destX, destY){
    // Base case: If current position is the goal, a path is found
    if(currX === destX && currY === destY){
        return true;
    }
    // Get the value (color/region identifier) of the current cell
    var cellValue = currentGrid[currX][currY];
    // Mark the current cell as visited by changing its value to -2
    currentGrid[currX][currY] = -2;

    var foundPath = false; // Flag to track if a path is found
    // Explore adjacent cells (diagonally)
    [-1, 1].forEach(function(deltaX){ // Iterate over possible changes in X-coordinate
        [-1, 1].forEach(function(deltaY){ // Iterate over possible changes in Y-coordinate
            var nextX = currX + deltaX; // Calculate next X-coordinate
            var nextY = currY + deltaY; // Calculate next Y-coordinate
            // Check if the next cell is within bounds and has the same 'color' (value)
            // The `currentGrid[nextX]` check prevents errors for out-of-bounds `nextX`
            if(currentGrid[nextX] && currentGrid[nextX][nextY] === cellValue){
                // Recursively call canTraverse for the next cell
                foundPath = foundPath || canTraverse(currentGrid, nextX, nextY, destX, destY);
            }
        });
    });
    return foundPath; // Return whether a path was found
}

/**
 * Splits a string by space and converts the parts to numbers.
 * @param {string} inputString - The string to be parsed.
 * @returns {number[]} - An array of numbers.
 */
function parseNumbersFromString(inputString){
    return inputString.split(' ').map(Number);
}

/**
 * Checks if an array represents the termination condition (0, 0).
 * @param {number[]} inputArray - The array to check.
 * @returns {boolean} - True if the first two elements are both 0, false otherwise.
 */
function checkTerminationCondition(inputArray){
    return inputArray[0] === 0 && inputArray[1] === 0;
}
