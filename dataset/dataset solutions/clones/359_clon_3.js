/*
 * Module for file system operations, primarily for reading standard input.
 * In a production environment, this might be replaced with a stream or API call.
 */
const fileSystem = require('fs');

/**
 * A marker symbol used to denote cells that have already been processed
 * or "cleared" by the flood fill algorithm.
 */
const PROCESSED_CELL_MARKER = '.';

/**
 * Defines the set of character symbols that are considered "features of interest"
 * for the purpose of counting and clearing connected regions.
 */
const RECOGNIZED_FEATURES = new Set(['@', '#', '*']);

/**
 * Helper function to determine if a given character represents a feature
 * that should be processed by the region clearing logic.
 * @param {string} char The character to check.
 * @returns {boolean} True if the character is a recognized feature, false otherwise.
 */
function isAFeatureSymbol(char) {
    return RECOGNIZED_FEATURES.has(char);
}

/**
 * Recursively clears all connected cells in a grid that match a specific value,
 * starting from a given coordinate. This implements a depth-first search
 * flood-fill mechanism.
 *
 * @param {number} startRow The starting row index for the clearing operation.
 * @param {number} startCol The starting column index for the clearing operation.
 * @param {string} matchValue The character value to match and clear.
 * @param {string[][]} gridReference The 2D array representing the grid (modified in place).
 * @param {number} gridRows The total number of rows in the grid.
 * @param {number} gridCols The total number of columns in the grid.
 */
function clearAdjacentCells(startRow, startCol, matchValue, gridReference, gridRows, gridCols) {
    // Define relative offsets for checking neighboring cells (up, down, left, right).
    const rowAdjustments = [0, 0, -1, 1]; // No change, no change, move up, move down
    const colAdjustments = [-1, 1, 0, 0]; // Move left, move right, no change, no change

    // Iterate through all four cardinal directions.
    for (let currentDirectionIndex = 0; currentDirectionIndex < 4; ++currentDirectionIndex) {
        // Calculate the coordinates of the potential next cell.
        const nextRowCoordinate = startRow + rowAdjustments[currentDirectionIndex];
        const nextColCoordinate = startCol + colAdjustments[currentDirectionIndex];

        // Ensure the calculated coordinates are within the grid boundaries.
        const isRowWithinBounds = nextRowCoordinate >= 0 && nextRowCoordinate < gridRows;
        const isColWithinBounds = nextColCoordinate >= 0 && nextColCoordinate < gridCols;

        if (!isRowWithinBounds || !isColWithinBounds) {
            // If the next coordinate is out of bounds, skip to the next direction.
            continue;
        }

        // Retrieve the character value of the adjacent cell.
        const adjacentCellValue = gridReference[nextRowCoordinate][nextColCoordinate];

        // If the adjacent cell's value matches the target value,
        // mark it as processed and recursively call this function.
        if (adjacentCellValue === matchValue) {
            gridReference[nextRowCoordinate][nextColCoordinate] = PROCESSED_CELL_MARKER;
            clearAdjacentCells(nextRowCoordinate, nextColCoordinate, matchValue, gridReference, gridRows, gridCols);
        }
    }
}

// --- Main Program Execution ---

// Read all input from standard input, decode as UTF-8, and split into lines.
// Each line is trimmed to remove leading/trailing whitespace and empty lines are filtered out.
const rawInputBuffer = fileSystem.readFileSync('/dev/stdin');
const inputDataLines = rawInputBuffer.toString().split('\n').map(l => l.trim()).filter(l => l.length > 0);

let lineCursor = 0; // Keep track of the current line being processed from inputDataLines.

// Loop indefinitely until a specific termination condition is met.
for (;;) {
    // Read the current line for map dimensions.
    const dimensionLine = inputDataLines[lineCursor++];

    // If there are no more lines or the line is unexpectedly empty, break.
    if (!dimensionLine) {
        break;
    }

    // Parse the map dimensions (height and width).
    // The original code used 'n', let's use 'mapDimensions'.
    const mapDimensions = dimensionLine.split(' ').map(Number);

    const currentMapHeight = mapDimensions[0]; // Number of rows
    const currentMapWidth = mapDimensions[1];  // Number of columns

    // Termination condition: if both dimensions are zero, exit the program.
    if (currentMapHeight === 0 && currentMapWidth === 0) {
        break;
    }

    // Initialize the 2D array (grid) that will hold the terrain map.
    // The original code used 'yx', let's use 'terrainMap'.
    const terrainMap = [];
    for (let r = 0; r < currentMapHeight; ++r) {
        // Read each row's string representation and convert it into an array of characters.
        const rowString = inputDataLines[lineCursor++];
        if (!rowString) { // Guard against malformed input (e.g., not enough rows)
            // Log an error or handle more gracefully in a robust application
            process.stderr.write("Error: Not enough map rows in input.\n");
            process.exit(1);
        }
        terrainMap.push(rowString.split(''));
    }

    // Initialize a counter for the number of distinct features identified.
    // The original code used 'cnt', let's use 'identifiedFeatureCount'.
    let identifiedFeatureCount = 0;

    // Iterate through each cell of the terrain map to find and process features.
    for (let rowIterator = 0; rowIterator < currentMapHeight; ++rowIterator) {
        for (let colIterator = 0; colIterator < currentMapWidth; ++colIterator) {
            // Get the symbol at the current cell.
            let currentCellSymbol = terrainMap[rowIterator][colIterator];

            // Skip cells that have already been processed/cleared.
            if (currentCellSymbol === PROCESSED_CELL_MARKER) {
                continue;
            }

            // Check if the current cell contains a feature of interest.
            if (isAFeatureSymbol(currentCellSymbol)) {
                // If it's a feature, increment the count.
                identifiedFeatureCount++;

                // Mark the starting cell of the feature as processed.
                terrainMap[rowIterator][colIterator] = PROCESSED_CELL_MARKER;

                // Initiate the recursive clearing process (flood fill)
                // for all connected cells matching this feature's symbol.
                clearAdjacentCells(
                    rowIterator,
                    colIterator,
                    currentCellSymbol,
                    terrainMap,
                    currentMapHeight,
                    currentMapWidth
                );
            }
            // If it's not a recognized feature and not a processed marker, just move on.
        }
    }

    // Output the total number of identified features for the current map.
    console.log(identifiedFeatureCount);
}