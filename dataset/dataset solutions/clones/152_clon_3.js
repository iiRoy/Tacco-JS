// Core module for file system operations, required for standard input processing
const fileSystemModule = require('fs');

/**
 * Reads synchronous input from the standard input stream (stdin) and processes it
 * into a grid-like structure. Each line of the input is treated as a row in the
 * labyrinth layout, where characters (expected to be '0' or '1') represent
 * path segments.
 *
 * @returns {string[]} An array of strings, where each string represents a row
 *                     of the labyrinth grid. Returns an empty array if input is
 *                     unavailable or errors occur.
 */
function acquireLabyrinthLayout() {
    try {
        // Obtain metadata about the standard input file descriptor to determine its size.
        const streamMetadata = fileSystemModule.fstatSync(process.stdin.fd);
        const totalDataVolume = streamMetadata.size;

        // If no data is present, immediately return an empty array to indicate no layout.
        if (totalDataVolume === 0) {
            return [];
        }

        // Allocate a new Buffer of the determined size to store the incoming data.
        const inputMemoryBlock = Buffer.alloc(totalDataVolume);

        // Synchronously read data from stdin into the allocated buffer.
        // The last argument (offset) is 0, indicating reading from the beginning of the stream.
        const actualBytesTransferred = fileSystemModule.readSync(
            process.stdin.fd,
            inputMemoryBlock,
            0,
            totalDataVolume,
            0
        );

        // Convert the buffer's contents to a UTF-8 string, remove leading/trailing whitespace,
        // and then split it into an array of lines based on newline characters.
        const rawInputStringContent = inputMemoryBlock.toString('utf8', 0, actualBytesTransferred);
        const processedLineSegments = rawInputStringContent.trim().split('\n');

        // Provide a warning if the input appears to be empty after processing.
        if (processedLineSegments.length === 0 || (processedLineSegments.length === 1 && processedLineSegments[0] === '')) {
            console.error("Warning: The provided labyrinth layout from stdin appears to be empty or malformed.");
            return [];
        }

        return processedLineSegments;
    } catch (operationError) {
        // Catch and log any errors encountered during the input reading process.
        console.error("An error occurred while attempting to read labyrinth layout from stdin:", operationError.message);
        return []; // Return empty layout on error to prevent further crashes.
    }
}

// Define symbolic constants for movement directions to improve code clarity and reduce magic strings.
const DIRECTION_UP = 'U';
const DIRECTION_DOWN = 'D';
const DIRECTION_LEFT = 'L';
const DIRECTION_RIGHT = 'R';

/**
 * Safely retrieves and converts a specific path segment's value from the labyrinth grid.
 * This function handles potential out-of-bounds access by returning 0 (representing no path)
 * if the requested coordinates are outside the grid's boundaries.
 *
 * @param {string[]} gridMatrix The labyrinth grid, represented as an array of strings.
 * @param {number} rowIdx The row index of the path segment.
 * @param {number} colIdx The column index of the path segment.
 * @returns {number} Returns 1 if a path segment exists at the given coordinates, otherwise 0.
 */
function getPathSegmentValue(gridMatrix, rowIdx, colIdx) {
    // Check if the row index is within the vertical bounds of the grid.
    if (rowIdx < 0 || rowIdx >= gridMatrix.length) {
        return 0; // Row is out of bounds, no path.
    }
    const targetRow = gridMatrix[rowIdx];
    // Check if the column index is within the horizontal bounds of the specific row.
    if (colIdx < 0 || colIdx >= targetRow.length) {
        return 0; // Column is out of bounds, no path.
    }
    // Convert the character at the specified grid cell to a number.
    // '1' becomes 1, '0' becomes 0. Non-numeric characters would become NaN, then 0.
    return Number(targetRow[colIdx]);
}

/**
 * Defines the prioritized movement strategies for the robot based on its current
 * facing direction. Each strategy includes the new direction, coordinate changes,
 * functions to calculate the relevant path segment's row/column, and a specific
 * boundary check condition (as per the original algorithm's logic).
 * The 'default' type strategy is always the last resort if no 'preferred' moves are possible.
 */
const traversalDecisionTree = {
    [DIRECTION_LEFT]: [
        // Priority 1: Attempt to turn DOWN
        { type: 'preferred', nextDirection: DIRECTION_DOWN,  deltaY: 1,  deltaX: 0, pathRowCalc: (y) => 2 * y + 1, pathColCalc: (x) => x,
          rowBoundaryCondition: (grid, y) => (2 * y + 1) < grid.length },
        // Priority 2: Attempt to continue LEFT
        { type: 'preferred', nextDirection: DIRECTION_LEFT,  deltaX: -1, deltaY: 0, pathRowCalc: (y) => 2 * y,   pathColCalc: (x) => x - 1,
          rowBoundaryCondition: (grid, y) => true }, // No explicit row boundary check in original for this segment
        // Priority 3: Attempt to turn UP
        { type: 'preferred', nextDirection: DIRECTION_UP,    deltaY: -1, deltaX: 0, pathRowCalc: (y) => 2 * y - 1, pathColCalc: (x) => x,
          rowBoundaryCondition: (grid, y) => y >= 1 }, // Original `uy > 0` translates to `2*y-1 > 0` or `y >= 1`
        // Default/Fallback: Turn RIGHT
        { type: 'default',   nextDirection: DIRECTION_RIGHT, deltaX: 1,  deltaY: 0, pathRowCalc: (y) => 2 * y,   pathColCalc: (x) => x,
          rowBoundaryCondition: (grid, y) => true } // No explicit row boundary check in original for this segment
    ],
    [DIRECTION_RIGHT]: [
        // Priority 1: Attempt to turn UP
        { type: 'preferred', nextDirection: DIRECTION_UP,    deltaY: -1, deltaX: 0, pathRowCalc: (y) => 2 * y - 1, pathColCalc: (x) => x,
          rowBoundaryCondition: (grid, y) => y >= 1 },
        // Priority 2: Attempt to continue RIGHT
        { type: 'preferred', nextDirection: DIRECTION_RIGHT, deltaX: 1,  deltaY: 0, pathRowCalc: (y) => 2 * y,   pathColCalc: (x) => x,
          rowBoundaryCondition: (grid, y) => true },
        // Priority 3: Attempt to turn DOWN
        { type: 'preferred', nextDirection: DIRECTION_DOWN,  deltaY: 1,  deltaX: 0, pathRowCalc: (y) => 2 * y + 1, pathColCalc: (x) => x,
          rowBoundaryCondition: (grid, y) => (2 * y + 1) < grid.length },
        // Default/Fallback: Turn LEFT
        { type: 'default',   nextDirection: DIRECTION_LEFT,  deltaX: -1, deltaY: 0, pathRowCalc: (y) => 2 * y,   pathColCalc: (x) => x - 1,
          rowBoundaryCondition: (grid, y) => true }
    ],
    [DIRECTION_DOWN]: [
        // Priority 1: Attempt to turn RIGHT
        { type: 'preferred', nextDirection: DIRECTION_RIGHT, deltaX: 1,  deltaY: 0, pathRowCalc: (y) => 2 * y,   pathColCalc: (x) => x,
          rowBoundaryCondition: (grid, y) => true },
        // Priority 2: Attempt to continue DOWN
        { type: 'preferred', nextDirection: DIRECTION_DOWN,  deltaY: 1,  deltaX: 0, pathRowCalc: (y) => 2 * y + 1, pathColCalc: (x) => x,
          rowBoundaryCondition: (grid, y) => (2 * y + 1) < grid.length },
        // Priority 3: Attempt to turn LEFT
        { type: 'preferred', nextDirection: DIRECTION_LEFT,  deltaX: -1, deltaY: 0, pathRowCalc: (y) => 2 * y,   pathColCalc: (x) => x - 1,
          rowBoundaryCondition: (grid, y) => true },
        // Default/Fallback: Turn UP
        { type: 'default',   nextDirection: DIRECTION_UP,    deltaY: -1, deltaX: 0, pathRowCalc: (y) => 2 * y - 1, pathColCalc: (x) => x,
          rowBoundaryCondition: (grid, y) => true }
    ],
    [DIRECTION_UP]: [
        // Priority 1: Attempt to turn LEFT
        { type: 'preferred', nextDirection: DIRECTION_LEFT,  deltaX: -1, deltaY: 0, pathRowCalc: (y) => 2 * y,   pathColCalc: (x) => x - 1,
          rowBoundaryCondition: (grid, y) => true },
        // Priority 2: Attempt to continue UP
        { type: 'preferred', nextDirection: DIRECTION_UP,    deltaY: -1, deltaX: 0, pathRowCalc: (y) => 2 * y - 1, pathColCalc: (x) => x,
          rowBoundaryCondition: (grid, y) => y >= 1 },
        // Priority 3: Attempt to turn RIGHT
        { type: 'preferred', nextDirection: DIRECTION_RIGHT, deltaX: 1,  deltaY: 0, pathRowCalc: (y) => 2 * y,   pathColCalc: (x) => x,
          rowBoundaryCondition: (grid, y) => true },
        // Default/Fallback: Turn DOWN
        { type: 'default',   nextDirection: DIRECTION_DOWN,  deltaY: 1,  deltaX: 0, pathRowCalc: (y) => 2 * y + 1, pathColCalc: (x) => x,
          rowBoundaryCondition: (grid, y) => true }
    ]
};

/**
 * Initiates and manages the robot's traversal through the labyrinth.
 * The robot begins at coordinates (0,0) facing RIGHT and follows a predefined
 * set of prioritized movement rules. The traversal continues until the robot
 * successfully returns to its starting point.
 */
function navigateLabyrinth() {
    const labyrinthGrid = acquireLabyrinthLayout();

    // If the labyrinth grid is empty, log an empty string and exit, as there's nothing to navigate.
    if (labyrinthGrid.length === 0) {
        console.log("");
        return;
    }

    // Initialize the robot's state: current position, facing direction, and a log of its path.
    let currentPositionX = 0;
    let currentPositionY = 0;
    let currentFacingDirection = DIRECTION_RIGHT; // The robot always starts facing right.
    let traversalLog = ''; // String to append each movement direction.

    // Introduce a safeguard against infinite loops, useful for debugging or malformed inputs.
    const maximumTraversalSteps = 100000; // Arbitrary limit to prevent runaway execution.
    let currentStepCount = 0;

    // The main loop for the labyrinth navigation process.
    while (true) {
        // Check for the maximum step limit to prevent infinite loops.
        if (currentStepCount >= maximumTraversalSteps) {
            console.error("Traversal aborted: Maximum step limit reached. This might indicate an infinite loop in the labyrinth path or a non-terminating maze.");
            break; // Exit the loop if the step limit is exceeded.
        }
        currentStepCount++; // Increment the step counter for each iteration.

        let chosenMovementStrategy = null;
        const availableStrategies = traversalDecisionTree[currentFacingDirection];

        // Iterate through the prioritized strategies for the current direction.
        for (let i = 0; i < availableStrategies.length; i++) {
            const strategyCandidate = availableStrategies[i];

            // If a 'default' strategy is encountered and no 'preferred' move has been selected yet,
            // this strategy is automatically chosen as the last resort.
            if (strategyCandidate.type === 'default') {
                if (!chosenMovementStrategy) {
                    chosenMovementStrategy = strategyCandidate;
                }
                break; // A default strategy is always the last in the list, so no further checks are needed.
            }

            // For 'preferred' strategies, both the specific row boundary condition and the path segment's value must be true.
            const pathSegmentCalculatedRow = strategyCandidate.pathRowCalc(currentPositionY, currentPositionX);
            const pathSegmentCalculatedCol = strategyCandidate.pathColCalc(currentPositionX); // Note: pathColCalc might only depend on X

            if (strategyCandidate.rowBoundaryCondition(labyrinthGrid, currentPositionY) &&
                getPathSegmentValue(labyrinthGrid, pathSegmentCalculatedRow, pathSegmentCalculatedCol) === 1) {
                chosenMovementStrategy = strategyCandidate;
                break; // A valid preferred move has been found, so stop checking other strategies.
            }
        }

        // Apply the chosen movement strategy to update the robot's state.
        if (chosenMovementStrategy) {
            currentFacingDirection = chosenMovementStrategy.nextDirection;
            currentPositionX += chosenMovementStrategy.deltaX; // Update X coordinate
            currentPositionY += chosenMovementStrategy.deltaY; // Update Y coordinate
            traversalLog += currentFacingDirection; // Record the movement.
        } else {
            // This scenario should ideally not occur if a 'default' strategy is always present.
            console.error("Critical Error: No valid movement strategy could be determined for the current state. Exiting navigation loop.");
            break;
        }

        // Check if the robot has successfully returned to its initial starting point (0,0).
        if (currentPositionX === 0 && currentPositionY === 0) {
            break; // The traversal is complete.
        }
    }

    // Output the recorded sequence of movements.
    console.log(traversalLog);
}

// Execute the labyrinth navigation process.
navigateLabyrinth();