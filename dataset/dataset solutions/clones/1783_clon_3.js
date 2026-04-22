"use strict";

// Import the file system module for input operations.
const fs = require("fs");

// --- Input Processing Utilities ---

// Read raw data from standard input.
const rawInputData = fs.readFileSync("/dev/stdin", "utf8");

// Split the input into tokens by whitespace and initialize a token pointer.
let dataTokens = rawInputData.split(/\s+/).filter(token => token.length > 0);
let currentTokenIndex = 0;

/**
 * Retrieves the next token from the input stream and converts it to a number.
 * @returns {number} The next number from the input.
 */
function getNextNumber() {
    // A small validation could be added here, e.g., checking if the token is actually a number.
    return Number(dataTokens[currentTokenIndex++]);
}

/**
 * Retrieves the next token from the input stream as a string.
 * @returns {string} The next string from the input.
 */
function getNextString() {
    return dataTokens[currentTokenIndex++];
}

/**
 * Reads a specified number of items from the input and converts them to numbers.
 * @param {number} count - The number of items to read.
 * @returns {number[]} An array of numbers.
 */
function readNumericSequence(count) {
    const sequence = [];
    for (let i = 0; i < count; i++) {
        sequence.push(getNextNumber());
    }
    return sequence;
}

/**
 * Dynamically creates a multi-dimensional array initialized with a specific value.
 * This is a rewritten version of the original `xArray` without using `eval`.
 * @param {any} initialValue - The value to initialize array elements with.
 * @param {...number} dimensions - The sizes of each dimension.
 * @returns {Array} A multi-dimensional array.
 */
function createInitializedMatrix(initialValue, ...dimensions) {
    if (dimensions.length === 0) {
        return initialValue;
    }

    const currentDimensionSize = dimensions[0];
    const remainingDimensions = dimensions.slice(1);

    return Array.from({ length: currentDimensionSize }, () =>
        createInitializedMatrix(initialValue, ...remainingDimensions)
    );
}

// --- Main Program Execution ---

// Execute the primary logic function and store its result.
const finalProgramResult = executePathfinding();

// If the result is not undefined, print it to the console.
if (finalProgramResult !== undefined) {
    console.log(String(finalProgramResult));
}

/**
 * The core logic function to solve the pathfinding challenge.
 * Implements a Breadth-First Search (BFS) to find the shortest path.
 * @returns {number} The minimum number of steps to reach the goal, or -1 if unreachable.
 */
function executePathfinding() {
    // Define a large number to represent unreachable states (infinity).
    const UNREACHABLE_MARKER = 1e9 + 7; // Slightly larger than 1e9 to avoid edge cases.

    // Direction vectors for moving up, right, down, left.
    // In order: Up (r-1, c), Right (r, c+1), Down (r+1, c), Left (r, c-1)
    const rowOffsets = [-1, 0, 1, 0];
    const colOffsets = [0, 1, 0, -1];
    const numberOfDirections = 4;

    // Read grid dimensions and maximum move steps per turn.
    const [gridHeight, gridWidth, maxStepsPerTurn] = readNumericSequence(3);

    // Read starting and goal coordinates.
    // Note: The problem uses (y, x) convention, but here we use (row, col).
    const [startRow, startCol, goalRow, goalCol] = readNumericSequence(4);

    // Initialize the game map with a border of '@' characters.
    // This simplifies boundary checks during pathfinding.
    const gameMap = Array(gridHeight + 2);

    // Helper to create a border string.
    const createBorderString = (len) => Array(len).fill('@').join('');

    // Top border row.
    gameMap[0] = createBorderString(gridWidth + 2);

    // Populate inner rows with input strings, adding '@' borders.
    for (let r = 0; r < gridHeight; r++) {
        gameMap[r + 1] = '@' + getNextString() + '@';
    }

    // Bottom border row.
    gameMap[gridHeight + 1] = createBorderString(gridWidth + 2);

    // Initialize a 2D array to store the minimum steps to reach each cell.
    // All cells are initially marked as unreachable.
    const minimumSteps = createInitializedMatrix(UNREACHABLE_MARKER, gridHeight + 2, gridWidth + 2);

    // The starting cell requires 0 steps.
    minimumSteps[startRow][startCol] = 0;

    // Initialize the BFS queue for the current level.
    // Each element in the queue is an object { r: row, c: col }.
    let currentLevelNodes = [{ r: startRow, c: startCol }];
    let currentPathLength = 0; // Represents 'd' from the original code.

    // Main BFS loop: Continues as long as there are nodes to process.
    while (currentLevelNodes.length > 0) {
        // Prepare a queue for nodes discovered in the next level.
        let nextLevelNodes = [];

        // Process all nodes at the current path length.
        for (const { r: currentRow, c: currentCol } of currentLevelNodes) {
            // Explore all four possible directions.
            for (let dirIdx = 0; dirIdx < numberOfDirections; dirIdx++) {
                let nextRow = currentRow;
                let nextCol = currentCol;

                // Attempt to move up to `maxStepsPerTurn` steps in the current direction.
                for (let stepCount = 0; stepCount < maxStepsPerTurn; stepCount++) {
                    nextRow += rowOffsets[dirIdx];
                    nextCol += colOffsets[dirIdx];

                    // Check for obstacles (represented by '@').
                    if (gameMap[nextRow][nextCol] === '@') {
                        // Cannot move further in this direction.
                        break;
                    }

                    // If we found a path to this cell that's shorter or equal to the current level's distance,
                    // it means we've already processed it or found a better path in a previous iteration
                    // at the same or an earlier level. So, no need to re-process it for this level.
                    // The crucial part is 'minimumSteps[nextRow][nextCol] <= currentPathLength'.
                    // If it's `currentPathLength + 1`, we need to check if it was visited in the *next* level.
                    // The original logic `dist[yy][xx] <= d` means if it was visited in current level or previous,
                    // we stop exploring *further* along this line.
                    // The only case we care about is `minimumSteps[nextRow][nextCol] > currentPathLength + 1`.
                    // If it's `currentPathLength + 1`, it means it's already added to `nextLevelNodes`.
                    if (minimumSteps[nextRow][nextCol] <= currentPathLength) {
                        // Path through current node is not better than an already found path.
                        // We must stop exploring further along this line because any subsequent
                        // cells on this path would also be reached at a distance >= currentPathLength + 1,
                        // but we already found a path to `(nextRow, nextCol)` at `currentPathLength` or less.
                        break;
                    }

                    // If this cell has not been visited at the current (currentPathLength + 1) level,
                    // or if we found a shorter path to it (which means it's not yet processed for this level).
                    if (minimumSteps[nextRow][nextCol] > currentPathLength + 1) {
                        // Update the minimum steps to reach this cell.
                        minimumSteps[nextRow][nextCol] = currentPathLength + 1;
                        // Add this cell to the queue for the next level.
                        nextLevelNodes.push({ r: nextRow, c: nextCol });
                    }
                    // Optimization: If we've already reached this cell in the current path length + 1,
                    // but it wasn't the *first* time we found it on this particular K-step line,
                    // we can still continue to check further steps on this line (stepCount+1).
                    // The `minimumSteps[nextRow][nextCol] > currentPathLength + 1` ensures we don't
                    // add duplicates to `nextLevelNodes` if already added at this level.
                }
            }
        }

        // Move to the next level in the BFS.
        currentLevelNodes = nextLevelNodes;
        currentPathLength++; // Increment the distance counter.
    }

    // After BFS, check the distance to the goal cell.
    const result = minimumSteps[goalRow][goalCol];

    // If the goal is still marked as unreachable, return -1.
    if (result === UNREACHABLE_MARKER) {
        return -1;
    } else {
        return result;
    }
}