let rawIncomingData = ''; // Stores all incoming data chunks
process.stdin.resume(); // Ensure stdin stays open
process.stdin.setEncoding('utf8'); // Interpret input as UTF-8 text

// Accumulate data chunks
process.stdin.on('data', function(dataChunk) {
    rawIncomingData += dataChunk;
});

// Process all data once input stream ends
process.stdin.on('end', function() {
    executePuzzleSolver(rawIncomingData);
});

/**
 * Parses a string line into an array of numbers.
 * @param {string} textLine - The input string, e.g., "10 20".
 * @returns {number[]} An array of parsed numbers.
 */
const extractIntegerValues = (textLine) => {
    // Ensure input is a string and not empty
    if (typeof textLine !== 'string' || textLine.trim() === '') {
        console.error("Warning: Attempted to parse empty or invalid line.");
        return [];
    }
    // Split by space and convert each part to an integer
    return textLine.split(' ').map(numStr => parseInt(numStr, 10));
};

/**
 * Checks if the given coordinate pair signals the end of input.
 * @param {number[]} coordinatePair - An array like [0, 0].
 * @returns {boolean} True if both values are 0, indicating termination.
 */
const isInputTerminator = (coordinatePair) => {
    // Validate array structure before access
    if (!Array.isArray(coordinatePair) || coordinatePair.length < 2) {
        // Log a warning for malformed input, but proceed cautiously
        console.warn("Malformed termination signal check:", coordinatePair);
        return false; // Treat as not a terminator if malformed
    }
    return coordinatePair[0] === 0 && coordinatePair[1] === 0;
};

/**
 * Initializes a 2D grid (matrix) with a default value.
 * @param {number[]} dimensions - An array [width, height] for the grid.
 * @returns {number[][]} A new 2D array filled with zeros.
 */
const createEmptyGrid = (dimensions) => {
    if (!Array.isArray(dimensions) || dimensions.length < 2 || dimensions[0] <= 0 || dimensions[1] <= 0) {
        console.error("Invalid dimensions provided for grid creation:", dimensions);
        return []; // Return an empty grid on error
    }
    const gridWidth = dimensions[0];
    const gridHeight = dimensions[1];
    // Use Array.from for a more functional approach to grid initialization
    return Array.from({ length: gridWidth }, () =>
        Array.from({ length: gridHeight }, () => 0)
    );
};

/**
 * Places a block obstacle onto the grid.
 * @param {number[][]} gameGrid - The 2D grid representing the game area.
 * @param {number[]} blockDetails - An array [blockId, orientation, startX, startY].
 *                                  orientation: 0 for vertical, 1 for horizontal.
 */
const applyObstacleToGrid = (gameGrid, blockDetails) => {
    // Basic validation for blockDetails array length
    if (!Array.isArray(blockDetails) || blockDetails.length < 4) {
        console.error("Invalid block details provided:", blockDetails);
        return;
    }

    const [blockIdentifier, blockOrientation, initialX, initialY] = blockDetails;

    // Define dimensions based on orientation
    const isHorizontalBlock = (blockOrientation === 1); // 1 for horizontal, 0 for vertical
    const obstacleWidth = isHorizontalBlock ? 4 : 2;
    const obstacleHeight = isHorizontalBlock ? 2 : 4;

    // Adjust coordinates to be 0-indexed
    const gridStartX = initialX - 1;
    const gridStartY = initialY - 1;

    // Guard against out-of-bounds placement
    if (gridStartX < 0 || gridStartY < 0 ||
        gridStartX + obstacleWidth > gameGrid.length ||
        gridStartY + obstacleHeight > (gameGrid[0] ? gameGrid[0].length : 0)) {
        console.warn(`Attempted to place block ${blockIdentifier} out of bounds at (${initialX},${initialY}). Skipping.`);
        return;
    }

    // Mark the block's area on the grid
    for (let currentX = gridStartX; currentX < gridStartX + obstacleWidth; currentX++) {
        for (let currentY = gridStartY; currentY < gridStartY + obstacleHeight; currentY++) {
            // Ensure bounds for currentX, currentY to prevent errors on malformed input
            if (gameGrid[currentX] && gameGrid[currentX][currentY] !== undefined) {
                gameGrid[currentX][currentY] = blockIdentifier;
            }
        }
    }
};

// Constant to mark visited cells during traversal
const VISITED_CELL_MARKER = -2;

/**
 * Performs a Depth-First Search (DFS) to check connectivity between two points on the grid.
 * The search can only move to adjacent cells of the same 'color' (block ID).
 * This function modifies the grid by marking visited cells.
 *
 * @param {number[][]} traversalMap - The 2D grid to traverse.
 * @param {number} currentRow - Current row index.
 * @param {number} currentCol - Current column index.
 * @param {number} targetRow - Destination row index.
 * @param {number} targetCol - Destination column index.
 * @returns {boolean} True if the target is reachable, false otherwise.
 */
const checkPathConnectivity = (traversalMap, currentRow, currentCol, targetRow, targetCol) => {
    // Base case: If current position is the target
    if (currentRow === targetRow && currentCol === targetCol) {
        return true;
    }

    // Store the 'color' (block ID) of the current cell for comparison
    const initialCellColor = traversalMap[currentRow][currentCol];

    // Mark the current cell as visited to prevent cycles
    traversalMap[currentRow][currentCol] = VISITED_CELL_MARKER;

    // Define possible movements (8 directions including diagonals)
    const rowDeltas = [-1, -1, -1, 0, 0, 1, 1, 1];
    const colDeltas = [-1, 0, 1, -1, 1, -1, 0, 1];

    let foundPath = false; // Flag to track if a path is found

    // Iterate through all 8 possible directions
    for (let i = 0; i < rowDeltas.length; i++) {
        const nextRow = currentRow + rowDeltas[i];
        const nextCol = currentCol + colDeltas[i];

        // Validate next coordinates are within grid boundaries
        const isValidRow = nextRow >= 0 && nextRow < traversalMap.length;
        const isValidCol = isValidRow && nextCol >= 0 && nextCol < traversalMap[0].length; // Assumes non-empty grid rows

        if (isValidRow && isValidCol) {
            // Check if the next cell has the same 'color' and hasn't been visited yet
            if (traversalMap[nextRow][nextCol] === initialCellColor) {
                // Recursively call for the next cell
                foundPath = foundPath || checkPathConnectivity(traversalMap, nextRow, nextCol, targetRow, targetCol);
                // If a path is found, we can stop exploring other directions
                if (foundPath) {
                    return true;
                }
            }
        }
    }

    return foundPath;
};

/**
 * Main function to orchestrate the puzzle solving process.
 * Reads input, sets up the grid, places blocks, and checks reachability for multiple scenarios.
 * @param {string} completeInputString - The entire input received from stdin.
 */
function executePuzzleSolver(completeInputString) {
    // Split the input into individual lines and clean up whitespace
    const scenarioLines = completeInputString.trim().split('\n');

    let currentLineIndex = 0; // Pointer for reading lines
    let scenarioCounter = 0; // Counter for processed scenarios

    // Loop through scenarios until termination signal is encountered
    while (true) {
        // Read grid dimensions
        const gridDimensions = extractIntegerValues(scenarioLines[currentLineIndex++]);

        // Check for termination condition
        if (isInputTerminator(gridDimensions)) {
            break; // Exit the loop if [0, 0] is encountered
        }

        scenarioCounter++; // Increment scenario count

        // Initialize the game grid for the current scenario
        let puzzleLayout = createEmptyGrid(gridDimensions);
        if (puzzleLayout.length === 0) {
            console.error(`Skipping scenario ${scenarioCounter} due to invalid grid dimensions.`);
            continue; // Move to the next potential scenario
        }

        // Read and adjust start and goal coordinates to be 0-indexed
        const startCoordinates = extractIntegerValues(scenarioLines[currentLineIndex++]).map(coord => coord - 1);
        const targetCoordinates = extractIntegerValues(scenarioLines[currentLineIndex++]).map(coord => coord - 1);

        // Read the number of blocks to be placed
        const numberOfObstacles = parseInt(scenarioLines[currentLineIndex++], 10);

        // Place each block onto the grid
        for (let obstacleIdx = 0; obstacleIdx < numberOfObstacles; obstacleIdx++) {
            const obstacleSpecification = extractIntegerValues(scenarioLines[currentLineIndex++]);
            applyObstacleToGrid(puzzleLayout, obstacleSpecification);
        }

        // Perform the reachability check using DFS
        // Ensure start/target coordinates are valid before attempting traversal
        const [startR, startC] = startCoordinates;
        const [targetR, targetC] = targetCoordinates;

        const gridMaxR = puzzleLayout.length - 1;
        const gridMaxC = puzzleLayout[0] ? puzzleLayout[0].length - 1 : -1;

        if (startR < 0 || startR > gridMaxR || startC < 0 || startC > gridMaxC ||
            targetR < 0 || targetR > gridMaxR || targetC < 0 || targetC > gridMaxC) {
            console.log(`Scenario ${scenarioCounter}: Coordinates out of bounds. Result: NO`);
            continue; // Skip traversal for this scenario
        }

        // Execute the pathfinding algorithm
        const isPathAvailable = checkPathConnectivity(puzzleLayout, startR, startC, targetR, targetC);

        // Output the result for the current scenario
        console.log(isPathAvailable ? "OK" : "NO");
    }
}