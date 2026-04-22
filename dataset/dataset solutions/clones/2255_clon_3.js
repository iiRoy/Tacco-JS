"use strict";

// Helper constant to define the character representing a wall in the grid.
const WALL_TILE = '#';

// Primary function to process the input data and compute the solution.
const processGridInput = (rawInputString) => {
    // Perform initial validation for the input string.
    if (!rawInputString || typeof rawInputString !== 'string' || rawInputString.trim().length === 0) {
        console.error("Input error: The provided input string is empty or invalid.");
        return; // Exit if input is not usable.
    }

    // Split the input string into individual lines and remove any leading/trailing whitespace.
    const inputLines = rawInputString.trim().split("\n");

    // Validate that there are enough lines to parse dimensions and grid data.
    if (inputLines.length < 1) {
        console.error("Input error: No data lines found after trimming.");
        return;
    }

    // Parse the grid dimensions (height and width) from the first line.
    const dimensionTokens = inputLines[0].split(" ");
    const gridHeight = parseInt(dimensionTokens[0], 10); // Explicitly specify radix for safety.
    const gridWidth = parseInt(dimensionTokens[1], 10);   // Explicitly specify radix for safety.

    // Further validate the parsed dimensions.
    if (isNaN(gridHeight) || isNaN(gridWidth) || gridHeight <= 0 || gridWidth <= 0) {
        console.error(`Input error: Invalid grid dimensions (${dimensionTokens[0]}, ${dimensionTokens[1]}). Must be positive integers.`);
        return;
    }

    // Construct the actual grid map from the subsequent lines.
    // Ensure we only process lines corresponding to the declared grid height.
    const gridStructure = inputLines.slice(1, gridHeight + 1).map(lineContent => lineContent.split(""));

    // Verify that the constructed grid matches the expected dimensions.
    if (gridStructure.length !== gridHeight || (gridHeight > 0 && gridStructure[0].length !== gridWidth)) {
        console.error("Input error: Actual grid dimensions do not match the declared dimensions.");
        return;
    }

    /**
     * Executes a Breadth-First Search (BFS) to find the longest path from a given starting point
     * within a connected component of non-wall cells.
     * @param {number} startRow - The starting row index for the BFS.
     * @param {number} startCol - The starting column index for the BFS.
     * @returns {number} The maximum distance from the starting point to any reachable cell.
     */
    const calculateMaxPathFrom = (startRow, startCol) => {
        // Define the possible movements (row and column offsets) for 4-directional adjacency.
        // This array represents: Up, Right, Down, Left.
        const movementOffsets = [
            { dR: -1, dC: 0 }, // Move Up
            { dR: 0, dC: 1 },  // Move Right
            { dR: 1, dC: 0 },  // Move Down
            { dR: 0, dC: -1 }  // Move Left
        ];

        // Initialize a 2D array to store the shortest distance to each cell from `(startRow, startCol)`.
        // `null` indicates an unvisited cell. This also implicitly tracks visited cells.
        const pathDistances = Array.from({ length: gridHeight }, () =>
            Array.from({ length: gridWidth }).fill(null)
        );

        // Initialize a queue for the BFS, storing objects with row, column, and current distance.
        const traversalQueue = [];
        let longestPathInComponent = 0; // Keeps track of the maximum distance found in this particular BFS.

        // Enqueue the starting cell and set its distance to 0.
        traversalQueue.push({ row: startRow, col: startCol, distance: 0 });
        pathDistances[startRow][startCol] = 0;

        // Continue BFS as long as there are cells to visit in the queue.
        while (traversalQueue.length > 0) {
            // Dequeue the current cell to process.
            const currentCell = traversalQueue.shift();

            // Update the longest path found in this component if the current cell's distance is greater.
            if (currentCell.distance > longestPathInComponent) {
                longestPathInComponent = currentCell.distance;
            }

            // Explore all 4 adjacent neighbors of the current cell.
            for (const offset of movementOffsets) {
                const nextRow = currentCell.row + offset.dR;
                const nextCol = currentCell.col + offset.dC;
                const newDistance = currentCell.distance + 1; // Each step increments distance by 1.

                // --- Neighbor Validation Checks ---
                // 1. Check if the next cell is within the grid boundaries.
                const isOutOfBoundaries = (nextRow < 0 || nextRow >= gridHeight || nextCol < 0 || nextCol >= gridWidth);
                if (isOutOfBoundaries) {
                    continue; // Skip if out of bounds.
                }

                // 2. Check if the next cell is a wall.
                if (gridStructure[nextRow][nextCol] === WALL_TILE) {
                    continue; // Skip if it's a wall.
                }

                // 3. Check if the next cell has already been visited.
                // In BFS, the first time a cell is reached, it's via the shortest path.
                if (pathDistances[nextRow][nextCol] !== null) {
                    continue; // Skip if already visited.
                }

                // If all conditions pass, the neighbor is valid and unvisited.
                // Mark its distance and enqueue it for further exploration.
                pathDistances[nextRow][nextCol] = newDistance;
                traversalQueue.push({ row: nextRow, col: nextCol, distance: newDistance });
            }
        }

        return longestPathInComponent;
    };

    let overallMaximumDistance = 0; // This variable will store the global maximum distance found across all starting points.

    // Iterate through every cell in the grid.
    for (let r = 0; r < gridHeight; r++) {
        for (let c = 0; c < gridWidth; c++) {
            // If the current cell is a wall, it cannot be a starting point for pathfinding, so skip it.
            if (gridStructure[r][c] === WALL_TILE) {
                continue;
            }

            // For each non-wall cell, perform a BFS to find the longest path originating from it.
            const currentBFSMaxDistance = calculateMaxPathFrom(r, c);

            // Update the overall maximum distance if the current BFS found a longer path.
            if (currentBFSMaxDistance > overallMaximumDistance) {
                overallMaximumDistance = currentBFSMaxDistance;
            }
        }
    }

    // Output the final result to the console.
    console.log(overallMaximumDistance);
};

// Read input from standard input and pass it to the processing function.
processGridInput(require('fs').readFileSync('/dev/stdin', 'utf8'));