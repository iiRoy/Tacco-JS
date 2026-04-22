/**
 * Encapsulates the logic for processing grid pathfinding problems.
 * This function handles parsing input, performing a Breadth-First Search,
 * and calculating a final metric based on path length and open cells.
 * @param {string} rawInputString - The complete input string, typically from stdin.
 * @returns {number} The calculated result, or -1 if no path is found. Throws an error for invalid input data.
 */
function navigateAndAnalyzeGrid(rawInputString) {
    const inputLines = rawInputString.trim().split('\n'); // Split input into individual lines.

    // Type III: Extracting dimensions with explicit parsing and validation.
    const dimensionTokens = inputLines[0].split(' ');
    const gridHeight = parseInt(dimensionTokens[0], 10);
    const gridWidth = parseInt(dimensionTokens[1], 10);

    // Type III: Initial input validation as guard clauses.
    if (isNaN(gridHeight) || isNaN(gridWidth) || gridHeight <= 0 || gridWidth <= 0) {
        throw new Error("Invalid grid dimensions specified in input. Must be positive integers.");
    }
    if (inputLines.length < gridHeight + 1) { // +1 accounts for the dimension line itself.
        throw new Error("Input string does not contain enough grid rows for specified dimensions.");
    }

    // Defining fixed start and end coordinates.
    const startY = 0;
    const startX = 0;

    const endY = gridHeight - 1;
    const endX = gridWidth - 1;

    // Type III: Constants for grid elements and unvisited state.
    const WALL_CHARACTER = '#';
    const PASSABLE_CHARACTER = '.';
    const DISTANCE_NOT_YET_CALCULATED = -1; // Using a numerical marker instead of a character.

    // Parsing the grid map from the input lines.
    // Type III: Slicing based on `gridHeight` to ensure the correct number of rows are processed.
    const gridLayout = inputLines.slice(1, gridHeight + 1).map(line => line.split(''));

    // Type III: Validate actual grid content dimensions.
    if (gridLayout.some(row => row.length !== gridWidth)) {
        throw new Error("Grid row lengths do not match specified grid width.");
    }

    // Initialize a 2D array to store minimum distances from the starting point.
    // Type III: Initializing with `DISTANCE_NOT_YET_CALCULATED`.
    const pathDistanceMap = Array.from({ length: gridHeight }, () =>
        Array.from({ length: gridWidth }, () => DISTANCE_NOT_YET_CALCULATED)
    );

    // Define movement offsets for 4 cardinal directions (Right, Down, Left, Up).
    const yOffsets = [0, 1, 0, -1];
    const xOffsets = [1, 0, -1, 0];

    /**
     * Executes a Breadth-First Search (BFS) to determine the shortest path length
     * from the starting point to the target point within the grid.
     * @returns {number} The shortest path length to the target, or DISTANCE_NOT_YET_CALCULATED if no path exists.
     */
    const performGridBFS = () => {
        const cellVisitQueue = []; // Queue for BFS traversal.

        // Type III: Early exit if start or end cells are walls.
        if (gridLayout[startY][startX] === WALL_CHARACTER || gridLayout[endY][endX] === WALL_CHARACTER) {
            return DISTANCE_NOT_YET_CALCULATED;
        }

        // Enqueue the starting cell and set its distance as 1.
        cellVisitQueue.push([startY, startX]);
        pathDistanceMap[startY][startX] = 1;

        // Process cells from the queue until it's empty.
        while (cellVisitQueue.length > 0) {
            const [currentY, currentX] = cellVisitQueue.shift(); // Dequeue the current cell.

            // Type III: Keep the early break optimization for finding the first shortest path.
            if (currentY === endY && currentX === endX) {
                break; // Target reached, shortest path found.
            }

            // Iterate through possible movement directions.
            for (let dirIdx = 0; dirIdx < 4; dirIdx++) {
                const nextY = currentY + yOffsets[dirIdx];
                const nextX = currentX + xOffsets[dirIdx];

                // Type III: Consolidated boundary and obstacle checks using a helper function.
                const isWithinBounds = (r, c) => r >= 0 && r < gridHeight && c >= 0 && c < gridWidth;

                if (!isWithinBounds(nextY, nextX) ||
                    gridLayout[nextY][nextX] === WALL_CHARACTER ||
                    pathDistanceMap[nextY][nextX] !== DISTANCE_NOT_YET_CALCULATED) {
                    // Skip if out of bounds, is a wall, or already visited (and distance recorded).
                    continue;
                }

                // Mark new distance and add the cell to the queue for future exploration.
                pathDistanceMap[nextY][nextX] = pathDistanceMap[currentY][currentX] + 1;
                cellVisitQueue.push([nextY, nextX]);
            }
        }

        // Return the final distance recorded for the target cell.
        return pathDistanceMap[endY][endX];
    };

    /**
     * Counts the total number of passable (non-wall) cells in the grid.
     * Type III: Rewritten using nested loops for variety instead of map/reduce.
     * @returns {number} The count of passable cells.
     */
    const countPassableTiles = () => {
        let passableCount = 0;
        for (let r = 0; r < gridHeight; r++) {
            for (let c = 0; c < gridWidth; c++) {
                if (gridLayout[r][c] === PASSABLE_CHARACTER) {
                    passableCount++;
                }
            }
        }
        return passableCount;
    };

    let finalComputedValue = 0;
    const shortestPathFound = performGridBFS();

    // Type III: Conditional logic using the new constant for unvisited state.
    if (shortestPathFound === DISTANCE_NOT_YET_CALCULATED) {
        finalComputedValue = -1; // No path reachable.
    } else {
        const totalWalkableArea = countPassableTiles(); // Type III: Intermediate variable.
        // Type III: Rephrasing the calculation for clarity.
        const cellsNotOnPath = totalWalkableArea - shortestPathFound;
        finalComputedValue = cellsNotOnPath;
    }

    return finalComputedValue;
}

// Type III: Externalized input reading and output logging.
// This separates concerns and makes the core logic function more reusable and testable.
try {
    const fileContents = require("fs").readFileSync("/dev/stdin", "utf8");
    const calculationResult = navigateAndAnalyzeGrid(fileContents);
    console.log(calculationResult);
} catch (error) {
    // Handle potential errors during file reading or grid analysis.
    console.error("An error occurred during execution:", error.message);
    // Optionally, terminate the process with an error code for system-level errors.
    // process.exit(1);
}