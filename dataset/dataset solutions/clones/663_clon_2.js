var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read raw input from standard input
var lineSegments = rawData.trim().split("\n"); // Split the input into an array of lines, removing leading/trailing whitespace

// Main processing loop; continues until a specific termination condition is met
while (true) {
    // Extract the configuration line (N H values) from the beginning of the line segments
    var configLine = lineSegments.shift();

    // Check for the termination condition: "0 0"
    if (configLine === "0 0") {
        break; // Exit the loop if the termination string is found
    }

    // Parse the configuration line: split by space and convert parts to numbers
    var dimensionsAndInstructions = configLine.split(" ").map(Number);
    var gridSize = dimensionsAndInstructions[0]; // N: size of the 3D grid (N x N x N)
    var instructionCount = dimensionsAndInstructions[1]; // H: number of instructions to follow

    // Initialize an object to store unique occupied cell coordinates.
    // Keys will be string representations of (x,y,z) coordinates, values will be 'true'.
    var occupiedCells = {};

    // Process each instruction to mark occupied cells
    for (var instructionIndex = 0; instructionIndex < instructionCount; instructionIndex++) {
        // Get the current instruction line and split it into its components
        var currentInstruction = lineSegments.shift().split(" ");
        var axisType = currentInstruction[0]; // The type of plane ("xy", "xz", "yz")
        var coordOne = currentInstruction[1] - 0; // First coordinate value (e.g., x for xy plane)
        var coordTwo = currentInstruction[2] - 0; // Second coordinate value (e.g., y for xy plane)

        // Based on the axis type, iterate through the grid size to mark cells
        if (axisType === "xy") {
            // For an "xy" plane, the z-coordinate varies from 0 to N-1
            for (var coordinateIterator = 0; coordinateIterator < gridSize; coordinateIterator++) {
                occupiedCells[coordOne + "," + coordTwo + "," + coordinateIterator] = true;
            }
        } else if (axisType === "xz") {
            // For an "xz" plane, the y-coordinate varies from 0 to N-1
            for (var coordinateIterator = 0; coordinateIterator < gridSize; coordinateIterator++) {
                occupiedCells[coordOne + "," + coordinateIterator + "," + coordTwo] = true;
            }
        } else if (axisType === "yz") {
            // For a "yz" plane, the x-coordinate varies from 0 to N-1
            for (var coordinateIterator = 0; coordinateIterator < gridSize; coordinateIterator++) {
                occupiedCells[coordinateIterator + "," + coordOne + "," + coordTwo] = true;
            }
        }
    }

    // Calculate the total volume of the grid (N*N*N) and subtract the number of unique occupied cells.
    // The result is the number of unoccupied cells.
    console.log(gridSize * gridSize * gridSize - Object.keys(occupiedCells).length);
}
