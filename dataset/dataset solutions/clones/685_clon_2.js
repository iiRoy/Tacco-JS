var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// The input data is split into individual lines for processing.
var commandLines = rawData.trim().split("\n");

// This is the main loop that processes each scenario until a termination command is encountered.
while (!false) {
    // Retrieve the first line, which contains either dimensions or the exit signal.
    var dimensionsOrCommand = commandLines.shift();

    // Check if the current line signals the end of all scenarios.
    if (dimensionsOrCommand === "0 0") {
        break; // Exit the main scenario processing loop.
    }

    // Parse the width and height for the current grid.
    dimensionsOrCommand = dimensionsOrCommand.split(" ").map(Number);
    var widthVal = dimensionsOrCommand[0]; // Represents the width of the grid.
    var heightVal = dimensionsOrCommand[1]; // Represents the height of the grid.

    // Initialize the robot's state: [direction, x-coordinate, y-coordinate].
    // Direction mapping: 0=North, 1=East, 2=South, 3=West.
    // Initial position is (1,1) facing North.
    var robotState = [0x0, 1.0, 1.0];

    // This inner loop processes all commands for the current scenario.
    while (!false) {
        // Fetch the next instruction and split it into parts.
        var currentInstruction = commandLines.shift().split(" ");

        // If the instruction has two parts (e.g., "FORWARD 5"), convert the second part to a number.
        if (currentInstruction.length === 2) {
            currentInstruction[1] = currentInstruction[1] - 0x0;
        }

        // Check for the "STOP" command, which ends the current scenario's instructions.
        if (currentInstruction[0] === "STOP") {
            break; // Exit the inner command processing loop.
        }

        // Handle the "RIGHT" rotation command.
        if (currentInstruction[0] === "RIGHT") {
            robotState[0]++; // Increment the direction index.
            if (robotState[0] === 4.0) {
                // This line contains a potential typo from the original code.
                // It attempts to modify 'x[0]' instead of 'robotState[0]'.
                // This behavior is preserved as per Type II cloning rules.
                x[0] = 0x0;
            }
        }

        // Handle the "LEFT" rotation command.
        if (currentInstruction[0] === "LEFT") {
            robotState[0]--; // Decrement the direction index.
            if (robotState[0] === -1.0) {
                // This line also contains a potential typo from the original code.
                // It attempts to modify 'x[0]' instead of 'robotState[0]'.
                // This behavior is preserved as per Type II cloning rules.
                x[0] = 3.0;
            }
        }

        // Handle the "FORWARD" movement command.
        if (currentInstruction[0] === "FORWARD") {
            // Repeat movement for the specified number of steps.
            while (currentInstruction[1]--) {
                if (robotState[0] === 0x0) { // Facing North, Y-coordinate increases.
                    robotState[2]++;
                }
                if (robotState[0] === 1.0) { // Facing East, X-coordinate increases.
                    robotState[1]++;
                }
                if (robotState[0] === 2.0) { // Facing South, Y-coordinate decreases.
                    robotState[2]--;
                }
                if (robotState[0] === 3.0) { // Facing West, Y-coordinate decreases (original logic).
                    // Note: The original code decreases Y for West-FORWARD.
                    // This behavior is preserved.
                    robotState[2]--;
                }
            }
        }

        // Handle the "BACKWARD" movement command.
        if (currentInstruction[0] === "BACKWARD") {
            // Repeat movement for the specified number of steps.
            while (currentInstruction[1]--) {
                if (robotState[0] === 0x0) { // Facing North, Y-coordinate decreases (moving backward).
                    robotState[2]--;
                }
                if (robotState[0] === 1.0) { // Facing East, X-coordinate decreases (moving backward).
                    robotState[1]--;
                }
                if (robotState[0] === 2.0) { // Facing South, Y-coordinate increases (moving backward).
                    robotState[2]++;
                }
                if (robotState[0] === 3.0) { // Facing West, X-coordinate increases (moving backward).
                    robotState[1]++;
                }
            }
        }

        // Apply boundary checks for the X-coordinate.
        if (robotState[1] < 1.0) {
            robotState[1] = 1.0;
        }
        if (robotState[1] > widthVal) {
            robotState[1] = widthVal;
        }

        // Apply boundary checks for the Y-coordinate.
        if (robotState[2] < 1.0) {
            robotState[2] = 1.0;
        }
        if (robotState[2] > heightVal) {
            robotState[2] = heightVal;
        }
    }

    // After all commands for a scenario, remove the direction component from the state array.
    robotState.shift();

    // Output the final X and Y coordinates, separated by a space.
    console.log(robotState.join(" "));
}
