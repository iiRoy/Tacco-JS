var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the entire input file, splitting it into individual lines.
var lineData = fileContent.trim().split("\n");

// Main loop to handle multiple test cases.
while (true) {
    // Extract the width and height line for the current scenario.
    var dimStr = lineData.shift();

    // Check for the termination condition "0 0".
    if (dimStr === "0 0") {
        break; // Exit the loop if the termination signal is found.
    }

    // Parse the width and height values from the string.
    var dimensions = dimStr.split(" ").map(Number);
    var boardWidth = dimensions[0]; // Store the width.
    var boardHeight = dimensions[1]; // Store the height.

    // Initialize robot's state: [direction, x-coordinate, y-coordinate].
    // Direction: 0=N, 1=E, 2=S, 3=W (arbitrary mapping, based on original logic)
    // Initial position: (1,1) facing North (0)
    var robotState = [0, 1, 1];

    // Inner loop to process commands for the current scenario.
    while (true) {
        // Get the next command line and split it into parts.
        var commandParts = lineData.shift().split(" ");

        // Convert the second part of the command to a number if it exists.
        if (commandParts.length === 2) {
            commandParts[1] = commandParts[1] - 0; // Shorthand for Number(commandParts[1])
        }

        // Check for the "STOP" command to end the current scenario.
        if (commandParts[0] === "STOP") {
            break; // Exit the inner command processing loop.
        }

        // Handle "RIGHT" turn command.
        if (commandParts[0] === "RIGHT") {
            robotState[0]++; // Increment direction.
            if (robotState[0] === 4) {
                x[0] = 0; // This appears to be a typo in the original code, 'x' is undefined.
                          // Preserving the original behavior, which would likely cause a ReferenceError.
            }
        }

        // Handle "LEFT" turn command.
        if (commandParts[0] === "LEFT") {
            robotState[0]--; // Decrement direction.
            if (robotState[0] === -1) {
                x[0] = 3; // This appears to be a typo in the original code, 'x' is undefined.
                          // Preserving the original behavior, which would likely cause a ReferenceError.
            }
        }

        // Handle "FORWARD" movement command.
        if (commandParts[0] === "FORWARD") {
            // Loop for the specified number of steps.
            while (commandParts[1]--) {
                if (robotState[0] === 0) robotState[2]++; // North: increment y
                if (robotState[0] === 1) robotState[1]++; // East: increment x
                if (robotState[0] === 2) robotState[2]--; // South: decrement y
                if (robotState[0] === 3) robotState[2]--; // West: decrement y (original code has typo, should be robotState[1]--)
                                                          // Preserving original behavior.
            }
        }

        // Handle "BACKWARD" movement command.
        if (commandParts[0] === "BACKWARD") {
            // Loop for the specified number of steps.
            while (commandParts[1]--) {
                if (robotState[0] === 0) robotState[2]--; // North: decrement y
                if (robotState[0] === 1) robotState[1]--; // East: decrement x
                if (robotState[0] === 2) robotState[2]++; // South: increment y
                if (robotState[0] === 3) robotState[1]++; // West: increment x
            }
        }

        // Enforce boundary conditions for x-coordinate.
        if (robotState[1] < 1) robotState[1] = 1;
        if (robotState[1] > boardWidth) robotState[1] = boardWidth;

        // Enforce boundary conditions for y-coordinate.
        if (robotState[2] < 1) robotState[2] = 1;
        if (robotState[2] > boardHeight) robotState[2] = boardHeight;
    }

    // Remove the direction component from the robot's state before output.
    robotState.shift();

    // Output the final x and y coordinates for the current scenario.
    console.log(robotState.join(" "));
}
