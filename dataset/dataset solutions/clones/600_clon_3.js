// This file implements a Breadth-First Search (BFS) algorithm
// to find the minimum number of steps required to collect all
// sequential power-ups on a grid, starting from a designated 'S' position.

// The grid can contain obstacles ('X'), empty paths ('.'),
// and numbered power-ups ('1', '2', '3', etc.).
// The goal is to reach a state where all required power-ups
// up to a target level have been collected.

/**
 * Explores possible paths on a grid using BFS to find the shortest path
 * to collect a sequence of power-ups.
 *
 * @param {number} initialX - The starting X-coordinate (column).
 * @param {number} initialY - The starting Y-coordinate (row).
 * @param {Array<Array<string>>} initialGridState - A deep copy of the initial grid configuration.
 * @param {Array<number>} gridDimensions - An array [height, width] of the grid.
 * @param {number} targetPower - The maximum power-up number to be collected (e.g., if 3, collect '1', '2', '3').
 * @returns {number} The minimum number of steps, or -1 if no path is found.
 */
function exploreGridPaths(initialX, initialY, initialGridState, gridDimensions, targetPower) {
    // --- Input Validation and Setup ---

    // Ensure grid dimensions are valid.
    if (!Array.isArray(gridDimensions) || gridDimensions.length !== 2 || gridDimensions[0] <= 0 || gridDimensions[1] <= 0) {
        // Log an error and return a failure indicator.
        console.error("Error: Invalid grid dimensions provided to exploreGridPaths.");
        return -1;
    }

    const gridHeight = gridDimensions[0];
    const gridWidth = gridDimensions[1];
    // The power level we need to reach *after* consuming the last required power-up.
    // E.g., if targetPower is 3, we need to reach power level 4.
    const finalPowerLevelRequired = targetPower + 1;

    // Define movement offsets for 4 directions: (dx, dy) for Up, Left, Right, Down.
    const deltaXCoordinates = [0, -1, 1, 0]; // Change in X for each direction.
    const deltaYCoordinates = [-1, 0, 0, 1]; // Change in Y for each direction.

    let minimumStepsAchieved = -1; // Initialize the result. -1 signifies no valid path found yet.

    // --- BFS Queue and Visited States Tracker ---

    // The BFS queue stores nodes representing a state:
    // [current_x, current_y, steps_taken, power_level_needed_for_next_pickup, current_grid_snapshot]
    // A deep copy of the initial grid state is created and the starting cell is marked as visited ('.').
    let startingGridSnapshot = initialGridState.map(row => [...row]);
    startingGridSnapshot[initialY][initialX] = '.'; // Mark the starting cell as traversable/visited.

    const explorationQueue = [
        [initialX, initialY, 0, 1, startingGridSnapshot] // Initial state: x, y, 0 steps, need power '1', current grid.
    ];

    // A Map is used to track visited states to prevent cycles and redundant computations.
    // The key combines current position, current power requirement, and the grid's state.
    // This is crucial because the grid itself changes and power level is part of the state.
    const visitedStatesMap = new Map();
    const initialGridStringRepresentation = startingGridSnapshot.map(row => row.join('')).join('');
    const initialStateKey = `${initialX} ${initialY} 1 ${initialGridStringRepresentation}`;
    visitedStatesMap.set(initialStateKey, true);

    // --- Main BFS Loop ---

    // Continue exploration as long as there are states in the queue.
    while (explorationQueue.length > 0) {
        // Retrieve and remove the first state from the queue (FIFO for BFS).
        const [
            currentX,
            currentY,
            currentStepCount,
            currentPowerRequirement,
            currentGridConfiguration
        ] = explorationQueue.shift();

        // Check if the goal condition is met: all required power-ups have been collected.
        if (currentPowerRequirement === finalPowerLevelRequired) {
            minimumStepsAchieved = currentStepCount; // Store the number of steps for this path.
            break; // Found the shortest path, exit the BFS loop.
        }

        // --- Explore Neighbors ---

        // Iterate through all four possible adjacent cells.
        for (let directionIndex = 0; directionIndex < 4; ++directionIndex) {
            const nextXCoordinate = currentX + deltaXCoordinates[directionIndex];
            const nextYCoordinate = currentY + deltaYCoordinates[directionIndex];
            let nextPowerLevelForState = currentPowerRequirement; // Initialize power for the next state.

            // 1. Boundary Check: Ensure the next cell is within grid boundaries.
            if (nextXCoordinate < 0 || nextYCoordinate < 0 || nextXCoordinate >= gridWidth || nextYCoordinate >= gridHeight) {
                continue; // Skip this direction if out of bounds.
            }

            // 2. Obstacle Check: Ensure the next cell is not an 'X' (obstacle).
            if (currentGridConfiguration[nextYCoordinate][nextXCoordinate] === "X") {
                continue; // Skip if it's an obstacle.
            }

            // 3. Create a deep copy of the grid for the new state.
            // This is essential because the grid state changes when power-ups are collected.
            const nextGridConfigurationCopy = currentGridConfiguration.map(row => [...row]);

            // 4. Power-up Collection Logic:
            // Check if the current cell contains the power-up needed next.
            const cellContentAtNext = nextGridConfigurationCopy[nextYCoordinate][nextXCoordinate];
            if (cellContentAtNext === String(nextPowerLevelForState)) {
                nextPowerLevelForState++; // Increment the power level requirement for the *subsequent* power-up.
                nextGridConfigurationCopy[nextYCoordinate][nextXCoordinate] = '.'; // Mark the power-up as collected (path cleared).
            }

            // 5. Generate a unique key for the new state to check against visited states.
            // The key includes position, current power requirement, and the grid's configuration.
            const nextGridStringRepresentation = nextGridConfigurationCopy.map(row => row.join('')).join('');
            const newStateKey = `${nextXCoordinate} ${nextYCoordinate} ${nextPowerLevelForState} ${nextGridStringRepresentation}`;

            // 6. Visited State Check: If this state has already been explored, skip it.
            if (visitedStatesMap.has(newStateKey)) {
                continue;
            }

            // 7. Mark the new state as visited.
            visitedStatesMap.set(newStateKey, true);

            // 8. Add the new state to the exploration queue.
            explorationQueue.push([
                nextXCoordinate,
                nextYCoordinate,
                currentStepCount + 1, // One more step taken.
                nextPowerLevelForState,
                nextGridConfigurationCopy
            ]);
        }
    }

    return minimumStepsAchieved; // Return the minimum steps found, or -1.
}


// --- Main Program Execution ---

// Use the 'fs' (file system) module to read input.
const fileSystem = require('fs');

// Read all raw input data from standard input ('/dev/stdin').
const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');

// Process the input: remove leading/trailing whitespace and split into individual lines.
const inputContentLines = rawInputContent.trim().split("\n");

// Parse the first line to get grid dimensions (height, width) and the target power level.
// Expected format: "HEIGHT WIDTH POWER_LEVEL"
const firstLineParts = inputContentLines.shift().split(" ").map(Number);

// Destructure the parsed values for clarity.
let [gridHeightValue, gridWidthValue, finalPowerLevelTarget] = firstLineParts;

// Basic validation for the parsed initial parameters.
if (isNaN(gridHeightValue) || isNaN(gridWidthValue) || isNaN(finalPowerLevelTarget) ||
    gridHeightValue <= 0 || gridWidthValue <= 0 || finalPowerLevelTarget < 0) {
    console.error("Error: Invalid initial parameters (height, width, or target power level) in input.");
    process.exit(1); // Exit with an error code if input is invalid.
}

// Initialize the game board (grid) and a variable to store the starting position.
const gameMapGrid = [];
let startingPointCoordinates = []; // Will store [x, y] of 'S'.

// Iterate through the remaining input lines to populate the grid and find the 'S' (start) position.
for (let rowIdx = 0; rowIdx < gridHeightValue; ++rowIdx) {
    // Get characters for the current row.
    const currentRowCharacters = inputContentLines.shift().split("");
    
    // Search for the 'S' character in the current row.
    const startColumnIndex = currentRowCharacters.indexOf("S");
    if (startColumnIndex !== -1) {
        startingPointCoordinates = [startColumnIndex, rowIdx]; // Store the (column, row) coordinates.
    }
    gameMapGrid.push(currentRowCharacters); // Add the processed row to the grid.
}

// Validate that a starting position 'S' was actually found on the grid.
if (startingPointCoordinates.length === 0) {
    console.error("Error: Starting position 'S' not found on the grid map.");
    process.exit(1);
}

// --- Execute the BFS Algorithm ---

// Call the pathfinding function with the gathered parameters.
// A deep copy of the initial game board is passed to ensure the function operates on its own state.
const calculatedMinimumSteps = exploreGridPaths(
    startingPointCoordinates[0],
    startingPointCoordinates[1],
    gameMapGrid.map(row => [...row]), // Deep copy of the grid.
    [gridHeightValue, gridWidthValue], // Grid dimensions.
    finalPowerLevelTarget // The highest power-up number to collect.
);

// --- Output Result ---

// Print the final result to standard output.
console.log(calculatedMinimumSteps);