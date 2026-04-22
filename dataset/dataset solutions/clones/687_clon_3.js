const fileSystemAccess = require('node:fs');

// Define constants for cardinal directions to improve readability
const DIRECTION_EAST = 0;
const DIRECTION_SOUTH = 1;
const DIRECTION_WEST = 2;
const DIRECTION_NORTH = 3;

// Define movement vectors [deltaX, deltaY] for each direction.
// These correspond to DIRECTION_EAST, DIRECTION_SOUTH, etc.
const coordinateChangeVectors = [
    [1, 0],  // East: X increases, Y stays same
    [0, 1],  // South: Y increases, X stays same
    [-1, 0], // West: X decreases, Y stays same
    [0, -1]  // North: Y decreases, X stays same
];

// Read the entire input stream from standard input
const fullInputBuffer = fileSystemAccess.readFileSync('/dev/stdin', 'utf8');

// Process the raw input: trim leading/trailing whitespace and split into an array of lines
const processedInputLines = fullInputBuffer.trim().split('\n');

// Initialize a pointer to keep track of the current line being read from the input array
let currentInputLinePointer = 0;

/**
 * Retrieves the next line from the pre-processed input array.
 * Advances the internal line pointer after retrieval.
 * @returns {string} The content of the next line.
 */
const fetchNextInputLine = () => {
    // Basic validation to prevent reading beyond the end of the input
    if (currentInputLinePointer >= processedInputLines.length) {
        // In a real-world scenario, this might throw an error or return a specific signal.
        // For this problem, we assume valid input structure.
        return "";
    }
    return processedInputLines[currentInputLinePointer++];
};

// Main loop to process multiple robot navigation scenarios.
// Each iteration handles one complete scenario until a termination signal is found.
for (;;) {
    const currentScenarioConfigLine = fetchNextInputLine();

    // The "0 0" string indicates the end of all scenarios and program termination.
    if (currentScenarioConfigLine === "0 0") {
        break; // Exit the main scenario loop
    }

    // Parse the grid dimensions for the current scenario.
    // The original problem interprets the first number as max Y, second as max X.
    const [gridBoundaryY, gridBoundaryX] = currentScenarioConfigLine.split(" ").map(Number);

    // Initialize the robot's state for the new scenario.
    // Using an object for clearer property names instead of array indices.
    let robotCurrentSituation = {
        facingDirection: DIRECTION_EAST, // Robot starts facing East (index 0)
        coordinateY: 1,                  // Robot starts at Y-coordinate 1 (1-indexed)
        coordinateX: 1                   // Robot starts at X-coordinate 1 (1-indexed)
    };

    // Inner loop to execute commands for the current robot scenario.
    // This loop continues until a "STOP" command is encountered.
    for (;;) {
        const rawCommandString = fetchNextInputLine();
        const commandParts = rawCommandString.split(" ");
        const commandIdentifier = commandParts[0];

        // Attempt to parse a numerical value for movement commands.
        // Default to 0 if no value is provided or if parsing fails (though commands typically have values).
        const commandMagnitude = commandParts.length > 1 ? parseInt(commandParts[1], 10) : 0;

        // Use a switch statement for clear and organized command handling.
        switch (commandIdentifier) {
            case "STOP":
                // This command signals the end of the current scenario's command sequence.
                break; // Exits the switch, will then break the inner loop.

            case "RIGHT":
                // Rotate the robot 90 degrees clockwise.
                // The modulo operator ensures the direction wraps around (0, 1, 2, 3 -> 0).
                robotCurrentSituation.facingDirection = (robotCurrentSituation.facingDirection + 1) % 4;
                break;

            case "LEFT":
                // Rotate the robot 90 degrees counter-clockwise.
                // Adding 4 before modulo handles negative results correctly for JavaScript's % operator.
                robotCurrentSituation.facingDirection = (robotCurrentSituation.facingDirection - 1 + 4) % 4;
                break;

            case "FORWARD":
            case "BACKWARD":
                // Determine the direction multiplier: 1 for FORWARD (move with facing), -1 for BACKWARD (move against facing).
                const movementDirectionMultiplier = (commandIdentifier === "FORWARD") ? 1 : -1;

                // Add a guard clause for invalid movement magnitude (e.g., non-positive steps).
                if (commandMagnitude <= 0) {
                    // Log a warning or handle as an error if commandMagnitude is invalid.
                    // console.warn(`Warning: ${commandIdentifier} received with non-positive magnitude: ${commandMagnitude}. Skipping movement.`);
                    break; // Skip the movement for this command.
                }

                // Apply the movement step by step for the specified magnitude.
                // This mimics the original `while(ary[1]--)` loop behavior.
                for (let i = 0; i < commandMagnitude; i++) {
                    const [deltaX, deltaY] = coordinateChangeVectors[robotCurrentSituation.facingDirection];
                    robotCurrentSituation.coordinateX += deltaX * movementDirectionMultiplier;
                    robotCurrentSituation.coordinateY += deltaY * movementDirectionMultiplier;
                }
                break;

            default:
                // Optional: Handle unrecognized commands gracefully.
                // console.warn(`Unrecognized command received: ${commandIdentifier}.`);
                break;
        }

        // If the command was "STOP", we need to exit the inner command loop.
        // The `break` inside the switch only exits the switch statement itself.
        if (commandIdentifier === "STOP") {
            break; // Exit the inner loop for commands.
        }

        // After each command (except STOP), enforce grid boundary constraints.
        // Robot's coordinates must stay within [1, gridBoundaryX] and [1, gridBoundaryY].
        robotCurrentSituation.coordinateY = Math.max(1, Math.min(robotCurrentSituation.coordinateY, gridBoundaryY));
        robotCurrentSituation.coordinateX = Math.max(1, Math.min(robotCurrentSituation.coordinateX, gridBoundaryX));
    }

    // Output the final Y and X coordinates for the current scenario.
    // The original code outputted Y then X, so we preserve that order.
    console.log(`${robotCurrentSituation.coordinateY} ${robotCurrentSituation.coordinateX}`);
}

// Program execution completes.