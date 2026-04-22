const fileSystemModule = require('fs'); // Import the file system module for reading input.

// Define symbolic constants for command types to enhance code clarity.
const COMMAND_IDENTIFIERS = {
    TURN_RIGHT: "RIGHT",
    TURN_LEFT: "LEFT",
    MOVE_FORWARD: "FORWARD",
    MOVE_BACKWARD: "BACKWARD",
    TERMINATE_SIMULATION: "STOP"
};

// Define direction vectors corresponding to indices:
// 0: North (Y-axis positive)
// 1: East (X-axis positive)
// 2: South (Y-axis negative)
// 3: West (X-axis negative)
const MOVEMENT_VECTORS = [
    { deltaX: 0, deltaY: 1 },
    { deltaX: 1, deltaY: 0 },
    { deltaX: 0, deltaY: -1 },
    { deltaX: -1, deltaY: 0 }
];

/**
 * Ensures a given coordinate stays within specified minimum and maximum bounds.
 * @param {number} coordinate - The current coordinate value.
 * @param {number} minVal - The minimum allowed value for the coordinate.
 * @param {number} maxVal - The maximum allowed value for the coordinate.
 * @returns {number} The coordinate clamped within the [minVal, maxVal] range.
 */
function clampCoordinate(coordinate, minVal, maxVal) {
    return Math.max(minVal, Math.min(maxVal, coordinate));
}

// Read all input from standard input, remove leading/trailing whitespace,
// and split it into an array of individual lines.
const completeInputData = fileSystemModule.readFileSync('/dev/stdin', 'utf8').trim();
const commandSequenceLines = completeInputData.split('\n');

let currentLineIndex = 0; // A pointer to track which line of input is being processed.

// Outer loop: Processes multiple simulation scenarios until a termination signal is found.
// Using a 'while(true)' loop as in the original, but with a different variable name for clarity.
while (true) {
    // Fetch the line containing the dimensions for the current operating area.
    const dimensionString = commandSequenceLines[currentLineIndex++];

    // Check if the scenario termination condition "0 0" has been met.
    if (dimensionString === "0 0") {
        break; // Exit the main scenario processing loop.
    }

    // Parse the width and height values from the dimension string.
    const gridDimensions = dimensionString.split(' ').map(Number);
    const areaWidth = gridDimensions[0];
    const areaHeight = gridDimensions[1];

    // Initialize the robot's operational state.
    // The robot starts at (1,1) facing North (direction index 0).
    const robotOperationalState = {
        currentX: 1,
        currentY: 1,
        facingDirectionIdx: 0 // 0: N, 1: E, 2: S, 3: W
    };

    // Inner loop: Processes individual commands within the current simulation scenario.
    let scenarioComplete = false;
    while (!scenarioComplete) {
        // Retrieve the next command line and parse its components.
        const rawCommand = commandSequenceLines[currentLineIndex++];
        const commandTokens = rawCommand.split(' ');
        const primaryCommand = commandTokens[0];
        let movementMagnitude = parseInt(commandTokens[1], 10); // Explicitly parse integer.

        // If the command doesn't have a numeric value (e.g., "STOP"), default to 0.
        if (isNaN(movementMagnitude)) {
            movementMagnitude = 0;
        }

        // Use a switch statement to handle different command types.
        switch (primaryCommand) {
            case COMMAND_IDENTIFIERS.TURN_RIGHT:
                // Rotate clockwise: N -> E -> S -> W -> N
                robotOperationalState.facingDirectionIdx = (robotOperationalState.facingDirectionIdx + 1) % 4;
                break;
            case COMMAND_IDENTIFIERS.TURN_LEFT:
                // Rotate counter-clockwise: N -> W -> S -> E -> N
                // Add 4 before modulo to handle negative results gracefully.
                robotOperationalState.facingDirectionIdx = (robotOperationalState.facingDirectionIdx - 1 + 4) % 4;
                break;
            case COMMAND_IDENTIFIERS.MOVE_FORWARD:
                // Apply movement 'movementMagnitude' times based on current direction.
                for (let i = 0; i < movementMagnitude; i++) {
                    const currentDelta = MOVEMENT_VECTORS[robotOperationalState.facingDirectionIdx];
                    robotOperationalState.currentX += currentDelta.deltaX;
                    robotOperationalState.currentY += currentDelta.deltaY;
                }
                break;
            case COMMAND_IDENTIFIERS.MOVE_BACKWARD:
                // Apply movement 'movementMagnitude' times in the opposite direction.
                for (let i = 0; i < movementMagnitude; i++) {
                    const currentDelta = MOVEMENT_VECTORS[robotOperationalState.facingDirectionIdx];
                    robotOperationalState.currentX -= currentDelta.deltaX; // Subtract delta for backward
                    robotOperationalState.currentY -= currentDelta.deltaY; // Subtract delta for backward
                }
                break;
            case COMMAND_IDENTIFIERS.TERMINATE_SIMULATION:
                scenarioComplete = true; // Signal to exit the command processing for this scenario.
                break;
            default:
                // For any unrecognized command, an expert system might log a warning or error.
                // For this clone, we simply ignore unknown commands.
                // console.warn(`Unrecognized command: ${primaryCommand} on line ${currentLineIndex - 1}.`);
                break;
        }

        // After each command execution, ensure the robot's coordinates remain within the grid boundaries.
        // Coordinates are 1-indexed, so min bound is 1.
        robotOperationalState.currentX = clampCoordinate(robotOperationalState.currentX, 1, areaWidth);
        robotOperationalState.currentY = clampCoordinate(robotOperationalState.currentY, 1, areaHeight);
    }

    // Output the final X and Y coordinates for the robot in the current scenario.
    // Using process.stdout.write for direct output, avoiding console.log's default newline.
    process.stdout.write(`${robotOperationalState.currentX} ${robotOperationalState.currentY}\n`);
}