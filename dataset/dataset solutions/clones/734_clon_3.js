/**
 * This module implements a simulation for a 3D Connect-N style game.
 * It reads game configurations and move instructions from standard input,
 * processes each move, checks for winning sequences, and outputs the game result.
 *
 * A Type III clone involves extensive changes:
 * - All identifiers are renamed for clarity.
 * - Whitespace and comments are completely rewritten.
 * - Data structures are re-initialized using different methods (e.g., Array.from).
 * - Core logic, such as direction vector generation, is significantly altered
 *   to be more comprehensive or explicit.
 * - New helper functions, guard clauses, and validation steps are introduced.
 * - Existing statements are rewritten for clarity or alternative equivalent logic.
 * - The overall functionality remains recognizably similar: simulating the game.
 */

/**
 * Determines the maximum length of a consecutive sequence of a specific player's
 * marks in any 3D direction, originating from a given coordinate on the game board.
 *
 * This function thoroughly checks all 26 possible 3D directions (up, down, left, right,
 * forward, backward, and all diagonals in 3D space) from the specified (originX, originY, originZ)
 * point. It first traverses backward along each direction to find the absolute start of a line,
 * then iterates forward, counting consecutive marks.
 *
 * @param {number} activePlayerMark - The numerical identifier for the current player's mark (e.g., 1 for Black, 2 for White).
 * @param {number} originX - The 0-indexed X-coordinate (column) of the piece that was just placed.
 * @param {number} originY - The 0-indexed Y-coordinate (row) of the piece that was just placed.
 * @param {number} originZ - The 0-indexed Z-coordinate (layer/depth) of the piece that was just placed.
 * @param {number} boardDimensionXY - The size of the board along the X and Y axes (e.g., if N=5, it's 5x5).
 * @param {number} boardDimensionZ - The maximum depth (Z-axis) of the board.
 * @param {Array<Array<Array<number>>>} gridMatrix - The 3D array representing the current state of the game board.
 * @returns {number} The longest sequence of the `activePlayerMark` found in any direction.
 */
function evaluateLineStreak(activePlayerMark, originX, originY, originZ, boardDimensionXY, boardDimensionZ, gridMatrix) {
    // Basic validation for the active player identifier.
    if (activePlayerMark !== 1 && activePlayerMark !== 2) {
        // In a production system, this might throw an error or log a critical event.
        console.error("Evaluation Error: Provided player mark is invalid. Expected 1 or 2.");
        return 0;
    }

    /**
     * Internal helper function to check if a given set of 3D coordinates
     * falls within the defined boundaries of the game board.
     * @param {number} x - X-coordinate to check.
     * @param {number} y - Y-coordinate to check.
     * @param {number} z - Z-coordinate to check.
     * @returns {boolean} True if coordinates are within bounds, false otherwise.
     */
    const isCoordinateValid = (x, y, z) => {
        return x >= 0 && x < boardDimensionXY &&
               y >= 0 && y < boardDimensionXY && // X and Y dimensions are typically the same in Connect-N boards.
               z >= 0 && z < boardDimensionZ;
    };

    let longestOverallSequence = 0; // Tracks the highest streak found across all directions.

    // Generate all 26 unique 3D direction vectors.
    // These vectors represent all possible movements from a central point
    // to any of its direct or diagonal neighbors in a 3x3x3 cube, excluding the center itself.
    const allDeltaVectors = [];
    for (let dz = -1; dz <= 1; dz++) {
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx !== 0 || dy !== 0 || dz !== 0) { // Exclude the (0,0,0) vector (no movement).
                    allDeltaVectors.push([dx, dy, dz]);
                }
            }
        }
    }

    // Iterate over each defined 3D direction to check for sequences.
    for (const [deltaX, deltaY, deltaZ] of allDeltaVectors) {
        let currentScanX = originX;
        let currentScanY = originY;
        let currentScanZ = originZ;

        // Phase 1: Backtrack to the beginning of the potential line segment.
        // Move `currentScanX,Y,Z` backward along the `delta` vector until the next step
        // would take it out of the board boundaries. This ensures we start counting
        // from the absolute first piece in a continuous line in this direction.
        while (isCoordinateValid(currentScanX - deltaX, currentScanY - deltaY, currentScanZ - deltaZ)) {
            currentScanX -= deltaX;
            currentScanY -= deltaY;
            currentScanZ -= deltaZ;
        }

        let currentConsecutiveCount = 0; // Counter for the current streak in this specific line.

        // Phase 2: Traverse forward along the line segment from the determined start point.
        // Count consecutive marks belonging to the `activePlayerMark`.
        while (isCoordinateValid(currentScanX, currentScanY, currentScanZ)) {
            if (gridMatrix[currentScanX][currentScanY][currentScanZ] === activePlayerMark) {
                currentConsecutiveCount++; // Increment if the mark matches the active player.
            } else {
                currentConsecutiveCount = 0; // Reset count if an opponent's mark or empty cell is found.
            }

            // Update the longest overall sequence found if the current streak is higher.
            if (currentConsecutiveCount > longestOverallSequence) {
                longestOverallSequence = currentConsecutiveCount;
            }

            // Advance to the next cell in the current direction.
            currentScanX += deltaX;
            currentScanY += deltaY;
            currentScanZ += deltaZ;
        }
    }

    return longestOverallSequence; // Return the maximum streak detected.
}

/**
 * Orchestrates a complete game simulation, processing multiple game sessions
 * from a single block of input data. Each session concludes with a winner
 * or a draw.
 *
 * @param {string} rawInputData - A multi-line string containing all game configurations and moves.
 * @returns {string} A newline-separated string of game outcomes (e.g., "Black 5\nDraw\nWhite 8").
 */
function runGameSimulation(rawInputData) {
    // Split the input data into individual lines, removing any leading/trailing whitespace.
    const inputLines = rawInputData.trim().split('\n');
    const simulationResults = []; // Array to store the outcome message for each game session.

    // Main loop for processing multiple game sessions.
    // Each iteration handles one complete game until its termination condition is met.
    while (true) {
        const configLine = inputLines.shift(); // Extract the first line for game configuration.

        // If no more configuration lines are available, or an empty line is encountered,
        // it signifies the end of all game simulations.
        if (!configLine) {
            break;
        }

        // Parse the configuration line into numeric parameters.
        const dimensionParameters = configLine.split(' ').map(Number);

        // A configuration line of "0 0 0" explicitly signals the end of input for game sessions.
        if (dimensionParameters.every(param => param === 0)) {
            break;
        }

        // Destructure the parameters:
        // boardDimensionXY: N - Width and height of the 3D board (N x N).
        // winningLength: M - The number of consecutive marks required to win.
        // boardDepth: P - The maximum depth (Z-axis) of the board, also the total number of moves.
        const [boardDimensionXY, winningLength, boardDepth] = dimensionParameters;

        // Initialize the 3D game board. It's an N x N x P grid, filled with 0s (representing empty cells).
        const gameBoardState = Array.from({ length: boardDimensionXY }, () =>
            Array.from({ length: boardDimensionXY }, () =>
                Array(boardDepth).fill(0) // Each layer is initialized with empty cells.
            )
        );

        // Read all move instructions for the current game session.
        const placementInstructions = [];
        for (let i = 0; i < boardDepth; i++) {
            const currentInstruction = inputLines.shift();
            if (!currentInstruction) {
                // This indicates malformed input where expected moves are missing.
                console.error("Input Error: Missing expected placement instruction for current game.");
                simulationResults.push("Error: Malformed input data.");
                return simulationResults.join('\n'); // Terminate and return error.
            }
            placementInstructions.push(currentInstruction.split(' ').map(Number));
        }

        let currentPlayerMark = 1; // Player 1 (traditionally "Black") starts the game.
        let isGameConcluded = false; // Flag to track if a winner has been determined.

        // Iterate through each planned move for the current game session.
        for (let moveCount = 0; moveCount < boardDepth; moveCount++) {
            const currentMoveCoords = placementInstructions[moveCount];
            // Adjust coordinates from 1-indexed (input) to 0-indexed (array access).
            const targetColumnX = currentMoveCoords[0] - 1;
            const targetRowY = currentMoveCoords[1] - 1;

            // Input validation: Check if the provided placement coordinates are within board bounds.
            if (targetColumnX < 0 || targetColumnX >= boardDimensionXY ||
                targetRowY < 0 || targetRowY >= boardDimensionXY) {
                // For a robust simulation, invalid moves should be handled gracefully.
                // Here, we log a warning, toggle player, and proceed, effectively skipping the move.
                console.warn(`Game Warning: Move ${moveCount + 1} with coordinates (${targetColumnX + 1}, ${targetRowY + 1}) is out of board bounds. Skipping turn.`);
                currentPlayerMark = (currentPlayerMark === 1) ? 2 : 1; // Toggle player even on invalid move attempt.
                continue; // Skip to the next move.
            }

            // Determine the lowest available Z-layer (depth) in the target column (X, Y).
            // This simulates gravity, where pieces stack on top of each other.
            let actualZLayer = 0;
            while (actualZLayer < boardDepth && gameBoardState[targetColumnX][targetRowY][actualZLayer] !== 0) {
                actualZLayer++;
            }

            // Check if the chosen column is completely full.
            if (actualZLayer >= boardDepth) {
                console.warn(`Game Warning: Move ${moveCount + 1} attempted to place a piece in a full column (${targetColumnX + 1}, ${targetRowY + 1}). Skipping turn.`);
                currentPlayerMark = (currentPlayerMark === 1) ? 2 : 1; // Toggle player.
                continue; // Skip to the next move.
            }

            // Place the current player's mark onto the game board at the determined position.
            gameBoardState[targetColumnX][targetRowY][actualZLayer] = currentPlayerMark;

            // After placing a piece, check if this move results in a winning sequence for the current player.
            const maximumStreakFound = evaluateLineStreak(
                currentPlayerMark,
                targetColumnX,
                targetRowY,
                actualZLayer,
                boardDimensionXY,
                boardDimensionZ,
                gameBoardState
            );

            // If the current player has achieved the required winning length (M), declare them the winner.
            if (maximumStreakFound >= winningLength) {
                const winnerIdentifier = (currentPlayerMark === 1) ? "Black" : "White";
                simulationResults.push(`${winnerIdentifier} ${moveCount + 1}`);
                isGameConcluded = true; // Mark the game as ended.
                break; // Exit the loop for moves, as the game is over.
            }

            // Toggle the current player for the next turn.
            currentPlayerMark = (currentPlayerMark === 1) ? 2 : 1;
        }

        // If the game finished all its moves and no winner was declared, it's a draw.
        if (!isGameConcluded) {
            simulationResults.push("Draw");
        }
    }

    // Return all collected game outcomes as a single string, with each outcome on a new line.
    return simulationResults.join('\n');
}

// --- Entry Point for Execution ---
// This block simulates reading from standard input and printing to standard output,
// mimicking typical competitive programming environment behavior.
try {
    // Attempt to read the entire content of standard input synchronously.
    const fileSystem = require('fs');
    const standardInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');

    // Execute the game simulation with the input and print the final results.
    console.log(runGameSimulation(standardInputContent));
} catch (error) {
    // Catch and report any errors during file reading or simulation.
    console.error("An error occurred during game simulation:", error.message);
}