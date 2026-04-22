function ProcessGridOperations(rawData) {
    // Validate the raw input data to ensure it's a non-empty string.
    if (typeof rawData !== 'string' || rawData.trim() === '') {
        console.error("Input data stream is invalid or unexpectedly empty.");
        return 0; // Return a default score or indicate an error condition.
    }

    // Deconstruct the input string into individual lines.
    const inputLines = rawData.split("\n");

    // Parse the grid's dimension (N) from the first line.
    const gridDimension = parseInt(inputLines[0], 10);
    // Enforce valid positive integer for grid dimension.
    if (isNaN(gridDimension) || gridDimension <= 0) {
        console.error("Grid dimension (N) must be a positive integer.");
        return 0;
    }

    // Extract and parse the sequence of operations (P) from the second line.
    // Each number signifies a 1-based index in a flattened representation of the grid.
    const operationSequence = inputLines[1].split(" ").map(entry => parseInt(entry, 10));
    // Verify all entries in the operation sequence are valid numbers.
    if (operationSequence.some(isNaN)) {
        console.error("Operation sequence contains non-numeric values.");
        return 0;
    }

    // Define symbolic constants for various cell states within the grid.
    const CELL_STATE_PERMANENTLY_REMOVED = -2; // Represents an actual border or a cell that has been fully removed.
    const CELL_STATE_TEMPORARILY_REMOVED = -1; // Marks a cell removed in the current operation, pending further propagation.
    const CELL_STATE_ACTIVE_ZERO = 0;           // An active grid cell with a value of zero.

    // Initialize the primary grid matrix.
    // The matrix is augmented with an extra row and column on all sides (N+2 x N+2)
    // to simplify boundary condition checks for active cells.
    const matrixTotalSize = gridDimension + 2;
    let gridMatrix = Array.from({ length: matrixTotalSize }, () => Array(matrixTotalSize).fill(0));

    // Populate the active inner cells (from [1,1] to [N,N]) with layer-based values.
    // The 'layerValue' indicates the cell's "depth" relative to the outermost active boundary.
    // A higher 'layerValue' implies closer proximity to the grid's geometric center.
    const deepestLayerValue = Math.floor((gridDimension - 1) / 2); // E.g., N=3 -> deepest=1; N=4 -> deepest=1.
    for (let currentLayer = deepestLayerValue; currentLayer >= 0; --currentLayer) {
        for (let r = 1; r <= gridDimension; ++r) { // Iterate through the rows of the active grid.
            for (let c = 1; c <= gridDimension; ++c) { // Iterate through the columns of the active grid.
                // Determine if the current cell (r, c) is situated on one of the four boundaries
                // that define the 'currentLayer'.
                const isBoundaryCellForCurrentLayer = (r === currentLayer + 1) || (c === currentLayer + 1) ||
                                                      (r === gridDimension - currentLayer) || (c === gridDimension - currentLayer);
                if (isBoundaryCellForCurrentLayer) {
                    gridMatrix[r][c] = currentLayer;
                }
            }
        }
    }

    // Designate the true border cells (row 0, row N+1, column 0, column N+1) as
    // permanently removed (CELL_STATE_PERMANENTLY_REMOVED) to serve as barriers.
    for (let r = 0; r < matrixTotalSize; ++r) {
        if (r === 0 || r === matrixTotalSize - 1) { // Process the topmost and bottommost padded rows.
            gridMatrix[r].fill(CELL_STATE_PERMANENTLY_REMOVED);
        } else { // Process the left and right side cells for intermediate padded rows.
            gridMatrix[r][0] = CELL_STATE_PERMANENTLY_REMOVED;
            gridMatrix[r][matrixTotalSize - 1] = CELL_STATE_PERMANENTLY_REMOVED;
        }
    }

    let accumulatedScore = 0; // This variable will aggregate scores from all operations.

    // A constant array to represent the row and column offsets for 4-directional neighbors.
    const NEIGHBOR_COORDINATE_DELTAS = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // Up, Down, Left, Right.

    /**
     * Recursively orchestrates the propagation of a cell removal.
     * Marks the initial cell as CELL_STATE_PERMANENTLY_REMOVED.
     * For active, unvisited neighbors, their value is reset to CELL_STATE_ACTIVE_ZERO.
     * For already permanently removed, unvisited neighbors, the removal propagation continues recursively.
     * @param {number} currentRow The row index of the current cell (1-based, within active grid).
     * @param {number} currentCol The column index of the current cell (1-based, within active grid).
     * @param {number} activeGridDim The dimension (N) of the main active grid.
     * @param {number[][]} gridRef The 2D reference to the grid matrix.
     * @param {number[][]} visitedPropagationTracker A 2D array to prevent infinite recursion during propagation.
     */
    function propagateRemovalRecursive(currentRow, currentCol, activeGridDim, gridRef, visitedPropagationTracker) {
        gridRef[currentRow][currentCol] = CELL_STATE_PERMANENTLY_REMOVED; // Mark current cell as fully removed.

        for (const [rowOffset, colOffset] of NEIGHBOR_COORDINATE_DELTAS) {
            const nextRow = currentRow + rowOffset;
            const nextCol = currentCol + colOffset;

            // Validate that the potential neighbor lies within the boundaries of the active grid.
            if (nextRow >= 1 && nextRow <= activeGridDim && nextCol >= 1 && nextCol <= activeGridDim) {
                // If the neighbor is an active cell (value >= 0) and has not been processed in this propagation cycle.
                if (gridRef[nextRow][nextCol] >= CELL_STATE_ACTIVE_ZERO && visitedPropagationTracker[nextRow][nextCol] === 0) {
                    visitedPropagationTracker[nextRow][nextCol] = 1; // Mark as visited for this propagation path.
                    gridRef[nextRow][nextCol] = CELL_STATE_ACTIVE_ZERO; // Reset its value to zero.
                }
                // If the neighbor is already a permanently removed cell (-2) and hasn't been visited.
                else if (gridRef[nextRow][nextCol] === CELL_STATE_PERMANENTLY_REMOVED && visitedPropagationTracker[nextRow][nextCol] === 0) {
                    visitedPropagationTracker[nextRow][nextCol] = 1; // Mark as visited.
                    propagateRemovalRecursive(nextRow, nextCol, activeGridDim, gridRef, visitedPropagationTracker); // Initiate recursive propagation.
                }
            }
        }
    }

    /**
     * Recursively adjusts values of adjacent cells. If a neighbor's value is higher
     * than the current cell's value and it hasn't been visited, it's decremented after
     * its own children are processed (post-order traversal).
     * @param {number} currentRow The row index of the current cell (1-based, within active grid).
     * @param {number} currentCol The column index of the current cell (1-based, within active grid).
     * @param {number} activeGridDim The dimension (N) of the main active grid.
     * @param {number[][]} gridRef The 2D reference to the grid matrix.
     * @param {number[][]} visitedDecrementTracker A 2D array to track visited cells for this decrement operation.
     */
    function adjustNeighborValuesRecursive(currentRow, currentCol, activeGridDim, gridRef, visitedDecrementTracker) {
        const valueOfCurrentCell = gridRef[currentRow][currentCol];

        for (const [rowOffset, colOffset] of NEIGHBOR_COORDINATE_DELTAS) {
            const nextRow = currentRow + rowOffset;
            const nextCol = currentCol + colOffset;

            // Ensure the neighbor is within the active grid, its value is strictly greater than the current cell's,
            // and it has not been visited during this specific value adjustment operation.
            if (nextRow >= 1 && nextRow <= activeGridDim && nextCol >= 1 && nextCol <= activeGridDim &&
                gridRef[nextRow][nextCol] > valueOfCurrentCell && visitedDecrementTracker[nextRow][nextCol] === 0) {

                visitedDecrementTracker[nextRow][nextCol] = 1; // Mark the neighbor as visited.
                adjustNeighborValuesRecursive(nextRow, nextCol, activeGridDim, gridRef, visitedDecrementTracker); // Recurse.
                gridRef[nextRow][nextCol]--; // Decrement the neighbor's value after its subtree has been processed.
            }
        }
    }

    // Process each operation as specified in the 'operationSequence'.
    for (let operationIndex = 0; operationIndex < operationSequence.length; ++operationIndex) {
        const flatTargetIndex = operationSequence[operationIndex]; // This is a 1-based flattened index.

        // Convert the 1-based flattened index into 1-based (row, column) coordinates.
        // Special handling for cells in the last column where 'flatTargetIndex % gridDimension' would yield 0.
        let cellRow = Math.ceil(flatTargetIndex / gridDimension);
        let cellCol = flatTargetIndex % gridDimension;
        if (cellCol === 0) {
            cellCol = gridDimension; // Correct column for items at the end of a row.
        }

        // Add the current cell's value to the running total score.
        accumulatedScore += gridMatrix[cellRow][cellCol];

        // Initialize two distinct 2D arrays to track visited cells for the current operation.
        // These trackers are crucial for preventing infinite recursion in DFS-like traversals
        // and must be re-initialized for each new operation in the sequence.
        const visitedForDecrement = Array.from({ length: matrixTotalSize }, () => Array(matrixTotalSize).fill(0));
        const visitedForRemoval = Array.from({ length: matrixTotalSize }, () => Array(matrixTotalSize).fill(0));

        // Mark the current cell as visited for the decrement process to prevent it from decrementing itself.
        visitedForDecrement[cellRow][cellCol] = 1;
        adjustNeighborValuesRecursive(cellRow, cellCol, gridDimension, gridMatrix, visitedForDecrement);

        // Mark the current cell as temporarily removed. It might become permanently removed later.
        gridMatrix[cellRow][cellCol] = CELL_STATE_TEMPORARILY_REMOVED;

        // Determine if the newly removed cell is immediately adjacent to any already permanently removed cell (border or previously removed).
        let isNextToPermanentRemoval = false;
        for (const [rowOffset, colOffset] of NEIGHBOR_COORDINATE_DELTAS) {
            const neighborRow = cellRow + rowOffset;
            const neighborCol = cellCol + colOffset;

            // Check if the neighbor is within the padded grid and is a permanently removed cell.
            if (neighborRow >= 0 && neighborRow < matrixTotalSize && neighborCol >= 0 && neighborCol < matrixTotalSize &&
                gridMatrix[neighborRow][neighborCol] === CELL_STATE_PERMANENTLY_REMOVED) {
                isNextToPermanentRemoval = true;
                break; // Found an adjacent permanent removal, no need to check further.
            }
        }

        // If the current cell is adjacent to a permanent removal, it too becomes permanently removed,
        // and this state propagates to its relevant neighbors.
        if (isNextToPermanentRemoval) {
            gridMatrix[cellRow][cellCol] = CELL_STATE_PERMANENTLY_REMOVED; // Current cell is now permanently removed.

            // Propagate the effects to its immediate neighbors.
            for (const [rowOffset, colOffset] of NEIGHBOR_COORDINATE_DELTAS) {
                const neighborRow = cellRow + rowOffset;
                const neighborCol = cellCol + colOffset;

                // Ensure the neighbor coordinate is within the active grid bounds (1 to N).
                if (neighborRow >= 1 && neighborRow <= gridDimension && neighborCol >= 1 && neighborCol <= gridDimension) {
                    if (gridMatrix[neighborRow][neighborCol] >= CELL_STATE_ACTIVE_ZERO) {
                        // If an active neighbor, its value is reset to zero.
                        gridMatrix[neighborRow][neighborCol] = CELL_STATE_ACTIVE_ZERO;
                    } else if (gridMatrix[neighborRow][neighborCol] === CELL_STATE_TEMPORARILY_REMOVED) {
                        // If a neighbor was also just temporarily removed (marked -1) in this iteration,
                        // and it hasn't been processed in the current propagation chain, it also becomes
                        // permanently removed, and its removal propagates.
                        if (visitedForRemoval[neighborRow][neighborCol] === 0) {
                            visitedForRemoval[neighborRow][neighborCol] = 1; // Mark as visited before recursive call.
                            propagateRemovalRecursive(neighborRow, neighborCol, gridDimension, gridMatrix, visitedForRemoval);
                        }
                    }
                }
            }
        }
    }

    // Display the final accumulated score to standard output.
    console.log('%s', accumulatedScore);
    return accumulatedScore;
}

// A utility function designed for local debugging in environments like a web browser.
// This function is external to the core problem-solving logic and can be adjusted or omitted.
function verifySolution(testId) {
    // Attempt to retrieve input, expected output, and result display elements from the DOM.
    const inputField = document.getElementById("input" + testId);
    const outputField = document.getElementById("output" + testId);
    const resultDisplay = document.getElementById("result" + testId);

    if (!inputField || !outputField || !resultDisplay) {
        console.error(`DOM elements for test case '${testId}' are missing.`);
        return;
    }

    const testInputData = inputField.value;
    // Assuming the expected output is a single line.
    const anticipatedOutput = outputField.value.split("\n")[0];

    let actualComputedResult;
    try {
        actualComputedResult = ProcessGridOperations(testInputData);
    } catch (err) {
        console.error(`An error occurred while processing test case '${testId}':`, err);
        resultDisplay.innerHTML = "ERROR";
        return;
    }

    // Compare the actual result against the anticipated output.
    const testStatus = (String(actualComputedResult) === anticipatedOutput) ? "AC" : "WA";
    resultDisplay.innerHTML = testStatus;
    console.log(`Test Case ${testId}: Expected=${anticipatedOutput}, Actual=${actualComputedResult}, Status=${testStatus}`);
}

// Standard entry point for competitive programming platforms (e.g., Node.js environment).
// Reads input from standard input stream and invokes the main grid processing function.
ProcessGridOperations(require("fs").readFileSync("/dev/stdin", "utf8"));