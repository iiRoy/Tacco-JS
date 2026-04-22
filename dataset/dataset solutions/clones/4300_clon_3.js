function processGridData(rawInputString) {
    // Validate the input string to ensure it's not null, undefined, or empty.
    if (!rawInputString || typeof rawInputString !== 'string' || rawInputString.trim() === '') {
        // In a production environment, one might throw an error or log a warning.
        // For this context, we'll simply return to prevent further execution with invalid data.
        return;
    }

    // Split the entire input content into individual lines.
    let allInputLines = rawInputString.split('\n');

    // Extract grid dimensions (height and width) from the first line.
    // Using parseInt with radix 10 for explicit and safe type conversion.
    const dimensionTokens = allInputLines[0].split(' ');
    const gridHeight = parseInt(dimensionTokens[0], 10);
    const gridWidth = parseInt(dimensionTokens[1], 10);

    // Perform basic validation on the extracted dimensions.
    if (isNaN(gridHeight) || isNaN(gridWidth) || gridHeight <= 0 || gridWidth <= 0) {
        // Invalid dimensions mean we cannot proceed.
        return;
    }

    // Discard the first line (which contained dimensions) to get only the grid rows.
    // Filter out any potential empty strings that might result from trailing newlines.
    let actualGridRows = allInputLines.slice(1).filter(line => line.length > 0);

    // Create a mutable representation of the grid.
    // Each row string is converted into an array of characters, allowing direct cell modification.
    let currentMutableGrid = actualGridRows.map(row => row.split(''));

    // --- Check for special grid configurations (edge cases) ---

    // Count all occurrences of '.' (empty cells) within the original input string.
    const emptyCellMarkers = rawInputString.match(/\./g);
    const totalEmptyCellCount = emptyCellMarkers ? emptyCellMarkers.length : 0;

    // Calculate the total number of cells in the grid.
    const totalGridCellCount = gridHeight * gridWidth;

    // Edge Case 1: The grid contains no empty cells (all cells are bombs).
    // In this scenario, no calculations are needed; the grid is printed as is.
    if (totalEmptyCellCount === 0) {
        console.log(actualGridRows.join('\n') + '\n');
        return; // Terminate execution.
    }

    // Edge Case 2: The entire grid consists of empty cells (no bombs).
    // Every cell should be replaced with '0'.
    if (totalEmptyCellCount === totalGridCellCount) {
        // Construct a new grid composed entirely of '0' characters.
        const allZerosGridOutput = Array(gridHeight).fill(Array(gridWidth).fill('0').join('')).join('\n');
        console.log(allZerosGridOutput + '\n');
        return; // Terminate execution.
    }

    // --- Core Logic: Process mixed grids (containing both bombs and empty cells) ---

    // Define the relative coordinates for all 8 surrounding neighbors (including diagonals).
    // Each pair [dy, dx] represents a change in (row, column) index.
    const eightDirections = [
        [-1, 0], [1, 0], [0, -1], [0, 1],       // Up, Down, Left, Right
        [-1, -1], [-1, 1], [1, -1], [1, 1]      // Up-Left, Up-Right, Down-Left, Down-Right
    ];

    // Iterate through each row of the grid.
    for (let currentRowIndex = 0; currentRowIndex < gridHeight; currentRowIndex++) {
        // Get a reference to the current row's character array for easier modification.
        let rowCharacters = currentMutableGrid[currentRowIndex];

        // Iterate through each column in the current row.
        for (let currentColIndex = 0; currentColIndex < gridWidth; currentColIndex++) {
            const currentCellSymbol = rowCharacters[currentColIndex];

            // Only proceed if the current cell is an empty spot ('.').
            // Bomb cells ('#') remain unchanged.
            if (currentCellSymbol !== '.') {
                continue; // Skip to the next cell.
            }

            let bombCountForCurrentCell = 0; // Initialize counter for adjacent bombs.

            // Check all 8 neighboring positions.
            for (const [deltaY, deltaX] of eightDirections) {
                const neighborY = currentRowIndex + deltaY;
                const neighborX = currentColIndex + deltaX;

                // Validate if the neighbor's coordinates are within the grid boundaries.
                const isNeighborValid = (neighborY >= 0 && neighborY < gridHeight &&
                                         neighborX >= 0 && neighborX < gridWidth);

                if (isNeighborValid) {
                    const neighborSymbol = currentMutableGrid[neighborY][neighborX];
                    // If the neighbor is a bomb ('#'), increment the counter.
                    if (neighborSymbol === '#') {
                        bombCountForCurrentCell++;
                    }
                }
            }

            // Update the current empty cell ('.') with the calculated number of adjacent bombs.
            // Convert the number to a string before assigning it to the character array.
            rowCharacters[currentColIndex] = String(bombCountForCurrentCell);
        }
        // The rowCharacters reference directly modifies currentMutableGrid[currentRowIndex],
        // so explicit re-assignment here is not strictly necessary but can improve clarity.
        currentMutableGrid[currentRowIndex] = rowCharacters;
    }

    // --- Final Output Generation ---
    // Convert the modified 2D character array back into a single string for printing.
    // First, join each row's characters into a string, then join all row strings with newlines.
    const finalFormattedGrid = currentMutableGrid.map(row => row.join('')).join('\n');
    console.log(finalFormattedGrid + '\n'); // Add a trailing newline as per common challenge requirements.
}