function* tokenStreamGenerator() {
    // This generator reads all content from standard input,
    // removes leading/trailing whitespace, and then splits it
    // into individual tokens based on any sequence of whitespace or newlines.
    // Each token is then yielded one by one.
    const inputContent = require("node:fs").readFileSync("/dev/stdin", "utf-8");
    const parsedDataSegments = inputContent.trim().split(/\s+|\n+/);
    for (const segment of parsedDataSegments) {
        yield segment;
    }
}

function acquireInputTokens(count, sourceIteratorInstance) {
    // This utility function fetches a specified 'count' of tokens
    // from a provided generator instance. If no instance is given,
    // it initializes and uses a new `tokenStreamGenerator`.
    // It collects these tokens into an array and returns them.
    const activeIterator = sourceIteratorInstance || (this.inputStream = tokenStreamGenerator());
    const collectedTokens = [];
    for (let index = 0; index < count; index++) {
        const { value, done } = activeIterator.next();
        if (done) {
            // In case the input stream ends prematurely, log an error and exit.
            console.error("Input stream exhausted prematurely. Not enough tokens.");
            process.exit(1);
        }
        collectedTokens.push(value);
    }
    return collectedTokens;
}

// Main application logic encapsulated within an Immediately Invoked Function Expression (IIFE).
(() => {
    // --- Configuration and Coordinate Input Processing ---

    // Read the grid dimensions (height, width) and the maximum step size (k).
    // The `map(Number)` call converts the string tokens directly to numeric values.
    const [ gridHeight, gridWidth, maxStepSize ] = acquireInputTokens(3).map(Number);

    // Read the starting and ending coordinates for the pathfinding algorithm.
    // Coordinates are adjusted to be 0-indexed by subtracting 1.
    const [ startRow, startCol, endRow, endCol ] = acquireInputTokens(4).map(val => Number(val) - 1);

    // Perform basic validation to ensure all coordinates are within the grid boundaries.
    const isValidCoordinate = (r, c) => r >= 0 && r < gridHeight && c >= 0 && c < gridWidth;
    if (!isValidCoordinate(startRow, startCol) || !isValidCoordinate(endRow, endCol)) {
        console.error("Error: Start or end coordinates are out of grid bounds.");
        process.exit(1);
    }

    // --- Grid Initialization ---

    // First, construct the raw grid layout from the input data.
    // Each line of input represents a row, which is then split into individual characters.
    const initialGridLayout = [];
    for (let r = 0; r < gridHeight; r++) {
        const rowCharacters = acquireInputTokens(1)[0].split('');
        initialGridLayout.push(rowCharacters);
    }

    // Initialize the path cost grid, which will store the minimum 'jumps'
    // required to reach each cell from the starting point.
    // Cells are initially marked with `Infinity` (unreachable),
    // and obstacles ('@') are marked with -1.
    const pathCostGrid = Array.from({ length: gridHeight }, () =>
        Array(gridWidth).fill(Infinity)
    );

    // Populate the path cost grid with obstacle information.
    for (let r = 0; r < gridHeight; r++) {
        for (let c = 0; c < gridWidth; c++) {
            if (initialGridLayout[r][c] === '@') {
                pathCostGrid[r][c] = -1; // Mark obstacles
            }
        }
    }

    // --- BFS Setup ---

    // Set the cost to reach the starting cell as 0.
    pathCostGrid[startRow][startCol] = 0;

    // Initialize the queue for the Breadth-First Search (BFS).
    // It will hold arrays `[row, column]` representing cells to be processed.
    const cellsToProcessQueue = [
        [startRow, startCol]
    ];

    // --- Grid Access Helper Functions ---

    // Returns the current path cost for a given cell.
    // Returns `null` if the coordinates are outside the grid bounds.
    const getCostAtCell = (r, c) => {
        if (!isValidCoordinate(r, c)) {
            return null; // Indicate out-of-bounds access
        }
        return pathCostGrid[r][c];
    };

    // Updates the path cost for a given cell, only if the coordinates are valid.
    const setCostAtCell = (r, c, cost) => {
        if (isValidCoordinate(r, c)) {
            pathCostGrid[r][c] = cost;
        }
    };

    // --- BFS Core Algorithm ---

    // Define the possible movement directions (delta_row, delta_column) for cardinal moves.
    const cardinalDirections = [
        [1, 0],  // Downward
        [-1, 0], // Upward
        [0, 1],  // Rightward
        [0, -1]  // Leftward
    ];

    let currentCellLocation = null; // Variable to hold the dequeued cell coordinates.

    // Continue BFS as long as there are cells in the queue to explore.
    while (cellsToProcessQueue.length > 0) {
        currentCellLocation = cellsToProcessQueue.shift(); // Dequeue the next cell
        const [currentRow, currentCol] = currentCellLocation;

        // If the target cell has been reached, the shortest path is found.
        if (currentRow === endRow && currentCol === endCol) {
            break;
        }

        // Calculate the cost for reaching any adjacent cell from the current cell.
        // Each "jump" counts as one step.
        const costToReachNext = getCostAtCell(currentRow, currentCol) + 1;

        // Explore all four cardinal directions.
        for (const [deltaR, deltaC] of cardinalDirections) {
            // For each direction, try jumping from 1 up to `maxStepSize` steps.
            for (let stepCount = 1; stepCount <= maxStepSize; stepCount++) {
                const nextRow = currentRow + deltaR * stepCount;
                const nextCol = currentCol + deltaC * stepCount;

                // Check if the potential next cell is within grid boundaries.
                if (!isValidCoordinate(nextRow, nextCol)) {
                    // If out of bounds, no further jumps in this direction are possible.
                    break;
                }

                const currentCellCost = getCostAtCell(nextRow, nextCol);

                // If the cell is an obstacle, no path can go through it,
                // so stop exploring further in this direction.
                if (currentCellCost === -1) {
                    break;
                }

                // If this cell has not been visited yet (cost is Infinity),
                // or if we found a shorter path to it, update its cost and enqueue it.
                if (currentCellCost === Infinity) {
                    setCostAtCell(nextRow, nextCol, costToReachNext);
                    cellsToProcessQueue.push([nextRow, nextCol]);
                } else if (currentCellCost <= costToReachNext) {
                    // If we've already found an equal or shorter path to this cell,
                    // there's no need to process it again from this path, nor
                    // to continue exploring further in this specific jump direction.
                    // This pruning prevents redundant work in BFS.
                    break;
                }
                // If currentCellCost > costToReachNext, it means we found a shorter path.
                // This scenario is effectively covered by the `Infinity` check in a standard BFS,
                // as cells are processed in increasing order of cost.
            }
        }
    }

    // --- Final Output ---

    const minimumJumpsToTarget = getCostAtCell(endRow, endCol);

    // If the target cell's cost is still `Infinity` (unreachable) or -1 (obstacle),
    // it means no path exists. Output -1 as per problem specification.
    if (minimumJumpsToTarget === Infinity || minimumJumpsToTarget === -1) {
        console.log('-1');
    } else {
        // Otherwise, output the minimum number of jumps required.
        console.log(minimumJumpsToTarget);
    }
})();