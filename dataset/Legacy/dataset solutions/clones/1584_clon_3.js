const rawData = require("fs").readFileSync("/dev/stdin", "utf8");

((inputContent) => {
    const inputLines = inputContent.split('\n');

    const [gridHeight, gridWidth] = inputLines[0].split(' ').map(Number);
    const startCoords = inputLines[1].split(' ').map(Number);
    const endCoords = inputLines[2].split(' ').map(Number);

    const gridMap = [];
    for (let r = 0; r < gridHeight; r++) {
        gridMap[r] = inputLines[r + 3].split('');
    }

    const obstacleChar = '#';

    // Helper function to generate warp offsets (2-step moves)
    const generateWarpOffsets = () => {
        const offsets = [];
        for (let dr = -2; dr <= 2; dr++) {
            for (let dc = -2; dc <= 2; dc++) {
                // Exclude the 3x3 immediate neighborhood (which are handled by walk moves)
                // and the current cell itself (0,0)
                if (Math.abs(dr) <= 1 && Math.abs(dc) <= 1) {
                    continue;
                }
                offsets.push([dr, dc]);
            }
        }
        return offsets;
    };

    const warpMoveOffsets = generateWarpOffsets();

    // Helper function to attempt updating the path cost for a cell
    // Returns true if the path was updated and the cell should be added to the queue, false otherwise.
    const attemptPathUpdate = (targetRow, targetCol, newPathCost, currentGridMap, minCostGrid, obstacleSymbol, height, width, processingQueue) => {
        // Check if coordinates are within grid boundaries
        if (targetRow < 0 || targetRow >= height || targetCol < 0 || targetCol >= width) {
            return false;
        }

        // Check if the target cell is an obstacle
        if (currentGridMap[targetRow][targetCol] === obstacleSymbol) {
            return false;
        }

        // If the new path cost is better than the current minimum, update it
        if (minCostGrid[targetRow][targetCol] > newPathCost) {
            minCostGrid[targetRow][targetCol] = newPathCost;
            processingQueue.push([targetRow, targetCol]); // Add to queue for further exploration
            return true;
        }
        return false;
    };

    // Initialize the minimum cost grid with Infinity
    const minCostGrid = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(Number.POSITIVE_INFINITY));

    // Adjust start and end coordinates to be 0-indexed
    const startRow = startCoords[0] - 1;
    const startCol = startCoords[1] - 1;
    const endRow = endCoords[0] - 1;
    const endCol = endCoords[1] - 1;

    // Initialize the processing queue (stack-like behavior for this Dijkstra variant)
    const processingQueue = [[startRow, startCol]];
    minCostGrid[startRow][startCol] = 0; // Starting point has a cost of 0

    let currentCellCoordinates = null;
    while (currentCellCoordinates = processingQueue.pop()) {
        const [currentRow, currentCol] = currentCellCoordinates;
        const currentPathCost = minCostGrid[currentRow][currentCol];

        // Define adjacent cells for 'walk' moves (0 cost)
        const adjacentMoveOffsets = [
            [1, 0], [-1, 0], [0, 1], [0, -1]
        ];

        // Process 'walk' moves (0 cost)
        for (const [dr, dc] of adjacentMoveOffsets) {
            const nextRow = currentRow + dr;
            const nextCol = currentCol + dc;
            attemptPathUpdate(nextRow, nextCol, currentPathCost, gridMap, minCostGrid, obstacleChar, gridHeight, gridWidth, processingQueue);
        }

        // Process 'warp' moves (1 cost)
        const warpPathCost = currentPathCost + 1;
        for (const [dr, dc] of warpMoveOffsets) {
            const nextRow = currentRow + dr;
            const nextCol = currentCol + dc;
            attemptPathUpdate(nextRow, nextCol, warpPathCost, gridMap, minCostGrid, obstacleChar, gridHeight, gridWidth, processingQueue);
        }
    }

    const finalAnswer = minCostGrid[endRow][endCol];
    console.log(finalAnswer === Number.POSITIVE_INFINITY ? -1 : finalAnswer);

})(rawData);
