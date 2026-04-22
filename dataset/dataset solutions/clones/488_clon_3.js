/*
 * This module provides a function to calculate the minimum number of hops
 * required to traverse a 2-row grid from the starting columns (0,0) and (1,0)
 * to the target column (n-1) in either row, avoiding specific cell types.
 * It employs a Breadth-First Search (BFS) approach to guarantee the shortest path.
 */
function navigateMinHops(gridDimensionN, gridMap) {
    // Robust input validation for the grid dimensions and structure.
    // Ensures gridDimensionN is a positive number and gridMap is a 2-element array.
    if (!gridDimensionN || typeof gridDimensionN !== 'number' || gridDimensionN <= 0 ||
        !Array.isArray(gridMap) || gridMap.length !== 2) {
        console.error("Error: Invalid grid dimensions or map provided. Returning an error state.");
        return "INPUT_ERROR"; // Indicate a problem with the input
    }
    // Further validation to ensure each row exists and has the correct length.
    if (!Array.isArray(gridMap[0]) || gridMap[0].length !== gridDimensionN ||
        !Array.isArray(gridMap[1]) || gridMap[1].length !== gridDimensionN) {
        console.error("Error: Grid rows have incorrect length or are malformed. Returning an error state.");
        return "INPUT_ERROR";
    }

    // A hash map to keep track of all coordinates (row, col) that have been added to the queue
    // or fully processed. This prevents revisiting nodes and avoids infinite loops in cyclic paths.
    // Keys are string representations like "row,col", values are simple booleans.
    const discoveredLocations = {};

    // This variable will store the length of the shortest path found.
    // Initialized to a string indicating no path has been found yet.
    let minimumTraversalSteps = "NO_PATH_FOUND";

    // The core BFS queue. Each element in the queue is an array representing a state:
    // [currentRowIndex, currentColumnIndex, currentPathLength].
    // The search begins from two initial points: (0,0) and (1,0), both at 0 steps.
    const explorationQueue = [
        [0, 0, 0], // Initial state 1: Row 0, Column 0, path length 0
        [1, 0, 0]  // Initial state 2: Row 1, Column 0, path length 0
    ];

    // Define constants for better readability and maintainability.
    const NUMBER_OF_GRID_ROWS = 2; // The grid is always 2 rows high (row 0 and row 1).
    const FINAL_COLUMN_DESTINATION = gridDimensionN - 1; // The target column index for any row.

    // The main loop of the Breadth-First Search algorithm.
    // It continues as long as there are cells left to explore in the queue.
    while (explorationQueue.length > 0) {
        // Dequeue the next cell's information for processing.
        // Using array destructuring for cleaner assignment.
        const currentCellData = explorationQueue.shift();
        const [currentRowIndex, currentColumnIndex, stepsTaken] = currentCellData;

        // Create a unique string key for the current cell's coordinates.
        const cellCoordinateKey = `${currentRowIndex},${currentColumnIndex}`;

        // Check if this specific cell has already been processed or is already in the queue.
        // If it has, skip it to avoid redundant computations and cycles.
        if (Object.prototype.hasOwnProperty.call(discoveredLocations, cellCoordinateKey)) {
            continue; // Move to the next item in the queue.
        } else {
            // Mark the current cell as visited to prevent future revisits.
            discoveredLocations[cellCoordinateKey] = true;
        }

        // Check if the current cell is the target destination.
        // A path is considered found if we reach the `FINAL_COLUMN_DESTINATION`
        // AND the cell's terrain type is not '2' (assuming '2' is a blocked/invalid endpoint).
        if (currentColumnIndex === FINAL_COLUMN_DESTINATION && gridMap[currentRowIndex][currentColumnIndex] !== 2) {
            minimumTraversalSteps = stepsTaken; // Update the result with the path length.
            break; // Since BFS finds the shortest path first, we can terminate early.
        }

        // Retrieve the terrain type of the current cell from the grid map.
        const currentTerrainType = gridMap[currentRowIndex][currentColumnIndex];
        let effectiveColumnForNextHops = currentColumnIndex; // Default: next hops originate from current column.

        // Apply special movement rules based on the terrain type.
        // Terrain type '1' means 'slide right'.
        if (currentTerrainType === 1) {
            // Continuously move to the right as long as the terrain remains '1'
            // and we are within grid boundaries.
            for (let nextPotentialCol = currentColumnIndex + 1; nextPotentialCol < gridDimensionN; ++nextPotentialCol) {
                if (gridMap[currentRowIndex][nextPotentialCol] === 1) {
                    effectiveColumnForNextHops = nextPotentialCol; // Update the effective column.
                } else {
                    break; // Stop sliding if terrain changes or boundary reached.
                }
            }
        }
        // Terrain type '2' means 'slide left'.
        else if (currentTerrainType === 2) {
            // Continuously move to the left as long as the terrain remains '2'
            // and we are within grid boundaries.
            for (let nextPotentialCol = currentColumnIndex - 1; nextPotentialCol >= 0; --nextPotentialCol) {
                if (gridMap[currentRowIndex][nextPotentialCol] === 2) {
                    effectiveColumnForNextHops = nextPotentialCol; // Update the effective column.
                } else {
                    break; // Stop sliding if terrain changes or boundary reached.
                }
            }
        }
        // If the terrain is neither '1' nor '2', no special sliding occurs;
        // effectiveColumnForNextHops remains the same as currentColumnIndex.

        // Generate the next set of possible moves from the `effectiveColumnForNextHops`.
        // The next row is always the opposite of the current row (0 -> 1, 1 -> 0).
        const nextRowToExplore = NUMBER_OF_GRID_ROWS - 1 - currentRowIndex; // Equivalent to `1 - currentRowIndex`.
        // These are the possible column offsets relative to `effectiveColumnForNextHops`.
        const columnOffsetsForNextMoves = [0, 1, 2];

        // Iterate through each possible column offset to generate new states.
        for (const colShift of columnOffsetsForNextMoves) {
            const nextColumnToExplore = effectiveColumnForNextHops + colShift;

            // Before adding to the queue, ensure the new column is within the grid's bounds.
            if (nextColumnToExplore >= 0 && nextColumnToExplore < gridDimensionN) {
                // Enqueue the new state: [nextRow, nextCol, incremented path length].
                explorationQueue.push([nextRowToExplore, nextColumnToExplore, stepsTaken + 1]);
            }
        }
    }

    return minimumTraversalSteps; // Return the final result (either path length or "NO_PATH_FOUND").
}

// --- Main execution block for processing input and running multiple simulations ---

// Import the Node.js File System module to read input.
const fileSystemModule = require('fs');
// Read all input from standard input as a UTF-8 encoded string.
const rawInputContents = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

// Process the raw input: remove leading/trailing whitespace and split into an array of lines.
let inputLinesCollection = rawInputContents.trim().split('\n');

// Loop through each test case provided in the input.
// The loop continues indefinitely until a specific termination condition is met.
while (true) {
    // Extract the grid dimension (N) for the current test case from the first line.
    // `shift()` removes the first element from the array and returns it.
    // `parseInt()` is used for explicit conversion to an integer, with radix 10 for safety.
    const currentGridSizeN = parseInt(inputLinesCollection.shift(), 10);

    // If the parsed N is 0, it signals the end of the input test cases.
    if (currentGridSizeN === 0) {
        break; // Exit the loop.
    }

    // Initialize a 2-dimensional array to store the grid map for the current level.
    const currentLevelMap = [];
    // Parse the first row of the grid. It's space-separated numbers.
    currentLevelMap[0] = inputLinesCollection.shift().split(' ').map(Number);
    // Parse the second row of the grid.
    currentLevelMap[1] = inputLinesCollection.shift().split(' ').map(Number);

    // Call the pathfinding function with the current grid's size and map.
    // Print the returned result to standard output.
    console.log(navigateMinHops(currentGridSizeN, currentLevelMap));
}