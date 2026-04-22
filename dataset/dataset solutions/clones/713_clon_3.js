// --- Global Configuration and Helper Utilities ---

// Constant representing the value for a land cell within the terrain grid.
const TERRAIN_LAND_VALUE = 1;
// Constant representing the value for a water cell within the terrain grid.
const TERRAIN_WATER_VALUE = 0;

// The number of distinct directions to check for adjacency (8 directions: horizontal, vertical, and diagonals).
const ADJACENCY_DIRECTION_COUNT = 8;

// Array of row offsets for 8-directional movement relative to a central cell.
const ROW_DIRECTION_OFFSETS = [-1, -1, -1, 0, 0, 1, 1, 1];
// Array of column offsets for 8-directional movement relative to a central cell.
const COL_DIRECTION_OFFSETS = [-1, 0, 1, -1, 1, -1, 0, 1];

/**
 * Parses a string value into an integer, providing a default of 0 if parsing fails.
 * This ensures robustness against malformed input data.
 * @param {string} valueAsString The string that needs to be converted to an integer.
 * @returns {number} The integer result of the parsing, or 0 if the string is not a valid integer.
 */
function robustParseInteger(valueAsString) {
    const numericValue = parseInt(valueAsString, 10);
    return isNaN(numericValue) ? 0 : numericValue;
}

/**
 * Determines if a given grid coordinate (row, column) falls within the specified boundaries of the grid.
 * This prevents out-of-bounds errors during grid traversal.
 * @param {number} rIndex The row index to validate.
 * @param {number} cIndex The column index to validate.
 * @param {number} totalRows The maximum number of rows in the grid (grid height).
 * @param {number} totalCols The maximum number of columns in the grid (grid width).
 * @returns {boolean} True if the coordinate is within bounds, false otherwise.
 */
function isCoordinateWithinBounds(rIndex, cIndex, totalRows, totalCols) {
    return rIndex >= 0 && rIndex < totalRows && cIndex >= 0 && cIndex < totalCols;
}

/**
 * Performs a Depth-First Search (DFS) to explore and mark all connected land cells
 * belonging to a single island. Once a cell is visited, it's marked to prevent re-processing.
 *
 * @param {number} startRow The starting row index for the exploration.
 * @param {number} startCol The starting column index for the exploration.
 * @param {number} gridDimensionHeight The total height of the terrain grid.
 * @param {number} gridDimensionWidth The total width of the terrain grid.
 * @param {number[][]} currentTerrainMap The 2D array representing the terrain (1 for land, 0 for water).
 * @param {boolean[][]} cellExplorationStatus A 2D array tracking which cells have been visited (true for unvisited, false for visited).
 */
function exploreIslandComponent(startRow, startCol, gridDimensionHeight, gridDimensionWidth, currentTerrainMap, cellExplorationStatus) {
    // Mark the current cell as visited to ensure it's not counted again or re-explored.
    cellExplorationStatus[startRow][startCol] = false;

    // Traverse all 8 neighboring cells.
    for (let directionCounter = 0; directionCounter < ADJACENCY_DIRECTION_COUNT; ++directionCounter) {
        const nextRowCandidate = startRow + ROW_DIRECTION_OFFSETS[directionCounter];
        const nextColCandidate = startCol + COL_DIRECTION_OFFSETS[directionCounter];

        // Check if the potential next cell is within the grid's confines.
        if (isCoordinateWithinBounds(nextRowCandidate, nextColCandidate, gridDimensionHeight, gridDimensionWidth)) {
            // If the next cell is land AND has not yet been explored, then recursively explore it.
            if (currentTerrainMap[nextRowCandidate][nextColCandidate] === TERRAIN_LAND_VALUE && cellExplorationStatus[nextRowCandidate][nextColCandidate]) {
                exploreIslandComponent(nextRowCandidate, nextColCandidate, gridDimensionHeight, gridDimensionWidth, currentTerrainMap, cellExplorationStatus);
            }
        }
    }
}

/**
 * Analyzes a series of terrain grids from raw input data to determine the number of distinct islands
 * in each grid. An island is defined as a connected group of land cells (value 1) in 8 directions.
 * The input format expects width and height on the first line, followed by height lines of terrain data.
 * This process repeats for multiple grids until a 0 0 width/height pair is encountered.
 *
 * @param {string} fullInputContent The entire input string, typically read from stdin.
 */
function countIslandsInTerrain(fullInputContent) {
    // Validate that input content is provided.
    if (!fullInputContent || fullInputContent.trim() === "") {
        console.error("Error: Received empty or invalid input data for terrain analysis.");
        return;
    }

    // Split the entire input string into an array of individual lines.
    const inputLinesArray = fullInputContent.split('\n');
    let linePointer = 0; // An index to keep track of the current line being processed from the input.

    // Outer loop to process each test case (each distinct terrain grid).
    while (true) {
        // Parse the grid dimensions (width and height) from the current line.
        const dimensionParts = inputLinesArray[linePointer++].trim().split(' ');
        const currentGridWidth = robustParseInteger(dimensionParts[0]);
        const currentGridHeight = robustParseInteger(dimensionParts[1]);

        // If both width and height are 0, it signifies the end of input test cases.
        if (currentGridWidth === 0 && currentGridHeight === 0) {
            break;
        }

        // Initialize the 2D array to hold the terrain data for the current grid.
        // All cells are pre-filled with water initially, then overwritten with actual data.
        const currentTerrainMap = Array.from({ length: currentGridHeight },
            () => Array(currentGridWidth).fill(TERRAIN_WATER_VALUE));

        // Populate the terrain map using data from subsequent input lines.
        for (let r = 0; r < currentGridHeight; ++r) {
            // Parse each row's values and directly assign them to the terrain map.
            const rowData = inputLinesArray[linePointer++].trim().split(' ').map(robustParseInteger);
            for (let c = 0; c < currentGridWidth; ++c) {
                currentTerrainMap[r][c] = rowData[c];
            }
        }

        // Initialize a 2D boolean array to keep track of which cells have already been visited
        // during island exploration. All cells start as unvisited (true).
        const cellExplorationStatus = Array.from({ length: currentGridHeight },
            () => Array(currentGridWidth).fill(true));

        let totalIslandsDiscovered = 0; // Counter for the number of distinct islands found in the current grid.

        // This loop ensures that all parts of the grid are scanned, and any new, unvisited
        // land cells (which signify the start of a new island) are processed.
        let activityInCurrentPass = true; // Flag to indicate if any new island was found in the current pass.
        while (activityInCurrentPass) {
            activityInCurrentPass = false; // Reset the flag for the start of a new pass over the grid.

            // Iterate through every cell in the grid.
            for (let r = 0; r < currentGridHeight; ++r) {
                for (let c = 0; c < currentGridWidth; ++c) {
                    // If the current cell is land and has not yet been visited, it's the root of a new island.
                    if (currentTerrainMap[r][c] === TERRAIN_LAND_VALUE && cellExplorationStatus[r][c]) {
                        totalIslandsDiscovered++; // Increment the count for a newly discovered island.
                        activityInCurrentPass = true; // Mark that an island was found in this pass.
                        // Initiate a recursive exploration to mark all connected land cells of this island as visited.
                        exploreIslandComponent(r, c, currentGridHeight, currentGridWidth, currentTerrainMap, cellExplorationStatus);
                    }
                }
            }
            // If, after scanning the entire grid, no new unvisited land cells were found,
            // it means all islands have been identified and counted.
            if (!activityInCurrentPass) {
                break; // Exit the inner processing loop for this grid.
            }
        }

        // Output the final count of islands for the current terrain grid.
        console.log(totalIslandsDiscovered);
    }
}

// --- Program Execution Entry Point ---
// Attempts to read the input from standard input and pass it to the island counting function.
// A try-catch block is used to gracefully handle potential file reading or processing errors.
try {
    const standardInputData = require("fs").readFileSync("/dev/stdin", "utf8");
    countIslandsInTerrain(standardInputData);
} catch (executionError) {
    console.error("An unexpected error occurred during program execution:", executionError.message);
    // Optionally, log the full stack trace for debugging purposes.
    // console.error(executionError.stack);
}