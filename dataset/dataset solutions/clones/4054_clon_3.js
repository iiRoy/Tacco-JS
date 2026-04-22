let inputBuffer = []; // A temporary buffer to hold all lines read from standard input.
let gridSizeValue; // Stores the 'N' dimension (number of columns) of our grid.
let processedDataMatrix; // The 2D array 'A' containing integer values for the grid.

// Import the 'readline' module to handle line-by-line input.
const inputProcessor = require('readline');

// Configure the interface for reading input from the console and writing output.
const interfaceHandler = inputProcessor.createInterface({
    input: process.stdin,  // Standard input stream.
    output: process.stdout, // Standard output stream (not used directly for final result).
});

// Event listener: triggered for each line of input received.
interfaceHandler.on('line', (currentLineSegment) => {
    // Basic validation: only store non-empty string lines.
    if (typeof currentLineSegment === 'string' && currentLineSegment.trim().length > 0) {
        inputBuffer.push(currentLineSegment);
    }
});

// Event listener: triggered when the input stream closes (e.g., EOF is reached).
interfaceHandler.on('close', () => {
    // Pre-check: Ensure there's at least some input to process.
    if (inputBuffer.length === 0) {
        console.error("Error: No input lines were provided. Cannot proceed.");
        return; // Exit if no input.
    }

    // Attempt to parse the grid dimension (N) from the first line.
    // `shift()` removes the first element from `inputBuffer` and returns it.
    gridSizeValue = parseInt(inputBuffer.shift(), 10);

    // Validate the parsed grid size. It must be a positive integer.
    if (isNaN(gridSizeValue) || gridSizeValue <= 0) {
        console.error("Error: Invalid or non-positive grid size detected. Please provide a valid integer.");
        return; // Exit if grid size is invalid.
    }

    // Define a helper function to parse a single row string into an array of numbers.
    const parseRowString = (rowText) => {
        // Split the string by spaces, filter out any empty strings that might result from multiple spaces,
        // then convert each part to an integer using radix 10 for safety.
        return rowText.split(" ")
                      .filter(segment => segment.trim() !== '')
                      .map(numericString => parseInt(numericString, 10));
    };

    // Process the remaining lines in the buffer to construct the 2D data matrix.
    processedDataMatrix = inputBuffer.map(parseRowString);

    // This problem specifically implies a 2-row grid. Let's define it as a constant for clarity.
    const EXPECTED_ROW_COUNT = 2;

    // Validate the dimensions of the created data matrix.
    // It must have the `EXPECTED_ROW_COUNT` rows, and each row must have `gridSizeValue` columns.
    if (processedDataMatrix.length !== EXPECTED_ROW_COUNT ||
        processedDataMatrix.some(row => row.length !== gridSizeValue)) {
        console.error(`Error: Data matrix dimensions mismatch. Expected ${EXPECTED_ROW_COUNT} rows and ${gridSizeValue} columns per row.`);
        return; // Exit if matrix dimensions are incorrect.
    }

    // Initialize the exploration queue. Each element is an object representing a node state:
    // `r`: row coordinate, `c`: column coordinate, `s`: sum accumulated to reach this node.
    // The exploration starts from (0, 0) with an initial sum of 0.
    const processingQueue = [{ r: 0, c: 0, s: 0 }];

    // Execute the grid exploration algorithm and print the final maximum sum found.
    console.log(
        exploreGrid(processingQueue, gridSizeValue, processedDataMatrix, EXPECTED_ROW_COUNT)
    );
});

/**
 * Performs a Breadth-First Search (BFS) to find the maximum possible sum path
 * from the starting node (0,0) to any reachable node in a 2xN grid.
 * Paths can move right (increment column) or down (increment row).
 *
 * @param {Array<Object>} workQueue - The queue of nodes to be processed.
 *                                    Each node is an object `{ r: number, c: number, s: number }`.
 * @param {number} totalColumns - The total number of columns (N) in the grid.
 * @param {Array<Array<number>>} gridData - The 2D array containing the integer values of the grid cells.
 * @param {number} fixedRowsCount - The fixed number of rows in the grid (expected to be 2).
 * @returns {number} The maximum sum encountered along any valid path.
 */
function exploreGrid(workQueue, totalColumns, gridData, fixedRowsCount) {
    let maxAccumulatedValue = 0; // Variable to keep track of the highest sum found so far.
    let debugNodesProcessed = 0; // A counter for debugging or performance metrics.

    // Continue processing as long as there are nodes in the queue.
    while (workQueue.length > 0) {
        debugNodesProcessed++; // Increment the counter for each node processed.

        // Dequeue the next node. Using object destructuring for clean access to properties.
        const { r: currentRow, c: currentCol, s: previousPathSum } = workQueue.shift();

        // Calculate the total sum to reach the current cell, including its own value.
        const currentPathTotal = previousPathSum + gridData[currentRow][currentCol];

        // Update the global maximum sum if the current path's total is greater.
        if (currentPathTotal > maxAccumulatedValue) {
            maxAccumulatedValue = currentPathTotal;
        }

        // --- Explore possible subsequent moves from the current cell ---

        // 1. Attempt to move right (increment column).
        // Check if moving right keeps us within the grid's column boundaries.
        if (currentCol + 1 < totalColumns) {
            workQueue.push({ r: currentRow, c: currentCol + 1, s: currentPathTotal });
        }

        // 2. Attempt to move down (increment row).
        // Check if moving down keeps us within the grid's row boundaries.
        // For a 2-row grid starting at row 0, this condition is only true if currentRow is 0.
        // `currentRow + 1 < fixedRowsCount` effectively means `currentRow < fixedRowsCount - 1`.
        // If `fixedRowsCount` is 2, then `currentRow < 1`, meaning `currentRow` must be 0.
        if (currentRow + 1 < fixedRowsCount) {
            workQueue.push({ r: currentRow + 1, c: currentCol, s: currentPathTotal });
        }
    }

    // Return the highest sum found after exploring all reachable paths.
    return maxAccumulatedValue;
}