// This module contains a function designed to find the minimum number of steps
// required to traverse a specialized grid from a starting point to a target column.
// It employs a Breadth-First Search (BFS) algorithm to guarantee the shortest path.

/**
 * Finds the shortest path length from initial positions [0,0] or [1,0] to the final column (gridDimension - 1).
 * The grid has special movement rules based on cell values (0, 1, or 2).
 *
 * @param {number} gridDimension The number of columns in the grid.
 * @param {Array<Array<number>>} terrainLayout A 2xN array representing the grid,
 *                                             where terrainLayout[row][col] is the cell type.
 * @returns {number|string} The minimum number of steps to reach the target column,
 *                          or "NO_SOLUTION_FOUND" if no path exists,
 *                          or "INVALID_DIMENSION" if the input dimension is non-positive.
 */
function explorePath(gridDimension, terrainLayout) {
    // A data structure to efficiently track all grid coordinates that have already been visited.
    // This prevents infinite loops and redundant processing in the BFS.
    const visitedCoordinates = new Set();

    // The core queue for the Breadth-First Search. Each element is an array:
    // [current_row_index, current_column_index, steps_taken_to_reach_this_point].
    // The search begins from two initial positions in column 0 for both rows, with 0 steps taken.
    const bfsFrontier = [[0, 0, 0], [1, 0, 0]];

    // This variable will store the length of the shortest path discovered.
    // It is initialized to null, indicating that no valid path has been found yet.
    let shortestPathLength = null;

    // --- Input Validation Guard Clause ---
    // If the grid dimension is not positive, it's an invalid scenario for pathfinding.
    if (gridDimension <= 0) {
        return "INVALID_DIMENSION";
    }

    // --- Main Breadth-First Search Loop ---
    // The loop continues as long as there are unvisited states in the queue.
    while (bfsFrontier.length > 0) {
        // Dequeue the next state to explore. This involves destructuring the array
        // into its component parts: row, column, and the number of steps.
        const [currentRow, currentColumn, stepsTaken] = bfsFrontier.shift();

        // Construct a unique string key for the current cell's coordinates.
        // This is used for quick lookups in the visitedCoordinates set.
        const currentCellKey = `${currentRow},${currentColumn}`;

        // If this specific cell has already been processed, skip it to avoid redundant work.
        if (visitedCoordinates.has(currentCellKey)) {
            continue;
        }

        // Mark the current cell as visited to ensure it's not processed again.
        visitedCoordinates.add(currentCellKey);

        // --- Goal Condition Check ---
        // A path is considered found if we've reached the last column (gridDimension - 1)
        // AND the cell type is not '2'. Type '2' cells have a special leftward movement
        // which might prevent a direct "goal" state at the boundary unless explicitly handled.
        if (currentColumn === gridDimension - 1 && terrainLayout[currentRow][currentColumn] !== 2) {
            // In BFS, the first path found to any target is guaranteed to be the shortest.
            shortestPathLength = stepsTaken;
            break; // Terminate the BFS immediately as the optimal solution is found.
        }

        // Retrieve the type of the current cell from the terrain layout.
        // This value dictates any special movement rules.
        const cellValueType = terrainLayout[currentRow][currentColumn];
        let effectiveColumnForNextMoves = currentColumn; // This will be the base column for branching.

        // --- Special Movement Logic Based on Cell Type ---
        if (cellValueType === 1) {
            // Type 1 cell: This implies a special movement where the explorer
            // moves right as far as possible, as long as the cells encountered are also type 1,
            // or until the grid boundary is reached.
            let speculativeColumn = currentColumn;
            let reachedFarRightBoundary = false;

            // Loop to determine the furthest possible column to the right.
            while (true) {
                speculativeColumn++; // Tentatively move one column to the right.

                // If the speculative column reaches the grid's rightmost edge (gridDimension - 1),
                // this path has successfully reached the boundary.
                if (speculativeColumn === gridDimension - 1) {
                    reachedFarRightBoundary = true;
                    break;
                }
                // If the next cell encountered is NOT a type 1 cell, the rightward movement stops.
                if (terrainLayout[currentRow][speculativeColumn] !== 1) {
                    speculativeColumn--; // Revert to the last valid type 1 cell.
                    break;
                }
            }

            // If the special rightward movement directly led to the grid's end boundary,
            // this signifies finding a path to the goal.
            if (reachedFarRightBoundary) {
                shortestPathLength = stepsTaken;
                break; // Exit BFS as the shortest path is confirmed.
            }
            effectiveColumnForNextMoves = speculativeColumn; // Update the effective column for subsequent branching.

        } else if (cellValueType === 2) {
            // Type 2 cell: This implies a special movement where the explorer
            // moves left as far as possible, as long as the cells encountered are also type 2.
            let speculativeColumn = currentColumn;
            while (true) {
                speculativeColumn--; // Tentatively move one column to the left.
                // If the speculative column goes beyond the left boundary (column 0)
                // or the next cell is not type 2, the leftward movement stops.
                if (speculativeColumn < 0 || terrainLayout[currentRow][speculativeColumn] !== 2) {
                    speculativeColumn++; // Revert to the last valid type 2 cell.
                    break;
                }
            }
            effectiveColumnForNextMoves = speculativeColumn; // Update the effective column for subsequent branching.
        }

        // --- Generate Next States for BFS ---
        // From the `effectiveColumnForNextMoves`, the explorer can transition to the other row
        // and explore three adjacent columns: `effectiveColumn`, `effectiveColumn + 1`, and `effectiveColumn + 2`.
        const nextRowIndex = 1 - currentRow; // Always switches to the alternate row (0 <-> 1).
        const nextStepCount = stepsTaken + 1; // Increment the path length for new states.

        // Iterate through the three possible column offsets (0, 1, 2) relative to the effective column.
        for (let colOffset = 0; colOffset <= 2; colOffset++) {
            const candidateNextColumn = effectiveColumnForNextMoves + colOffset;

            // Ensure the candidate next column is within the valid grid boundaries [0, gridDimension - 1].
            if (candidateNextColumn >= 0 && candidateNextColumn < gridDimension) {
                // Add this new valid state (row, column, updated step count) to the BFS queue.
                bfsFrontier.push([nextRowIndex, candidateNextColumn, nextStepCount]);
            }
        }
    }

    // After the BFS loop completes, return the result.
    // If `shortestPathLength` is not null, a path was found; otherwise, no solution exists.
    return shortestPathLength !== null ? shortestPathLength : "NO_SOLUTION_FOUND";
}

// --- Main Execution Block: Handles Input/Output Operations ---

// Read all input data from standard input (e.g., /dev/stdin in a Unix-like environment).
// The input is expected to be UTF-8 encoded.
const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input: remove any leading/trailing whitespace and split it into individual lines.
const inputLinesArray = rawInputData.trim().split('\n');

// Loop through the input lines, processing one puzzle at a time.
// The loop continues until a grid dimension of 0 is encountered, signaling the end of input.
while (inputLinesArray.length > 0) {
    // Extract the grid dimension (N) from the first line of the current puzzle.
    // Use parseInt with radix 10 for reliable number conversion.
    const currentGridDimension = parseInt(inputLinesArray.shift(), 10);

    // If the dimension is 0, this is the termination condition for the input processing.
    if (currentGridDimension === 0) {
        break;
    }

    // --- Input Validation for Grid Dimension ---
    // Check for non-numeric or negative grid dimensions, which indicate malformed input.
    if (isNaN(currentGridDimension) || currentGridDimension < 0) {
        console.error("Error: Invalid grid dimension encountered. Skipping remaining input.");
        break; // Exit the loop due to critical input error.
    }

    // Initialize an array to hold the 2xN grid's terrain data.
    // The problem statement implies a fixed two-row grid.
    const terrainLayout = [];

    // Populate the two rows of the terrain layout from the input.
    for (let rowIndex = 0; rowIndex < 2; rowIndex++) {
        // --- Input Validation for Grid Rows ---
        // Ensure there are enough lines remaining in the input to define the grid rows.
        if (inputLinesArray.length === 0) {
            console.error(`Error: Incomplete grid definition for dimension ${currentGridDimension}. Missing row ${rowIndex}.`);
            // If input is exhausted prematurely, it's a critical error for the current puzzle.
            return; // Exit the entire script.
        }

        // Parse the current row: split by spaces and convert each segment to a number.
        const parsedRow = inputLinesArray.shift()
                                        .split(' ')
                                        .map(value => parseInt(value, 10));

        // --- Input Validation for Row Length ---
        // Verify that the number of elements in the parsed row matches the expected grid dimension.
        if (parsedRow.length !== currentGridDimension) {
            console.error(`Error: Row ${rowIndex} has an incorrect number of columns (${parsedRow.length}), expected ${currentGridDimension}.`);
            return; // Exit the script due to malformed input.
        }
        terrainLayout[rowIndex] = parsedRow;
    }

    // Call the pathfinding function with the parsed grid data for the current puzzle.
    const puzzleResult = explorePath(currentGridDimension, terrainLayout);

    // Output the result for the current puzzle to standard output.
    console.log(puzzleResult);
}