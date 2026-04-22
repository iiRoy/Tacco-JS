// This program generates a binary grid pattern based on four input parameters:
// grid height, grid width, a horizontal divider, and a vertical divider.
// The pattern forms a checkerboard-like structure where regions are defined
// by whether they are above/below the vertical divider and left/right of the horizontal divider.

// The core logic assigns '0' if a cell is in the same quadrant (e.g., both top-left or both bottom-right)
// relative to the dividers, and '1' if it's in different quadrants (e.g., top-right or bottom-left).

/**
 * Generates and prints a binary grid pattern to the console.
 *
 * @param {string} inputStringData - The raw input string, expected to contain
 *                                   "H W A B" on the first line, where:
 *                                   H = grid height (number of rows)
 *                                   W = grid width (number of columns)
 *                                   A = horizontal divider position (columns < A are left half)
 *                                   B = vertical divider position (rows < B are top half)
 */
const ProcessGridPattern = (inputStringData) => {
    // Begin by validating the input string's presence and type.
    if (typeof inputStringData !== 'string' || inputStringData.trim().length === 0) {
        console.error("Execution Aborted: Input data is either missing or not a valid string.");
        return; // Terminate execution if input is invalid.
    }

    // Extract the crucial first line from the input.
    // We use .trim() to handle potential leading/trailing whitespace on the line.
    const parameterLine = inputStringData.split('\n')[0].trim();

    // Parse the space-separated numerical parameters.
    // Using parseInt with radix 10 ensures reliable integer conversion.
    const numericParameters = parameterLine.split(' ').map(value => parseInt(value, 10));

    // Destructure the array into clearly named constants for better readability.
    const [gridHeight, gridWidth, horizontalDivider, verticalDivider] = numericParameters;

    // --- Comprehensive Input Validation (Guard Clauses) ---
    // Check for invalid parsing results (NaN) and ensure dimensions are positive.
    if (
        isNaN(gridHeight) || isNaN(gridWidth) || isNaN(horizontalDivider) || isNaN(verticalDivider) ||
        gridHeight <= 0 || gridWidth <= 0 || horizontalDivider < 0 || verticalDivider < 0
    ) {
        console.error("Execution Aborted: One or more numerical parameters are invalid. Ensure all are non-negative integers and height/width are positive.");
        return; // Stop if core parameters are malformed.
    }

    // Add a warning if divider positions exceed the grid's actual dimensions.
    // The logic will still function, but the pattern might appear uniform if a divider is 'outside'.
    if (horizontalDivider > gridWidth || verticalDivider > gridHeight) {
        console.warn("Warning: Divider positions are set beyond the grid's boundaries. This may simplify the resulting pattern.");
    }

    // Initialize an empty array that will store the complete 2D grid structure.
    let generatedMatrix = [];

    // --- Grid Construction Loop ---
    // The outer loop iterates through each row of the grid.
    for (let currentGridRow = 0; currentGridRow < gridHeight; currentGridRow++) {
        // For each row, an array is prepared to hold its cell values (0s or 1s).
        let rowContent = [];

        // Pre-calculate whether the current row falls into the "top" half
        // based on the vertical divider. This boolean is used in the inner loop.
        const isCurrentRowInTopSection = currentGridRow < verticalDivider;

        // The inner loop iterates through each column within the current row.
        for (let currentGridColumn = 0; currentGridColumn < gridWidth; currentGridColumn++) {
            // Pre-calculate whether the current column falls into the "left" half
            // based on the horizontal divider.
            const isCurrentColumnInLeftSection = currentGridColumn < horizontalDivider;

            // Determine the cell's value using a logical XOR-like pattern.
            // If both (row, column) are in the same relative section (both top/left or both bottom/right),
            // the value is 0. Otherwise (top/right or bottom/left), it's 1.
            const cellFinalValue = (isCurrentRowInTopSection === isCurrentColumnInLeftSection) ? 0 : 1;

            // Add the determined value to the current row's array.
            rowContent.push(cellFinalValue);
        }
        // After completing all columns for the current row, add the full row to the matrix.
        generatedMatrix.push(rowContent);
    }

    // --- Output Phase ---
    // Iterate over the fully generated matrix and print each row to the console.
    // The numerical values in each row are joined directly into a string,
    // producing output like "0011" for a row.
    generatedMatrix.forEach(rowArray => {
        console.log(rowArray.join(''));
    });
};

// Invoke the pattern generation function, reading input from standard input.
// This setup is typical for competitive programming environments in Node.js.
ProcessGridPattern(require('fs').readFileSync('/dev/stdin', 'utf8'));