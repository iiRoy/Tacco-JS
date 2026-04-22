(function() {
    /**
     * Stores the globally tracked minimum cost found for a path.
     * Initialized to a very large number (infinity) to ensure any valid path cost will be smaller.
     * @type {number}
     */
    let shortestPathSoFar = Infinity;

    /**
     * Represents the grid or map layout, where each element is a character.
     * Obstacles are typically non-empty characters, while '.' denotes a free path.
     * @type {string[][]}
     */
    let mapLayout;

    /**
     * Defines the character that represents an obstacle on the map.
     * @type {string}
     */
    const OBSTACLE_CHARACTER = '#';

    /**
     * Processes the raw input string, parses grid dimensions,
     * initializes the map, and initiates the pathfinding process.
     *
     * @param {string} rawInputData - The complete input string, typically from stdin.
     */
    function executePathfindingSolution(rawInputData) {
        // --- Type II: Renaming, Reformatting, Comments ---
        // Clean up whitespace and split input into individual lines.
        const cleanedLines = rawInputData.trim().split('\n');

        // --- Type III: Add guard clauses/validations ---
        if (!cleanedLines || cleanedLines.length < 2) {
            console.error("Error: Insufficient input data provided.");
            shortestPathSoFar = -1; // Indicate an error state
            return;
        }

        // Parse grid dimensions from the first line.
        const dimensionParts = cleanedLines[0].split(' ');
        if (dimensionParts.length < 2) {
            console.error("Error: Grid dimensions are missing or malformed.");
            shortestPathSoFar = -1;
            return;
        }

        // --- Type III: Intermediate steps for clarity ---
        const totalRowsStr = dimensionParts[0];
        const totalColsStr = dimensionParts[1];

        const totalRows = Number(totalRowsStr);
        const totalCols = Number(totalColsStr);

        // --- Type III: Add guard clauses/validations ---
        if (isNaN(totalRows) || isNaN(totalCols) || totalRows <= 0 || totalCols <= 0) {
            console.error("Error: Invalid grid dimensions provided (must be positive numbers).");
            shortestPathSoFar = -1;
            return;
        }

        // Extract the map layout data from the remaining lines.
        const gridDataLines = cleanedLines.slice(1);

        // Map each line to an array of characters, representing the grid.
        mapLayout = gridDataLines.map(line => line.split(''));

        // --- Type III: Add validation for map dimensions vs. parsed dimensions ---
        if (mapLayout.length !== totalRows || (mapLayout.length > 0 && mapLayout[0].length !== totalCols)) {
            console.error(`Warning: Actual map dimensions (${mapLayout.length}x${mapLayout.length > 0 ? mapLayout[0].length : 0}) do not match declared dimensions (${totalRows}x${totalCols}). Using actual map dimensions.`);
            // Adjust totalRows/totalCols if necessary for consistency, or proceed with potential issues.
            // For this example, we'll proceed, assuming the mapLayout is the canonical source if it exists.
        }

        // Define the starting and ending coordinates for pathfinding.
        // The problem implies 0-indexed coordinates, and the end is (rows-1, cols-1).
        const startPoint = { r: 0, c: 0 };
        const endPoint = { r: totalRows - 1, c: totalCols - 1 };

        // Initiate the recursive pathfinding algorithm.
        // Start with 0 cost from the initial position.
        navigateGridRecursively(startPoint, endPoint, 0);

        // Output the final result.
        // --- Type III: Conditional output for better user feedback ---
        if (shortestPathSoFar === Infinity) {
            console.log(-1); // Indicate no path found
        } else if (shortestPathSoFar === -1) {
            // Error already logged, just exit.
        } else {
            console.log(shortestPathSoFar);
        }
    }

    /**
     * Recursively explores possible paths on the grid to find the minimum cost.
     * This function implements a depth-first search-like approach with pruning.
     *
     * @param {{r: number, c: number}} currentCoordinates - The current row and column.
     * @param {{r: number, c: number}} destinationCoordinates - The target row and column.
     * @param {number} currentPathCost - The accumulated cost to reach currentCoordinates.
     */
    function navigateGridRecursively(currentCoordinates, destinationCoordinates, currentPathCost) {
        // --- Type II: Renaming, Reformatting ---
        // Destructure coordinates for easier access and clarity.
        const { r: currentRow, c: currentCol } = currentCoordinates;
        const { r: targetRow, c: targetCol } = destinationCoordinates;

        // --- Type III: Add boundary checks as an early exit/guard clause ---
        // Ensure current position is within grid boundaries before accessing mapLayout.
        if (currentRow < 0 || currentRow >= mapLayout.length ||
            currentCol < 0 || currentCol >= mapLayout[0].length) {
            return; // Out of bounds, invalid path.
        }

        // --- Type II: Update variable names and logic ---
        // If the current cell is an obstacle, increment the path cost.
        // The problem statement implies cost is incurred *at* the obstacle cell.
        if (mapLayout[currentRow][currentCol] !== '.') {
            currentPathCost++;
        }

        // --- Type II: Rewrite conditional for pruning ---
        // If the current path cost already exceeds or equals the best path found so far,
        // there's no need to continue exploring this path. Prune it.
        if (currentPathCost >= shortestPathSoFar) {
            return;
        }

        // Base case: If the destination is reached.
        if (currentRow === targetRow && currentCol === targetCol) {
            // --- Type II: Update assignment with Math.min for clarity ---
            // Update the global minimum cost if this path is shorter.
            shortestPathSoFar = Math.min(shortestPathSoFar, currentPathCost);
            // --- Type III: Add a debug log for path discovery ---
            // console.debug(`Found path to destination with cost: ${currentPathCost}`);
            return;
        }

        // --- Type III: Introduce helper variables for next positions ---
        const nextRow = currentRow + 1;
        const nextCol = currentCol + 1;

        // Recursive steps: Explore possible movements (down and right only).
        // The original logic had specific conditions for being on the same row/col as the end.
        // Let's keep that structure but with renamed variables.

        // If we are already on the target row, we can only move right.
        if (currentRow === targetRow) {
            navigateGridRecursively({ r: currentRow, c: nextCol }, destinationCoordinates, currentPathCost);
        }
        // If we are already on the target column, we can only move down.
        else if (currentCol === targetCol) {
            navigateGridRecursively({ r: nextRow, c: currentCol }, destinationCoordinates, currentPathCost);
        }
        // Otherwise, we can explore both moving right and moving down.
        else {
            // Try moving right.
            navigateGridRecursively({ r: currentRow, c: nextCol }, destinationCoordinates, currentPathCost);
            // Try moving down.
            navigateGridRecursively({ r: nextRow, c: currentCol }, destinationCoordinates, currentPathCost);
        }
    }

    // This block handles the execution of the solution with input from standard input.
    // It's placed outside the IIFE's main scope but within its execution context
    // by calling the main function with the read data.
    try {
        const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
        executePathfindingSolution(fileContent);
    } catch (error) {
        console.error("Failed to read input from /dev/stdin:", error.message);
        // Optionally set shortestPathSoFar to indicate failure or print a specific error
        // if executePathfindingSolution hasn't handled it already.
        if (shortestPathSoFar === Infinity) {
            console.log(-1);
        }
    }

})();