const rawData = require("fs").readFileSync("/dev/stdin", "utf8");

(function (inputDataString) {
    // Break the incoming data string into separate lines
    const gridLines = inputDataString.split('\n');

    // Extract grid dimensions (height and width) from the first line
    const [gridHeight, gridWidth] = gridLines[0].split(' ').map(Number);

    // Parse the starting coordinates from the second line
    const startCoords = gridLines[1].split(' ').map(Number);

    // Parse the target coordinates from the third line
    const endCoords = gridLines[2].split(' ').map(Number);

    // Construct the 2D terrain grid from subsequent lines
    const terrainGrid = [];
    for (let rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
        terrainGrid[rowIdx] = gridLines[rowIdx + 3].split('');
    }

    // Define the character that represents an impassable obstacle
    const obstacleChar = '#';

    /**
     * Evaluates a potential cell and updates its minimum path cost if a better path is found.
     * @param {number} currRow - The row index of the cell being considered.
     * @param {number} currCol - The column index of the cell being considered.
     * @param {number} currentCost - The cost to reach this cell via the current path.
     * @returns {boolean} Returns true if the cell's minimum cost was updated, false otherwise.
     */
    const updatePathCost = (currRow, currCol, currentCost) => {
        let cellContent = null;
        // Ensure the coordinates are within the grid boundaries
        if (terrainGrid[currRow] && terrainGrid[currRow][currCol]) {
            cellContent = terrainGrid[currRow][currCol];
        }

        // If the cell is valid, not an obstacle, and the new cost is lower than the recorded one
        if (cellContent && cellContent !== obstacleChar && minCosts[currRow][currCol] > currentCost) {
            minCosts[currRow][currCol] = currentCost; // Update the minimum cost for this cell
            return true; // Indicate that an update occurred
        } else {
            return false; // No update was made
        }
    };

    // Initialize a 2D array to store the minimum costs to reach each cell, defaulting to Infinity
    const minCosts = Array(gridHeight).fill().map(_unused => Array(gridWidth).fill(Infinity));

    // Initialize the processing queue with the starting cell's adjusted coordinates
    const processingQueue = [[startCoords[0] - 1, startCoords[1] - 1]];

    // Set the initial path value (cost) for the starting cell
    let pathValue = 0;
    minCosts[startCoords[0] - 1][startCoords[1] - 1] = pathValue;

    let currentCell = null; // Variable to hold the cell currently being processed from the queue

    // Main loop: Continues as long as there are cells in the processing queue
    while (currentCell = processingQueue.pop()) {
        // Define the possible "walk" moves (adjacent cells, cost +0)
        const adjacentMoves = [
            [currentCell[0] + 1, currentCell[1]],
            [currentCell[0] - 1, currentCell[1]],
            [currentCell[0], currentCell[1] + 1],
            [currentCell[0], currentCell[1] - 1]
        ];

        let nextCell = null; // Variable to hold the coordinates of the next cell to check
        pathValue = minCosts[currentCell[0]][currentCell[1]]; // Get the current cell's minimum cost

        // Process all adjacent walk moves
        while (nextCell = adjacentMoves.pop()) {
            if (updatePathCost(nextCell[0], nextCell[1], pathValue)) {
                processingQueue.push([nextCell[0], nextCell[1]]); // Add to queue if its cost was improved
            }
        }

        // Define the possible "warp" moves (2-unit jumps, cost +1)
        const teleportJumps = [
            [currentCell[0] + 2, currentCell[1] + 2],
            [currentCell[0] + 2, currentCell[1] + 1],
            [currentCell[0] + 2, currentCell[1]],
            [currentCell[0] + 2, currentCell[1] - 1],
            [currentCell[0] + 2, currentCell[1] - 2],
            [currentCell[0] + 1, currentCell[1] + 2],
            [currentCell[0] + 1, currentCell[1] + 1],
            [currentCell[0] + 1, currentCell[1] - 1],
            [currentCell[0] + 1, currentCell[1] - 2],
            [currentCell[0], currentCell[1] + 2],
            [currentCell[0], currentCell[1] - 2],
            [currentCell[0] - 1, currentCell[1] + 2],
            [currentCell[0] - 1, currentCell[1] + 1],
            [currentCell[0] - 1, currentCell[1] - 1],
            [currentCell[0] - 1, currentCell[1] - 2],
            [currentCell[0] - 2, currentCell[1] + 2],
            [currentCell[0] - 2, currentCell[1] + 1],
            [currentCell[0] - 2, currentCell[1]],
            [currentCell[0] - 2, currentCell[1] - 1],
            [currentCell[0] - 2, currentCell[1] - 2]
        ];

        pathValue++; // Increment the cost for warp moves

        // Process all warp moves
        while (nextCell = teleportJumps.pop()) {
            if (updatePathCost(nextCell[0], nextCell[1], pathValue)) {
                processingQueue.push([nextCell[0], nextCell[1]]); // Add to queue if its cost was improved
            }
        }
    }

    // Retrieve the final minimum cost to reach the destination cell
    const finalResult = minCosts[endCoords[0] - 1][endCoords[1] - 1];

    // Output the result: -1 if the destination is unreachable (cost remains Infinity), otherwise the calculated cost
    console.log(finalResult === Infinity ? -1 : finalResult);

})(rawData);
