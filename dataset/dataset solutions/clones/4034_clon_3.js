const pathSolver = (function() {
    // Define a constant for cells that are obstacles or have not yet been visited via a shorter path.
    // Using a large integer instead of Infinity to avoid potential floating-point issues,
    // though for simple comparisons, Infinity works equally well.
    const OBSTACLE_OR_UNVISITED = Number.MAX_SAFE_INTEGER;

    // A small helper function to generate an array filled with a specific value.
    const generateFilledRow = (length, fillValue) => new Array(length).fill(fillValue);

    /**
     * Computes a specific grid-based pathfinding metric.
     * It performs a Breadth-First Search (BFS) to find the shortest path from (1,1) to (W,H)
     * on a given grid. The final result is the total count of traversable cells ('.')
     * in the grid minus the length of the shortest path found.
     *
     * @param {string} rawInputText - The complete raw input string from stdin.
     * @returns {number} The calculated difference or -1 if the path is not found or input is invalid.
     */
    return function(rawInputText) {
        // Input validation: Check if the input is provided and not just whitespace.
        if (!rawInputText || rawInputText.trim().length === 0) {
            console.error("Error: Received empty or invalid input data.");
            return -1;
        }

        // Process the input text into an array of lines.
        const allGridLines = rawInputText.trim().split('\n');

        // Parse the grid dimensions (Height and Width) from the very first line.
        // Unary plus operator `+` is used for concise string-to-number conversion.
        const [gridHeightValue, gridWidthValue] = allGridLines[0].split(' ').map(dimStr => +dimStr);

        // Further validation for the parsed dimensions.
        if (isNaN(gridHeightValue) || isNaN(gridWidthValue) || gridHeightValue <= 0 || gridWidthValue <= 0) {
            console.error("Error: Grid dimensions are invalid or non-positive.");
            return -1;
        }

        // Initialize the BFS traversal matrix. This matrix includes an outer border
        // of OBSTACLE_OR_UNVISITED cells to simplify boundary checks during traversal.
        // The effective size will be (gridHeightValue + 2) x (gridWidthValue + 2).
        const bfsTraversalMatrix = [];

        // Add the top border row to the matrix.
        bfsTraversalMatrix.push(generateFilledRow(gridWidthValue + 2, OBSTACLE_OR_UNVISITED));

        let accessibleCellCounter = 0; // Keeps track of all '.' cells in the grid.

        // Populate the main part of the BFS traversal matrix based on the input grid.
        // Rows are 1-indexed (from 1 to gridHeightValue) due to the added border.
        for (let currentGridRow = 1; currentGridRow <= gridHeightValue; currentGridRow++) {
            const activeRowData = [OBSTACLE_OR_UNVISITED]; // Start with the left border cell.
            const sourceInputRow = allGridLines[currentGridRow];

            // Guard against malformed input where a grid row might be missing or too short.
            if (!sourceInputRow || sourceInputRow.length < gridWidthValue) {
                console.error(`Input format error: Missing or truncated grid row at index ${currentGridRow}.`);
                return -1;
            }

            // Iterate through columns (0 to gridWidthValue - 1) for the actual grid data.
            for (let currentGridCol = 0; currentGridCol < gridWidthValue; currentGridCol++) {
                if (sourceInputRow[currentGridCol] === '.') {
                    accessibleCellCounter++;
                    activeRowData.push(0); // Mark traversable cells with 0 distance initially.
                } else {
                    activeRowData.push(OBSTACLE_OR_UNVISITED); // Mark obstacles explicitly.
                }
            }
            activeRowData.push(OBSTACLE_OR_UNVISITED); // Add the right border cell.
            bfsTraversalMatrix.push(activeRowData);
        }

        // Add the bottom border row to complete the padded matrix.
        bfsTraversalMatrix.push(generateFilledRow(gridWidthValue + 2, OBSTACLE_OR_UNVISITED));

        // Define the possible movement directions for BFS (up, left, down, right).
        // Each object specifies a change in column (dc) and row (dr).
        const moveOffsets = [
            { dc: -1, dr: 0 }, // Move Left
            { dc: 0, dr: -1 }, // Move Up
            { dc: 1, dr: 0 },  // Move Right
            { dc: 0, dr: 1 }   // Move Down
        ];

        // Initialize the BFS queue. Each element is an object representing a cell:
        // { col: column_index, row: row_index, dist: distance_from_start }
        const discoveryQueue = [];

        // Define the starting and target coordinates within the padded matrix.
        const initialCol = 1;
        const initialRow = 1;
        const finalCol = gridWidthValue;
        const finalRow = gridHeightValue;

        // Pre-check: Ensure the starting cell is not an obstacle.
        if (bfsTraversalMatrix[initialRow][initialCol] === OBSTACLE_OR_UNVISITED) {
            console.warn("Warning: The designated start cell (1,1) is an obstacle. Pathfinding is impossible.");
            return -1;
        }
        // Pre-check: Ensure the target cell is not an obstacle.
        if (bfsTraversalMatrix[finalRow][finalCol] === OBSTACLE_OR_UNVISITED) {
            console.warn("Warning: The designated target cell (W,H) is an obstacle. Pathfinding is impossible.");
            return -1;
        }

        // Mark the starting cell's distance in the matrix and add it to the queue.
        // The initial distance is 1, as per standard 1-indexed path length.
        bfsTraversalMatrix[initialRow][initialCol] = 1;
        discoveryQueue.push({ col: initialCol, row: initialRow, dist: 1 });

        // Main BFS loop: continues as long as there are cells to explore.
        while (discoveryQueue.length > 0) {
            // Dequeue the current cell's information.
            const currentCell = discoveryQueue.shift();
            const { col: currentC, row: currentR, dist: currentD } = currentCell;

            // Check if the current cell is the target cell.
            if (currentC === finalCol && currentR === finalRow) {
                // If target reached, return the total accessible cells minus the shortest path length.
                return accessibleCellCounter - currentD;
            }

            // Explore all valid neighbors of the current cell.
            for (const offset of moveOffsets) {
                const nextC = currentC + offset.dc;
                const nextR = currentR + offset.dr;
                const nextDistance = currentD + 1;

                // Check if the neighbor cell is traversable (marked 0) and has not been visited yet
                // by a shorter or equal path (which `0` guarantees for BFS).
                if (bfsTraversalMatrix[nextR][nextC] === 0) {
                    bfsTraversalMatrix[nextR][nextC] = nextDistance; // Mark as visited with its distance.
                    discoveryQueue.push({ col: nextC, row: nextR, dist: nextDistance }); // Enqueue for future exploration.
                }
            }
        }

        // If the BFS loop completes and the target cell was not reached, it implies no path exists.
        console.warn("Warning: The target cell (W,H) is unreachable from the start cell (1,1).");
        return -1; // Indicate that no path was found.
    };
})();

// Execute the path solver by reading input from stdin and printing the computed result.
console.log(pathSolver(require('fs').readFileSync('/dev/stdin', 'utf8')));