const fileSystemModule = require('fs');

// Constants for robot orientation, improving readability over magic numbers.
const ORIENTATION_NORTH = 0; // Corresponds to original xy[0] = 0
const ORIENTATION_EAST = 1;  // Corresponds to original xy[0] = 1
const ORIENTATION_SOUTH = 2; // Corresponds to original xy[0] = 2
const ORIENTATION_WEST = 3;  // Corresponds to original xy[0] = 3

/**
 * Reads the entire content of a file, trims it, and splits it into an array of lines.
 * Filters out any empty lines to ensure clean command processing.
 * @param {string} filePath - The path to the input file (e.g., '/dev/stdin').
 * @returns {string[]} An array of strings, where each string is a line from the input.
 */
const retrieveAndPrepareData = (filePath) => {
    const rawFileContents = fileSystemModule.readFileSync(filePath, 'utf8');
    return rawFileContents.trim().split('\n').filter(line => line.length > 0);
};

/**
 * Clamps a given numerical value within a specified inclusive range.
 * This is used to ensure robot coordinates do not exceed grid boundaries.
 * @param {number} currentVal - The value to be clamped.
 * @param {number} lowerBound - The minimum allowed value.
 * @param {number} upperBound - The maximum allowed value.
 * @returns {number} The clamped value.
 */
const constrainCoordinate = (currentVal, lowerBound, upperBound) => {
    return Math.max(lowerBound, Math.min(currentVal, upperBound));
};

// Start of the main program execution flow.
// Load all input commands and grid specifications into a mutable array.
let processedInputLines = retrieveAndPrepareData('/dev/stdin');

// Outer processing loop: Iterates through each distinct simulation scenario.
// Each scenario starts with grid dimensions and ends with a "0 0" or EOF.
while (true) {
    // Extract the first line, which should define the grid's width and height.
    const dimensionsLine = processedInputLines.shift();

    // Check for the global termination signal: "0 0".
    // If encountered, all scenarios have been processed, and the program exits.
    if (dimensionsLine === '0 0') {
        break;
    }

    // Parse the grid dimensions. Using `parseInt` with radix 10 for robustness.
    const [widthStr, heightStr] = dimensionsLine.split(' ');
    const gridWidth = parseInt(widthStr, 10);
    const gridHeight = parseInt(heightStr, 10);

    // Initialize the robot's internal state.
    // The array elements represent: [orientation, xPosition, yPosition].
    // Initial state: Facing North (0), at coordinates (1,1).
    let robotCurrentState = [ORIENTATION_NORTH, 1, 1];

    // Inner processing loop: Handles all movement commands for the current robot simulation.
    // This loop continues until a "STOP" command is received for the current scenario.
    while (true) {
        // Fetch the next command string and split it into its components.
        const rawCommandString = processedInputLines.shift();
        const commandSegments = rawCommandString.split(' ');

        // The first segment is always the primary command (e.g., "FORWARD", "RIGHT").
        const primaryAction = commandSegments[0];

        // Default step count for commands like "RIGHT" or "LEFT" (which don't take steps).
        let movementSteps = 1;

        // If a second segment exists, it represents the number of steps for movement commands.
        if (commandSegments.length > 1) {
            const parsedSteps = parseInt(commandSegments[1], 10);
            // Ensure the parsed steps are a valid non-negative number.
            movementSteps = isNaN(parsedSteps) || parsedSteps < 0 ? 0 : parsedSteps;
        }

        // Check if the current scenario's commands have concluded.
        if (primaryAction === 'STOP') {
            break; // Exit the inner loop and prepare for the next scenario.
        }

        // Execute actions based on the identified primary command.
        switch (primaryAction) {
            case 'RIGHT':
                // Rotate clockwise: 0 -> 1 -> 2 -> 3 -> 0.
                // Using modulo operator to cycle through orientations.
                robotCurrentState[0] = (robotCurrentState[0] + 1) % 4;
                break;
            case 'LEFT':
                // Rotate counter-clockwise: 0 -> 3 -> 2 -> 1 -> 0.
                // Adding 4 before modulo ensures positive results for negative numbers.
                robotCurrentState[0] = (robotCurrentState[0] - 1 + 4) % 4;
                break;
            case 'FORWARD':
                // Move the robot forward by `movementSteps`.
                // This section replicates the original code's behavior, including a specific quirk
                // where moving "West" (orientation 3) incorrectly modifies the Y coordinate.
                for (let i = 0; i < movementSteps; i++) {
                    switch (robotCurrentState[0]) { // Check current orientation
                        case ORIENTATION_NORTH: // North: Y increases
                            robotCurrentState[2]++;
                            break;
                        case ORIENTATION_EAST:  // East: X increases
                            robotCurrentState[1]++;
                            break;
                        case ORIENTATION_SOUTH: // South: Y decreases
                            robotCurrentState[2]--;
                            break;
                        case ORIENTATION_WEST:  // West: Original code's bug: Y decreases instead of X.
                            robotCurrentState[2]--; // Replicating original code's logic (xy[2]--)
                            break;
                    }
                }
                break;
            case 'BACKWARD':
                // Move the robot backward by `movementSteps`.
                for (let i = 0; i < movementSteps; i++) {
                    switch (robotCurrentState[0]) { // Check current orientation
                        case ORIENTATION_NORTH: // North: Y decreases (backward)
                            robotCurrentState[2]--;
                            break;
                        case ORIENTATION_EAST:  // East: X decreases (backward)
                            robotCurrentState[1]--;
                            break;
                        case ORIENTATION_SOUTH: // South: Y increases (backward)
                            robotCurrentState[2]++;
                            break;
                        case ORIENTATION_WEST:  // West: X increases (backward)
                            robotCurrentState[1]++;
                            break;
                    }
                }
                break;
            // No default case needed, as unknown commands are implicitly ignored,
            // matching the behavior of the original `if` chain without an `else`.
        }

        // After each command, apply boundary constraints to the robot's position.
        // X-coordinate must be between 1 and `gridWidth`.
        robotCurrentState[1] = constrainCoordinate(robotCurrentState[1], 1, gridWidth);
        // Y-coordinate must be between 1 and `gridHeight`.
        robotCurrentState[2] = constrainCoordinate(robotCurrentState[2], 1, gridHeight);
    }

    // Once all commands for a scenario are processed, extract the final X and Y coordinates.
    // The orientation (first element) is not part of the required output, so it's removed.
    robotCurrentState.shift();
    // Output the final X and Y coordinates, separated by a space.
    console.log(robotCurrentState.join(' '));
}