"use strict";
// Module for file system operations, used to read standard input.
const fileSystemModule = require("fs");

// Read all input from standard input as a UTF-8 string.
const rawInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");

// Split the input content by spaces or newlines to get an array of tokens.
const dataTokens = rawInputContent.split(/ |\n/);

// Pointer to keep track of the current token being processed from `dataTokens`.
let currentTokenPointer = 0;

/**
 * Retrieves and converts the next token from the input stream to a number.
 * Increments the token pointer after consumption.
 * @returns {number} The next numerical token.
 */
function extractNextNumericalValue() {
    return +dataTokens[currentTokenPointer++];
}

/**
 * Retrieves the next token from the input stream as a string.
 * Increments the token pointer after consumption.
 * @returns {string} The next string token.
 */
function extractNextStringValue() {
    return dataTokens[currentTokenPointer++];
}

/**
 * Retrieves a specified number of tokens from the input stream and returns them as an array of strings.
 * Updates the token pointer.
 * @param {number} count - The number of string tokens to retrieve.
 * @returns {string[]} An array containing the requested string tokens.
 */
function extractMultipleStrings(count) {
    const stringSubset = dataTokens.slice(currentTokenPointer, currentTokenPointer + count);
    currentTokenPointer += count;
    return stringSubset;
}

/**
 * Calculates the shortest path distances from a specified starting cell
 * to all other reachable cells within a 2D grid using a Breadth-First Search (BFS) algorithm.
 *
 * @param {string[]} gridMap - The 2D grid, where each element is a string representing a row.
 *                             '.' for open paths, '#' for obstacles.
 * @param {number} initialX - The x-coordinate (column) of the starting cell.
 * @param {number} initialY - The y-coordinate (row) of the starting cell.
 * @returns {number[][]} A 2D array (distance matrix) where each cell contains the minimum
 *                        number of steps from the start, or a very large number if unreachable.
 */
function computeShortestPathMatrix(gridMap, initialX, initialY) {
    const PATH_SYMBOL = "."; // Represents a traversable cell.
    const OBSTACLE_SYMBOL = "#"; // Represents an impassable wall.
    const UNREACHABLE_DISTANCE = 1000000000; // A large value to denote infinity or unreachability.

    // Basic validation for the input grid map.
    if (!gridMap || gridMap.length === 0 || gridMap[0].length === 0) {
        console.error("Error: Provided grid map is empty or malformed.");
        return [[]]; // Return an empty matrix or handle error appropriately.
    }

    const gridRows = gridMap.length;
    const gridColumns = gridMap[0].length;

    // Validate starting coordinates to ensure they are within grid bounds.
    if (initialX < 0 || initialX >= gridColumns || initialY < 0 || initialY >= gridRows) {
        console.error(`Error: Starting coordinates (${initialX}, ${initialY}) are outside grid boundaries.`);
        // If start is invalid, no paths are reachable, so return a matrix of UNREACHABLE_DISTANCE.
        return Array(gridRows).fill(null).map(() => Array(gridColumns).fill(UNREACHABLE_DISTANCE));
    }

    // Initialize the distance matrix with UNREACHABLE_DISTANCE for all cells.
    const distanceResultMatrix = Array(gridRows).fill(null).map(() => Array(gridColumns).fill(UNREACHABLE_DISTANCE));

    // Define coordinate changes for moving in 4 cardinal directions (Up, Right, Down, Left).
    const deltaX = [0, 1, 0, -1]; // Change in X-coordinate.
    const deltaY = [-1, 0, 1, 0]; // Change in Y-coordinate.
    const numberOfDirections = deltaX.length; // Expected to be 4.

    // Initialize the BFS queue. Cells are stored as objects {x, y} for clarity.
    const bfsTraversalQueue = [];
    bfsTraversalQueue.push({ x: initialX, y: initialY });

    // The distance to the starting cell is 0.
    distanceResultMatrix[initialY][initialX] = 0;

    let currentLevelPathLength = 0; // Tracks the distance for the current BFS level.

    // Main BFS loop: Continues as long as there are cells to visit.
    while (bfsTraversalQueue.length > 0) {
        currentLevelPathLength++; // Increment distance for cells processed in the next level.
        const nextLevelQueue = []; // Temporarily holds cells for the next BFS level.

        // Process all cells at the current distance level.
        while (bfsTraversalQueue.length > 0) {
            const currentCell = bfsTraversalQueue.shift(); // Dequeue the oldest cell (FIFO).
            const currentCellX = currentCell.x;
            const currentCellY = currentCell.y;

            // Explore all possible neighbors from the current cell.
            for (let i = 0; i < numberOfDirections; i++) {
                const neighborX = currentCellX + deltaX[i];
                const neighborY = currentCellY + deltaY[i];

                // Check if the neighbor is within the grid boundaries.
                if (neighborX < 0 || neighborX >= gridColumns || neighborY < 0 || neighborY >= gridRows) {
                    continue; // Skip if out of bounds.
                }

                // Check if the neighbor is an obstacle.
                if (gridMap[neighborY][neighborX] === OBSTACLE_SYMBOL) {
                    continue; // Skip if it's a wall.
                }

                // Check if the neighbor has already been visited with a shorter or equal path.
                // If it's still UNREACHABLE_DISTANCE, it means it's unvisited.
                if (distanceResultMatrix[neighborY][neighborX] === UNREACHABLE_DISTANCE) {
                    distanceResultMatrix[neighborY][neighborX] = currentLevelPathLength; // Mark its distance.
                    nextLevelQueue.push({ x: neighborX, y: neighborY }); // Enqueue for the next level.
                }
            }
        }
        // If no new cells were found for the next level, BFS is complete.
        if (nextLevelQueue.length === 0) {
            break;
        }
        // Add all cells from the next level's queue to the main BFS queue.
        bfsTraversalQueue.push(...nextLevelQueue);
    }
    return distanceResultMatrix;
}

/**
 * The primary function to solve the grid navigation problem.
 * It reads grid dimensions, finds a starting point 'S', calculates path costs,
 * and determines the minimum number of 'teleportations' to reach any edge.
 * @returns {number} The minimum number of teleportations, or -1 if input is invalid
 *                   or the starting point is not found.
 */
function executeGridAnalysis() {
    // Read grid dimensions (height, width) and the maximum jump distance (k).
    const gridDimHeight = extractNextNumericalValue();
    const gridDimWidth = extractNextNumericalValue();
    const maximumAllowedJump = extractNextNumericalValue();

    // Input validation for grid dimensions and jump distance.
    if (gridDimHeight <= 0 || gridDimWidth <= 0 || maximumAllowedJump <= 0) {
        console.error("Error: Grid dimensions and maximum jump distance must be positive integers.");
        return -1; // Indicate an error.
    }

    // Read the grid map, which consists of `gridDimHeight` rows (strings).
    const gridInputMap = extractMultipleStrings(gridDimHeight);

    let startPointX = -1; // X-coordinate of the 'S' (start) character.
    let startPointY = -1; // Y-coordinate of the 'S' (start) character.

    // Loop through the grid rows to locate the 'S' (starting) character.
    for (let rowIndex = 0; rowIndex < gridDimHeight; rowIndex++) {
        const currentRowString = gridInputMap[rowIndex];
        const foundSIndex = currentRowString.indexOf("S");
        if (foundSIndex !== -1) { // If 'S' is found in the current row.
            startPointX = foundSIndex;
            startPointY = rowIndex;
            break; // Exit loop once 'S' is located.
        }
    }

    // Guard clause: If the starting point 'S' was not found in the grid.
    if (startPointX === -1 || startPointY === -1) {
        console.error("Error: Starting point 'S' not found within the provided grid map.");
        return -1; // Indicate a critical error.
    }

    // Compute the shortest path distances from 'S' to all reachable cells.
    const bfsDistanceMatrix = computeShortestPathMatrix(gridInputMap, startPointX, startPointY);

    // Initialize the minimum teleportations required to a very large number.
    let minimumRequiredTeleports = Number.MAX_SAFE_INTEGER;

    // Iterate through every cell in the grid to calculate possible teleportation paths.
    for (let currentY = 0; currentY < gridDimHeight; currentY++) {
        for (let currentX = 0; currentX < gridDimWidth; currentX++) {
            const currentCellPathCost = bfsDistanceMatrix[currentY][currentX];

            // If the cell is unreachable from 'S' or requires more steps than `maximumAllowedJump`, skip it.
            if (currentCellPathCost > maximumAllowedJump) {
                continue;
            }

            // Calculate the number of 'teleport' steps needed to reach each of the four grid edges
            // from the current cell, considering `maximumAllowedJump` distance per step.
            // Math.ceil(coord / k) gives the number of k-sized jumps to reach 0 from coord.
            const stepsToTopBoundary = Math.ceil(currentY / maximumAllowedJump);
            const stepsToLeftBoundary = Math.ceil(currentX / maximumAllowedJump);
            // For bottom/right, it's distance from current cell to (h-1) or (w-1).
            const stepsToBottomBoundary = Math.ceil((gridDimHeight - 1 - currentY) / maximumAllowedJump);
            const stepsToRightBoundary = Math.ceil((gridDimWidth - 1 - currentX) / maximumAllowedJump);

            // The minimum steps to reach any edge from the current cell, plus 1 for the initial
            // teleport from 'S' to this current cell (if this cell is chosen as an intermediate point).
            const currentCellTotalTeleports = Math.min(
                stepsToTopBoundary,
                stepsToLeftBoundary,
                stepsToBottomBoundary,
                stepsToRightBoundary
            ) + 1;

            // Update the overall minimum teleportations if a better path is found.
            if (currentCellTotalTeleports < minimumRequiredTeleports) {
                minimumRequiredTeleports = currentCellTotalTeleports;
            }
        }
    }
    return minimumRequiredTeleports;
}

// Execute the main analysis function.
const finalProgramResult = executeGridAnalysis();

// Display the result to standard output if it's a valid, non-error value.
if (finalProgramResult !== undefined && finalProgramResult !== -1) {
    console.log(finalProgramResult);
} else if (finalProgramResult === -1) {
    // A specific error message can be logged if an error code is returned.
    console.error("Program terminated due to an invalid input configuration or missing start point.");
}