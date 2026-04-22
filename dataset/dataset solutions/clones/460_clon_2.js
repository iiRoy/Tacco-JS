var dataBuffer = ''; // Buffer for accumulating incoming data chunks

process.stdin.resume(); // Activates the standard input stream to begin receiving data

process.stdin.setEncoding('utf8'); // Sets the character encoding for the input stream

process.stdin.on('data', function(dataBlock) {
    dataBuffer += dataBlock; // Appends each received data block to the main buffer
});

process.stdin.on('end', function() {
    // When the input stream ends, all data has been received.
    // Call the primary processing function with the complete data.
    processAllCases(dataBuffer);
});

// Primary function to handle the entire set of test cases
function processAllCases(dataBuffer) {
    // Splits the buffered input into individual lines,
    // after trimming any leading/trailing whitespace from the whole buffer.
    var inputLines = dataBuffer.trim().split('\n');

    var caseIndex = 0; // Index to keep track of the current line being processed

    // Loop through test cases until a termination condition is met
    while (true) {
        var gridMatrix = []; // Initialize an empty 2D array to represent the grid for the current case

        // Read the dimensions (width and height) for the current grid from the input lines
        var dimensions = parseNumericLine(inputLines[caseIndex++]);

        // Check if the current dimensions indicate the end of input (e.g., 0 0)
        if (isEndOfInputMarker(dimensions)) {
            break; // Exit the loop if the end marker is found
        }

        // Set up the grid matrix with initial values based on the read dimensions
        initializeGridMatrix(dimensions, gridMatrix);

        // Read the starting X and Y coordinates for pathfinding
        var startCoordinates = parseNumericLine(inputLines[caseIndex++]);

        // Read the target X and Y coordinates for pathfinding
        var targetCoordinates = parseNumericLine(inputLines[caseIndex++]);

        // Read the number of obstacles that need to be placed on the grid
        var numObstacles = parseInt(inputLines[caseIndex++], 10); // Parse as integer with base 10

        // Iterate and place each obstacle described in the input
        for (var obstacleCounter = 0; obstacleCounter < numObstacles; obstacleCounter += 1) {
            // Parse the details of the current obstacle
            var currentObstacle = parseNumericLine(inputLines[caseIndex++]);

            // Apply the obstacle's properties to the grid matrix
            placeObstacleOnGrid(gridMatrix, currentObstacle);
        }

        // Execute the pathfinding algorithm to determine if the target is reachable
        // Adjust coordinates to be 0-indexed for array access (original input might be 1-indexed)
        var pathFound = checkPathExistence(
            gridMatrix,
            startCoordinates[0] - 1,
            startCoordinates[1] - 1,
            targetCoordinates[0] - 1,
            targetCoordinates[1] - 1
        );

        // Output the result ("OK" if reachable, "NO" otherwise)
        console.log(pathFound ? "OK" : "NO");
    }
}

// Function to create and initialize the 2D grid matrix
function initializeGridMatrix(dimensions, gridMatrix) {
    // Loop for each row, from 0 up to (but not including) the width
    for (var rowIterator = 0; rowIterator < dimensions[0]; rowIterator += 1) {
        var rowContent = []; // Temporary array to hold values for the current row

        // Loop for each column within the current row, from 0 up to (but not including) the height
        for (var columnIterator = 0; columnIterator < dimensions[1]; columnIterator += 1) {
            rowContent.push(0); // Initialize each cell with a default value, e.g., 0 for empty
        }
        gridMatrix.push(rowContent); // Add the fully populated row to the grid matrix
    }
}

// Function responsible for placing a defined obstacle onto the grid
function placeObstacleOnGrid(gridMatrix, currentObstacle) {
    // Determine the orientation of the block; true if horizontal, false if vertical
    var isBlockHorizontal = !currentObstacle[1];

    // Set the block's width and height based on its orientation
    // Example: (4x2) for horizontal, (2x4) for vertical
    var blockWidth = isBlockHorizontal ? 4 : 2;
    var blockHeight = isBlockHorizontal ? 2 : 4;

    // Extract and adjust the top-left coordinates of the obstacle to be 0-indexed
    var obstacleXCoord = currentObstacle[2] - 1;
    var obstacleYCoord = currentObstacle[3] - 1;

    // Iterate over the rectangular area that the obstacle occupies
    for (var gridXIndex = obstacleXCoord; gridXIndex < obstacleXCoord + blockWidth; gridXIndex += 1) {
        for (var gridYIndex = obstacleYCoord; gridYIndex < obstacleYCoord + blockHeight; gridYIndex += 1) {
            // Mark the cells covered by the obstacle with its unique identifier
            gridMatrix[gridXIndex][gridYIndex] = currentObstacle[0];
        }
    }
}

// Recursive function to determine if a path exists from current coordinates to target coordinates
function checkPathExistence(gridMatrix, currentXPos, currentYPos, targetXPos, targetYPos) {
    // Base case: If the current position is the target, a path has been found
    if (currentXPos === targetXPos && currentYPos === targetYPos) {
        return true;
    }

    // Store the region ID (value) of the current cell before marking it as visited
    var regionID = gridMatrix[currentXPos][currentYPos];

    // Mark the current cell as visited (e.g., using -2) to prevent revisiting and infinite loops
    gridMatrix[currentXPos][currentYPos] = -2;

    var pathExists = false; // Flag to track if any valid path is found from this position

    // Iterate through possible changes in the row index (dx: -1 or +1)
    [-1, 1].forEach(function(deltaRow) {
        // Iterate through possible changes in the column index (dy: -1 or +1)
        [-1, 1].forEach(function(deltaCol) {
            // Calculate the coordinates of the neighboring cell
            var neighborX = currentXPos + deltaRow,
                neighborY = currentYPos + deltaCol;

            // Check if the neighbor cell is within grid bounds (gridMatrix[neighborX] exists)
            // and if it has the same region ID as the starting cell of this search
            if (
                gridMatrix[neighborX] && // Check if the row index is valid
                gridMatrix[neighborX][neighborY] !== undefined && // Check if the column index is valid within that row
                gridMatrix[neighborX][neighborY] === regionID // Check if the neighbor has the same region ID
            ) {
                // Recursively call the function for the neighbor cell.
                // If the recursive call finds a path, update pathExists.
                pathExists = pathExists || checkPathExistence(gridMatrix, neighborX, neighborY, targetXPos, targetYPos);
            }
        });
    });
    // Return the final pathExists status
    return pathExists;
}

// Utility function to convert a string of space-separated numbers into an array of numbers
function parseNumericLine(lineText) {
    // Splits the string by spaces and then converts each resulting string part to a Number
    return lineText.split(' ').map(Number);
}

// Utility function to check if a coordinate pair signifies the end of input
function isEndOfInputMarker(coordinatePair) {
    // Returns true if both the first and second elements of the array are 0
    return coordinatePair[0] === 0 && coordinatePair[1] === 0;
}