function GridAnalysisProcessor(rawInputData) {
    // This function processes grid data to count the occurrences of 3x3 subgrids
    // containing a specific number of black cells (from 0 to 9).

    // --- Phase 1: Input Parsing and Initial Setup ---

    // Type III: Robust input validation and filtering of empty lines.
    // The raw input string is split into individual lines, and any blank lines are discarded.
    const dataLines = rawInputData.split('\n').filter(line => line.trim().length > 0);

    // Type III: Initial guard clause for completely empty input data.
    if (dataLines.length === 0) {
        console.error("No input data provided for grid analysis. Outputting default zero counts.");
        // If no grid is defined, no 3x3 squares exist, so all counts are zero.
        console.log(Array(10).fill(0).join('\n'));
        return;
    }

    // Type III: More explicit and robust parsing of grid dimensions from the first line.
    // The first line is expected to contain two space-separated integers: totalGridRows and totalGridCols.
    const dimensionTokens = dataLines[0].split(' ');
    const totalGridRows = parseInt(dimensionTokens[0], 10);
    const totalGridCols = parseInt(dimensionTokens[1], 10);

    // Type III: Validation for grid dimensions.
    // Ensure that parsed dimensions are valid positive integers.
    if (isNaN(totalGridRows) || isNaN(totalGridCols) || totalGridRows < 1 || totalGridCols < 1) {
        console.error(`Invalid grid dimensions: Rows (${dimensionTokens[0]}) and columns (${dimensionTokens[1]}) must be positive integers.`);
        console.log(Array(10).fill(0).join('\n')); // Output default if dimensions are invalid.
        return;
    }

    // Type II: Renamed variable for clarity.
    // Type III: Combined declaration and initialization.
    // This array will store the frequency of 3x3 squares having 'k' black cells,
    // where 'k' is the index (from 0 to 9).
    const blackCellDensityCounts = Array(10).fill(0);

    // Type III: Initial calculation for 3x3 squares with zero black cells.
    // The total number of possible 3x3 subgrids is (totalGridRows - 2) * (totalGridCols - 2).
    // We use Math.max(0, ...) to handle cases where the grid is too small (e.g., H < 3 or W < 3)
    // and no valid 3x3 squares can exist, preventing negative counts.
    const initialEmptySquares = Math.max(0, (totalGridRows - 2) * (totalGridCols - 2));
    blackCellDensityCounts[0] = initialEmptySquares;

    // Type III: Early exit if only grid dimensions are provided and no black cells are specified.
    // In this scenario, only the count for 0 black cells (all white) is relevant.
    if (dataLines.length === 1) {
        console.log(blackCellDensityCounts.join('\n'));
        return;
    }

    // Type II: Renamed variable.
    // Type III: Uses `let` for a mutable grid state represented as a 2D array.
    // `true` indicates a black cell, `false` indicates a white cell.
    // The grid is initially filled with all white cells.
    let gridOccupancyMatrix = Array.from({ length: totalGridRows }, () => Array(totalGridCols).fill(false));

    // Type III: Helper constant for iterating 3x3 offsets.
    const TERNARY_OFFSETS = [-1, 0, 1];

    // --- Phase 2: Process Black Cell Placements and Update Frequencies ---

    // Type II: Renamed loop variable `k` for better context.
    // Type III: Iterating from the second line onwards, as the first line contains dimensions.
    // Each subsequent line specifies the 1-indexed coordinates of a cell to be marked black.
    for (let currentLineIdx = 1; currentLineIdx < dataLines.length; currentLineIdx++) {
        // Type III: More explicit parsing of coordinates from the current line.
        const coordStringPair = dataLines[currentLineIdx].split(' ');
        let blackDotRow = parseInt(coordStringPair[0], 10) - 1; // Convert to 0-indexed row
        let blackDotCol = parseInt(coordStringPair[1], 10) - 1; // Convert to 0-indexed column

        // Type III: Input validation for black cell coordinates.
        // Skip coordinates that are outside the grid boundaries to prevent errors.
        if (isNaN(blackDotRow) || isNaN(blackDotCol) ||
            blackDotRow < 0 || blackDotRow >= totalGridRows ||
            blackDotCol < 0 || blackDotCol >= totalGridCols) {
            console.warn(`Skipping invalid black cell coordinate: (${coordStringPair[0]}, ${coordStringPair[1]}) as it is out of grid bounds.`);
            continue;
        }

        // Type III: Optimization/Guard: If the cell is already black, its placement won't change
        // the counts, so we can skip processing this specific coordinate.
        if (gridOccupancyMatrix[blackDotRow][blackDotCol]) {
            continue;
        }

        // Mark the current cell as black on the grid.
        gridOccupancyMatrix[blackDotRow][blackDotCol] = true;

        // Type III: Iterate through all 9 potential 3x3 subgrids that could be affected
        // by the newly placed black cell at (blackDotRow, blackDotCol).
        // A 3x3 subgrid is uniquely identified by its center cell (centerOfSquareRow, centerOfSquareCol).
        // The newly black cell can be the center itself, or one of the 8 surrounding cells
        // within an affected 3x3 square.
        for (let rowOffsetFromDot = -1; rowOffsetFromDot <= 1; rowOffsetFromDot++) {
            for (let colOffsetFromDot = -1; colOffsetFromDot <= 1; colOffsetFromDot++) {
                // Calculate the coordinates of the potential center of an affected 3x3 subgrid.
                const centerOfSquareRow = blackDotRow + rowOffsetFromDot;
                const centerOfSquareCol = blackDotCol + colOffsetFromDot;

                // Type III: Validate if this potential center forms a complete 3x3 subgrid
                // that is entirely contained within the main grid boundaries.
                // A 3x3 square centered at (R, C) covers cells from (R-1, C-1) to (R+1, C+1).
                // Therefore, R-1 must be >= 0 (R >= 1) and R+1 must be <= totalGridRows - 1 (R <= totalGridRows - 2).
                // Similar logic applies to columns.
                const isSquareCenterValid = (centerOfSquareRow >= 1 && centerOfSquareRow <= totalGridRows - 2) &&
                                            (centerOfSquareCol >= 1 && centerOfSquareCol <= totalGridCols - 2);

                if (isSquareCenterValid) {
                    // This 3x3 subgrid is valid and its black cell count needs to be re-evaluated.
                    let currentBlackCountInSquare = 0;

                    // Type III: Use clearer loop variables for iterating within the current 3x3 square.
                    // Calculate the total number of black cells within this specific 3x3 subgrid.
                    for (let subgridRowOffset of TERNARY_OFFSETS) {
                        for (let subgridColOffset of TERNARY_OFFSETS) {
                            const checkCellRow = centerOfSquareRow + subgridRowOffset;
                            const checkCellCol = centerOfSquareCol + subgridColOffset;

                            // Access gridOccupancyMatrix; no need for explicit bounds check here because
                            // the `isSquareCenterValid` condition already guarantees that `checkCellRow`
                            // and `checkCellCol` will always fall within the main grid's boundaries.
                            if (gridOccupancyMatrix[checkCellRow][checkCellCol]) {
                                currentBlackCountInSquare++;
                            }
                        }
                    }

                    // Type III: Update the frequency counts based on the change.
                    // Since a new black cell was just added, the count for this 3x3 square increased by 1.
                    // We must decrement the frequency for the *previous* count and increment for the *new* count.
                    // The `currentBlackCountInSquare` variable holds the count *after* the new black cell was added.
                    // Therefore, the previous count for this square was `currentBlackCountInSquare - 1`.
                    // It is guaranteed that `currentBlackCountInSquare` will be at least 1 here, because the
                    // newly placed black cell (blackDotRow, blackDotCol) is part of this 3x3 square.
                    blackCellDensityCounts[currentBlackCountInSquare - 1]--; // Decrement frequency for the old count.
                    blackCellDensityCounts[currentBlackCountInSquare]++;     // Increment frequency for the new count.
                }
            }
        }
    }

    // --- Phase 3: Output Results ---

    // Type II: Ensure consistent output format as specified by the problem.
    // The final frequencies are joined by newline characters and printed to the console.
    console.log(blackCellDensityCounts.join('\n'));
}

// Type III: Added a comment to clarify the purpose of this standard input handling section.
// This section is responsible for reading the input from standard I/O and invoking
// the main processing function. As per the problem instructions, this part should
// not be modified.
GridAnalysisProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));