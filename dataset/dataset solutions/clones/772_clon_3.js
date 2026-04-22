const xCoordinateModifiers = {
    'N': 0,
    'S': 0,
    'E': 1,
    'W': -1
};

const yCoordinateModifiers = {
    'N': 1,
    'S': -1,
    'E': 0,
    'W': 0
};

/**
 * Executes a simulation based on provided game input,
 * involving robot movement on a grid and collecting targets.
 * @param {string} rawSimulationData - The complete input string containing all test cases.
 */
function ExecuteSimulation(rawSimulationData) {
    // Split the entire input data into individual lines for easier processing.
    const simulationInputLines = rawSimulationData.split('\n');
    let currentInputLinePointer = 0;

    // Define constants for the game board dimensions and initial robot position.
    const GRID_DIMENSION = 21; // The board is 21x21 (0-20).
    const INITIAL_ROBOT_X = 10;
    const INITIAL_ROBOT_Y = 10;

    // Main loop to process multiple test cases until a termination condition is met.
    while (true) {
        // Read the number of target locations for the current test case.
        // The 'Number()' constructor is used for explicit type conversion from string to integer.
        const numberOfTargets = Number(simulationInputLines[currentInputLinePointer++]);

        // If the number of targets is zero, it signifies the end of input.
        if (numberOfTargets === 0) {
            break; // Exit the simulation loop.
        }

        // Initialize the game board. It's a 2D array representing the grid.
        // Each cell initially indicates no target present (false).
        const gameGrid = Array.from({ length: GRID_DIMENSION }, () =>
            Array.from({ length: GRID_DIMENSION }, () => false)
        );

        // Populate the game board with target locations.
        // Each target's coordinates are read from the input.
        for (let targetIndex = 0; targetIndex < numberOfTargets; targetIndex++) {
            const coordinateLineParts = simulationInputLines[currentInputLinePointer].split(' ');
            const targetXCoord = Number(coordinateLineParts[0]);
            const targetYCoord = Number(coordinateLineParts[1]);

            // Basic validation for coordinates to ensure they are within grid bounds.
            if (targetXCoord >= 0 && targetXCoord < GRID_DIMENSION &&
                targetYCoord >= 0 && targetYCoord < GRID_DIMENSION) {
                gameGrid[targetXCoord][targetYCoord] = true; // Mark this cell as containing a target.
            }
            currentInputLinePointer++; // Move to the next input line.
        }

        // Read the total number of movement instructions for the current test case.
        const totalMovementInstructions = Number(simulationInputLines[currentInputLinePointer++]);

        // Arrays to store movement directions and corresponding step counts.
        const movementInstructionDirections = [];
        const movementInstructionSteps = [];

        // Parse all movement instructions.
        for (let instructionIndex = 0; instructionIndex < totalMovementInstructions; instructionIndex++) {
            const instructionLineParts = simulationInputLines[currentInputLinePointer].split(' ');
            movementInstructionDirections[instructionIndex] = instructionLineParts[0]; // e.g., 'N', 'S'
            movementInstructionSteps[instructionIndex] = Number(instructionLineParts[1]); // e.g., 5, 10
            currentInputLinePointer++; // Advance input line pointer.
        }

        // Initialize robot's starting position and counter for collected items.
        // A game state object encapsulates these related variables for better organization.
        let gameState = {
            robotCurrentX: INITIAL_ROBOT_X,
            robotCurrentY: INITIAL_ROBOT_Y,
            collectedItemsCount: 0
        };

        // Check if the initial position itself contains a target.
        // This is a pre-movement check for the starting cell.
        if (gameGrid[gameState.robotCurrentX][gameState.robotCurrentY]) {
            gameGrid[gameState.robotCurrentX][gameState.robotCurrentY] = false; // "Collect" the target.
            gameState.collectedItemsCount++; // Increment count.
        }

        // Process each movement instruction sequentially.
        for (let instructionIdx = 0; instructionIdx < totalMovementInstructions; instructionIdx++) {
            const currentDirection = movementInstructionDirections[instructionIdx];
            const stepsToTake = movementInstructionSteps[instructionIdx];

            // Validate the direction. If invalid, skip this instruction to prevent errors.
            if (!xCoordinateModifiers.hasOwnProperty(currentDirection)) {
                // In a real application, one might log this error or throw an exception.
                continue;
            }

            // Move the robot step by step for the given distance.
            for (let step = 0; step < stepsToTake; step++) {
                // Update robot's coordinates based on the current direction.
                gameState.robotCurrentX += xCoordinateModifiers[currentDirection];
                gameState.robotCurrentY += yCoordinateModifiers[currentDirection];

                // Add a guard clause for boundary checks. If the robot moves out of bounds,
                // it cannot collect targets. This prevents array out-of-bounds access.
                if (gameState.robotCurrentX < 0 || gameState.robotCurrentX >= GRID_DIMENSION ||
                    gameState.robotCurrentY < 0 || gameState.robotCurrentY >= GRID_DIMENSION) {
                    // Robot moved out of bounds. Any targets outside the grid are unreachable.
                    continue; // Skip target check if out of bounds.
                }

                // Check if the new valid position contains a target.
                if (gameGrid[gameState.robotCurrentX][gameState.robotCurrentY]) {
                    gameGrid[gameState.robotCurrentX][gameState.robotCurrentY] = false; // Mark as collected.
                    gameState.collectedItemsCount++; // Increment collected count.
                }
            }
        }

        // Determine if all targets were successfully collected.
        const allTargetsRetrieved = (gameState.collectedItemsCount === numberOfTargets);

        // Output the result for the current test case.
        if (allTargetsRetrieved) {
            console.log("Yes");
        } else {
            console.log("No");
        }
    }
}

// Entry point: Read input from standard input and pass it to the simulation function.
ExecuteSimulation(require("fs").readFileSync("/dev/stdin", "utf8"));