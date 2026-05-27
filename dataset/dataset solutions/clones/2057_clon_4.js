let finalMinCost;

function ProcessPathfinding(inputData) {
    inputData = inputData.trim();
    const lineSegments = inputData.split("\n");

    const gridDimensions = lineSegments[0].split(" ");
    const totalRows = parseInt(gridDimensions[0], 10);
    const totalCols = parseInt(gridDimensions[1], 10);

    const terrainMap = lineSegments.slice(1).map(segment => segment.split(''));

    const costMatrix = Array(totalRows).fill(0).map(() => Array(totalCols).fill(0));

    // Initialize the cost for the starting cell (0,0)
    costMatrix[0][0] = (terrainMap[0][0] === '#') ? 1 : 0;

    // Populate costs for the first row (only movement to the right is possible)
    for (let currentColumn = 1; currentColumn < totalCols; currentColumn++) {
        costMatrix[0][currentColumn] = costMatrix[0][currentColumn - 1] + ((terrainMap[0][currentColumn] === '#') ? 1 : 0);
    }

    // Populate costs for the first column (only movement downwards is possible)
    for (let currentRow = 1; currentRow < totalRows; currentRow++) {
        costMatrix[currentRow][0] = costMatrix[currentRow - 1][0] + ((terrainMap[currentRow][0] === '#') ? 1 : 0);
    }

    // Populate costs for the rest of the grid using dynamic programming
    for (let currentRow = 1; currentRow < totalRows; currentRow++) {
        for (let currentColumn = 1; currentColumn < totalCols; currentColumn++) {
            const cellObstacleCost = (terrainMap[currentRow][currentColumn] === '#') ? 1 : 0;
            costMatrix[currentRow][currentColumn] = Math.min(
                costMatrix[currentRow - 1][currentColumn], // Cost from the cell directly above
                costMatrix[currentRow][currentColumn - 1]  // Cost from the cell directly to the left
            ) + cellObstacleCost;
        }
    }

    // The minimum cost to reach the bottom-right cell
    finalMinCost = costMatrix[totalRows - 1][totalCols - 1];

    console.log(finalMinCost);
}

ProcessPathfinding(require("fs").readFileSync("/dev/stdin", "utf8"));
