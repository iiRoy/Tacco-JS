// This JavaScript program processes a series of robot movement instructions.
// It reads grid dimensions and commands from standard input, then calculates
// and outputs the final position of a robot on each grid.

// Obtain all raw input data from the standard input stream.
const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input: remove leading/trailing whitespace and split into an array of lines.
let inputLines = rawInputData.trim().split("\n");

// Begin the primary processing loop for multiple test cases (grids).
// This loop continues indefinitely until a specific termination condition is met.
while (true) {
    // Extract the first line from the input array, which should contain grid dimensions.
    let gridDimensionsString = inputLines.shift();

    // Check if the current line signifies the end of all test cases.
    if (gridDimensionsString === "0 0") {
        break; // Exit the main program loop.
    }

    // Parse the grid dimensions string into an array of numbers.
    let parsedGridDimensions = gridDimensionsString.split(" ").map(Number);
    let maximumXCoordinate = parsedGridDimensions[0]; // The width of the grid.
    let maximumYCoordinate = parsedGridDimensions[1]; // The height of the grid.

    // Initialize the robot's state: [direction, current_x, current_y].
    // Direction encoding: 0=North, 1=East, 2=South, 3=West.
    // The robot starts at (1,1) facing North.
    let robotState = [0, 1, 1];

    // Start the inner loop to process individual commands for the current grid.
    // This loop also continues until a specific command terminates it.
    while (true) {
        // Retrieve the next command line and break it into its constituent parts.
        let commandInstruction = inputLines.shift().split(" ");

        // If the command has two parts (e.g., "FORWARD 5"), ensure the second part is numeric.
        if (commandInstruction.length === 2) {
            commandInstruction[1] = commandInstruction[1] - 0; // Convert string to number.
        }

        // Check if the current command is the "STOP" signal for this grid.
        if (commandInstruction[0] === "STOP") {
            break; // Exit the inner command processing loop.
        }

        // Handle the "RIGHT" turn command.
        if (commandInstruction[0] === "RIGHT") {
            robotState[0]++; // Rotate clockwise.
            if (robotState[0] === 4) {
                robotState[0] = 0; // Wrap around from West (3) to North (0).
            }
        }

        // Handle the "LEFT" turn command.
        if (commandInstruction[0] === "LEFT") {
            robotState[0]--; // Rotate counter-clockwise.
            if (robotState[0] === -1) {
                robotState[0] = 3; // Wrap around from North (0) to West (3).
            }
        }

        // Handle the "FORWARD" movement command.
        if (commandInstruction[0] === "FORWARD") {
            // Execute movement for the specified number of steps.
            while (commandInstruction[1]--) {
                if (robotState[0] === 0) robotState[2]++; // Moving North: Y increases.
                if (robotState[0] === 1) robotState[1]++; // Moving East: X increases.
                if (robotState[0] === 2) robotState[2]--; // Moving South: Y decreases.
                if (robotState[0] === 3) robotState[1]--; // Moving West: X decreases.
            }
        }

        // Handle the "BACKWARD" movement command.
        if (commandInstruction[0] === "BACKWARD") {
            // Execute movement for the specified number of steps.
            while (commandInstruction[1]--) {
                if (robotState[0] === 0) robotState[2]--; // Moving Backward (North): Y decreases.
                if (robotState[0] === 1) robotState[1]--; // Moving Backward (East): X decreases.
                if (robotState[0] === 2) robotState[2]++; // Moving Backward (South): Y increases.
                if (robotState[0] === 3) robotState[1]++; // Moving Backward (West): X increases.
            }
        }

        // Enforce grid boundaries for the robot's X and Y coordinates.
        // X-coordinate must be at least 1.
        if (robotState[1] < 1) robotState[1] = 1;
        // Y-coordinate must be at least 1.
        if (robotState[2] < 1) robotState[2] = 1;
        // X-coordinate must not exceed the grid's width.
        if (robotState[1] > maximumXCoordinate) robotState[1] = maximumXCoordinate;
        // Y-coordinate must not exceed the grid's height.
        if (robotState[2] > maximumYCoordinate) robotState[2] = maximumYCoordinate;
    }

    // After all commands for a grid are processed, remove the direction component
    // as only the final X and Y coordinates are required for output.
    robotState.shift();
    // Output the final X and Y coordinates, separated by a single space.
    console.log(robotState.join(" "));
}
