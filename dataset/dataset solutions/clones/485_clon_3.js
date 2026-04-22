// This function determines the minimum number of steps required to navigate a 2-row grid.
// It uses a Breadth-First Search (BFS) approach, starting from two initial positions.
// The goal is to reach the last column (n-1) in a cell that is not of type '2'.
// Navigation rules depend on cell types ('1' or '2') and involve moving within a row
// before potentially switching rows and moving by an offset.
function solveGridPath(gridWidth, gridMatrix) {
    // A Map to efficiently track visited coordinates to prevent revisiting states
    // and falling into infinite loops. Keys are strings like "row,col".
    const visitedStatesMap = new Map();

    // Variable to store the minimum number of steps found.
    // Initialized to -1, indicating no path has been found yet.
    let minPathSteps = -1;

    // The BFS queue, containing arrays of [currentRowIndex, currentColumnIndex, stepsTaken].
    // The search begins from two initial cells: (0,0) and (1,0), both with 0 steps.
    const initialTraversalStates = [[0, 0, 0], [1, 0, 0]];
    const processingQueue = [...initialTraversalStates]; // Use spread to create a distinct array instance.

    // The target column index, which is the rightmost column of the grid.
    const finalColumnTarget = gridWidth - 1;

    // The main Breadth-First Search loop. It continues as long as there are
    // unvisited states in the queue to explore.
    while (processingQueue.length > 0) {
        // Dequeue the current state (cell coordinates and steps taken) for processing.
        const [currentRow, currentCol, currentSteps] = processingQueue.shift();

        // Generate a unique string key for the current cell's coordinates.
        const currentCoordKey = `${currentRow},${currentCol}`;

        // If this cell has already been processed, skip it to avoid redundant work.
        if (visitedStatesMap.has(currentCoordKey)) {
            continue;
        }
        // Mark the current cell as visited.
        visitedStatesMap.set(currentCoordKey, true);

        // Check if the current state meets the goal condition:
        // 1. The current column is the final column.
        // 2. The cell type at this position is not '2'.
        if (currentCol === finalColumnTarget && gridMatrix[currentRow][currentCol] !== 2) {
            minPathSteps = currentSteps; // A path to the goal has been found.
            break; // Terminate the BFS as we're looking for the minimum steps.
        }

        // Retrieve the type of the current cell from the grid.
        const currentCellType = gridMatrix[currentRow][currentCol];
        // A temporary variable to track the column index after type-specific movements within the row.
        let effectiveColumnAfterMovement = currentCol;

        // Apply movement logic based on the current cell's type.
        if (currentCellType === 1) {
            // For cell type '1': Move rightward as long as consecutive cells are also '1'.
            // If a non-'1' cell is encountered, stop just before it.
            // If the end of the grid is reached, stop there.
            while (effectiveColumnAfterMovement < finalColumnTarget) {
                const nextPotentialCol = effectiveColumnAfterMovement + 1;
                // If the next cell is not type '1', break the movement loop.
                if (gridMatrix[currentRow][nextPotentialCol] !== 1) {
                    break;
                }
                effectiveColumnAfterMovement = nextPotentialCol; // Continue moving right.
            }

            // A special condition: if after moving, the effective column is the final column
            // AND the cell at this position is still type '1', then this path segment
            // is considered a dead end for reaching the goal (as type '1' at n-1 is not a goal).
            // This mirrors the original logic to skip adding children in this specific scenario.
            if (effectiveColumnAfterMovement === finalColumnTarget && gridMatrix[currentRow][effectiveColumnAfterMovement] === 1) {
                continue; // Skip generating and enqueuing new states from this position.
            }
        } else if (currentCellType === 2) {
            // For cell type '2': Move leftward.
            // The original logic decrements the column, then checks the new cell.
            // It stops when the new cell is not type '2', and the final column
            // will be the index of that first non-'2' cell encountered while moving left.
            let tempColForType2 = currentCol;
            while (tempColForType2 > 0) { // Ensure we don't go out of bounds to the left (column 0 is valid).
                tempColForType2--; // Attempt to move left to the previous column.
                // If the cell at this new (decremented) position is not type '2', then stop.
                if (gridMatrix[currentRow][tempColForType2] !== 2) {
                    break; // The loop terminates, and tempColForType2 holds the position of the non-'2' cell.
                }
            }
            effectiveColumnAfterMovement = tempColForType2; // Update the effective column.
        }

        // After any type-specific horizontal movements, generate new states to explore.
        // These new states involve switching to the other row and potentially shifting columns.
        for (let colOffset = 0; colOffset <= 2; colOffset++) {
            const nextRowIndex = 1 - currentRow; // Switches from row 0 to 1, or 1 to 0.
            const nextColumnIndex = effectiveColumnAfterMovement + colOffset; // New column based on adjusted position and an offset.
            const nextStepsCount = currentSteps + 1; // Increment the step count for the new state.

            // Ensure the next column index is within the valid grid boundaries [0, gridWidth - 1].
            // This is a robustness addition (Type III change) as the original code didn't explicitly check.
            if (nextColumnIndex >= 0 && nextColumnIndex < gridWidth) {
                 processingQueue.push([nextRowIndex, nextColumnIndex, nextStepsCount]);
            }
        }
    }

    return minPathSteps; // Return the result (-1 if no path was found).
}

// Import the 'fs' (file system) module for reading input from a file.
const fileSystem = require('fs');

// Read all input data from '/dev/stdin' (standard input) as a UTF-8 string.
const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');

// Pre-process the raw input: trim any leading/trailing whitespace and split it into an
// array of lines based on newline characters.
let inputLinesArray = rawInputData.trim().split('\n');

// Loop through each test case provided in the input.
// The loop continues as long as there are lines left to process.
while (inputLinesArray.length > 0) {
    // Extract the grid width for the current test case from the first line.
    // `parseInt` is used with radix 10 for explicit number conversion.
    const currentGridWidth = parseInt(inputLinesArray.shift(), 10);

    // A grid width of 0 signifies the end of all test cases.
    if (currentGridWidth === 0) {
        break;
    }

    // Initialize an array to store the 2-row grid configuration for the current test case.
    const gridConfiguration = [];

    // Attempt to read the two lines representing the grid rows.
    const firstRowInput = inputLinesArray.shift();
    const secondRowInput = inputLinesArray.shift();

    // Add a guard clause for robust input handling:
    // If either row input is missing (e.g., due to malformed input), log an error and exit the loop.
    if (!firstRowInput || !secondRowInput) {
        console.error("Error: Insufficient input lines for grid configuration. Expected 2 rows.");
        break;
    }

    // Parse each row string into an array of numbers and add them to the grid configuration.
    gridConfiguration.push(firstRowInput.split(' ').map(Number));
    gridConfiguration.push(secondRowInput.split(' ').map(Number));

    // Call the pathfinding function with the current grid's dimensions and configuration.
    // The result (minimum steps) is then printed to standard output.
    console.log(solveGridPath(currentGridWidth, gridConfiguration));
}