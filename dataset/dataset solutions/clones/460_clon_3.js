let rawInputAccumulator = '';

process.stdin.on('data', function (dataChunk) {
    rawInputAccumulator += dataChunk;
}).setEncoding('utf8');

process.stdin.on('end', function () {
    processCollectedInput(rawInputAccumulator);
});

// --- Configuration Constants ---
const EMPTY_GRID_CELL_VALUE = 0;
const VISITED_CELL_MARKER = -2;
const INPUT_TERMINATION_VALUE = 0;
const HORIZONTAL_BLOCK_ORIENTATION = 0; // Corresponds to block[1] = 0
const VERTICAL_BLOCK_ORIENTATION = 1;   // Corresponds to block[1] = 1

// --- Helper Utilities ---

/**
 * Transforms a space-separated string of numbers into an array of numeric values.
 * @param {string} textLine The input string to parse.
 * @returns {number[]} An array of numbers, or an empty array if input is invalid.
 */
function parseNumericalLine(textLine) {
    if (typeof textLine !== 'string' || textLine.trim() === '') {
        // Guard clause: return empty array for invalid or empty input lines.
        return [];
    }
    // Using a regex to split by one or more whitespace characters for robustness.
    return textLine.trim().split(/\s+/).map(Number);
}

/**
 * Determines if a given array of numbers represents the program's termination signal.
 * @param {number[]} numericArray A pair of numbers, typically grid dimensions.
 * @returns {boolean} True if the array is [0, 0], indicating termination.
 */
function isTerminationPair(numericArray) {
    // Guard clause: ensure array has at least two elements.
    if (!Array.isArray(numericArray) || numericArray.length < 2) {
        return false;
    }
    return numericArray[0] === INPUT_TERMINATION_VALUE && numericArray[1] === INPUT_TERMINATION_VALUE;
}

/**
 * Safely retrieves the value of a cell from a 2D grid, performing boundary checks.
 * @param {number[][]} gridMap The 2D array representing the grid.
 * @param {number} r The row index.
 * @param {number} c The column index.
 * @returns {number | undefined} The cell's value, or undefined if coordinates are out of bounds.
 */
function getGridCellSafely(gridMap, r, c) {
    if (!gridMap || r < 0 || c < 0 || r >= gridMap.length || c >= gridMap[0].length) {
        return undefined; // Coordinates are outside the grid boundaries.
    }
    return gridMap[r][c];
}

// --- Grid Operations ---

/**
 * Initializes a new 2D grid (matrix) with specified dimensions, filling all cells with an empty value.
 * @param {number} width The number of rows for the grid.
 * @param {number} height The number of columns for the grid.
 * @returns {number[][]} A newly created grid matrix.
 */
function createEmptyGrid(width, height) {
    // Guard clause: ensure dimensions are positive.
    if (width <= 0 || height <= 0) {
        console.error(`Invalid grid dimensions: width=${width}, height=${height}. Returning empty grid.`);
        return [];
    }

    const newGrid = [];
    // Using a for loop to construct the grid row by row.
    for (let rowIdx = 0; rowIdx < width; rowIdx++) {
        // Each row is initialized as an array of 'EMPTY_GRID_CELL_VALUE'.
        newGrid.push(Array(height).fill(EMPTY_GRID_CELL_VALUE));
    }
    return newGrid;
}

/**
 * Places an obstacle (block) onto the grid based on its definition.
 * The block's dimensions depend on its orientation. Coordinates are adjusted from 1-indexed to 0-indexed.
 * @param {number[][]} targetGrid The grid matrix where the obstacle will be placed.
 * @param {number[]} obstacleData An array: [block_identifier, orientation_flag, x_coord_1_indexed, y_coord_1_indexed].
 */
function layOutObstacle(targetGrid, obstacleData) {
    // Destructure obstacle data for clarity.
    const [blockIdentifier, blockOrientation, rawXCoord, rawYCoord] = obstacleData;

    // Convert 1-indexed input coordinates to 0-indexed grid coordinates.
    const startRow = rawXCoord - 1;
    const startCol = rawYCoord - 1;

    let obstacleActualWidth, obstacleActualHeight;

    // Determine obstacle dimensions based on its orientation.
    if (blockOrientation === HORIZONTAL_BLOCK_ORIENTATION) {
        obstacleActualWidth = 4;
        obstacleActualHeight = 2;
    } else if (blockOrientation === VERTICAL_BLOCK_ORIENTATION) {
        obstacleActualWidth = 2;
        obstacleActualHeight = 4;
    } else {
        // Guard clause: handle unrecognized orientation.
        console.warn(`Unrecognized block orientation flag: ${blockOrientation}. Obstacle not placed.`);
        return;
    }

    // Iterate over the area where the obstacle should be placed.
    for (let r = startRow; r < startRow + obstacleActualWidth; r++) {
        for (let c = startCol; c < startCol + obstacleActualHeight; c++) {
            // Check if the current cell is within the grid boundaries before assigning.
            if (r >= 0 && r < targetGrid.length && c >= 0 && c < targetGrid[0].length) {
                targetGrid[r][c] = blockIdentifier;
            } else {
                // Optionally, log if an obstacle attempts to place outside the grid.
                // console.debug(`Obstacle segment at [${r}, ${c}] is outside grid bounds.`);
            }
        }
    }
}

// --- Pathfinding Algorithm ---

/**
 * Recursively determines if a path exists from a starting cell to a target cell
 * within the grid, where cells must share the same 'group identifier' to be traversable.
 * This function modifies the grid to mark visited cells during traversal (DFS).
 * @param {number[][]} currentGrid The grid matrix for pathfinding.
 * @param {number} currentRow The current row index of the traversal.
 * @param {number} currentCol The current column index of the traversal.
 * @param {number} finalRow The target row index.
 * @param {number} finalCol The target column index.
 * @returns {boolean} True if a path to the target is found, false otherwise.
 */
function explorePathRecursive(currentGrid, currentRow, currentCol, finalRow, finalCol) {
    // Base case 1: If the current position is the target, a path is found.
    if (currentRow === finalRow && currentCol === finalCol) {
        return true;
    }

    // Retrieve the original group identifier of the current cell.
    const currentCellGroup = getGridCellSafely(currentGrid, currentRow, currentCol);

    // Base case 2: Invalid cell conditions.
    // - If currentCellGroup is undefined (out of bounds).
    // - If the cell has already been visited.
    // - If the cell is an empty cell (not part of any traversable group).
    if (currentCellGroup === undefined || currentCellGroup === VISITED_CELL_MARKER || currentCellGroup === EMPTY_GRID_CELL_VALUE) {
        return false;
    }

    // Mark the current cell as visited to prevent infinite loops and re-processing.
    // This uses the grid itself as the visited set.
    currentGrid[currentRow][currentCol] = VISITED_CELL_MARKER;

    let pathExists = false; // Flag to track if any recursive call finds a path.

    // Define orthogonal movement directions (Up, Down, Left, Right).
    const deltaRows = [-1, 1, 0, 0];
    const deltaCols = [0, 0, -1, 1];

    // Explore all four adjacent cells.
    for (let i = 0; i < deltaRows.length; i++) {
        const nextRow = currentRow + deltaRows[i];
        const nextCol = currentCol + deltaCols[i];

        // Check if the next cell is within grid boundaries.
        if (nextRow >= 0 && nextRow < currentGrid.length &&
            nextCol >= 0 && nextCol < currentGrid[0].length) {

            const nextCellGroup = getGridCellSafely(currentGrid, nextRow, nextCol);

            // Only proceed if the next cell is part of the same group identifier
            // (i.e., it's the 'color' we're looking for, and it hasn't been visited or is empty).
            // The `currentCellGroup` variable holds the *original* value of the starting cell for this recursive call,
            // which is essential for `nextCellGroup === currentCellGroup` comparison.
            if (nextCellGroup === currentCellGroup) {
                if (explorePathRecursive(currentGrid, nextRow, nextCol, finalRow, finalCol)) {
                    pathExists = true; // A path was found through this branch.
                    break; // Optimization: If a path is found, no need to explore other directions.
                }
            }
        }
    }

    return pathExists;
}

// --- Main Program Flow ---

/**
 * The main function that orchestrates the parsing of input and execution of the pathfinding logic.
 * @param {string} fullInputText The entire input received from standard input.
 */
function processCollectedInput(fullInputText) {
    // Clean and split the input into an array of lines.
    const allInputLines = fullInputText.trim().split('\n');

    // Guard clause: handle cases where no input is provided.
    if (allInputLines.length === 0) {
        console.error("No input data was provided for processing.");
        return;
    }

    let lineIterator = 0; // Pointer to the current line being read from `allInputLines`.

    // Loop through test cases until a termination signal is found.
    while (true) {
        // Read and parse the grid dimensions for the current test case.
        const dimensions = parseNumericalLine(allInputLines[lineIterator++]);

        // Check if the current dimensions indicate the end of input.
        if (isTerminationPair(dimensions)) {
            break; // Exit the main processing loop.
        }

        const [gridWidth, gridHeight] = dimensions;
        const currentGridMatrix = createEmptyGrid(gridWidth, gridHeight);

        // Read and parse starting and target coordinates.
        // Adjusting from 1-indexed to 0-indexed immediately.
        const [startRawX, startRawY] = parseNumericalLine(allInputLines[lineIterator++]);
        const startGridRow = startRawX - 1;
        const startGridCol = startRawY - 1;

        const [targetRawX, targetRawY] = parseNumericalLine(allInputLines[lineIterator++]);
        const targetGridRow = targetRawX - 1;
        const targetGridCol = targetRawY - 1;

        // Read and parse the count of obstacles for this test case.
        const numObstacles = Number(allInputLines[lineIterator++]); // Using Number() for direct conversion.

        // Process each obstacle and apply it to the grid.
        for (let k = 0; k < numObstacles; k++) {
            const obstacleDetails = parseNumericalLine(allInputLines[lineIterator++]);
            layOutObstacle(currentGridMatrix, obstacleDetails);
        }

        // Execute the pathfinding algorithm.
        const isPathFound = explorePathRecursive(currentGridMatrix, startGridRow, startGridCol, targetGridRow, targetGridCol);

        // Output the result based on whether a path was found.
        if (isPathFound) {
            console.log("OK");
        } else {
            console.log("NO");
        }

        // Additional guard: Check for unexpected end of input lines within a test case.
        if (lineIterator > allInputLines.length && !isTerminationPair(dimensions)) {
            console.warn("Warning: Input data ended unexpectedly before termination signal.");
            break;
        }
    }
}