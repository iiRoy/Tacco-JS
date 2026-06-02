console.log((function() {
    const MOD_CONSTANT = 1000000007; // Represents 1e9 + 7
    
    // Helper function to apply the modulo operation
    const getModuloResult = (value) => value % MOD_CONSTANT;

    // Read the entire input string from stdin
    const rawInputString = require('fs').readFileSync('/dev/stdin', 'utf8');
    
    // Split the input into individual lines and remove leading/trailing whitespace
    const inputLines = rawInputString.trim().split('\n');

    // Extract the first line which contains grid dimensions
    const firstLine = inputLines.shift();
    
    // Parse height and width from the first line
    const dimensionStrings = firstLine.split(' ');
    const gridHeight = parseInt(dimensionStrings[0], 10);
    const gridWidth = parseInt(dimensionStrings[1], 10);

    // The remaining lines represent the grid data
    const gridData = inputLines;

    // Initialize a 2D array (DP table) to store path counts
    // All cells are initially set to 0
    const pathCounts = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(0));

    // Base case: The starting cell (0,0) has exactly one way to reach it (by starting there)
    pathCounts[0][0] = 1;

    // Iterate through each cell of the grid
    for (let rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
        for (let colIdx = 0; colIdx < gridWidth; colIdx++) {
            // If the current cell is an obstacle ('#'), no paths can pass through it.
            // Its path count remains 0 (or 1 if it was (0,0) and an obstacle, but that's not possible in typical problems).
            // The problem implies (0,0) is never an obstacle.
            if (gridData[rowIdx][colIdx] === '#') {
                continue;
            }

            // For the starting cell (0,0), pathCounts[0][0] is already 1.
            // The following 'if' conditions will be false, so its value remains 1.
            // For other cells, pathCounts[rowIdx][colIdx] is initially 0.
            let currentCellPaths = pathCounts[rowIdx][colIdx];

            // If not in the first row, add paths from the cell directly above
            if (rowIdx > 0) {
                // The value from the cell above is added to the current cell's path count.
                // If the cell above was an obstacle, its path count would be 0, so it correctly adds nothing.
                currentCellPaths = getModuloResult(currentCellPaths + pathCounts[rowIdx - 1][colIdx]);
            }

            // If not in the first column, add paths from the cell directly to the left
            if (colIdx > 0) {
                // Similar logic for the cell to the left.
                currentCellPaths = getModuloResult(currentCellPaths + pathCounts[rowIdx][colIdx - 1]);
            }

            // Update the DP table with the total calculated paths for the current cell
            pathCounts[rowIdx][colIdx] = currentCellPaths;
        }
    }

    // The final result is the number of paths to the bottom-right corner of the grid
    return pathCounts[gridHeight - 1][gridWidth - 1].toString();
})());
