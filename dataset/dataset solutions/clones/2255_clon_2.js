"use strict";

// This function processes the raw input string to find the longest path in a grid.
const processInput = (inputContent) => {
    // Clean up the input and split it into individual lines.
    inputContent = inputContent.trim().split("\n");

    // Parse the grid dimensions from the first line.
    const gridRows = parseInt(inputContent[0].split(" ")[0]);
    const gridCols = parseInt(inputContent[0].split(" ")[1]);

    // Create the grid map from the subsequent lines.
    const mapLayout = inputContent.slice(1, gridRows + 1).map(lineData => lineData.split(""));

    // Defines a Breadth-First Search (BFS) function to find the maximum distance from a starting point.
    const findLongestPath = (startRow, startCol) => {
        // Define row offsets for 4-directional movement (Up, Right, Down, Left).
        const rowDirection = [-1, 0, 1, 0];
        // Define column offsets for 4-directional movement.
        const colDirection = [0, 1, 0, -1];

        // Initialize a 2D array to store path distances, marking unvisited cells with -1.
        let pathDistances = Array(gridRows).fill(null).map(() => Array(gridCols).fill(-1));
        // Initialize a queue for BFS traversal.
        let coordinateQueue = [];
        // This variable is declared but not used, maintaining original structure.
        let currentPathCost = 0;
        // Stores the maximum path length found from the current starting point.
        let maxPathLength = 0;

        // Add the starting coordinates to the queue and mark its distance as 0.
        coordinateQueue.push([startRow, startCol]);
        pathDistances[startRow][startCol] = 0;

        // Continue BFS as long as there are elements in the queue.
        while (coordinateQueue.length > 0) {
            // Dequeue the current point.
            const currentPoint = coordinateQueue.shift();

            // Iterate through all four possible directions.
            for (let dirIndex = 0; dirIndex < 4; dirIndex++) {
                const nextRow = currentPoint[0] + rowDirection[dirIndex];
                const nextCol = currentPoint[1] + colDirection[dirIndex];

                // Check for out-of-bounds conditions.
                if (nextCol < 0 || gridCols <= nextCol) continue;
                if (nextRow < 0 || gridRows <= nextRow) continue;
                // Check if the next cell is a wall ('#').
                if (mapLayout[nextRow][nextCol] === '#') continue;
                // Check if the cell has already been visited.
                if (pathDistances[nextRow][nextCol] !== -1) continue;

                // If valid and unvisited, enqueue the next cell.
                coordinateQueue.push([nextRow, nextCol]);
                // Update its distance.
                pathDistances[nextRow][nextCol] = pathDistances[currentPoint[0]][currentPoint[1]] + 1;

                // Update the maximum path length found so far from this BFS.
                maxPathLength = Math.max(maxPathLength, pathDistances[nextRow][nextCol]);
            }
        }

        // The following lines are commented out in the original, so they remain commented.
        // console.log(pathDistances.join("\n"));
        // console.log("---------")

        return maxPathLength;
    };

    // Initialize the overall maximum path length found across all possible starting points.
    let overallMaxPath = 0;

    // Iterate through each cell in the grid.
    for (let currentRow = 0; currentRow < gridRows; currentRow++) {
        for (let currentCol = 0; currentCol < gridCols; currentCol++) {
            // If the current cell is a wall, skip it as a starting point.
            if (mapLayout[currentRow][currentCol] === "#") continue;
            // Perform BFS from the current cell and update the overall maximum path.
            overallMaxPath = Math.max(overallMaxPath, findLongestPath(currentRow, currentCol));
        }
    }

    // Output the final result to the console.
    console.log(overallMaxPath);
};

// Read input from standard input and pass it to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
