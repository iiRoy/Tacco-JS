const fileSystemModule = require('fs'); // Node.js file system utilities

// Define the source for input data.
// For production, this might be '/dev/stdin', but for testing, a local file is convenient.
const dataInputPath = './sample_e.txt';

/**
 * Reads and processes raw input data from a specified file path.
 * The data is expected to be space or newline separated.
 *
 * @param {string} filePath - The path to the input file.
 * @returns {string[]} An array of string tokens from the file content.
 */
function acquireInputTokens(filePath) {
    try {
        const rawContent = fileSystemModule.readFileSync(filePath, 'utf8');
        // Split by any whitespace character sequence and filter out any empty strings
        return rawContent.split(/\s+/).filter(Boolean);
    } catch (error) {
        console.error(`Error reading input file at ${filePath}:`, error.message);
        process.exit(1); // Terminate if file reading fails
    }
}

// --- Main execution flow ---

// Retrieve and tokenize the raw data
const rawDataTokens = acquireInputTokens(dataInputPath);

// Validate minimum input structure: at least dimensions (2 tokens)
if (rawDataTokens.length < 2) {
    console.error('Error: Insufficient input data. Expected at least grid dimensions.');
    process.exit(1);
}

// Parse grid dimensions from the initial tokens
const gridRowsCount = parseInt(rawDataTokens[0], 10);
const gridColsCount = parseInt(rawDataTokens[1], 10);

// Basic validation for grid dimensions
if (isNaN(gridRowsCount) || gridRowsCount <= 0 || isNaN(gridColsCount) || gridColsCount <= 0) {
    console.error('Error: Invalid grid dimensions provided. Must be positive integers.');
    process.exit(1);
}

// Extract and parse target coordinate pairs
const rawCoordStrings = rawDataTokens.slice(2);

// Ensure an even number of coordinate values for pairs
if (rawCoordStrings.length % 2 !== 0) {
    console.error('Error: Mismatched coordinate values. Expected pairs (Y X).');
    process.exit(1);
}

const targetPointCoordinates = [];
// Iterate through raw coordinate strings, parsing them into objects
for (let k = 0; k < rawCoordStrings.length; k += 2) {
    const rawY = parseInt(rawCoordStrings[k], 10);
    const rawX = parseInt(rawCoordStrings[k + 1], 10);

    if (isNaN(rawY) || isNaN(rawX)) {
        console.error(`Error: Invalid coordinate value found at index ${k} or ${k + 1}.`);
        process.exit(1);
    }
    // Store as 1-indexed, will convert to 0-indexed when applying to grid
    targetPointCoordinates.push({ yCoord: rawY, xCoord: rawX });
}

/**
 * Initializes a 2D grid (matrix) with a specified number of rows and columns,
 * filling all cells with a default value.
 *
 * @param {number} rows - The number of rows for the grid.
 * @param {number} cols - The number of columns for the grid.
 * @param {number} initialValue - The value to initialize each cell with.
 * @returns {number[][]} The initialized 2D grid.
 */
function createZeroFilledGrid(rows, cols, initialValue = 0) {
    return Array.from({ length: rows }, () => Array(cols).fill(initialValue));
}

// Initialize the primary grid that will store calculated values
const processingGrid = createZeroFilledGrid(gridRowsCount, gridColsCount);

/**
 * Increments all cell values in a specified row of the grid.
 *
 * @param {number[][]} grid - The 2D grid to modify.
 * @param {number} rowIndex - The 0-indexed row to increment.
 */
function incrementGridRow(grid, rowIndex) {
    if (rowIndex < 0 || rowIndex >= grid.length) return; // Guard against invalid row index
    for (let col = 0; col < grid[rowIndex].length; col++) {
        grid[rowIndex][col]++;
    }
}

/**
 * Increments all cell values in a specified column of the grid.
 *
 * @param {number[][]} grid - The 2D grid to modify.
 * @param {number} colIndex - The 0-indexed column to increment.
 */
function incrementGridColumn(grid, colIndex) {
    if (colIndex < 0 || colIndex >= grid[0].length) return; // Guard against invalid column index
    for (let row = 0; row < grid.length; row++) {
        grid[row][colIndex]++;
    }
}

// Process each target point to update the grid values
for (const point of targetPointCoordinates) {
    // Convert 1-indexed input coordinates to 0-indexed for array access
    const effectiveRowIndex = point.yCoord - 1;
    const effectiveColIndex = point.xCoord - 1;

    // Validate if the coordinates are within the grid boundaries
    if (effectiveRowIndex < 0 || effectiveRowIndex >= gridRowsCount ||
        effectiveColIndex < 0 || effectiveColIndex >= gridColsCount) {
        console.warn(`Warning: Target point (${point.yCoord}, ${point.xCoord}) is out of grid bounds. Skipping.`);
        continue; // Skip this point if it's invalid
    }

    // Apply increments to the entire row and column for the current target point
    incrementGridRow(processingGrid, effectiveRowIndex);
    incrementGridColumn(processingGrid, effectiveColIndex);

    // Correct for the double-increment at the intersection point (Y, X)
    // The cell at (Y, X) was incremented once for its row and once for its column.
    // To reflect that it's a single target, we decrement it by one.
    processingGrid[effectiveRowIndex][effectiveColIndex]--;
}

let maximumObservedValue = 0;

// Iterate through the processed grid to find the highest value
// Using for...of loops for cleaner iteration over rows and cell values
for (const currentRow of processingGrid) {
    for (const cellValue of currentRow) {
        if (cellValue > maximumObservedValue) {
            maximumObservedValue = cellValue;
        }
    }
}

// Output the final calculated maximum value
console.log(maximumObservedValue);