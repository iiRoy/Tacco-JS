var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// This array will hold lines of input data, processed sequentially.
var lineSegments = rawData.trim().split("\n");

// The main processing loop continues until a specific termination condition is met.
while (true) {
    // Extract the first line, which specifies grid dimensions and the number of operations.
    var dimensionsAndOperations = lineSegments.shift();

    // If the extracted line is "0 0", it signals the end of input, so we break the loop.
    if (dimensionsAndOperations === "0 0") {
        break;
    }

    // Parse the dimension and operation count from the string into numbers.
    dimensionsAndOperations = dimensionsAndOperations.split(" ").map(Number);

    // Assign the parsed values to descriptive variables.
    var gridSize = dimensionsAndOperations[0];
    var numOperations = dimensionsAndOperations[1];

    // Initialize a three-dimensional array (voxel map) to represent the grid space.
    // All elements are initially set to 0, indicating an 'empty' state.
    var voxelMap = [];
    for (var dimA = 0; dimA < gridSize; dimA++) {
        voxelMap[dimA] = [];
        for (var dimB = 0; dimB < gridSize; dimB++) {
            voxelMap[dimA][dimB] = [];
            for (var dimC = 0; dimC < gridSize; dimC++) {
                voxelMap[dimA][dimB][dimC] = 0; // Set voxel to 0 (empty)
            }
        }
    }

    // Iterate through each operation to mark specific planes within the voxel map.
    for (var opIndex = 0; opIndex < numOperations; opIndex++) {
        // Retrieve the current operation's parameters from the input lines.
        var operationParams = lineSegments.shift().split(" ");

        // The first parameter indicates the type of plane to be marked.
        var planeType = operationParams.shift();

        // Convert the remaining parameters to zero-indexed numbers.
        operationParams = operationParams.map(function(valItem) {
            return Number(valItem) - 1;
        });

        // Based on the plane type, mark the corresponding voxels as 'filled' (1).
        if (planeType === "xy") {
            // Mark all voxels along the Z-axis for a given (X, Y) coordinate.
            for (var iterCoord = 0; iterCoord < gridSize; iterCoord++) {
                voxelMap[operationParams[0]][operationParams[1]][iterCoord] = 1;
            }
        } else if (planeType === "xz") {
            // Mark all voxels along the Y-axis for a given (X, Z) coordinate.
            for (var iterCoord = 0; iterCoord < gridSize; iterCoord++) {
                voxelMap[operationParams[0]][iterCoord][operationParams[1]] = 1;
            }
        } else if (planeType === "yz") {
            // Mark all voxels along the X-axis for a given (Y, Z) coordinate.
            for (var iterCoord = 0; iterCoord < gridSize; iterCoord++) {
                voxelMap[iterCoord][operationParams[0]][operationParams[1]] = 1;
            }
        }
    }

    // After all operations, count the number of voxels that remain 'empty' (0).
    var emptyCellsCount = 0;
    for (var finalX = 0; finalX < gridSize; finalX++) {
        for (var finalY = 0; finalY < gridSize; finalY++) {
            for (var finalZ = 0; finalZ < gridSize; finalZ++) {
                if (voxelMap[finalX][finalY][finalZ] === 0) {
                    emptyCellsCount++; // Increment the counter for each empty cell.
                }
            }
        }
    }

    // Output the final count of empty cells for the current grid configuration.
    console.log(emptyCellsCount);
}
