// This JavaScript module implements a pathfinding algorithm, likely a variation of Breadth-First Search (BFS),
// to navigate a peculiar 2-row grid. The goal is to find the minimum number of steps to reach the end of the grid.

// Global variables for the current grid's dimensions and layout.
// These are updated for each test case from the input stream.
let gridWidth = 0; // Represents 'n' from the original code, the width of the grid.
let boardLayout = []; // Represents 'xy' from the original code, the 2D array holding grid cell types.

/**
 * Calculates the minimum number of traversal steps required to reach the target column
 * in the current grid configuration.
 *
 * The grid consists of two rows (index 0 and 1) and 'gridWidth' columns.
 * Movement rules are complex, involving special jumps based on cell values (1 or 2).
 *
 * @returns {number} The minimum number of steps, or -1 if no path is found.
 */
const calculateTraversalPath = () => {
    // A Set is used to efficiently track all visited grid cells (row, column) to prevent
    // infinite loops and redundant path explorations in the BFS.
    const exploredPositions = new Set();
    let minimumSteps = -1; // Initialize the result to -1, indicating no path found yet.

    // The BFS queue stores objects, each representing a state in the exploration:
    // { row: number, col: number, steps: number }
    // Initial starting points are (0,0) and (1,0) with 0 steps taken.
    const searchQueue = [
        { row: 0, col: 0, steps: 0 },
        { row: 1, col: 0, steps: 0 }
    ];

    // Pre-calculate the target column index for efficiency.
    const targetColumn = gridWidth - 1;

    // The main BFS loop continues as long as there are positions in the queue to explore.
    while (searchQueue.length > 0) {
        // Dequeue the next position to explore.
        const currentExploration = searchQueue.shift();
        // Use object destructuring for cleaner access to current state properties.
        const { row: currentRowIndex, col: currentColumnIndex, steps: stepsTaken } = currentExploration;

        // Construct a unique string key for the current cell to check against visited positions.
        const positionKey = `${currentRowIndex},${currentColumnIndex}`;

        // If this position has already been explored in a shorter or equal number of steps, skip it.
        // This check prevents revisiting states and cycles.
        if (exploredPositions.has(positionKey)) {
            continue;
        }
        // Mark the current position as visited.
        exploredPositions.add(positionKey);

        // --- Guard Clauses and Boundary Checks ---
        // Ensure the current position is within valid grid boundaries.
        // This defensive check helps catch potential issues from neighbor generation.
        if (currentColumnIndex < 0 || currentColumnIndex >= gridWidth || currentRowIndex < 0 || currentRowIndex > 1) {
            continue;
        }

        // --- Goal Condition Check ---
        // If the current column is the target column and the cell type is not '2',
        // a valid path to the end has been found.
        if (currentColumnIndex === targetColumn && boardLayout[currentRowIndex][currentColumnIndex] !== 2) {
            minimumSteps = stepsTaken; // Update the result.
            break; // Path found, terminate the BFS as we're looking for the shortest.
        }

        // Retrieve the type of the current cell from the grid layout.
        const cellType = boardLayout[currentRowIndex][currentColumnIndex];

        // This variable will hold the effective column index after any special movements
        // dictated by the cell type (1 or 2).
        let effectiveColumnForNeighbors = currentColumnIndex;

        // --- Special Movement Rules Based on Cell Type ---
        if (cellType === 1) {
            // Cell type 1: Move forward (increase column index) as long as consecutive cells are also '1'.
            // Stop if a non-'1' cell is encountered, or if the end of the row is reached.
            let tempColumn = currentColumnIndex;
            while (tempColumn < targetColumn) { // Iterate until one column before the target
                tempColumn++; // Attempt to move to the next column.

                // If the target column is reached during this forward movement:
                if (tempColumn === targetColumn) {
                    effectiveColumnForNeighbors = tempColumn; // Update the effective column.
                    // If the cell at the target column is NOT type '2', this is a valid end point.
                    if (boardLayout[currentRowIndex][tempColumn] !== 2) {
                        minimumSteps = stepsTaken;
                        return minimumSteps; // Early return: path found directly to the goal.
                    }
                    // If it IS type '2' at targetColumn, this path can't end here, so break the inner loop.
                    break;
                }

                // If the next cell encountered is not type '1', then the movement stops
                // at the cell just before this non-'1' cell.
                if (boardLayout[currentRowIndex][tempColumn] !== 1) {
                    effectiveColumnForNeighbors = tempColumn - 1;
                    break; // Terminate forward movement.
                }
                // If it's still type '1', continue moving forward; update effective column.
                effectiveColumnForNeighbors = tempColumn;
            }
        } else if (cellType === 2) {
            // Cell type 2: Move backward (decrease column index) as long as consecutive cells are also '2'.
            // Stop if a non-'2' cell is encountered, or if the beginning of the row is reached.
            let tempColumn = currentColumnIndex;
            while (tempColumn > 0) { // Iterate until one column after the start (index 0)
                tempColumn--; // Attempt to move to the previous column.

                // If the previous cell is not type '2', then the movement stops
                // at the cell just after this non-'2' cell.
                if (boardLayout[currentRowIndex][tempColumn] !== 2) {
                    effectiveColumnForNeighbors = tempColumn + 1;
                    break; // Terminate backward movement.
                }
                // If it's still type '2', continue moving backward; update effective column.
                effectiveColumnForNeighbors = tempColumn;
            }
            // Additional guard: Ensure effectiveColumnForNeighbors doesn't fall below 0.
            // This can happen if starting at col 0 with cellType 2.
            if (effectiveColumnForNeighbors < 0) {
                effectiveColumnForNeighbors = 0;
            }
        }

        // --- Neighbor Generation and Enqueueing ---
        // Neighbors are always in the other row and one of three adjacent columns.
        const nextRowIndex = 1 - currentRowIndex; // Switches between row 0 and row 1.
        const nextSteps = stepsTaken + 1; // Each step increments the count.

        // Explore three potential neighbor columns relative to the effective column.
        for (let neighborOffset = 0; neighborOffset <= 2; neighborOffset++) {
            const neighborColumnIndex = effectiveColumnForNeighbors + neighborOffset;

            // Ensure the generated neighbor column is within the valid grid boundaries.
            if (neighborColumnIndex >= 0 && neighborColumnIndex < gridWidth) {
                const neighborKey = `${nextRowIndex},${neighborColumnIndex}`;
                // Only enqueue if this neighbor has not been visited yet.
                if (!exploredPositions.has(neighborKey)) {
                    searchQueue.push({
                        row: nextRowIndex,
                        col: neighborColumnIndex,
                        steps: nextSteps
                    });
                }
            }
        }
    }

    // If the loop finishes without finding a path to the target, return -1.
    return minimumSteps;
};

// --- Main Program Execution ---

// Read all standard input synchronously. This is common in competitive programming.
const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input: trim whitespace and split into an array of lines.
const inputLines = rawInputData.trim().split('\n');

// Loop through each test case provided in the input.
// Each test case starts with 'n' (gridWidth), followed by two lines for the grid.
while (true) {
    // Attempt to read the grid width for the current test case.
    const currentNString = inputLines.shift();

    // If there are no more lines, it means end of input.
    if (currentNString === undefined) {
        break;
    }

    // Convert the string to an integer. Use parseInt with radix for safety.
    gridWidth = parseInt(currentNString, 10);

    // A grid width of 0 signals the end of all test cases.
    if (gridWidth === 0) {
        break;
    }

    // Initialize the board layout for the current test case.
    boardLayout = [];

    // Read the two rows of grid data.
    const firstRowString = inputLines.shift();
    const secondRowString = inputLines.shift();

    // Basic input validation: ensure both rows exist.
    if (firstRowString === undefined || secondRowString === undefined) {
        console.error("Error: Malformed input - expected two grid rows but found fewer.");
        break; // Exit the processing loop due to bad input.
    }

    // Parse each row string into an array of numbers.
    boardLayout[0] = firstRowString.split(' ').map(Number);
    boardLayout[1] = secondRowString.split(' ').map(Number);

    // Execute the pathfinding algorithm for the current grid and print the result.
    // The `calculateTraversalPath` function implicitly accesses `gridWidth` and `boardLayout`
    // from the outer scope, forming a closure.
    const pathResult = calculateTraversalPath();
    console.log(pathResult);
}