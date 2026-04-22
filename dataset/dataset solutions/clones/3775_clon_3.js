const parseLineToNumbers = (lineContent) => {
    // Basic validation for the input line content.
    if (typeof lineContent !== 'string' || lineContent.trim() === '') {
        console.error('Error: Attempted to parse an invalid or empty line.');
        // Depending on strictness, could throw an error or return an empty array.
        return [];
    }
    return lineContent.split(' ').map(token => {
        const numericValue = Number(token);
        // Additional check for non-numeric tokens within a line.
        if (isNaN(numericValue)) {
            console.warn(`Warning: Encountered non-numeric token "${token}". Treating as 0.`);
            return 0; // Or handle as an error if strictness is higher.
        }
        return numericValue;
    });
};

const calculateMinGridColoringCost = (fullInputString) => {
    /*
     * This module processes a multi-line string input to determine the minimum
     * transformation cost for a grid of colors. The goal is to recolor the grid
     * such that cells (row, col) with the same (row + col) % 3 value share a
     * common target color, and these three target colors (for modulo 0, 1, and 2)
     * must all be distinct.
     *
     * Input Format:
     * 1. First line: Two integers, 'gridSize' (N) and 'numAvailableColors' (C).
     * 2. Next 'numAvailableColors' lines: A C x C matrix representing 'colorChangeCostMatrix'.
     *    colorChangeCostMatrix[originalColor][targetColor] is the cost to change.
     * 3. Next 'gridSize' lines: An N x N matrix representing 'initialGridState'.
     *    Colors in initialGridState are 1-indexed and must be converted to 0-indexed.
     */

    if (typeof fullInputString !== 'string' || fullInputString.length === 0) {
        console.error("Input string is either not a string or is empty. Cannot process.");
        // Exiting gracefully or throwing an exception based on desired error handling.
        return;
    }

    // Normalize and split the input into an array of individual lines.
    const inputDataLines = fullInputString.trim().split('\n');

    // --- Phase 1: Input Dimensions and Initial Setup ---
    if (inputDataLines.length < 1) {
        console.error("Input contains no lines. Cannot extract grid dimensions.");
        return;
    }

    const dimensionAndColorInfo = parseLineToNumbers(inputDataLines[0]);

    if (dimensionAndColorInfo.length < 2) {
        console.error("First line must specify grid size (N) and number of colors (C).");
        return;
    }

    const gridSize = dimensionAndColorInfo[0]; // N
    const numAvailableColors = dimensionAndColorInfo[1]; // C

    // Early exit for non-positive or trivial dimensions.
    if (gridSize <= 0 || numAvailableColors <= 0) {
        console.log(0); // Assuming 0 cost for an empty or invalid grid configuration.
        return;
    }

    // Validate if enough lines are provided for the cost matrix and the grid itself.
    const minimumRequiredLines = 1 + numAvailableColors + gridSize;
    if (inputDataLines.length < minimumRequiredLines) {
        console.error(`Insufficient input lines. Expected at least ${minimumRequiredLines}, but got ${inputDataLines.length}.`);
        return;
    }

    // --- Phase 2: Parse Color Change Cost Matrix ---
    const colorChangeCostMatrix = []; // This replaces the 'd' variable.
    const costMatrixStartLineIndex = 1;

    for (let currentCostRowIndex = 0; currentCostRowIndex < numAvailableColors; currentCostRowIndex++) {
        const lineContent = inputDataLines[costMatrixStartLineIndex + currentCostRowIndex];
        const parsedCostRow = parseLineToNumbers(lineContent);

        // Validate each row of the cost matrix.
        if (parsedCostRow.length !== numAvailableColors) {
            console.error(`Error in cost matrix row ${currentCostRowIndex}: Expected ${numAvailableColors} values, but found ${parsedCostRow.length}.`);
            return;
        }
        colorChangeCostMatrix.push(parsedCostRow);
    }

    // --- Phase 3: Parse Initial Grid State ---
    const initialGridState = []; // This replaces the 'a' variable.
    const gridStateStartLineIndex = costMatrixStartLineIndex + numAvailableColors;

    for (let currentGridRowIndex = 0; currentGridRowIndex < gridSize; currentGridRowIndex++) {
        const lineContent = inputDataLines[gridStateStartLineIndex + currentGridRowIndex];
        const parsedGridRow = parseLineToNumbers(lineContent);

        // Validate each row of the initial grid.
        if (parsedGridRow.length !== gridSize) {
            console.error(`Error in grid row ${currentGridRowIndex}: Expected ${gridSize} values, but found ${parsedGridRow.length}.`);
            return;
        }
        // Convert 1-indexed colors from input to 0-indexed for internal use.
        initialGridState.push(parsedGridRow.map(colorValue => colorValue - 1));
    }

    // --- Phase 4: Pre-compute Color Distribution by Modulo Group ---
    // This matrix, 'colorCountsByModuloGroup', stores:
    // colorCountsByModuloGroup[moduloGroupIdentifier][originalColorIndex] = count
    // The moduloGroupIdentifier can be 0, 1, or 2 (from (row + col) % 3).
    // The originalColorIndex ranges from 0 to numAvailableColors - 1.
    const colorCountsByModuloGroup = Array.from({ length: 3 }, () => Array(numAvailableColors).fill(0)); // Replaces 'z'.

    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            const currentModuloGroup = (r + c) % 3;
            const originalColorOfCell = initialGridState[r][c];

            // Validate that the color is within the expected range.
            if (originalColorOfCell < 0 || originalColorOfCell >= numAvailableColors) {
                console.warn(`Warning: Cell (${r}, ${c}) contains an out-of-bounds color index (${originalColorOfCell}). Skipping this cell.`);
                continue; // Skip invalid cell data.
            }

            colorCountsByModuloGroup[currentModuloGroup][originalColorOfCell]++;
        }
    }

    // --- Phase 5: Determine Minimum Overall Transformation Cost ---
    let minimumOverallCost = Number.MAX_SAFE_INTEGER; // Replaces 'ans'.

    // A critical constraint: we need at least 3 distinct colors to assign to the 3 modulo groups.
    if (numAvailableColors < 3) {
        console.log(minimumOverallCost); // Outputting MAX_SAFE_INTEGER indicates no valid solution under constraints.
        return;
    }

    // Iterate through all possible combinations of three distinct target colors.
    // targetColorForGroup0: Color for (row + col) % 3 == 0 cells.
    // targetColorForGroup1: Color for (row + col) % 3 == 1 cells.
    // targetColorForGroup2: Color for (row + col) % 3 == 2 cells.
    for (let targetColorForGroup0 = 0; targetColorForGroup0 < numAvailableColors; targetColorForGroup0++) {
        for (let targetColorForGroup1 = 0; targetColorForGroup1 < numAvailableColors; targetColorForGroup1++) {
            // Ensure target color for group 1 is distinct from group 0.
            if (targetColorForGroup0 === targetColorForGroup1) {
                continue;
            }

            for (let targetColorForGroup2 = 0; targetColorForGroup2 < numAvailableColors; targetColorForGroup2++) {
                // Ensure target color for group 2 is distinct from both group 0 and group 1.
                if (targetColorForGroup2 === targetColorForGroup0 || targetColorForGroup2 === targetColorForGroup1) {
                    continue;
                }

                let currentCombinationCalculatedCost = 0; // Replaces 't'.

                // Calculate cost for the first modulo group (0).
                // Sum up (count of original color 'k' in group 0) * (cost to change 'k' to targetColorForGroup0).
                for (let originalColorIndex = 0; originalColorIndex < numAvailableColors; originalColorIndex++) {
                    const countInGroup0 = colorCountsByModuloGroup[0][originalColorIndex];
                    const costToTransform = colorChangeCostMatrix[originalColorIndex][targetColorForGroup0];
                    currentCombinationCalculatedCost += countInGroup0 * costToTransform;
                }

                // Calculate cost for the second modulo group (1).
                // Sum up (count of original color 'k' in group 1) * (cost to change 'k' to targetColorForGroup1).
                for (let originalColorIndex = 0; originalColorIndex < numAvailableColors; originalColorIndex++) {
                    const countInGroup1 = colorCountsByModuloGroup[1][originalColorIndex];
                    const costToTransform = colorChangeCostMatrix[originalColorIndex][targetColorForGroup1];
                    currentCombinationCalculatedCost += countInGroup1 * costToTransform;
                }

                // Calculate cost for the third modulo group (2).
                // Sum up (count of original color 'k' in group 2) * (cost to change 'k' to targetColorForGroup2).
                for (let originalColorIndex = 0; originalColorIndex < numAvailableColors; originalColorIndex++) {
                    const countInGroup2 = colorCountsByModuloGroup[2][originalColorIndex];
                    const costToTransform = colorChangeCostMatrix[originalColorIndex][targetColorForGroup2];
                    currentCombinationCalculatedCost += countInGroup2 * costToTransform;
                }

                // Update the global minimum cost if the current combination is cheaper.
                minimumOverallCost = Math.min(minimumOverallCost, currentCombinationCalculatedCost);
            }
        }
    }

    // --- Phase 6: Output the Result ---
    // If minimumOverallCost is still Number.MAX_SAFE_INTEGER, it implies no valid
    // distinct color combination was found, typically due to numAvailableColors < 3.
    if (minimumOverallCost === Number.MAX_SAFE_INTEGER) {
        console.log("No feasible distinct color assignment found for the three modulo groups.");
    } else {
        console.log(minimumOverallCost);
    }
};

// This part is environment-specific for reading from standard input.
// It remains untouched as it's an external dependency.
calculateMinGridColoringCost(require("fs").readFileSync("/dev/stdin", "utf8"));