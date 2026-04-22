const InputUtility = {
    // Stores the active iterator instance for input reading
    inputIterator: null,

    // Generator function for reading and tokenizing standard input
    * rawInputTokenizer() {
        // Read all content from standard input at once
        const fullInputBuffer = require("fs").readFileSync("/dev/stdin", "utf-8");
        // Remove leading/trailing whitespace and split into tokens by newlines or spaces
        const inputTokens = fullInputBuffer.trim().split(/[\n\s]+/);
        // Yield each token individually
        for (const tokenUnit of inputTokens) {
            yield tokenUnit;
        }
    },

    // Function to extract a specified number of values from the input stream
    fetchInputValues(numToRetrieve) {
        // Initialize the input iterator if it hasn't been created yet
        if (!this.inputIterator) {
            this.inputIterator = this.rawInputTokenizer();
        }
        const collectedStrings = [];
        // Loop to collect the requested number of tokens
        for (let i = 0; i < numToRetrieve; i++) {
            collectedStrings.push(this.inputIterator.next().value);
        }
        return collectedStrings;
    }
};

// Main application logic encapsulated within an Immediately Invoked Function Expression (IIFE)
(() => {
    // Define constants for clarity and maintainability
    const OBSTACLE_CHAR = '@';
    const BLOCKED_CELL_VALUE = -1;
    const UNVISITED_CELL_VALUE = null; // Represents a cell not yet reached by BFS
    const NO_PATH_FOUND_RESULT = -1; // Output value for an unreachable target

    // Read initial grid dimensions and the maximum movement distance per step
    const initialConfigStrings = InputUtility.fetchInputValues(3);
    const gridRows = parseInt(initialConfigStrings[0], 10); // Total number of rows
    const gridCols = parseInt(initialConfigStrings[1], 10);   // Total number of columns
    const maxSingleMoveRange = parseInt(initialConfigStrings[2], 10); // Max steps in one cardinal direction

    // Read starting and target coordinates, adjusting them to be 0-indexed
    const coordinateInputStrings = InputUtility.fetchInputValues(4);
    const startRow = parseInt(coordinateInputStrings[0], 10) - 1;
    const startCol = parseInt(coordinateInputStrings[1], 10) - 1;
    const targetRow = parseInt(coordinateInputStrings[2], 10) - 1;
    const targetCol = parseInt(coordinateInputStrings[3], 10) - 1;

    // --- Helper for boundary checks (Type III addition: guard clause/validation) ---
    // Determines if a given row and column pair falls within the grid's boundaries
    const isCoordinateValid = (r, c) => r >= 0 && r < gridRows && c >= 0 && c < gridCols;

    // Early exit if initial or target coordinates are out of bounds
    if (!isCoordinateValid(startRow, startCol) || !isCoordinateValid(targetRow, targetCol)) {
        console.log(NO_PATH_FOUND_RESULT);
        return;
    }
    // --- End of Input Validation ---

    // Initialize the character-based grid representing the terrain layout
    const terrainGrid = Array.from({ length: gridRows }, (_, r) => {
        const currentLineOfChars = InputUtility.fetchInputValues(1)[0]; // Read one line as a string
        return Array.from(currentLineOfChars); // Convert string into an array of characters
    });

    // Initialize the BFS distance tracking grid
    // This grid will store the minimum steps to reach each cell, or special values for obstacles/unvisited
    const distanceTrackingGrid = Array.from({ length: gridRows }, (_, r) =>
        Array.from({ length: gridCols }, (_, c) => {
            if (terrainGrid[r][c] === OBSTACLE_CHAR) {
                return BLOCKED_CELL_VALUE; // Mark obstacles
            }
            return UNVISITED_CELL_VALUE; // Mark all other cells as unvisited
        })
    );

    // Set the starting cell's distance to 0, as it's the origin of the path
    distanceTrackingGrid[startRow][startCol] = 0;
    // Initialize the BFS queue with the starting cell's coordinates
    const bfsTraversalQueue = [[startRow, startCol]];

    // --- Grid access utility functions (Type III: enhanced robustness) ---
    // Safely retrieves a value from the distance tracking grid
    const getGridCellStatus = (r, c) => {
        if (!isCoordinateValid(r, c)) {
            // Return undefined for out-of-bounds access, mimicking original behavior for invalid indices
            return undefined;
        }
        return distanceTrackingGrid[r][c];
    };

    // Safely assigns a new value to a cell in the distance tracking grid
    const setGridCellStatus = (r, c, value) => {
        if (isCoordinateValid(r, c)) {
            distanceTrackingGrid[r][c] = value;
        }
        // No return value required for this setter function
    };
    // --- End Grid Access Utilities ---

    // Define the four cardinal direction vectors (Type III: consolidating repetitive code)
    const cardinalMovementVectors = [
        [1, 0],  // Move Down (positive row change)
        [-1, 0], // Move Up (negative row change)
        [0, 1],  // Move Right (positive column change)
        [0, -1]  // Move Left (negative column change)
    ];

    // Main Breadth-First Search (BFS) algorithm execution loop
    // Continues as long as there are cells to explore in the queue
    while (bfsTraversalQueue.length > 0) {
        // Dequeue the current cell's coordinates from the front of the queue
        const currentCellCoordinates = bfsTraversalQueue.shift();
        const [currentRow, currentCol] = currentCellCoordinates;

        // Retrieve the path length to reach the current cell
        const currentPathDistance = getGridCellStatus(currentRow, currentCol);
        // The path length to any directly reachable next cell will be one unit greater
        const proposedNextPathDistance = currentPathDistance + 1;

        // Iterate through each of the four cardinal directions
        for (const [deltaRow, deltaCol] of cardinalMovementVectors) {
            // For each direction, explore possible moves up to the maximum single move range
            for (let stepCount = 1; stepCount <= maxSingleMoveRange; stepCount++) {
                const nextRow = currentRow + deltaRow * stepCount;
                const nextCol = currentCol + deltaCol * stepCount;

                // Query the status of the potential next cell
                const nextCellCurrentStatus = getGridCellStatus(nextRow, nextCol);

                // --- Multi-step BFS Movement Logic (replicates original behavior) ---
                // 1. If the next cell is out of bounds or an obstacle (BLOCKED_CELL_VALUE),
                //    we cannot proceed further along this specific line of sight.
                if (nextCellCurrentStatus === undefined || nextCellCurrentStatus === BLOCKED_CELL_VALUE) {
                    break; // Terminate exploration in this current direction
                }

                // 2. If the cell is currently unvisited (UNVISITED_CELL_VALUE),
                //    we've found a shortest path to it. Mark its distance and add it to the queue.
                //    Crucially, we *continue* the `stepCount` loop to check if we can
                //    reach further unvisited cells *through* this newly visited cell
                //    within the same `maxSingleMoveRange` move.
                if (nextCellCurrentStatus === UNVISITED_CELL_VALUE) {
                    setGridCellStatus(nextRow, nextCol, proposedNextPathDistance);
                    bfsTraversalQueue.push([nextRow, nextCol]);
                }
                // 3. If the cell is already visited (not UNVISITED_CELL_VALUE, not BLOCKED_CELL_VALUE, not undefined),
                //    we do NOT add it to the queue again (as it's already processed or awaiting processing with a shorter/equal path).
                //    However, we *continue* the `stepCount` loop. This allows the BFS to
                //    "pass through" already visited non-obstacle cells to potentially
                //    reach new unvisited cells further along the `maxSingleMoveRange` path.
                //    No explicit `else` or `break` is needed here; the loop simply proceeds.
            }
        }
    }

    // --- Output the final computed result ---
    // Retrieve the final calculated distance to the target cell
    const finalDistanceToTarget = getGridCellStatus(targetRow, targetCol);

    if (finalDistanceToTarget === UNVISITED_CELL_VALUE) {
        console.log(NO_PATH_FOUND_RESULT); // Target was unreachable
    } else {
        console.log(finalDistanceToTarget); // Output the minimum steps required
    }
})();