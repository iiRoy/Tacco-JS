// This script processes a series of grid-based puzzles.
// For each grid, it calculates a value for each cell based on its neighbors,
// specifically looking for the minimum value among certain adjacent cells
// and then adding one. Cells marked with '*' are special base cases.
// The ultimate goal is to find the maximum calculated value across the entire grid.

// Global variables for the current grid and its size.
// Using global scope for simplicity as in the original, but generally
// these would be passed as parameters or encapsulated within an object/class.
let processingGrid = [];
let matrixSize = 0;

/**
 * Determines the path value for a given cell within the global `processingGrid`.
 * It uses a dynamic programming approach, relying on already computed
 * values of its "past" (top-left, top-center, left-center) neighbors.
 *
 * @param {number} currentRow - The row index of the cell to process.
 * @param {number} currentCol - The column index of the cell to process.
 */
function calculatePathValue(currentRow, currentCol) {
    // Local aliases for global variables for conciseness within the function.
    const currentGrid = processingGrid;
    const gridDimension = matrixSize;

    // Retrieve the content of the current cell.
    const cellContent = currentGrid[currentRow][currentCol];

    // Base case 1: If the cell contains an obstacle ('*'), its path value is 0.
    if (cellContent === "*") {
        currentGrid[currentRow][currentCol] = 0;
        return;
    }

    // Define relative offsets for the three relevant neighbors: top-left, top-center, and left-center.
    // This order is crucial for the dynamic programming approach, ensuring these neighbors are
    // already processed (i.e., their values determined) before the current cell.
    const neighborRelativePositions = [
        { dr: -1, dc: -1 }, // Top-left neighbor
        { dr: -1, dc: 0 },  // Top-center neighbor
        { dr: 0, dc: -1 }   // Left-center neighbor
    ];

    // Initialize `minimumAdjacentValue` to Infinity to correctly find the smallest neighbor value.
    let minimumAdjacentValue = Infinity;
    // Flag to track if at least one valid (in-bounds) neighbor was considered.
    let hasValidNeighbor = false;

    // Iterate through each defined neighbor relative position.
    for (let offsetIndex = 0; offsetIndex < neighborRelativePositions.length; offsetIndex++) {
        const offset = neighborRelativePositions[offsetIndex];

        // Calculate the absolute coordinates of the potential neighbor.
        const neighborRow = currentRow + offset.dr;
        const neighborCol = currentCol + offset.dc;

        // Check if the calculated neighbor coordinates are within the grid boundaries.
        const isOutOfBounds = neighborRow < 0 || neighborRow >= gridDimension ||
                             neighborCol < 0 || neighborCol >= gridDimension;

        if (isOutOfBounds) {
            // If a neighbor is out of bounds, it contributes as if it had a value of 0
            // for the purpose of the minimum calculation. This effectively makes cells
            // adjacent to boundaries (where some neighbors are missing) have a value of 1.
            minimumAdjacentValue = Math.min(minimumAdjacentValue, 0);
            // We do not set hasValidNeighbor to true, as this neighbor is invalid.
            continue; // Move to the next neighbor offset.
        }

        // Retrieve the value of the valid neighbor.
        // Explicitly convert to a number to ensure arithmetic operations are correct.
        const neighborValue = Number(currentGrid[neighborRow][neighborCol]);

        // Guard clause: Ensure the neighbor value is a valid number.
        // This handles unexpected data or potential issues if processing order was different.
        if (isNaN(neighborValue)) {
            // If a neighbor's value is not a number, it's treated as an invalid contribution
            // and effectively ignored for the minimum calculation by skipping.
            continue;
        }

        // Update the minimum value found among valid neighbors.
        minimumAdjacentValue = Math.min(minimumAdjacentValue, neighborValue);
        hasValidNeighbor = true; // Mark that at least one valid neighbor was processed.
    }

    // Determine the final value for the current cell based on neighbor values.
    if (!hasValidNeighbor && cellContent !== "*") {
        // If no valid in-bounds neighbors were found (e.g., top-left corner)
        // and it's not an obstacle, its value is 1.
        currentGrid[currentRow][currentCol] = 1;
    } else if (minimumAdjacentValue === Infinity) {
        // This case occurs if all potential neighbors were either out-of-bounds
        // or contained invalid (non-numeric) data, and the cell itself is not an obstacle.
        // It implies the cell is effectively on a boundary or isolated from valid paths.
        currentGrid[currentRow][currentCol] = 1;
    } else {
        // The cell's value is one greater than the minimum value of its valid neighbors.
        const calculatedCellResult = minimumAdjacentValue + 1;
        currentGrid[currentRow][currentCol] = calculatedCellResult;
    }
}

// --- Main Program Execution ---

// Attempt to read all input data from standard input.
// A try-catch block is added for robustness in case of file system errors.
let rawInputData = '';
try {
    rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
} catch (error) {
    console.error("Error reading input data:", error.message);
    process.exit(1); // Terminate the script if input cannot be read.
}

// Process the raw input data: trim whitespace and split into individual lines.
const inputLines = rawInputData.trim().split("\n");

/**
 * Parses grid data from the input lines.
 * @param {number} dimension - The expected square dimension of the grid.
 * @param {string[]} sourceLines - The array of remaining input lines.
 * @returns {string[][]|null} The parsed 2D grid array, or null if parsing fails.
 */
function parseGridForProcessing(dimension, sourceLines) {
    const newGrid = [];
    for (let rowIndex = 0; rowIndex < dimension; rowIndex++) {
        // Guard against insufficient input lines for the specified grid dimension.
        if (sourceLines.length === 0) {
            console.error(`Error: Insufficient input lines to construct grid of size ${dimension}. Expected ${dimension} rows, but ran out.`);
            return null; // Indicate parsing failure.
        }
        const gridRowInput = sourceLines.shift(); // Get the next line, which represents a grid row.

        // Validate the format and length of the grid row string.
        if (typeof gridRowInput !== 'string' || gridRowInput.length !== dimension) {
            console.error(`Error: Invalid row format or length for row ${rowIndex} (0-indexed). Expected length ${dimension}, but got ${gridRowInput ? gridRowInput.length : 'undefined'}. Row content: '${gridRowInput}'`);
            return null; // Indicate parsing failure.
        }
        // Split the row string into an array of characters and add to the grid.
        newGrid.push(gridRowInput.split(""));
    }
    return newGrid;
}

// Initialize a counter for processed test cases.
let testCaseNumber = 0;

// Main loop to process multiple test cases until a grid dimension of 0 is encountered.
while (true) {
    testCaseNumber++; // Increment the test case counter for the current iteration.

    // Retrieve the next line, which should be the grid dimension (N).
    const currentDimensionStr = inputLines.shift();

    // Handle cases where there are no more input lines, indicating an unexpected end of input.
    if (currentDimensionStr === undefined) {
        console.warn(`Warning: Unexpected end of input after ${testCaseNumber - 1} test cases. No dimension found for test case ${testCaseNumber}.`);
        break;
    }

    // Convert the dimension string to an integer.
    matrixSize = parseInt(currentDimensionStr, 10);

    // Validate the parsed matrix size.
    if (isNaN(matrixSize) || matrixSize < 0) {
        console.error(`Error: Invalid grid dimension '${currentDimensionStr}' encountered for test case ${testCaseNumber}. Skipping this test case.`);
        // If N is invalid but not 0, we should skip the corresponding grid lines.
        // If it's a negative number or NaN, it's an error.
        // If it's NaN and not 0, it won't break the loop, so must handle explicitly.
        // For robustness, treat any non-positive valid number (including 0) as an end condition.
        if (matrixSize <= 0) {
             console.log(`--- Finished processing ${testCaseNumber - 1} test cases. ---`);
             break; // Exit the loop if N is 0 or negative.
        }
        continue; // Skip to the next iteration (next test case) if N is invalid but positive.
    }

    // Check for the termination condition (matrixSize = 0).
    if (matrixSize === 0) {
        console.log(`--- Finished processing ${testCaseNumber - 1} test cases. ---`);
        break; // Exit the loop as requested by the problem statement.
    }

    // Initialize `maximumCalculatedValue` for the current test case.
    let maximumCalculatedValue = 0;

    // Parse the grid for the current test case using the helper function.
    processingGrid = parseGridForProcessing(matrixSize, inputLines);
    if (processingGrid === null) {
        console.error(`Critical Error: Grid parsing failed for test case ${testCaseNumber}. Aborting further processing.`);
        process.exit(1); // Abort if grid parsing critically fails.
    }

    // Iterate through each cell of the grid, row by row, then column by column.
    // This specific order (top-left to bottom-right) is essential for the
    // dynamic programming logic of `calculatePathValue` to work correctly.
    for (let rowIterator = 0; rowIterator < matrixSize; rowIterator++) {
        for (let colIterator = 0; colIterator < matrixSize; colIterator++) {
            // Call the function to compute and set the path value for the current cell.
            calculatePathValue(rowIterator, colIterator);

            // Retrieve the calculated value from the grid and ensure it's a number.
            const cellValue = Number(processingGrid[rowIterator][colIterator]);

            // Update the overall maximum value found in the grid so far,
            // only if the cell value is a valid number.
            if (!isNaN(cellValue)) {
                maximumCalculatedValue = Math.max(maximumCalculatedValue, cellValue);
            } else {
                // Log a warning if a cell unexpectedly contains a non-numeric value after processing.
                console.warn(`Warning: Cell [${rowIterator}][${colIterator}] contains non-numeric value '${processingGrid[rowIterator][colIterator]}' after processing for test case ${testCaseNumber}.`);
            }
        }
    }

    // Output the maximum calculated path value for the current grid test case.
    console.log(maximumCalculatedValue);
}