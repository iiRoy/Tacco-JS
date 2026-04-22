const fileSystemInterface = require('node:fs');

/**
 * Ensures a numeric value stays within a defined inclusive range.
 * This function is utilized to constrain the robot's coordinates to the grid.
 * @param {number} currentValue The value to be clamped.
 * @param {number} lowerBound The minimum allowed value.
 * @param {number} upperBound The maximum allowed value.
 * @returns {number} The clamped value.
 */
function applyCoordinateConstraint(currentValue, lowerBound, upperBound) {
    return Math.max(lowerBound, Math.min(currentValue, upperBound));
}

// Define symbolic constants for the robot's directional state.
// These correspond to the original numeric values: 0, 1, 2, 3.
const ROBOT_HEADING_NORTH = 0; // Represents movement primarily in the positive Y direction
const ROBOT_HEADING_EAST = 1;  // Represents movement primarily in the positive X direction
const ROBOT_HEADING_SOUTH = 2; // Represents movement primarily in the negative Y direction
const ROBOT_HEADING_WEST = 3;  // Represents movement primarily in the negative X direction (in a standard setup)

// Read the entire standard input stream synchronously.
// The input is expected to be a sequence of lines describing simulation scenarios.
const fullInputContent = fileSystemInterface.readFileSync('/dev/stdin', 'utf8');

// Pre-process the input: remove leading/trailing whitespace and split into individual command lines.
let simulationInstructions = fullInputContent
    .trim()
    .split('\n');

// Outer simulation loop: processes one complete grid scenario per iteration.
// This loop continues until a specific termination signal ("0 0") is encountered.
while (true) {
    // Fetch the line containing the grid dimensions for the current scenario.
    const currentGridSizeSpec = simulationInstructions.shift();

    // Check for the global termination condition.
    if (currentGridSizeSpec === '0 0') {
        break; // Exit the main simulation loop if "0 0" is found.
    }

    // Parse the grid dimensions (width and height) from the string.
    // The `map(Number)` ensures the strings are converted to numeric types.
    const [gridPlaneWidth, gridPlaneHeight] = currentGridSizeSpec.split(' ').map(Number);

    // Initialize the robot's operational state for the new scenario.
    // The robot starts at (1,1) facing North (direction 0).
    let currentRobotContext = {
        orientation: ROBOT_HEADING_NORTH, // Initial direction setting
        currentX: 1,                      // Initial X-coordinate
        currentY: 1                       // Initial Y-coordinate
    };

    // Inner command processing loop: handles all movements and rotations for the current grid.
    // This loop terminates when a "STOP" command is received.
    let isScenarioActive = true;
    while (isScenarioActive) {
        // Retrieve and parse the next operational command.
        const nextOperationLine = simulationInstructions.shift();
        const operationTokens = nextOperationLine.split(' ');
        const primaryOperation = operationTokens[0]; // e.g., "FORWARD", "RIGHT", "STOP"

        // Extract the magnitude for movement commands, if present.
        let movementQuantity = 0;
        if (operationTokens.length > 1) {
            movementQuantity = parseInt(operationTokens[1], 10);
            // Basic validation for parsed number; defaults to 0 if invalid.
            if (isNaN(movementQuantity)) {
                movementQuantity = 0;
            }
        }

        // Implement command-specific logic using a switch construct for clarity.
        switch (primaryOperation) {
            case 'STOP':
                isScenarioActive = false; // Signal to terminate the inner loop.
                break;

            case 'RIGHT':
                // Rotate the robot 90 degrees clockwise. The modulo operator handles wrapping around 0-3.
                currentRobotContext.orientation = (currentRobotContext.orientation + 1) % 4;
                break;

            case 'LEFT':
                // Rotate the robot 90 degrees counter-clockwise.
                // Adding 4 before modulo ensures positive results for negative intermediate values.
                currentRobotContext.orientation = (currentRobotContext.orientation - 1 + 4) % 4;
                break;

            case 'FORWARD':
            case 'BACKWARD':
                // Execute movement commands for the specified quantity of steps.
                // The original code's movement logic is specifically replicated here.
                for (let stepCounter = 0; stepCounter < movementQuantity; stepCounter++) {
                    let coordinateDeltaX = 0;
                    let coordinateDeltaY = 0;

                    // Determine coordinate changes based on direction and command type.
                    // This logic mirrors the original if-else structure precisely.
                    if (primaryOperation === 'FORWARD') {
                        if (currentRobotContext.orientation === ROBOT_HEADING_NORTH) { // Direction 0
                            coordinateDeltaY = 1; // Move Y+
                        } else if (currentRobotContext.orientation === ROBOT_HEADING_EAST) { // Direction 1
                            coordinateDeltaX = 1; // Move X+
                        } else if (currentRobotContext.orientation === ROBOT_HEADING_SOUTH) { // Direction 2
                            coordinateDeltaY = -1; // Move Y-
                        } else if (currentRobotContext.orientation === ROBOT_HEADING_WEST) { // Direction 3 (Original had Y- here)
                            coordinateDeltaY = -1; // Replicating original's Y- for FORWARD WEST.
                        }
                    } else { // BACKWARD command
                        if (currentRobotContext.orientation === ROBOT_HEADING_NORTH) { // Direction 0
                            coordinateDeltaY = -1; // Move Y-
                        } else if (currentRobotContext.orientation === ROBOT_HEADING_EAST) { // Direction 1
                            coordinateDeltaX = -1; // Move X-
                        } else if (currentRobotContext.orientation === ROBOT_HEADING_SOUTH) { // Direction 2
                            coordinateDeltaY = 1; // Move Y+
                        } else if (currentRobotContext.orientation === ROBOT_HEADING_WEST) { // Direction 3 (Original had X+ here)
                            coordinateDeltaX = 1; // Replicating original's X+ for BACKWARD WEST.
                        }
                    }

                    // Apply the calculated coordinate changes.
                    currentRobotContext.currentX += coordinateDeltaX;
                    currentRobotContext.currentY += coordinateDeltaY;
                }
                break;

            default:
                // Unrecognized command; an error or warning could be logged here.
                // console.warn(`Encountered an unknown command: ${primaryOperation}. Ignoring.`);
                break;
        }

        // After each command, ensure the robot's position remains within the grid boundaries.
        // The grid is 1-indexed, so coordinates are clamped between 1 and the grid's dimensions.
        currentRobotContext.currentX = applyCoordinateConstraint(currentRobotContext.currentX, 1, gridPlaneWidth);
        currentRobotContext.currentY = applyCoordinateConstraint(currentRobotContext.currentY, 1, gridPlaneHeight);
    }

    // Output the final X and Y coordinates of the robot for the current scenario.
    // The original code effectively printed the 2nd and 3rd elements of its `xy` array.
    console.log(`${currentRobotContext.currentX} ${currentRobotContext.currentY}`);
}

// End of the robot simulation program.