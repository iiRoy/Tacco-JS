function executeProgram(rawData) {
    const processedInputLines = rawData.trim().split("\n");

    const dimensionSpecifiers = processedInputLines[0].split(" ");
    const totalRows = parseInt(dimensionSpecifiers[0], 10);
    const totalColumns = parseInt(dimensionSpecifiers[1], 10);

    const terrainGrid = processedInputLines.slice(1).map(lineContent => lineContent.split(''));

    const finalObstacleCount = determinePathCost(terrainGrid, totalRows, totalColumns);

    console.log(finalObstacleCount);
}

function determinePathCost(gridMatrix, numRows, numCols) {
    // dpTable[r][c] will store the minimum obstacle count to reach cell (r, c)
    // from the starting cell (0, 0).
    const dpTable = Array(numRows).fill(null).map(() => Array(numCols).fill(Infinity));

    // A helper function to determine if a cell is an obstacle (cost 1) or free (cost 0).
    const getCellCost = (r, c) => (gridMatrix[r][c] !== '.') ? 1 : 0;

    // Initialize the cost for the starting cell (0, 0).
    dpTable[0][0] = getCellCost(0, 0);

    // Populate the first row of the DP table.
    // To reach any cell in the first row, one can only come from the left.
    for (let currentColumn = 1; currentColumn < numCols; currentColumn++) {
        dpTable[0][currentColumn] = dpTable[0][currentColumn - 1] + getCellCost(0, currentColumn);
    }

    // Populate the first column of the DP table.
    // To reach any cell in the first column, one can only come from above.
    for (let currentRow = 1; currentRow < numRows; currentRow++) {
        dpTable[currentRow][0] = dpTable[currentRow - 1][0] + getCellCost(currentRow, 0);
    }

    // Fill the rest of the DP table.
    // To reach cell (r, c), one must come from either (r-1, c) (downward move)
    // or (r, c-1) (rightward move). We take the minimum of these two paths.
    for (let currentRow = 1; currentRow < numRows; currentRow++) {
        for (let currentColumn = 1; currentColumn < numCols; currentColumn++) {
            dpTable[currentRow][currentColumn] = Math.min(
                dpTable[currentRow - 1][currentColumn], // Path from above
                dpTable[currentRow][currentColumn - 1]  // Path from left
            ) + getCellCost(currentRow, currentColumn);
        }
    }

    // The result is the minimum obstacle count to reach the bottom-right cell.
    return dpTable[numRows - 1][numCols - 1];
}

executeProgram(require("fs").readFileSync("/dev/stdin", "utf8"));
