/**
 * This module is designed to process a grid and track the distribution of marked cells
 * within all possible 3x3 subgrids. It takes grid dimensions and a series of coordinates
 * to mark cells, then outputs the counts of 3x3 squares that contain 0 to 9 marked cells.
 */

/**
 * Determines the number of 'true' (marked) cells within a 3x3 square centered at
 * the given coordinates (centerRow, centerCol) in the provided grid.
 * It's assumed that the center coordinates are valid, meaning a full 3x3 square
 * can be formed within the grid boundaries.
 *
 * @param {boolean[][]} currentGridState - The 2D boolean array representing the grid's current state.
 * @param {number} centerRow - The 0-indexed row coordinate of the 3x3 square's center.
 * @param {number} centerCol - The 0-indexed column coordinate of the 3x3 square's center.
 * @returns {number} The total count of marked cells within the 3x3 square.
 */
function calculateSquareOccupancy(currentGridState, centerRow, centerCol) {
    let markedCellCount = 0; // Initialize a counter for marked cells in the 3x3 square

    // Iterate through the 3x3 neighborhood relative to the center
    for (let rOffset = -1; rOffset <= 1; rOffset++) {
        for (let cOffset = -1; cOffset <= 1; cOffset++) {
            const currentRowIndex = centerRow + rOffset;
            const currentColIndex = centerCol + cOffset;

            // Check if the cell at (currentRowIndex, currentColIndex) is marked
            // No need for explicit boundary checks here as the caller ensures the 3x3 square fits.
            if (currentGridState[currentRowIndex][currentColIndex]) {
                markedCellCount++; // Increment if the cell is marked
            }
        }
    }
    return markedCellCount;
}

/**
 * Orchestrates the grid processing operations based on standard input.
 * It parses grid dimensions from the first line and then processes subsequent lines
 * as coordinates for cells to be marked. Finally, it prints the counts of
 * 3x3 squares having 0 to 9 marked cells, each on a new line.
 *
 * @param {string} rawInputData - The entire raw input string, typically read from /dev/stdin.
 */
function processGridOperations(rawInputData) {
    // Clean and split the input into individual lines
    const inputLines = rawInputData.trim().split('\n');

    // --- Step 1: Parse initial grid dimensions ---
    const dimensionTokens = inputLines[0].split(' ').map(Number);
    const gridHeight = dimensionTokens[0]; // Total number of rows in the grid
    const gridWidth = dimensionTokens[1];  // Total number of columns in the grid

    // Initialize an array to store the final counts.
    // resultMetrics[k] will hold the number of 3x3 squares containing exactly k marked cells.
    // A 3x3 square can have 0 to 9 marked cells.
    const resultMetrics = Array.from({ length: 10 }, () => 0);

    // --- Step 2: Handle edge cases where 3x3 subgrids cannot exist ---
    // A 3x3 square requires a grid of at least 3x3 dimensions.
    if (gridHeight < 3 || gridWidth < 3) {
        console.log(resultMetrics.join('\n')); // Output all zeros and exit
        return;
    }

    // Calculate the total number of possible 3x3 squares whose centers
    // are within the valid range (i.e., not on the outer perimeter rows/columns).
    // The center of a 3x3 square (0-indexed) can range from (1,1) to (H-2, W-2).
    const totalPotentialSquareCenters = (gridHeight - 2) * (gridWidth - 2);
    // Initially, all these squares have zero marked cells.
    resultMetrics[0] = totalPotentialSquareCenters;

    // --- Step 3: Early exit if only dimensions were provided (no cells to mark) ---
    if (inputLines.length === 1) {
        console.log(resultMetrics.join('\n'));
        return;
    }

    // --- Step 4: Initialize the grid state ---
    // Create a 2D boolean array representing the grid.
    // 'true' indicates a marked cell, 'false' indicates an unmarked cell.
    const markedCellsGrid = Array.from({ length: gridHeight }, () =>
        Array.from({ length: gridWidth }, () => false)
    );

    // --- Step 5: Process each coordinate update from the input ---
    // Iterate through the input lines starting from the second line (index 1),
    // as the first line contains dimensions.
    for (let currentLineIndex = 1; currentLineIndex < inputLines.length; currentLineIndex++) {
        const lineContent = inputLines[currentLineIndex].trim();
        if (!lineContent) {
            continue; // Skip empty lines that might appear in the input
        }

        const coordinateTokens = lineContent.split(' ').map(Number);
        const oneIndexedRow = coordinateTokens[0]; // Original 1-indexed row from input
        const oneIndexedCol = coordinateTokens[1]; // Original 1-indexed column from input

        // Convert to 0-indexed coordinates for internal array usage
        const zeroIndexedRow = oneIndexedRow - 1;
        const zeroIndexedCol = oneIndexedCol - 1;

        // Input validation: Ensure coordinates are within grid bounds
        const isValidCoordinate =
            zeroIndexedRow >= 0 && zeroIndexedRow < gridHeight &&
            zeroIndexedCol >= 0 && zeroIndexedCol < gridWidth;

        if (!isValidCoordinate) {
            // Optionally, log a warning for invalid coordinates. For this clone, we just skip.
            continue;
        }

        // Optimization: If the cell is already marked, marking it again won't change counts, so skip.
        if (markedCellsGrid[zeroIndexedRow][zeroIndexedCol]) {
            continue;
        }

        // Mark the cell in the grid
        markedCellsGrid[zeroIndexedRow][zeroIndexedCol] = true;

        // --- Step 6: Update counts for all 3x3 squares affected by the newly marked cell ---
        // A newly marked cell (zeroIndexedRow, zeroIndexedCol) affects any 3x3 square
        // whose center (centerR, centerC) is located within the 3x3 area around the marked cell.
        // This means centerR is in [zeroIndexedRow - 1, zeroIndexedRow + 1]
        // and centerC is in [zeroIndexedCol - 1, zeroIndexedCol + 1].
        for (let centerRowOffset = -1; centerRowOffset <= 1; centerRowOffset++) {
            for (let centerColOffset = -1; centerColOffset <= 1; centerColOffset++) {
                const potentialCenterRow = zeroIndexedRow + centerRowOffset;
                const potentialCenterCol = zeroIndexedCol + centerColOffset;

                // Check if this (potentialCenterRow, potentialCenterCol) is a valid center
                // for a 3x3 square that fits entirely within the main grid.
                // Valid centers (0-indexed) are from (1,1) to (gridHeight-2, gridWidth-2).
                const isCenterWithinValidRange =
                    potentialCenterRow >= 1 && potentialCenterRow <= gridHeight - 2 &&
                    potentialCenterCol >= 1 && potentialCenterCol <= gridWidth - 2;

                if (isCenterWithinValidRange) {
                    // Calculate the current number of marked cells in this 3x3 square
                    // after the new cell (zeroIndexedRow, zeroIndexedCol) has been marked.
                    const currentOccupancyCount = calculateSquareOccupancy(
                        markedCellsGrid,
                        potentialCenterRow,
                        potentialCenterCol
                    );

                    // The previous occupancy count for this square (before the current cell was marked)
                    // must have been one less than the current count.
                    const previousOccupancyCount = currentOccupancyCount - 1;

                    // Adjust the result metrics:
                    // Decrement the count for squares that previously had 'previousOccupancyCount' marked cells.
                    // Increment the count for squares that now have 'currentOccupancyCount' marked cells.
                    if (previousOccupancyCount >= 0) { // Safety check; should always be valid if currentOccupancyCount >= 1
                        resultMetrics[previousOccupancyCount]--;
                    }
                    resultMetrics[currentOccupancyCount]++;
                }
            }
        }
    }

    // --- Step 7: Output the final calculated metrics ---
    console.log(resultMetrics.join('\n'));
}

// The following line ensures that the processing function is called with the
// standard input data when the script is executed.
processGridOperations(require("fs").readFileSync("/dev/stdin", "utf8"));