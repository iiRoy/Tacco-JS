/*
 * This program processes a series of grid-based pathfinding scenarios.
 * For each scenario, it determines if a path can be found from a starting
 * point to a specific 'depth' or level, adhering to certain movement rules
 * and safe zone restrictions at each level.
 *
 * The core logic involves a recursive depth-first search (DFS) that explores
 * possible moves. At each step, it checks if the current position is within
 * a dynamically defined "safe zone" for that particular depth level.
 *
 * Input format for each scenario (terminated by "0 0"):
 * 1. Two integers: initialRow initialCol (e.g., "1 1")
 * 2. One integer: targetDepth (e.g., "5")
 * 3. A space-separated list of integers: restrictedZoneData (x0 y0 x1 y1 ... xN yN)
 *    Each pair (x_i, y_i) defines the center of a 3x3 safe zone for level 'i'.
 */

// Define the grid dimensions. The problem implies a 10x10 grid.
const GRID_DIMENSION = 10;

// Define the relative movement offsets for the "knight-like" moves.
// These arrays specify 12 distinct moves (deltaRow, deltaCol) from a current tile.
const KNIGHT_MOVE_OFFSETS_ROW = [-1, 0, 1, -2, 2, -2, 2, -2, 2, -1, 0, 1];
const KNIGHT_MOVE_OFFSETS_COL = [-2, -2, -2, -1, -1, 0, 0, 1, 1, 2, 2, 2];

/**
 * Generates a unique string key for a given row and column coordinate.
 * This helper function is used for efficient lookup in the allowed tiles map.
 * @param {number} r - The row index.
 * @param {number} c - The column index.
 * @returns {string} A string representation of the coordinate, typically "row_col".
 */
function generateCoordinateKey(r, c) {
    return `${r}_${c}`;
}

/**
 * Recursively explores possible paths on a grid, attempting to reach the maximum
 * possible depth while adhering to movement rules and level-specific safe zones.
 * This function updates a shared tracker for the deepest level found across all paths.
 *
 * @param {number} currentRow - The current row index of the explorer.
 * @param {number} currentCol - The current column index of the explorer.
 * @param {number} currentLevel - The current depth level reached in the path.
 * @param {number[]} deepestLevelTracker - An array containing a single number,
 *                                         representing the maximum depth found so far.
 *                                         It's used to simulate pass-by-reference.
 * @param {number} requiredLevel - The target depth level that needs to be achieved
 *                                 for a successful outcome (i.e., "OK").
 * @param {number[]} restrictedZonesData - An array defining the center points of 3x3
 *                                         safe zones for each level. The format is
 *                                         [x0, y0, x1, y1, ...], where (x_i, y_i)
 *                                         is the center for level 'i'.
 * @returns {void} This function updates `deepestLevelTracker` as a side effect.
 */
function findMaxDepth(
    currentRow,
    currentCol,
    currentLevel,
    deepestLevelTracker,
    requiredLevel,
    restrictedZonesData
) {
    // Update the maximum depth observed so far with the current level.
    deepestLevelTracker[0] = Math.max(deepestLevelTracker[0], currentLevel);

    // Early exit optimization: If the target level has already been met or surpassed,
    // there's no need to explore further down this particular path.
    if (deepestLevelTracker[0] >= requiredLevel) {
        return;
    }

    // Determine the center coordinates for the 3x3 safe zone at the current level.
    // The `restrictedZonesData` array stores (x, y) pairs consecutively.
    const zoneCenterX = restrictedZonesData[currentLevel * 2];
    const zoneCenterY = restrictedZonesData[currentLevel * 2 + 1];

    // Guard clause: If the current level exceeds the available restricted zone data,
    // it implies no safe zone is defined for this level, so we stop exploring.
    if (zoneCenterX === undefined || zoneCenterY === undefined) {
        return;
    }

    // Create a Map to store all coordinates that are considered "safe" for the current level.
    // This map defines a 3x3 square centered around (zoneCenterX, zoneCenterY).
    const allowedTilesMap = new Map();
    for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
        for (let colOffset = -1; colOffset <= 1; colOffset++) {
            const safeTileRow = zoneCenterX + rowOffset;
            const safeTileCol = zoneCenterY + colOffset;
            allowedTilesMap.set(generateCoordinateKey(safeTileRow, safeTileCol), true);
        }
    }

    // Iterate through all 12 possible knight-like moves from the current position.
    for (let moveIndex = 0; moveIndex < KNIGHT_MOVE_OFFSETS_ROW.length; moveIndex++) {
        const nextRow = currentRow + KNIGHT_MOVE_OFFSETS_ROW[moveIndex];
        const nextCol = currentCol + KNIGHT_MOVE_OFFSETS_COL[moveIndex];

        // Boundary check: Ensure the potential next position is within the defined grid.
        if (
            nextRow < 0 ||
            nextCol < 0 ||
            nextRow >= GRID_DIMENSION ||
            nextCol >= GRID_DIMENSION
        ) {
            continue; // Skip this move if it leads out of bounds.
        }

        // Check if the potential next tile is within the allowed safe zone for the current level.
        if (allowedTilesMap.has(generateCoordinateKey(nextRow, nextCol))) {
            // If the move is valid and the destination tile is safe, recurse to the next level.
            findMaxDepth(
                nextRow,
                nextCol,
                currentLevel + 1, // Increment level for the recursive call
                deepestLevelTracker,
                requiredLevel,
                restrictedZonesData
            );

            // Another early exit optimization: If the target level was already met
            // during a deeper recursive call originating from this branch, we can
            // immediately return to prune further exploration of this branch.
            if (deepestLevelTracker[0] >= requiredLevel) {
                return;
            }
        }
    }
}

// Main program execution block.
// Encapsulate the main logic in a try-catch block for robust error handling.
try {
    // Read the entire input from standard input as a single string.
    const rawDataInput = require('fs').readFileSync('/dev/stdin', 'utf8');

    // Split the input string into an array of lines, removing any leading/trailing
    // whitespace from the overall input first.
    let inputLines = rawDataInput.trim().split('\n');

    // Process each scenario from the input lines until a termination condition is met
    // or no more input lines are available.
    while (inputLines.length > 0) {
        // Retrieve and parse the line containing the initial position for the current scenario.
        const currentPositionLine = inputLines.shift();

        // Guard against an unexpected empty line, which could happen if input ends abruptly.
        if (!currentPositionLine) {
            break;
        }

        const initialPosition = currentPositionLine.split(' ').map(Number);

        // Extract the starting row and column coordinates.
        const startRow = initialPosition[0];
        const startCol = initialPosition[1];

        // Termination condition: If the starting coordinates are (0, 0), exit the processing loop.
        if (startRow === 0 && startCol === 0) {
            break;
        }

        // Retrieve and parse the target depth required for this scenario.
        const targetDepthString = inputLines.shift();
        const targetDepth = Number(targetDepthString);

        // Basic validation for the target depth. If invalid, log an error and skip this scenario.
        if (isNaN(targetDepth) || targetDepth < 0) {
            console.error(`Error: Invalid target depth '${targetDepthString}' in input. Skipping scenario.`);
            // Consume the next line which would be restrictedZonesData for consistency in input parsing.
            if (inputLines.length > 0) {
                inputLines.shift();
            }
            continue; // Move to the next scenario.
        }

        // Retrieve and parse the data defining the safe zones at various levels.
        const restrictedZonesDataString = inputLines.shift();
        const restrictedZonesData = restrictedZonesDataString.split(' ').map(Number);

        // Basic validation for restricted zones data.
        if (restrictedZonesData.some(isNaN)) {
             console.error(`Error: Invalid restricted zones data '${restrictedZonesDataString}' in input. Skipping scenario.`);
             continue; // Move to the next scenario.
        }

        // Initialize a tracker for the deepest level found during the pathfinding.
        // An array is used here to simulate pass-by-reference, allowing the recursive
        // function to update a single shared value.
        const deepestLevelTracker = [0];

        // Initiate the recursive pathfinding process from the initial position at level 0.
        findMaxDepth(
            startRow,
            startCol,
            0, // Initial level is always 0
            deepestLevelTracker,
            targetDepth,
            restrictedZonesData
        );

        // Determine the final outcome: "OK" if the target depth was reached, "NA" otherwise.
        const resultIndicator = (deepestLevelTracker[0] === targetDepth) ? 'OK' : 'NA';
        console.log(resultIndicator);
    }
} catch (error) {
    // Catch and report any unexpected errors that occur during file reading or processing.
    console.error("An unhandled error occurred during input processing:", error.message);
}