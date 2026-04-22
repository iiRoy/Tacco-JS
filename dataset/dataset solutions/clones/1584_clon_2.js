// This script processes grid data from standard input to find the minimum cost path.
const rawData = require("fs").readFileSync("/dev/stdin", "utf8");

(
    // The main processing logic is encapsulated in an immediately invoked function expression.
    inputBuffer => {

        // Split the entire input string into individual lines.
        const textLines = inputBuffer.split('\n');

        // Parse the first line for grid dimensions: height and width.
        const [gridRows, gridCols] = textLines[0].split(' ').map(Number);

        // Parse the second line for the starting coordinates (row, column).
        const startPoint = textLines[1].split(' ').map(Number);

        // Parse the third line for the destination coordinates (row, column).
        const endPoint = textLines[2].split(' ').map(Number);

        // Initialize the grid matrix based on input lines.
        // Each character represents a cell in the grid.
        const gridMatrix = [];
        for (let rowIdx = 0; rowIdx < gridRows; rowIdx++) {
            gridMatrix[rowIdx] = textLines[rowIdx + 3].split('');
        }

        // Define the character that represents an impassable obstacle.
        const obstacleChar = 'X'; // Changed from '#'

        /**
         * Helper function to evaluate a given cell and update its minimum cost if a cheaper path is found.
         * @param {number} currentRow - The row index of the cell to evaluate.
         * @param {number} currentCol - The column index of the cell to evaluate.
         * @param {number} currentCost - The cost to reach this cell through the current path.
         * @returns {boolean} True if the cell's minimum cost was updated, false otherwise.
         */
        const processLocation = (currentRow, currentCol, currentCost) => {
            let cellContent = null;
            // Check if the coordinates are within the grid boundaries.
            if (gridMatrix[currentRow] && gridMatrix[currentRow][currentCol]) {
                cellContent = gridMatrix[currentRow][currentCol];
            }

            // If the cell is valid, not an obstacle, and the current path offers a lower cost,
            // update the cost and signal that an update occurred.
            if (cellContent && cellContent !== obstacleChar && minCostTable[currentRow][currentCol] > currentCost) {
                minCostTable[currentRow][currentCol] = currentCost;
                return true; // Cost was updated
            } else {
                return false; // No update or invalid cell
            }
        };

        // Initialize the dynamic programming table (minCostTable) with Infinity for all cells,
        // representing unknown or unreachable paths initially.
        const minCostTable = Array(gridRows).fill(null).map(
            _ => Array(gridCols).fill(Infinity)
        );

        // Initialize the exploration queue (BFS-like) with the starting point.
        // Coordinates are 1-indexed in input, so convert to 0-indexed.
        const explorationQueue = [
            [startPoint[0] - 1, startPoint[1] - 1]
        ];

        // Set the initial cost for the starting point to zero.
        let pathCost = 0;
        minCostTable[startPoint[0] - 1][startPoint[1] - 1] = pathCost;

        // Variable to hold the current position being processed from the queue.
        let currentPos = null;

        // Main traversal loop: processes locations from the queue until it's empty.
        while (currentPos = explorationQueue.pop()) {
            // Retrieve the cost to reach the current position.
            pathCost = minCostTable[currentPos[0]][currentPos[1]];

            // Define possible direct (1-step) movement options.
            const directNeighbors = [
                [currentPos[0] + 1, currentPos[1]],
                [currentPos[0] - 1, currentPos[1]],
                [currentPos[0], currentPos[1] + 1],
                [currentPos[0], currentPos[1] - 1]
            ];

            // Process each direct neighbor.
            let neighborCoord = null;
            while (neighborCoord = directNeighbors.pop()) {
                // If a shorter path to this neighbor is found, update its cost and add to queue.
                if (processLocation(neighborCoord[0], neighborCoord[1], pathCost)) {
                    explorationQueue.push([neighborCoord[0], neighborCoord[1]]);
                }
            }

            // Define possible teleport (2-step) movement options.
            const teleportOptions = [
                [currentPos[0] + 2, currentPos[1] + 2],
                [currentPos[0] + 2, currentPos[1] + 1],
                [currentPos[0] + 2, currentPos[1]],
                [currentPos[0] + 2, currentPos[1] - 1],
                [currentPos[0] + 2, currentPos[1] - 2],
                [currentPos[0] + 1, currentPos[1] + 2],
                [currentPos[0] + 1, currentPos[1] + 1],
                [currentPos[0] + 1, currentPos[1] - 1],
                [currentPos[0] + 1, currentPos[1] - 2],
                [currentPos[0], currentPos[1] + 2],
                [currentPos[0], currentPos[1] - 2],
                [currentPos[0] - 1, currentPos[1] + 2],
                [currentPos[0] - 1, currentPos[1] + 1],
                [currentPos[0] - 1, currentPos[1] - 1],
                [currentPos[0] - 1, currentPos[1] - 2],
                [currentPos[0] - 2, currentPos[1] + 2],
                [currentPos[0] - 2, currentPos[1] + 1],
                [currentPos[0] - 2, currentPos[1]],
                [currentPos[0] - 2, currentPos[1] - 1],
                [currentPos[0] - 2, currentPos[1] - 2]
            ];

            // Teleport moves incur an additional cost.
            pathCost++;

            // Process each teleport option.
            while (neighborCoord = teleportOptions.pop()) {
                // If a shorter path to this teleport destination is found, update its cost and add to queue.
                if (processLocation(neighborCoord[0], neighborCoord[1], pathCost)) {
                    explorationQueue.push([neighborCoord[0], neighborCoord[1]]);
                }
            }
        }

        // After the traversal, retrieve the minimum cost to reach the destination.
        // Convert 1-indexed destination coordinates to 0-indexed.
        const finalResult = minCostTable[endPoint[0] - 1][endPoint[1] - 1];

        // Output the result. If the destination is unreachable (cost is still Infinity), output -1.
        console.log(finalResult === Infinity ? -1 : finalResult);

    }
)(rawData);